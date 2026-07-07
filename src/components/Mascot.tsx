import { motion, AnimatePresence } from 'framer-motion'

export type MascotMood = 'idle' | 'happy' | 'sad' | 'encourage'

interface MascotProps {
  mood: MascotMood
  message?: string
}

export function Mascot({ mood, message }: MascotProps) {
  const isHappy = mood === 'happy'
  const isSad = mood === 'sad' || mood === 'encourage'

  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={
          isHappy
            ? { y: [0, -28, -8, 0], scale: [1, 1.08, 1.05, 1], rotate: [0, -6, 6, 0] }
            : isSad
              ? { y: [0, 6, 0], scale: [1, 0.92, 0.95], rotate: [0, -3, 3, 0] }
              : { y: [0, -4, 0] }
        }
        transition={{
          duration: isHappy ? 0.65 : isSad ? 0.55 : 2.5,
          repeat: mood === 'idle' ? Infinity : 0,
          ease: 'easeOut',
        }}
        className={`relative flex h-28 w-28 items-center justify-center rounded-full shadow-lg md:h-32 md:w-32 ${
          isHappy
            ? 'bg-gradient-to-br from-yellow-200 to-amber-300'
            : isSad
              ? 'bg-gradient-to-br from-slate-200 to-blue-200'
              : 'bg-gradient-to-br from-amber-200 to-orange-300'
        }`}
      >
        <span className="text-6xl md:text-7xl" role="img" aria-label="Mascot bear">
          🐻
        </span>

        <AnimatePresence>
          {isHappy ? (
            <motion.span
              key="smile"
              initial={{ opacity: 0, scale: 0, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0 }}
              className="absolute -bottom-1 text-3xl"
            >
              😄
            </motion.span>
          ) : null}
          {isSad ? (
            <motion.span
              key="sad"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-1 text-2xl"
            >
              😢
            </motion.span>
          ) : null}
        </AnimatePresence>

        {isHappy ? (
          <motion.span
            animate={{ scale: [1, 1.3, 1], rotate: [0, 15, 0] }}
            transition={{ duration: 0.5, repeat: 2 }}
            className="absolute -right-1 -top-1 text-2xl"
          >
            ✨
          </motion.span>
        ) : null}
      </motion.div>

      <AnimatePresence mode="wait">
        {message ? (
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="max-w-sm rounded-2xl bg-white/90 px-5 py-3 text-center text-lg font-semibold text-slate-700 shadow-md"
          >
            {message}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
