import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GAME_REGISTRY } from './config/gameRegistry'
import { ChallengeQuizGame } from './games/ChallengeQuizGame'
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
        <Route path="/games/challenge/:challengeId" element={<ChallengeQuizGame />} />
        {GAME_REGISTRY.map((game) => {
          const GameComponent = game.component
          return (
            <Route key={game.id} path={game.route} element={<GameComponent />} />
          )
        })}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
