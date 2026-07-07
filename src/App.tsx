import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { LetterRecognitionGame } from './games/LetterRecognitionGame'
import { LetterTracingGame } from './games/LetterTracingGame'
import { PictureWordMatchGame } from './games/PictureWordMatchGame'
import { ActivityMenuScreen } from './pages/ActivityMenuScreen'
import { HomeScreen } from './pages/HomeScreen'
import { LaunchScreen } from './pages/LaunchScreen'
import { ProgressScreen } from './pages/ProgressScreen'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<LaunchScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/activities" element={<ActivityMenuScreen />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/games/letter-recognition" element={<LetterRecognitionGame />} />
        <Route path="/games/picture-word-match" element={<PictureWordMatchGame />} />
        <Route path="/games/letter-tracing" element={<LetterTracingGame />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
