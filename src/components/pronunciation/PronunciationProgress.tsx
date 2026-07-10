interface PronunciationProgressProps {
  completed: number
  total: number
  label: string
}

/** Simple star-step progress for self-paced pronunciation (no pass/fail ladder). */
export function PronunciationProgress({
  completed,
  total,
  label,
}: PronunciationProgressProps) {
  return (
    <div className="flex flex-col items-center gap-2" aria-label={label}>
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        {Array.from({ length: total }, (_, index) => {
          const done = index < completed
          return (
            <span
              key={index}
              className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg transition ${
                done
                  ? 'bg-amber-300 shadow'
                  : 'bg-white/70 text-slate-300 ring-2 ring-slate-200'
              }`}
              aria-hidden
            >
              {done ? '⭐' : '○'}
            </span>
          )
        })}
      </div>
    </div>
  )
}
