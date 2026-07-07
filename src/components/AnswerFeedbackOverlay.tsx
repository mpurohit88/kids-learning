import { AnimatePresence, motion } from 'framer-motion'

export type AnswerFeedbackType = 'success' | 'wrong' | null

interface AnswerFeedbackOverlayProps {
  type: AnswerFeedbackType
}

export function AnswerFeedbackOverlay({ type }: AnswerFeedbackOverlayProps) {
  return (
    <AnimatePresence>
      {type === 'success' ? (
        <motion.div
          key="success"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center bg-green-400/10"
        >
          <motion.div
            initial={{ scale: 0, rotate: -30 }}
            animate={{ scale: [0, 1.35, 1], rotate: [0, 12, 0] }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 14 }}
            className="flex flex-col items-center"
          >
            <motion.span
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 0.5, repeat: 1 }}
              className="text-[7rem] drop-shadow-2xl md:text-[8rem]"
            >
              ⭐
            </motion.span>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2 rounded-full bg-amber-300 px-8 py-3 text-3xl font-extrabold text-amber-900 shadow-xl md:text-4xl"
            >
              Correct!
            </motion.p>
          </motion.div>

          {Array.from({ length: 8 }).map((_, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [1, 1, 0],
                scale: [0, 1.2, 0.6],
                x: Math.cos((index / 8) * Math.PI * 2) * 120,
                y: Math.sin((index / 8) * Math.PI * 2) * 120,
              }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="absolute text-4xl"
            >
              ✨
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
