import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Suppress known THREE.js deprecation warnings that don't affect functionality
const originalWarn = console.warn;
console.warn = function(...args) {
  const message = args[0]?.toString?.() || '';
  // Suppress THREE.js internal deprecation warnings
  if (
    message.includes('THREE.THREE.Clock') ||
    message.includes('PCFSoftShadowMap') ||
    message.includes('THREE.WebGLShadowMap')
  ) {
    return;
  }
  originalWarn.apply(console, args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
