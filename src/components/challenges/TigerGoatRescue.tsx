import { motion, AnimatePresence } from 'framer-motion'
import { getMaxWrongAllowed, getRequiredCorrect } from './challengeUtils'

export interface TigerGoatRescueProps {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  passThreshold?: number
  isComplete?: boolean
  className?: string
  variant?: 'vertical' | 'horizontal'
}

const GOAT_TOP_PERCENT = 6
const TIGER_START_TOP_PERCENT = 76

export function TigerGoatRescue({
  totalQuestions,
  correctCount,
  wrongCount,
  passThreshold = 0.6,
  isComplete = false,
  className = '',
  variant = 'vertical',
}: TigerGoatRescueProps) {
  const requiredCorrect = getRequiredCorrect(totalQuestions, passThreshold)
  const maxWrongAllowed = getMaxWrongAllowed(totalQuestions, passThreshold)
  const passed = correctCount >= requiredCorrect
  const tigerProgress = Math.min(wrongCount / maxWrongAllowed, 1)
  const isSaved = isComplete && passed
  const isEaten = !passed && (tigerProgress >= 1 || isComplete)
  const showGoat = !isEaten || isSaved
  const answered = correctCount + wrongCount

  const tigerTopPercent = isEaten
    ? GOAT_TOP_PERCENT
    : TIGER_START_TOP_PERCENT - tigerProgress * (TIGER_START_TOP_PERCENT - GOAT_TOP_PERCENT)

  const statusMessage = isComplete
    ? isSaved
      ? 'Ganu is safe!'
      : 'Tiger got Ganu!'
    : isEaten
      ? 'Chomp! Too many wrong!'
      : `Save Ganu! ${requiredCorrect}+ correct`

  if (variant === 'horizontal') {
    return (
      <HorizontalTrack
        className={className}
        statusMessage={statusMessage}
        correctCount={correctCount}
        wrongCount={wrongCount}
        answered={answered}
        totalQuestions={totalQuestions}
        tigerProgress={tigerProgress}
        isEaten={isEaten}
        isSaved={isSaved}
      />
    )
  }

  return (
    <div
      className={`flex h-full min-h-[320px] flex-col rounded-[1.75rem] border-4 border-white bg-white/90 px-2 py-3 shadow-lg ${className}`}
      aria-label="Save the goat mini game"
    >
      <h2 className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-emerald-700 md:text-base">
        Save the Goat
      </h2>
      <p className="mb-2 text-center text-[10px] font-semibold leading-tight text-slate-600 md:text-xs">
        {statusMessage}
      </p>
      <p className="mb-2 text-center text-[10px] font-semibold text-amber-800 md:text-xs">
        ✅ {correctCount} · ❌ {wrongCount}
      </p>

      <div className="relative mx-auto flex min-h-[220px] flex-1 w-full max-w-[88px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 via-emerald-50 to-emerald-200">
        <div className="absolute bottom-3 left-2 top-3 w-1.5 rounded-full bg-emerald-400/80" />

        <motion.div
          animate={{
            opacity: showGoat ? 1 : 0,
            scale: showGoat ? 1 : 0,
            y: isEaten ? 16 : 0,
            rotate: isEaten ? 20 : 0,
          }}
          transition={{ duration: 0.45, ease: 'easeIn' }}
          className="absolute left-1/2 z-20 -translate-x-1/2 text-3xl md:text-4xl"
          style={{ top: `${GOAT_TOP_PERCENT}%` }}
        >
          <motion.span
            animate={
              isSaved
                ? { y: [0, -6, 0], rotate: [0, 8, -8, 0] }
                : isEaten
                  ? {}
                  : tigerProgress > 0.4
                    ? { x: [0, -2, 2, 0] }
                    : { y: [0, -2, 0] }
            }
            transition={{
              duration: isSaved ? 0.55 : 1.4,
              repeat: isSaved ? 2 : Infinity,
              ease: 'easeInOut',
            }}
            className="block"
            role="img"
            aria-label="Goat"
          >
            🐐
          </motion.span>
        </motion.div>

        <AnimatePresence>
          {isSaved ? (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 z-30 -translate-x-1/2 text-xl"
              style={{ top: `${GOAT_TOP_PERCENT - 4}%` }}
            >
              🛡️
            </motion.span>
          ) : null}
        </AnimatePresence>

        <motion.div
          animate={{ top: `${tigerTopPercent}%` }}
          transition={{ type: 'spring', stiffness: isEaten ? 180 : 90, damping: isEaten ? 16 : 14 }}
          className="absolute left-1/2 z-30 -translate-x-1/2"
        >
          <motion.span
            animate={
              isEaten
                ? {
                    scale: [1, 1.5, 1.25, 1.35],
                    rotate: [0, -15, 10, -5, 0],
                  }
                : { x: [0, 2, 0] }
            }
            transition={{ duration: isEaten ? 0.7 : 0.45 }}
            className="block text-3xl md:text-4xl"
            role="img"
            aria-label="Tiger"
          >
            🐯
          </motion.span>
        </motion.div>

        <AnimatePresence>
          {isEaten && !isSaved ? (
            <>
              <motion.span
                key="chomp"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.3, 1, 0.6] }}
                transition={{ duration: 0.9 }}
                className="absolute left-1/2 z-40 -translate-x-1/2 text-sm font-extrabold text-orange-600"
                style={{ top: `${GOAT_TOP_PERCENT + 14}%` }}
              >
                Chomp!
              </motion.span>
              <motion.span
                key="yum"
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: [0, 1, 0], y: [0, -12, -20] }}
                transition={{ duration: 1.1, delay: 0.35 }}
                className="absolute left-1/2 z-40 -translate-x-1/2 text-xl"
                style={{ top: `${GOAT_TOP_PERCENT + 8}%` }}
              >
                😋
              </motion.span>
            </>
          ) : null}
        </AnimatePresence>

        {['🌿', '🌱', '🌿'].map((leaf, index) => (
          <span
            key={index}
            className="absolute text-sm opacity-60"
            style={{ left: index % 2 === 0 ? '6%' : '70%', top: `${35 + index * 20}%` }}
          >
            {leaf}
          </span>
        ))}
      </div>

      <p className="mt-2 text-center text-[10px] text-slate-500 md:text-xs">
        {answered}/{totalQuestions}
      </p>
    </div>
  )
}

interface TrackProps {
  className: string
  statusMessage: string
  correctCount: number
  wrongCount: number
  answered: number
  totalQuestions: number
  tigerProgress: number
  isEaten: boolean
  isSaved: boolean
}

function HorizontalTrack({
  className,
  statusMessage,
  correctCount,
  wrongCount,
  answered,
  totalQuestions,
  tigerProgress,
  isEaten,
  isSaved,
}: TrackProps) {
  const tigerLeftPercent = isEaten ? 72 : 4 + tigerProgress * 68

  return (
    <div
      className={`w-full max-w-3xl rounded-[1.75rem] border-4 border-white bg-white/85 px-4 py-4 shadow-lg ${className}`}
    >
      <h2 className="mb-2 text-center text-lg font-extrabold text-emerald-700">Save the Goat</h2>
      <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-600">
        <span>{statusMessage}</span>
        <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
          ✅ {correctCount} · ❌ {wrongCount}
        </span>
      </div>
      <div className="relative h-20 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-100 to-lime-50">
        <motion.span
          animate={{ opacity: isEaten && !isSaved ? 0 : 1, scale: isEaten && !isSaved ? 0 : 1 }}
          className="absolute bottom-3 right-[4%] text-4xl"
        >
          🐐
        </motion.span>
        <motion.span
          animate={{ left: `${tigerLeftPercent}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 14 }}
          className="absolute bottom-3 -translate-x-1/2 text-4xl"
        >
          🐯
        </motion.span>
        {isSaved ? <span className="absolute left-1/2 top-1 -translate-x-1/2">🛡️</span> : null}
      </div>
      <p className="mt-2 text-center text-xs text-slate-500">
        {answered}/{totalQuestions} answered
      </p>
    </div>
  )
}
