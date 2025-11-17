import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// 👉 Vercel Analytics importieren
import { Analytics } from '@vercel/analytics/react'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />

    {/* 👉 Vercel Analytics aktivieren */}
    <Analytics />
  </StrictMode>,
)

