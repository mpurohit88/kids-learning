import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface RoadSignButtonProps {
  id: string
  selectedId: string | null
  wobbleId: string | null
  isLocked: boolean
  onClick: (id: string) => void
  children: ReactNode
}

export function RoadSignButton({
  id,
  selectedId,
  wobbleId,
  isLocked,
  onClick,
  children,
}: RoadSignButtonProps) {
  const isSelected = selectedId === id
  const shouldWobble = wobbleId === id

  let stateClass = 'bg-amber-300 text-amber-950 border-amber-500 hover:bg-amber-200'
  if (isLocked && isSelected) {
    stateClass = 'bg-amber-400 text-amber-950 border-amber-600'
  }

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      animate={shouldWobble ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
      transition={{ duration: 0.35 }}
      disabled={isLocked}
      onClick={() => onClick(id)}
      className={`flex min-h-14 w-full flex-col items-center justify-center rounded-2xl border-4 px-3 py-3 text-xl font-extrabold shadow-lg transition md:min-h-16 md:text-2xl ${stateClass}`}
    >
      {children}
    </motion.button>
  )
}
