from fastapi import FastAPI, Depends, HTTPException, Query
from sqlalchemy import create_engine, Column, Integer, String
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel
from typing import List, Optional
from fastapi import Form

DATABASE_URL = "sqlite:///./library.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Book(Base):
    __tablename__ = "book"
    id = Column(Integer,primary_key =True, index=True)
    title = Column(String, index=True)
    author = Column(String, index=True)
    text = Column(String, nullable=True)
    year = Column(Integer)

Base.metadata.create_all(bind=engine)

class BookSchema(BaseModel):
    id: Optional[int] = None
    title: str
    author: str
    text: Optional[str] = None
    year: Optional[int] = None

    class Config:
        orm_mode = True
app = FastAPI()

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
        text: str = Form,
        year: int = Form,
        db: Session = Depends(get_db),
):
    book = Book(
        title = title,
        author = author,
        text = text,
        year = year,
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
    existing_book.text = book.text
    existing_book.year = book.year

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
