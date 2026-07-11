import { Volume2 } from 'lucide-react'

interface QuestionHearButtonProps {
  onClick: () => void
  ariaLabel: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeClasses = {
  sm: 'h-11 w-11 rounded-xl border-2',
  md: 'h-14 w-14 md:h-16 md:w-16',
  lg: 'h-20 w-20 md:h-24 md:w-24',
} as const

const iconSizes = {
  sm: 22,
  md: 28,
  lg: 36,
} as const

export function QuestionHearButton({
  onClick,
  ariaLabel,
  size = 'md',
}: QuestionHearButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onClick}
      className={`flex shrink-0 items-center justify-center border-orange-200 bg-orange-400 text-white shadow-lg transition hover:bg-orange-300 ${
        size === 'sm' ? sizeClasses.sm : `rounded-2xl border-4 ${sizeClasses[size]}`
      }`}
    >
      <Volume2 size={iconSizes[size]} strokeWidth={2.5} />
    </button>
  )
}
