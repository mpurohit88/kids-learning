import type { Letter } from '../../types'
import { KannadaSoundHints } from './KannadaSoundHints'

interface LetterOptionLabelProps {
  letter: Letter
  showSoundHints?: boolean
}

export function LetterOptionLabel({ letter, showSoundHints = false }: LetterOptionLabelProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span>{letter.character}</span>
      {showSoundHints ? <KannadaSoundHints letter={letter} layout="stacked" /> : null}
    </div>
  )
}
