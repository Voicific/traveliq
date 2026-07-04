import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const app = (
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Build-time prerender (scripts/prerender.mjs) writes fully-rendered HTML into each route's
// index.html. When that snapshot is present, hydrate it instead of discarding it
// with a fresh client render; otherwise mount normally (dev + non-prerendered).
if (rootElement.hasChildNodes()) {
  ReactDOM.hydrateRoot(rootElement, app);
} else {
  ReactDOM.createRoot(rootElement).render(app);
}