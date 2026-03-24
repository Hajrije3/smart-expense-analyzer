try {
    const d = JSON.parse(localStorage.getItem("appearance") || "{}");
    document.documentElement.classList.toggle("dark", !!d.darkMode);
} catch { /* ignore */ }

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
