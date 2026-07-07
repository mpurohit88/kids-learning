import { AnimatePresence, motion } from 'framer-motion'

export type AnswerFeedbackType = 'success' | 'wrong' | null

interface AnswerFeedbackOverlayProps {
  type: AnswerFeedbackType
}

const jumpingStars = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  x: (index - 4) * 52 + (index % 2 === 0 ? 18 : -18),
  delay: index * 0.07,
  size: index % 3 === 0 ? 'text-6xl' : index % 3 === 1 ? 'text-5xl' : 'text-4xl',
}))

export function AnswerFeedbackOverlay({ type }: AnswerFeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {type === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center overflow-hidden bg-green-400/15"
        >
          {jumpingStars.map((star) => (
            <motion.span
              key={star.id}
              initial={{ opacity: 0, y: 80, x: star.x, scale: 0.2, rotate: -20 }}
              animate={{
                opacity: [0, 1, 1, 0.9, 0],
                y: [80, -30, -110, -90, -130],
                scale: [0.2, 1.4, 1.1, 1.25, 0.7],
                rotate: [-20, 12, -8, 6, 0],
              }}
              transition={{
                delay: star.delay,
                duration: 0.95,
                ease: 'easeOut',
              }}
              className={`absolute ${star.size} drop-shadow-lg`}
            >
              ⭐
            </motion.span>
          ))}

          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.4, 1], rotate: [0, 10, 0] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.12 }}
            className="flex flex-col items-center"
          >
            <motion.span
              animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
              transition={{ duration: 0.55, repeat: 1 }}
              className="text-[7rem] drop-shadow-2xl md:text-[8rem]"
            >
              ⭐
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-2 rounded-full bg-amber-300 px-8 py-3 text-3xl font-extrabold text-amber-900 shadow-xl md:text-4xl"
            >
              Correct!
            </motion.p>
          </motion.div>

          {Array.from({ length: 12 }).map((_, index) => (
            <motion.span
              key={`spark-${index}`}
              initial={{ opacity: 1, scale: 0, x: 0, y: 20 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.3, 0.5],
                x: Math.cos((index / 12) * Math.PI * 2) * (90 + (index % 3) * 20),
                y: Math.sin((index / 12) * Math.PI * 2) * (90 + (index % 3) * 20),
              }}
              transition={{ duration: 0.85, ease: 'easeOut', delay: 0.05 + index * 0.02 }}
              className="absolute text-3xl"
            >
              {index % 2 === 0 ? '✨' : '💫'}
            </motion.span>
          ))}
        </motion.div>
      ) : null}

      {type === 'wrong' ? (
        <motion.div
          key="wrong"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-orange-300/10"
        >
          <motion.div
            initial={{ scale: 0.8, x: 0 }}
            animate={{ x: [-8, 8, -6, 6, 0], scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.45 }}
            className="flex flex-col items-center"
          >
            <span className="text-6xl md:text-7xl">🙂</span>
            <p className="mt-3 rounded-full bg-white/95 px-8 py-3 text-2xl font-bold text-slate-700 shadow-xl md:text-3xl">
              Try again!
            </p>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
