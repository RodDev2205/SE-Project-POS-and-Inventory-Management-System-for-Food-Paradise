import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Expose API_BASE_URL globally to support modules that may reference it without importing.
// This ensures older files or third-party codes that expect a global don't throw ReferenceError.
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
