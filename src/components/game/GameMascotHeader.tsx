import { Mascot, type MascotMood } from '../Mascot'

interface GameMascotHeaderProps {
  roundIndex: number
  roundCount: number
  mood: MascotMood
  message?: string
  onHearAgain?: () => void
  hearAgainLabel?: string
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
}: GameMascotHeaderProps) {
  return (
    <div className="relative w-full shrink-0">
      <p className="absolute left-0 top-0 z-10 rounded-full bg-white/80 px-3 py-1 text-sm font-semibold text-slate-600 shadow">
        {roundLabel} {Math.min(roundIndex + 1, roundCount)} / {roundCount}
      </p>
      <Mascot
        mood={mood}
        message={message}
        onHearAgain={onHearAgain}
        hearAgainLabel={hearAgainLabel}
      />
    </div>
  )
}
