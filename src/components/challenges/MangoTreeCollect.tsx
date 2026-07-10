import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from '../../hooks/useTranslation'
import { getRequiredCorrect } from './challengeUtils'

export interface MangoTreeCollectProps {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  passThreshold?: number
  isComplete?: boolean
  className?: string
  variant?: 'vertical' | 'horizontal'
}

function getMangoSlot(index: number, total: number) {
  const cols = 2
  const row = Math.floor(index / cols)
  const col = index % cols
  const rows = Math.ceil(total / cols)
  const top = 10 + (row / Math.max(rows, 1)) * 36
  const left = col === 0 ? 16 : 58
  return { top: `${top}%`, left: `${left}%` }
}

export function MangoTreeCollect({
  totalQuestions,
  correctCount,
  wrongCount,
  passThreshold = 0.6,
  isComplete = false,
  className = '',
  variant = 'vertical',
}: MangoTreeCollectProps) {
  const { t } = useTranslation()
  const requiredCorrect = getRequiredCorrect(totalQuestions, passThreshold)
  const passed = correctCount >= requiredCorrect
  const allCollected = correctCount >= totalQuestions
  const isSuccess = isComplete && passed
  const isFailure = isComplete && !passed
  const answered = correctCount + wrongCount

  const statusMessage = isComplete
    ? isSuccess
      ? allCollected
        ? t('sideGames.mango.allCollected')
        : t('sideGames.mango.basketFull')
      : t('sideGames.mango.needMore')
    : t('sideGames.mango.goal', { count: requiredCorrect })

  if (variant === 'horizontal') {
    return (
      <div
        className={`w-full max-w-3xl rounded-[1.75rem] border-4 border-white bg-white/85 px-4 py-4 shadow-lg ${className}`}
      >
        <h2 className="mb-2 text-center text-lg font-extrabold text-amber-700">
          {t('sideGames.mango.title')}
        </h2>
        <div className="mb-2 flex items-center justify-between gap-2 text-sm font-semibold text-slate-600">
          <span>{statusMessage}</span>
          <span className="rounded-full bg-amber-100 px-3 py-1 text-amber-800">
            🥭 {correctCount}/{totalQuestions}
          </span>
        </div>
        <div className="relative flex h-20 items-end justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-lime-100 px-6 pb-2">
          <span className="text-4xl">🌳</span>
          <span className="text-3xl">🪣</span>
          {isSuccess ? <span className="absolute left-1/2 top-1 -translate-x-1/2">⭐</span> : null}
        </div>
        <p className="mt-2 text-center text-xs text-slate-500">
          {t('sideGames.answered', { answered, total: totalQuestions })} · ❌ {wrongCount}
        </p>
      </div>
    )
  }

  const mangoIndices = Array.from({ length: totalQuestions }, (_, index) => index)

  return (
    <div
      className={`flex h-full min-h-[320px] flex-col rounded-[1.75rem] border-4 border-white bg-white/90 px-2 py-3 shadow-lg ${className}`}
      aria-label={t('sideGames.mango.ariaLabel')}
    >
      <h2 className="mb-1 text-center text-sm font-extrabold uppercase tracking-wide text-amber-700 md:text-base">
        {t('sideGames.mango.title')}
      </h2>
      <p className="mb-2 text-center text-[10px] font-semibold leading-tight text-slate-600 md:text-xs">
        {statusMessage}
      </p>
      <p className="mb-2 text-center text-[10px] font-semibold text-amber-800 md:text-xs">
        🥭 {correctCount}/{totalQuestions} · ❌ {wrongCount}
      </p>

      <div className="relative mx-auto flex min-h-[220px] flex-1 w-full max-w-[88px] overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 via-lime-50 to-amber-100">
        <span className="absolute left-1/2 top-[48%] z-0 -translate-x-1/2 text-2xl opacity-90">🌳</span>

        {mangoIndices.map((index) => {
          const collected = index < correctCount
          const slot = getMangoSlot(index, totalQuestions)
          const bucketTop = `${72 + (index % 3) * 4}%`
          const bucketLeft = `${28 + (index % 2) * 24}%`
          const isLatestCollect = collected && index === correctCount - 1

          if (collected) {
            if (isLatestCollect) {
              return (
                <motion.span
                  key={`mango-${index}`}
                  initial={{ top: slot.top, left: slot.left, opacity: 1, scale: 1 }}
                  animate={{
                    top: bucketTop,
                    left: bucketLeft,
                    scale: [1, 1.2, 0.85],
                    rotate: [0, 18, -8, 0],
                  }}
                  transition={{ duration: 0.65, ease: 'easeIn' }}
                  className="absolute z-20 text-base md:text-lg"
                  role="img"
                  aria-hidden
                >
                  🥭
                </motion.span>
              )
            }

            return (
              <span
                key={`mango-${index}`}
                className="absolute z-20 text-base md:text-lg"
                style={{ top: bucketTop, left: bucketLeft }}
                role="img"
                aria-hidden
              >
                🥭
              </span>
            )
          }

          return (
            <motion.span
              key={`mango-${index}`}
              animate={
                isFailure
                  ? { opacity: [1, 0.55, 1], y: [0, -2, 0] }
                  : { y: [0, -3, 0] }
              }
              transition={{ duration: isFailure ? 1.2 : 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute z-10 text-base md:text-lg"
              style={{ top: slot.top, left: slot.left }}
              role="img"
              aria-hidden
            >
              🥭
            </motion.span>
          )
        })}

        <div className="absolute bottom-2 left-1/2 z-30 -translate-x-1/2 text-2xl md:text-3xl">
          🪣
        </div>

        <AnimatePresence>
          {isSuccess ? (
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: [0, 1.3, 1] }}
              exit={{ opacity: 0 }}
              className="absolute left-1/2 top-[8%] z-40 -translate-x-1/2 text-xl"
            >
              ⭐
            </motion.span>
          ) : null}
        </AnimatePresence>

        <AnimatePresence>
          {isFailure ? (
            <motion.span
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: [0, 1, 1], y: [4, 0, 0] }}
              exit={{ opacity: 0 }}
              className="absolute bottom-[18%] left-1/2 z-40 -translate-x-1/2 whitespace-nowrap text-[9px] font-extrabold text-orange-600 md:text-[10px]"
            >
              {t('sideGames.mango.soClose')}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>

      <p className="mt-2 text-center text-[10px] text-slate-500 md:text-xs">
        {t('sideGames.answered', { answered, total: totalQuestions })}
      </p>
    </div>
  )
}
