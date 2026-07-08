import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { GAME_REGISTRY } from './config/gameRegistry'
import { ChallengeQuizGame } from './games/ChallengeQuizGame'
import { AdditionMenuScreen } from './pages/AdditionMenuScreen'
import { ActivityMenuScreen } from './pages/ActivityMenuScreen'
import { HomeScreen } from './pages/HomeScreen'
import { LaunchScreen } from './pages/LaunchScreen'
import { MotherTongueScreen } from './pages/MotherTongueScreen'
import { NumberLearnerPage } from './pages/NumberLearnerPage'
import { ProgressScreen } from './pages/ProgressScreen'
import { useAppStore } from './store/useAppStore'

function AppEntry() {
  const uiLocale = useAppStore((state) => state.uiLocale)
  const localeReady = useAppStore((state) => state.localeReady)
  const initLocale = useAppStore((state) => state.initLocale)

  useEffect(() => {
    initLocale()
  }, [initLocale])

  if (!localeReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-100 to-indigo-100">
        <p className="text-xl font-semibold text-slate-600">Loading...</p>
      </div>
    )
  }

  if (!uiLocale) {
    return <MotherTongueScreen />
  }

  return <LaunchScreen />
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<AppEntry />} />
        <Route path="/language" element={<MotherTongueScreen />} />
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/activities" element={<ActivityMenuScreen />} />
        <Route path="/learn/numbers" element={<NumberLearnerPage />} />
        <Route path="/progress" element={<ProgressScreen />} />
        <Route path="/games/challenge/addition" element={<AdditionMenuScreen />} />
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
