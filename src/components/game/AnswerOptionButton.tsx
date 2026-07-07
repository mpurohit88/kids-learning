import type { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface AnswerOptionButtonProps {
  id: string
  correctId: string
  selectedId: string | null
  isLocked: boolean
  onClick: (id: string) => void
  className?: string
  children: ReactNode
}

function getOptionButtonClassName(
  isLocked: boolean,
  isSelected: boolean,
  isCorrectOption: boolean,
): string {
  if (isLocked && isSelected && isCorrectOption) {
    return 'bg-green-400 text-white'
  }
  if (isLocked && isSelected && !isCorrectOption) {
    return 'bg-red-300 text-white'
  }
  if (isLocked && isCorrectOption) {
    return 'bg-green-300 text-white'
  }
  return 'bg-white text-slate-800 hover:bg-blue-50'
}

export function AnswerOptionButton({
  id,
  correctId,
  selectedId,
  isLocked,
  onClick,
  className = '',
  children,
}: AnswerOptionButtonProps) {
  const isSelected = selectedId === id
  const isCorrectOption = id === correctId
  const stateClass = getOptionButtonClassName(isLocked, isSelected, isCorrectOption)

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      disabled={isLocked}
      onClick={() => onClick(id)}
      className={`${className} ${stateClass}`}
    >
      {children}
    </motion.button>
  )
}
