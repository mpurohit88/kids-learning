import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface BigButtonProps {
  children: ReactNode
  onClick: () => void
  color?: string
  className?: string
  ariaLabel?: string
}

export function BigButton({
  children,
  onClick,
  color = '#64b5f6',
  className = '',
  ariaLabel,
}: BigButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={`min-h-28 w-full rounded-3xl border-4 border-white px-6 py-5 text-2xl font-bold text-white shadow-lg transition-shadow hover:shadow-xl md:min-h-32 md:text-3xl ${className}`}
      style={{ backgroundColor: color }}
    >
      {children}
    </motion.button>
  )
}
