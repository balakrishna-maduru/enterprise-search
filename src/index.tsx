// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './globals.css';
import './index.css'; // Import theme CSS
import App from './App';
import { initializeTheme } from './config/branding';

// Initialize DBS theme
initializeTheme();

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element not found');
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
