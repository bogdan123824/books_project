import React, { FC, useState, useEffect } from 'react';
import {
   BooksPageWrapper,
   BooksPageContainer,
   ButtonsContainer,
   BooksHeaderContainer,
   BooksHeader,
   BooksSortContainer
} from './BooksPage.ts';
import axios from 'axios';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faPlus, faBook } from '@fortawesome/free-solid-svg-icons'

import { Table, Button, Spinner, Dropdown, DropdownButton, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

import BookModal from '../../modals/BookModal/BookModal.tsx';
import AddBookModal from '../../modals/AddBookModal/AddBookModal.tsx';

import { apiUrl } from '../../config.ts';

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

   const [sortBy, setSortBy] = useState("author");
   const [filter, setFilter] = useState("");

   const [loading, setLoading] = useState(false);

   const [showEditModal, setShowEditModal] = useState(false);
   const [showAddModal, setShowAddModal] = useState(false);

   const fetchBooks = async () => {
      setLoading(true);

      try {
         const response = await axios.get<Book[]>(`${apiUrl}/all_books/`);

         setBooks(response.data);
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

   const handleSelect = (eventKey: string | null) => {
      if (eventKey) {
         setSortBy(eventKey);
      }
   };

   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFilter(e.target.value);
   };

   const sortedAndFilteredBooks = books
      .filter((book) => {
         const lowerCaseFilter = filter.toLowerCase();
         return (
            book.title.toLowerCase().includes(lowerCaseFilter) || book.author.toLowerCase().includes(lowerCaseFilter)
         );
      })
      .sort((a, b) => {
         if (sortBy === "author") {
            return a.author.localeCompare(b.author);
         }
         if (sortBy === "title") {
            return a.title.localeCompare(b.title);
         }
         return 0;
      });

   return (
      <BooksPageWrapper>
         <BooksPageContainer>
            <BooksHeader><FontAwesomeIcon icon={faBook} />  Books management</BooksHeader>
            <BooksHeaderContainer>
               <BooksSortContainer>
                  <BooksHeader style={{ fontSize: "95%" }}>Sort by</BooksHeader>
                  <DropdownButton
                     id="sort-dropdown"
                     title={sortBy}
                     onSelect={handleSelect}
                     variant="dark"
                     menuVariant="dark"
                     style={{
                        marginLeft: "12px"
                     }}
                  >
                     <Dropdown.Item eventKey="author">author</Dropdown.Item>
                     <Dropdown.Item eventKey="title">title</Dropdown.Item>
                  </DropdownButton>
                  <Form.Group>
                     <Form.Control
                        type="text"
                        placeholder="Filter..."
                        value={filter}
                        onChange={handleInputChange}
                        style={{ maxWidth: '300px', marginLeft: "12px" }}
                     />
                  </Form.Group>
               </BooksSortContainer>
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
                     {sortedAndFilteredBooks.map((book) => (
                        <tr
                           key={book.id}
                           onClick={() => handleRowClick(book)}
                           style={{
                              cursor: 'pointer',
                           }}
                        >
                           <td>{book.title}</td>
                           <td>{book.author}</td>
                           <td style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "340px"}}>{book.description}</td>
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