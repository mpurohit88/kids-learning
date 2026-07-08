import type { Letter } from '../../types'
import { KannadaSoundHints } from './KannadaSoundHints'

interface LetterOptionLabelProps {
  letter: Letter
  showSoundHints?: boolean
}

export function LetterOptionLabel({ letter, showSoundHints = false }: LetterOptionLabelProps) {
  const hasBothCases = letter.lowerCase && letter.lowerCase !== letter.character

  return (
    <div className="flex flex-col items-center gap-1">
      {hasBothCases ? (
        <span className="flex items-center gap-1 leading-none">
          <span>{letter.character}</span>
          <span className="text-base font-normal opacity-50">/</span>
          <span>{letter.lowerCase}</span>
        </span>
      ) : (
        <span>{letter.character}</span>
      )}
      {letter.example ? (
        <span className="text-xs font-normal opacity-70">{letter.example.word}</span>
      ) : null}
      {showSoundHints ? <KannadaSoundHints letter={letter} layout="stacked" /> : null}
    </div>
  )
}
