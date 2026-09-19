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
