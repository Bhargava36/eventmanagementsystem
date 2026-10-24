// Suppress upstream Three.js r183 deprecation warning inside @react-three/fiber until v10 is released
const _origWarn = console.warn;
console.warn = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('THREE.Clock: This module has been deprecated')) {
    return;
  }
  _origWarn(...args);
};

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../src/app/App'
import { ThemeProvider } from './Contexts/ThemeContext'
import { AuthProvider } from './Contexts/AuthContext'
import { ToastProvider } from './Contexts/ToastContext'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <App />
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
