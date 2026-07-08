import type { ReactNode } from 'react'
import { QuestionHearButton } from './QuestionHearButton'

interface QuestionPromptRowProps {
  children: ReactNode
  onHearAgain?: () => void
  hearAgainLabel: string
  className?: string
  textClassName?: string
  buttonSize?: 'md' | 'lg'
}

export function QuestionPromptRow({
  children,
  onHearAgain,
  hearAgainLabel,
  className = '',
  textClassName = 'text-center text-xl font-semibold text-slate-700 md:text-2xl',
  buttonSize = 'md',
}: QuestionPromptRowProps) {
  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <p className={textClassName}>{children}</p>
      {onHearAgain ? (
        <QuestionHearButton
          onClick={onHearAgain}
          ariaLabel={hearAgainLabel}
          size={buttonSize}
        />
      ) : null}
    </div>
  )
}
