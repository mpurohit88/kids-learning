import { QuestionHearButton } from './QuestionHearButton'

interface VerticalAdditionQuestionProps {
  addends: number[]
  onHearAgain?: () => void
  hearAgainLabel: string
}

function padDigits(value: number, columnCount: number): string[] {
  const digits = String(value).split('')
  const padding = columnCount - digits.length
  return [...Array(Math.max(padding, 0)).fill(''), ...digits]
}

function getColumnLabels(columnCount: number): string[] {
  if (columnCount >= 3) return ['H', 'T', 'O']
  if (columnCount === 2) return ['T', 'O']
  return ['O']
}

export function VerticalAdditionQuestion({
  addends,
  onHearAgain,
  hearAgainLabel,
}: VerticalAdditionQuestionProps) {
  const columnCount = Math.max(...addends.map((value) => String(value).length))
  const columnLabels = getColumnLabels(columnCount)
  const digitClass =
    'inline-flex w-9 items-center justify-center text-4xl font-bold tabular-nums text-slate-800 md:w-11 md:text-5xl'
  const labelClass =
    'inline-flex w-9 items-center justify-center text-sm font-bold uppercase tracking-wide text-slate-500 md:w-11 md:text-base'
  const operatorColumnClass = `${digitClass} text-slate-700`

  return (
    <div className="flex items-center justify-center gap-4">
      <div
        className="rounded-2xl border-2 border-slate-100 bg-slate-50 px-5 py-4"
        aria-label={addends.join(' plus ')}
      >
        <div className="flex justify-end">
          {columnLabels.map((label, index) => (
            <span key={`label-${label}-${index}`} className={labelClass}>
              {label}
            </span>
          ))}
        </div>

        {addends.map((addend, rowIndex) => {
          const digits = padDigits(addend, columnCount)
          const isLastRow = rowIndex === addends.length - 1

          return (
            <div
              key={`${addend}-${rowIndex}`}
              className={`flex items-center ${rowIndex === 0 ? 'mt-1' : 'mt-1'}`}
            >
              {isLastRow ? (
                <span className={operatorColumnClass}>+</span>
              ) : (
                <span className={`${operatorColumnClass} opacity-0`}>+</span>
              )}
              {digits.map((digit, index) => (
                <span key={`${rowIndex}-${index}`} className={digitClass}>
                  {digit}
                </span>
              ))}
            </div>
          )
        })}

        <div className="mt-2 ml-9 border-t-4 border-slate-800 md:ml-11" />

        <div className="mt-2 flex justify-end pr-1">
          <span className={`${digitClass} min-w-[4.5rem] md:min-w-[5.5rem]`}>?</span>
        </div>
      </div>

      {onHearAgain ? (
        <QuestionHearButton onClick={onHearAgain} ariaLabel={hearAgainLabel} />
      ) : null}
    </div>
  )
}
