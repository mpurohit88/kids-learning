import type { WhCheckpointId, WhExample } from '../../types'
import { RoadSignButton } from './RoadSignButton'

interface FillBlankSignChallengeProps {
  example: WhExample
  options: WhCheckpointId[]
  selectedId: string | null
  wobbleId: string | null
  isLocked: boolean
  getWordLabel: (id: WhCheckpointId) => string
  onSelect: (id: WhCheckpointId) => void
}

function formatBlankPrompt(prompt: string, blankIndex = 0): string {
  const words = prompt.split(/\s+/)
  if (blankIndex < 0 || blankIndex >= words.length) return prompt
  words[blankIndex] = '___'
  return words.join(' ')
}

export function FillBlankSignChallenge({
  example,
  options,
  selectedId,
  wobbleId,
  isLocked,
  getWordLabel,
  onSelect,
}: FillBlankSignChallengeProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <span className="text-4xl" aria-hidden>
        {example.emoji}
      </span>
      <p className="text-center text-2xl font-bold leading-snug text-slate-800 md:text-3xl">
        {formatBlankPrompt(example.prompt, example.blankIndex ?? 0)}
      </p>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-3">
        {options.map((optionId) => (
          <RoadSignButton
            key={optionId}
            id={optionId}
            selectedId={selectedId}
            wobbleId={wobbleId}
            isLocked={isLocked}
            onClick={() => onSelect(optionId)}
          >
            {getWordLabel(optionId)}
          </RoadSignButton>
        ))}
      </div>
    </div>
  )
}
