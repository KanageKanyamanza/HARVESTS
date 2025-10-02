import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Configuration stricte React (désactivé temporairement pour éviter la double vérification)
ReactDOM.createRoot(document.getElementById('root')).render(
  <App />
);
