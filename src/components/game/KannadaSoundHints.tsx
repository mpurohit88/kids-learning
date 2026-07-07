import type { Letter } from '../../types'
import { getKannadaSoundHints } from '../../utils/kannadaLetterHints'

interface KannadaSoundHintsProps {
  letter: Letter
  layout?: 'stacked' | 'inline'
}

export function KannadaSoundHints({ letter, layout = 'stacked' }: KannadaSoundHintsProps) {
  const { hindi, english } = getKannadaSoundHints(letter.name)

  if (layout === 'inline') {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl bg-white/90 px-5 py-3 shadow">
        <span className="text-sm font-semibold text-slate-500">Sounds like</span>
        {hindi ? (
          <span className="rounded-xl bg-orange-50 px-3 py-1 text-2xl font-bold text-slate-700">
            {hindi}
          </span>
        ) : null}
        {hindi ? <span className="text-slate-400">·</span> : null}
        <span className="rounded-xl bg-blue-50 px-3 py-1 text-xl font-bold uppercase text-blue-700">
          {english}
        </span>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-0.5">
      {hindi ? (
        <span className="text-base font-semibold text-slate-500 md:text-lg">{hindi}</span>
      ) : null}
      <span className="text-sm font-bold uppercase tracking-wide text-blue-600 md:text-base">
        {english}
      </span>
    </div>
  )
}
