import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Spinner } from 'react-bootstrap';

import axios from 'axios';

import "./../Modal.css";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark, faPlus, faEraser } from '@fortawesome/free-solid-svg-icons'

import { apiUrl } from '../../config.ts';

type FormData = {
   title: string;
   author: string;
   description: string;
   year: number;
};

const AddBookModal = ({ show, handleClose, onBookUpdated }) => {
   const [loading, setLoading] = useState(false);

   const [formData, setFormData] = useState<FormData>({
      title: "",
      author: "",
      description: "",
      year: 0
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
         year: 0
      });
   };

   const handleConfirm = async () => {
      setLoading(true);

      try {
         const response = await axios.post(`${apiUrl}/add_book`, {
            title: formData.title,
            author: formData.title,
            description: formData.description,
            year: formData.year
         });

         if (onBookUpdated) {
            onBookUpdated(response.data);
         }

         handleClear();
         handleClose();
      } catch (error) {
         console.error("Error adding book:", error);
      } finally {
         setLoading(false);
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