import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
// Import the main App component, which serves as the entry point of the application's UI.
import App from './App';

// Get the root DOM element where the React application will be mounted.
const rootElement = document.getElementById('root');
// Ensure the root element exists before attempting to render the app.
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Create a React root for the main application container.
const root = ReactDOM.createRoot(rootElement);
// Render the App component within React's StrictMode for highlighting potential problems.
root.render(
  <React.StrictMode>
    <HelmetProvider>
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
