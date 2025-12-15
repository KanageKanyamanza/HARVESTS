import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App.jsx';
import './index.css';

// Configuration stricte React (désactivé temporairement pour éviter la double vérification)
ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
