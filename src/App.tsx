import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AccessibleExamCursor } from './components/accessibility/AccessibleExamCursor'
import { GAME_REGISTRY } from './config/gameRegistry'
import { ChallengeQuizGame } from './games/ChallengeQuizGame'
import { AdditionMenuScreen } from './pages/AdditionMenuScreen'
import { GreaterLessThanMenuScreen } from './pages/GreaterLessThanMenuScreen'
import { ActivityMenuScreen } from './pages/ActivityMenuScreen'
import { HomeScreen } from './pages/HomeScreen'
import { LaunchScreen } from './pages/LaunchScreen'
import { MotherTongueScreen } from './pages/MotherTongueScreen'
import { NumberLearnerPage } from './pages/NumberLearnerPage'
import { ProgressScreen } from './pages/ProgressScreen'
import { useAppStore } from './store/useAppStore'

function AppEntry() {
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

  return <LaunchScreen />
}

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AccessibleExamCursor className="min-h-screen">
        <Routes>
          <Route path="/" element={<AppEntry />} />
          <Route path="/language" element={<MotherTongueScreen />} />
          <Route path="/home" element={<HomeScreen />} />
          <Route path="/activities" element={<ActivityMenuScreen />} />
          <Route path="/learn/numbers" element={<NumberLearnerPage />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/games/challenge/addition" element={<AdditionMenuScreen />} />
          <Route
            path="/games/challenge/greater-less-than"
            element={<GreaterLessThanMenuScreen />}
          />
          <Route path="/games/challenge/:challengeId" element={<ChallengeQuizGame />} />
          {GAME_REGISTRY.map((game) => {
            const GameComponent = game.component
            // Use path without a leading slash so RR matches consistently with basename.
            const path = game.route.replace(/^\//, '')
            return <Route key={game.id} path={path} element={<GameComponent />} />
          })}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AccessibleExamCursor>
    </BrowserRouter>
  )
}

export default App
