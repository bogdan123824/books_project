import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './index.css';
import reportWebVitals from './reportWebVitals';

import App from "./components/App/App.tsx";

import BooksPage from './components/pages/BooksPage/BooksPage.tsx';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App>
        <Routes>
          <Route path="/" element={<BooksPage></BooksPage>} />
        </Routes>
      </App>
    </Router>
  </React.StrictMode>
);

reportWebVitals();
