import React, { FC, useState, useEffect } from 'react';
import {
   BooksPageWrapper,
   BooksPageContainer,
   ButtonsContainer,
   BooksHeaderContainer,
   BooksHeader
} from './BooksPage.ts';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faPlus } from '@fortawesome/free-solid-svg-icons'

import { Table, Button, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import BookModal from '../../modals/BookModal/BookModal.tsx';
import AddBookModal from '../../modals/AddBookModal/AddBookModal.tsx';

import { apiUrl } from '../../config.ts';

import booksData from '../../books.json';

interface BooksPageProps { }

type Book = {
   id: number;
   title: string;
   author: string;
   description: string | null;
   year: number;
   genre: string;
};

const BooksPage: FC<BooksPageProps> = () => {
   const [books, setBooks] = useState<Book[]>([]);
   const [selectedBook, setSelectedBook] = useState(null);

   const [loading, setLoading] = useState(false);

   const [showEditModal, setShowEditModal] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);

   const fetchBooks = async () => {
      setLoading(true);

      try {
         const response = await axios.get<Book[]>(`${apiUrl}/all_books/`);

         setBooks(response.data);

         //setBooks(booksData);
      } catch (error) {
         console.error('Error fetching books:', error);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      fetchBooks();
   }, []);

   const updateBookList = () => {
      fetchBooks();
   };

   const handleRowClick = (book) => {
      setSelectedBook(book);
      setShowEditModal(true);
   };

   const handleCloseEditModal = () => {
      setSelectedBook(null);
      setShowEditModal(false);
   };

   const handleCloseAddModal = () => {
      setShowAddModal(false);
   };

   const handleAddModal = () => {
      setShowAddModal(true);
   };

   return (
      <BooksPageWrapper>
         <BooksPageContainer>
            <BooksHeaderContainer>
               <BooksHeader>Books management</BooksHeader>
               <ButtonsContainer>
                  <Button variant="success" onClick={handleAddModal} style={{ marginRight: "12px" }}><FontAwesomeIcon icon={faPlus} /></Button>
                  <Button variant="dark" onClick={fetchBooks}><FontAwesomeIcon icon={faArrowsRotate} /></Button>
               </ButtonsContainer>
            </BooksHeaderContainer>
            {loading ? (
               <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
                  <Spinner animation="border" style={{ color: "white" }} />
               </div>
            ) : (
               <Table
                  bordered hover responsive
                  variant="dark"
                  style={{
                     borderColor: 'rgb(23, 25, 27)',
                     width: "1120px"
                  }}
               >
                  <thead>
                     <tr>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Description</th>
                        <th>Year</th>
                        <th>Genre</th>
                     </tr>
                  </thead>
                  <tbody>
                     {books.map((book) => (
                        <tr
                           key={book.id}
                           onClick={() => handleRowClick(book)}
                           style={{
                              cursor: 'pointer'
                           }}
                        >
                           <td>{book.title}</td>
                           <td>{book.author}</td>
                           <td style={{whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "340px"}}>{book.description}</td>
                           <td>{book.year}</td>
                           <td>{book.genre}</td>
                        </tr>
                     ))}
                  </tbody>
               </Table>
            )}
            <BookModal
               show={showEditModal}
               handleClose={handleCloseEditModal}
               book={selectedBook}
               onBookUpdated={updateBookList}
            />
            <AddBookModal
               show={showAddModal}
               handleClose={handleCloseAddModal}
               onBookUpdated={updateBookList}
            />
         </BooksPageContainer>
      </BooksPageWrapper >
   );
};

export default BooksPage;