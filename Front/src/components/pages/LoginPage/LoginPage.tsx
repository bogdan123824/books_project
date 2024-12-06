import React, { FC, useState, useEffect } from 'react';
import {
   PageWrapper,
   PageContainer
} from '../Page.styled.ts';
import './LoginPage.css';
import axios from 'axios';
import { Link } from 'react-router-dom';

import { Form, Button, Alert } from "react-bootstrap";
import 'bootstrap/dist/css/bootstrap.min.css';

import { apiUrl } from '../../config.ts';

interface LoginPageProps { }

const LoginPage: FC<LoginPageProps> = () => {
   const [username, setUsername] = useState("");
   const [password, setPassword] = useState("");

   const [message, setMessage] = useState<{ text: string, variant: string } | null>(null);
   const [isFadingOut, setIsFadingOut] = useState(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      try {
         const response = await axios.post(`${apiUrl}/token`, {
            username: username,
            password: password
         });

         const token = response.data.access_token;
         if (token) {
            localStorage.setItem("token", token);
         }

         setUsername("");
         setPassword("");

         const loggedInEvent = new CustomEvent("loggedIn");
         window.dispatchEvent(loggedInEvent);

         setMessage({ text: "Successfully logged in!", variant: "success" });
      } catch (error) {
         setMessage({ text: "Login failed.", variant: "danger" });
         console.error("Error during login:", error);
      }
   };

   useEffect(() => {
      if (message) {
         const fadeOutTimer = setTimeout(() => {
            setIsFadingOut(true);
         }, 3000);

         const removeMessageTimer = setTimeout(() => {
            setMessage(null);
            setIsFadingOut(false);
         }, 4000);

         return () => {
            clearTimeout(fadeOutTimer);
            clearTimeout(removeMessageTimer);
         };
      }
   }, [message]);

   return (
      <PageWrapper>
         <PageContainer style={{ display: "flex", justifyContent: "center" }}>
            <Form onSubmit={handleSubmit} style={{ width: "300px" }}>
               <Form.Group controlId="formUsername" className="mb-3">
                  <Form.Control
                     className='FormPlaceholder'
                     style={{
                        backgroundColor: "rgb(33, 37, 41)",
                        color: "white",
                        border: "none"
                     }}
                     type="text"
                     placeholder="Enter username"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     required
                  />
               </Form.Group>
               <Form.Group controlId="formPassword" className="mb-3">
                  <Form.Control
                     className='FormPlaceholder'
                     style={{
                        backgroundColor: "rgb(33, 37, 41)",
                        color: "white",
                        border: "none"
                     }}
                     type="password"
                     placeholder="Enter password"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     required
                  />
               </Form.Group>
               <Button className="w-100" variant="dark" type="submit">
                  Log in
               </Button>
               <p style={{ color: "grey", textAlign: "center", marginTop: "12px" }}>
                  Don't have an account? <Link to="/Register" style={{ color: "rgb(87, 165, 204)", textDecoration: "none" }}>Create one!</Link>
               </p>
               {message && (
                  <Alert
                     style={{
                        opacity: isFadingOut ? 0 : 1,
                        height: isFadingOut ? 0 : "42px",
                        padding: isFadingOut ? 0 : '8px',
                        textAlign: "center",
                        marginBottom: 0,
                        overflow: "hidden",
                        transition: "opacity 1s ease-in-out, height 1s ease-in-out, padding 1s ease-in-out",
                        backgroundColor: message.variant == "success" ? "rgb(40, 167, 69)" : "rgb(220, 53, 69)",
                        color: "white",
                        border: "rgb(33, 37, 41) 1px solid",
                     }}
                  >
                     {message.text}
                  </Alert>
               )}
            </Form>
         </PageContainer>
      </PageWrapper>
   );
};

export default LoginPage;
