import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from '../src/app/App'
import { ThemeProvider } from './Contexts/ThemeContext'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
