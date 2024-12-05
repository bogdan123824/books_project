from fastapi import FastAPI, Depends, HTTPException, Query, Form
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
import bcrypt

DATABASE_URL = "sqlite:///./library.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class User(Base):
    __tablename__ = "user"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)

class Book(Base):
    __tablename__ = "book"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    description = Column(String, nullable=True)
    year = Column(String, nullable=True)
    genre = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

class BookSchema(BaseModel):
    id: Optional[int] = None
    title: str
    author: str
    description: Optional[str] = None
    year: Optional[str] = None
    genre: Optional[str] = None

    class Config:
        from_attributes = True

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


@app.post("/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_username(db, user.username)
    if existing_user:
        raise HTTPException(status_code=400, detail="Username already exists")

    existing_email = get_user_by_email(db, user.email)
    if existing_email:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)
    new_user = User(username=user.username, email=user.email, hashed_password=hashed_password)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


@app.post("/token")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = get_user_by_username(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return {"access_token": user.username, "token_type": "bearer"}


@app.get("/all_books/", response_model=List[BookSchema])
async def get_all_books(db: Session = Depends(get_db)):
    return db.query(Book).all()


@app.get("/search_book_by_name_or_author", response_model=List[BookSchema])
async def search_books(
        title: Optional[str] = Query(None, description="Name book"),
        author: Optional[str] = Query(None, description="Author"),
        db: Session = Depends(get_db),
):
    query = db.query(Book)

    if title:
        query = query.filter(Book.title.ilike(f"%{title}%"))
    if author:
        query = query.filter(Book.author.ilike(f"%{author}%"))
    results = query.all()

    if not results:
        raise HTTPException(status_code=404, detail="Book not found")
    return results


@app.post("/add_book", response_model=BookSchema)
async def add_books(
        title: str = Form(...),
        author: str = Form(...),
        description: Optional[str] = Form(None),
        year: Optional[str] = Form(None),
        genre: str = Form(...),
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme),
):
    user = get_user_by_username(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    book = Book(
        title=title,
        author=author,
        description=description,
        year=year,
        genre=genre,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book


@app.put("/edit_book/{book_id}", response_model=BookSchema)
async def edit_book(
        book_id: int,
        book: BookSchema,
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme),
):
    user = get_user_by_username(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    existing_book = db.query(Book).filter(Book.id == book_id).first()
    if existing_book is None:
        raise HTTPException(status_code=404, detail="Book not found")

    existing_book.title = book.title
    existing_book.author = book.author
    existing_book.description = book.description
    existing_book.year = book.year
    existing_book.genre = book.genre

    db.commit()
    db.refresh(existing_book)
    return existing_book


@app.delete("/delete_book/{book_id}")
async def delete_book(
        book_id: int,
        db: Session = Depends(get_db),
        token: str = Depends(oauth2_scheme),
):
    user = get_user_by_username(db, token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")

    book = db.query(Book).filter(Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {"message": "Book deleted"}