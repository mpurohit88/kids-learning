import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Mascot } from './Mascot'
import { StarDisplay } from './StarDisplay'
import type { GameRoundResult } from '../types'

interface GameCompleteModalProps {
  result: GameRoundResult
  onPlayAgain: () => void
  onBackToMenu: () => void
}

export function GameCompleteModal({
  result,
  onPlayAgain,
  onBackToMenu,
}: GameCompleteModalProps) {
  const navigate = useNavigate()
  const message =
    result.stars === 3
      ? 'Amazing! You are a star!'
      : result.stars === 2
        ? 'Great job! Keep going!'
        : 'Good try! Practice makes perfect!'

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-2xl"
      >
        <Mascot mood="happy" message={message} />
        <div className="my-6">
          <StarDisplay count={result.stars} size="lg" />
        </div>
        <p className="text-xl font-semibold text-slate-700">
          {result.correct} out of {result.total} correct
        </p>

        <div className="mt-8 flex flex-col gap-3">
          <button
            type="button"
            onClick={onPlayAgain}
            className="rounded-2xl bg-green-500 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-green-400"
          >
            Play Again
          </button>
          <button
            type="button"
            onClick={onBackToMenu}
            className="rounded-2xl bg-blue-500 px-6 py-4 text-lg font-bold text-white shadow-md transition hover:bg-blue-400"
          >
            Back to Games
          </button>
          <button
            type="button"
            onClick={() => navigate('/progress')}
            className="rounded-2xl bg-amber-400 px-6 py-4 text-lg font-bold text-amber-900 shadow-md transition hover:bg-amber-300"
          >
            See My Stars
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
