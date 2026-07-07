import { motion, AnimatePresence } from 'framer-motion'

interface MascotProps {
  mood: 'idle' | 'happy' | 'encourage'
  message?: string
}

export function Mascot({ mood, message }: MascotProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.div
        animate={
          mood === 'happy'
            ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] }
            : mood === 'encourage'
              ? { x: [0, -4, 4, 0] }
              : { y: [0, -4, 0] }
        }
        transition={{
          duration: mood === 'idle' ? 2.5 : 0.6,
          repeat: mood === 'idle' ? Infinity : 0,
          ease: 'easeInOut',
        }}
        className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-amber-200 to-orange-300 shadow-lg md:h-32 md:w-32"
      >
        <span className="text-6xl md:text-7xl" role="img" aria-label="Mascot">
          🐻
        </span>
        <span className="absolute -right-1 -top-1 text-2xl">✨</span>
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
