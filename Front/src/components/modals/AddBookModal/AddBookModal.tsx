import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner, Alert } from 'react-bootstrap';

import axios from 'axios';

import './../Modal.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark, faPlus, faEraser } from '@fortawesome/free-solid-svg-icons';

import { apiUrl } from '../../config.ts';

type FormData = {
   title: string;
   author: string;
   description: string;
   year: number | string; 
   genre: string;
};

const AddBookModal = ({ show, handleClose, onBookUpdated }) => {
   const [loading, setLoading] = useState(false); 
   const [error, setError] = useState<string | null>(null); 

   const [formData, setFormData] = useState<FormData>({
      title: "",
      author: "",
      description: "",
      year: "",
      genre: ""
   });

   useEffect(() => {
      if (!show) {
         handleClear();
      }
   }, [show]);

   const handleClear = () => {
      setFormData({
         title: "",
         author: "",
         description: "",
         year: "",
         genre: ""
      });
      setError(null);
   };

   const validateInputs = (): boolean => {
      if (
         !formData.title.trim() ||
         !formData.author.trim() ||
         !formData.description.trim() ||
         !formData.genre.trim()
      ) {
         setError("All fields must be filled in without spaces");
         return false;
      }

      if (/\d/.test(formData.author)) {
         setError("Author should not contain numbers.");
         return false;
       }

      const year = Number(formData.year);
      if (isNaN(year) || year < 1700 || year > new Date().getFullYear()) {
         setError("Year must be a number from 1700 to the current year");
         return false;
      }

      if (formData.year.toString().length > 4) {
         setError("Year must not exceed 4 digits");
         return false;
      }

      if (/\d/.test(formData.genre)) {
         setError("Genre should not contain numbers");
         return false;
      }

      setError(null); 
      return true;
   };

   const handleConfirm = async () => {
      if (!validateInputs()) {
         return; 
      }
   
      setLoading(true);
   
      try {
         const data = {
            title: formData.title.trim(),
            author: formData.author.trim(),
            description: formData.description.trim(),
            year: Number(formData.year), 
            genre: formData.genre.trim(),
         };
   
         const params = new URLSearchParams();
         params.append('title', data.title);
         params.append('author', data.author);
         params.append('description', data.description);
         params.append('year', data.year.toString());
         params.append('genre', data.genre);
   
         const token = localStorage.getItem("token"); 
   
         const response = await axios.post(`${apiUrl}/add_book`, params, {
            headers: {
               'Content-Type': 'application/x-www-form-urlencoded',
               'Authorization': `Bearer ${token}`, 
            },
         });
   
         if (onBookUpdated) {
            onBookUpdated(response.data);
         }
   
         handleClear();
         handleClose();
      } catch (error) {
         console.error("Error adding book:", error);
         setError("Failed to add book. Please try again.");
      } finally {
         setLoading(false);
      }
   };
   

   const handleInputChange = (e) => {
      const { name, value } = e.target;

      if (name === "author" && /\d/.test(value)) {
         return;
      }

      if (name === "year" && value !== "" && !/^\d*$/.test(value)) {
         return;
      }

      if (name === "year" && value.length > 4) {
         return; 
      }

      if (name === "genre" && /\d/.test(value)) {
         return;
      }

      setFormData((prev) => ({
         ...prev,
         [name]: value.trimStart(), 
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
            <Modal.Title>Add book</Modal.Title>
            <FontAwesomeIcon
               icon={faXmark}
               onClick={handleClose}
               style={{
                  cursor: "pointer",
                  fontSize: "160%"
               }}
            />
         </Modal.Header>
         <Modal.Body className='Dark'>
            {error && <Alert variant="danger">{error}</Alert>}
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
                     placeholder="Enter Author"
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
         <Modal.Footer
            className='Dark'
            style={{
               borderTop: "2px rgb(23, 25, 27) solid"
            }}
         >
            <Button
               variant="success"
               style={{ marginRight: "8px" }}
               onClick={handleConfirm}
            >
               {loading ? <Spinner animation="border" style={{ width: '18px', height: '18px' }} /> : <><FontAwesomeIcon icon={faPlus} /> Add</>}
            </Button>
            <Button variant="dark" onClick={handleClear}><FontAwesomeIcon icon={faEraser} /></Button>
         </Modal.Footer>
      </Modal>
   );
};

export default AddBookModal;
