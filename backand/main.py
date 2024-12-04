from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from fastapi import Form
from fastapi.middleware.cors import CORSMiddleware

DATABASE_URL = "sqlite:///./library.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Book(Base):
    __tablename__ = "book"
    id = Column(Integer,primary_key =True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    description = Column(String, nullable=True)
    year = Column(Integer,nullable=True)
    genre = Column(String, nullable=True)

Base.metadata.create_all(bind=engine)

class BookSchema(BaseModel):
    id: Optional[int] = None
    title: str
    author: str
    description: Optional[str] = None
    year: Optional[int] = None
    genre: Optional[str] = None

    class Config:
        from_attributes = True
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

@app.get("/all_books/", response_model=List[BookSchema])
async def get_all_books(db: Session = Depends(get_db)):
    return db.query(Book).all()

@app.get("/search_book_by_name_or_author", response_model= List[BookSchema])
async def search_books(
        title: Optional[str] = Query(None, text="Name book"),
        author: Optional[str] = Query(None, text="Author"),
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

@app.post("/add_book", response_model = BookSchema)
async def add_books(
        title: str = Form,
        author: str = Form,
        description: str = Form(None),
        year: int = Form(None),
        genre: str = Form,
        db: Session = Depends(get_db),
):
    book = Book(
        title = title,
        author = author,
        description = description,
        year = year,
        genre = genre,
    )
    db.add(book)
    db.commit()
    db.refresh(book)
    return book

@app.put("/edit_book/{book_id}", response_model = BookSchema)
async def edit_book(
        book_id: int,
        book: BookSchema,
        db: Session = Depends(get_db),
):
    existing_book = db.query(Book). filter(Book.id == book_id).first()

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
async def delete_book(book_id: int, db: Session = Depends(get_db)):
    book = db.query(Book).filter(Book.id == book_id).first()
    if book is None:
        raise HTTPException(status_code=404, detail="Book not found")
    db.delete(book)
    db.commit()
    return {f"Book deleted"}
