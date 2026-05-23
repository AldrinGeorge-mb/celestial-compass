// frontend/src/main.jsx
// Single Vite entry point. Mounts the React tree and imports all global styles.

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';         // Tailwind base directives
import './styles/global.css'; // Custom space theme & component styles

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);