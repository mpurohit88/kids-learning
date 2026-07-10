import { QuestionHearButton } from './QuestionHearButton'
import type { ComparisonPayload } from '../../types'

interface ComparisonQuestionProps {
  comparison: ComparisonPayload
  onHearAgain?: () => void
  hearAgainLabel: string
  ariaLabel: string
}

function BlankOval() {
  return (
    <span
      className="inline-flex h-14 w-16 items-center justify-center rounded-full border-4 border-dashed border-teal-400 bg-teal-50 text-2xl font-bold text-teal-600 md:h-16 md:w-20 md:text-3xl"
      aria-hidden
    >
      ?
    </span>
  )
}

export function ComparisonQuestion({
  comparison,
  onHearAgain,
  hearAgainLabel,
  ariaLabel,
}: ComparisonQuestionProps) {
  const numberClass =
    'text-4xl font-bold tabular-nums text-slate-800 md:text-5xl'

  return (
    <div className="flex items-center justify-center gap-4">
      <div
        className="flex flex-wrap items-center justify-center gap-3 rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-6 md:gap-4"
        aria-label={ariaLabel}
      >
        <span className={numberClass}>{comparison.left}</span>

        {comparison.mode === 'symbol' ? (
          <>
            <BlankOval />
            <span className={numberClass}>{comparison.right}</span>
          </>
        ) : (
          <>
            <span className="text-4xl font-bold text-teal-700 md:text-5xl">
              {comparison.symbol}
            </span>
            <BlankOval />
          </>
        )}
      </div>

      {onHearAgain ? (
        <QuestionHearButton onClick={onHearAgain} ariaLabel={hearAgainLabel} />
      ) : null}
    </div>
  )
}
