import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function render() {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

// Konva paints text once, so wait for Inter or the canvas keeps its fallback
// labels. Never hold the editor back for long if the font can't load.
Promise.race([
  document.fonts.load('12px Inter'),
  new Promise((resolve) => setTimeout(resolve, 800)),
]).finally(render)
