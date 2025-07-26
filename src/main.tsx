import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

console.log(import.meta.env.VITE_FIREBASE_API_KEY); // 🔍 Debug env var

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

