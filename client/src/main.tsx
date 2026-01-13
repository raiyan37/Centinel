/**
 * Application Entry Point
 * 
 * This file bootstraps the React application.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Import global styles (includes Tailwind CSS)
import '@/styles/index.css';

// Import main App component
import App from './App';

// Mount the application
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
