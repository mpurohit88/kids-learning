import { Mascot, type MascotMood } from '../Mascot'
import type { Ref } from 'react'

interface GameMascotHeaderProps {
  roundIndex: number
  roundCount: number
  mood: MascotMood
  message?: string
  onHearAgain?: () => void
  hearAgainLabel?: string
  /** Smaller speech bubble for short mobile prompts. */
  denseMessage?: boolean
  bearRef?: Ref<HTMLDivElement>
  /** Label before the counter, e.g. "Round" or "Letter". */
  roundLabel: string
}

export function GameMascotHeader({
  roundIndex,
  roundCount,
  mood,
  message,
  onHearAgain,
  hearAgainLabel,
  roundLabel,
  denseMessage = false,
  bearRef,
}: GameMascotHeaderProps) {
  return (
    <div className="relative w-full shrink-0">
      <p className="absolute left-0 top-0 z-10 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 shadow">
        {roundLabel} {Math.min(roundIndex + 1, roundCount)} / {roundCount}
      </p>
      <Mascot
        bearRef={bearRef}
        mood={mood}
        message={message}
        onHearAgain={onHearAgain}
        hearAgainLabel={hearAgainLabel}
        denseMessage={denseMessage}
      />
    </div>
  )
}
