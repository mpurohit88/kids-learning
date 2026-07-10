import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { installAudioUnlockListeners } from './utils/audio'

// Unlock Web Audio + speechSynthesis on the first real tap (required on mobile).
installAudioUnlockListeners()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
