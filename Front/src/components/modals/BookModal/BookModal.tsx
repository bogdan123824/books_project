import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

import axios from 'axios';

import "./../Modal.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faXmark, faPenToSquare, faTrash } from '@fortawesome/free-solid-svg-icons'

import { apiUrl } from '../../config.ts';

type FormData = {
   title: string;
   author: string;
   description: string;
   year: number;
   genre: string;
};

const BookModal = ({ show, handleClose, book, onBookUpdated }) => {
   const [loading, setLoading] = useState(false);

   const [currentState, setCurrentState] = useState("default");

   const [formData, setFormData] = useState<FormData>({
      title: "",
      author: "",
      description: "",
      year: 0,
      genre: ""
   });

   useEffect(() => {
      if (show) {
         setCurrentState("default");
      }
   }, [show]);

   if (!book) return null;

   const handleEdit = () => {
      setFormData({
         title: book.title,
         author: book.title,
         description: book.description,
         year: book.year,
         genre: book.genre
      });
      setCurrentState("edit");
   };

   const handleDelete = () => {
      setCurrentState("delete");
   };

   const handleCancel = () => {
      setCurrentState("default");
   };

   const handleConfirm = async () => {
      setLoading(true);
      if (currentState === "edit") {
         try {
            await axios.put(`${apiUrl}/edit_book/${book.id}`, {
               ...formData
            });
            onBookUpdated();

            handleClose();
         } catch (error) {
            console.error("Error updating book:", error);
         } finally {
            setLoading(false);
         }
      } else if (currentState === "delete") {
         try {
            await axios.delete(`${apiUrl}/delete_book/${book.id}`);
            onBookUpdated();

            handleClose();
         } catch (error) {
            console.error("Error deleting book:", error);
         } finally {
            setLoading(false);
         }
      }
   };

   const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData((prev) => ({
         ...prev,
         [name]: value,
      }));
   };

   return (
      <Modal
         show={show} onHide={handleClose} centered size="lg" backdrop="static"
         style={{
            backgroundColor: "rgba(33, 37, 41, 0.525)"
         }}
      >
         <Modal.Header
            closeButton
            className='Dark'
            style={{
               borderBottom: "2px rgb(23, 25, 27) solid",
               justifyContent: "space-between"
            }}
         >
            <Modal.Title>Book details</Modal.Title>
            <FontAwesomeIcon
               icon={faXmark}
               onClick={handleClose}
               style={{
                  cursor: "pointer",
                  fontSize: "160%"
               }}
            />
         </Modal.Header>
         {currentState === "edit" ? (
            <Modal.Body className='Dark'>
               <Form>
                  <Form.Group className="mb-3 d-flex">
                     <Form.Label className="me-2">Title:</Form.Label>
                     <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        placeholder="Enter name"
                     />
                  </Form.Group>
                  <Form.Group className="mb-3 d-flex">
                     <Form.Label className="me-2">Author:</Form.Label>
                     <Form.Control
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        placeholder="Enter price"
                     />
                  </Form.Group>
                  <Form.Group className="mb-3 d-flex">
                     <Form.Label className="me-2">Description:</Form.Label>
                     <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter description"
                     />
                  </Form.Group>
                  <Form.Group className="mb-3 d-flex">
                     <Form.Label className="me-2">Year:</Form.Label>
                     <Form.Control
                        type="text"
                        name="year"
                        value={formData.year}
                        onChange={handleInputChange}
                        placeholder="Enter year"
                     />
                  </Form.Group>
                  <Form.Group className="mb-3 d-flex">
                  <Form.Label className="me-2">Genre:</Form.Label>
                  <Form.Control
                     type="text"
                     name="genre"
                     value={formData.genre}
                     onChange={handleInputChange}
                     placeholder="Enter genre"
                  />
               </Form.Group>
               </Form>
            </Modal.Body>
         ) : (
            <Modal.Body className='Dark'>
               <h5 style={{ marginBottom: "18px" }}>Title: {book?.title}</h5>
               <p><strong>Author:</strong> {book?.author}</p>
               <p><strong>Description:</strong> {book?.description}</p>
               <p><strong>Year:</strong> {book?.year}</p>
               <p><strong>Genre:</strong> {book?.genre}</p>
            </Modal.Body>
         )}
         <Modal.Footer
            className='Dark'
            style={{
               borderTop: "2px rgb(23, 25, 27) solid",
               justifyContent: "space-between"
            }}
         >
            <span>{currentState === "delete" ? "Deleting..." : currentState === "edit" ? "Editing..." : ""}</span>
            {currentState == "default" ? (
               <div>
                  <Button variant="dark" onClick={handleEdit} style={{ marginRight: "8px" }}><FontAwesomeIcon icon={faPenToSquare} /> Edit</Button>
                  <Button variant="danger" onClick={handleDelete}><FontAwesomeIcon icon={faTrash} /> Delete</Button>
               </div>
            ) : (
               <div>
                  <Button
                     variant={currentState === "delete" ? "danger" : "success"}
                     style={{ marginRight: "8px" }}
                     onClick={handleConfirm}
                  >
                     {loading ? <Spinner animation="border" style={{ width: '18px', height: '18px' }} /> : <><FontAwesomeIcon icon={faCheck} /> Confirm</>}
                  </Button>
                  <Button variant="dark" onClick={handleCancel}>
                     <FontAwesomeIcon icon={faXmark} />
                  </Button>
               </div>
            )}
         </Modal.Footer>
      </Modal>
   );
};

export default BookModal;