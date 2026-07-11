import type { WhCheckpointId, WhPictureMatch } from '../../types'
import { RoadSignButton } from './RoadSignButton'

interface PictureMatchChallengeProps {
  pictureMatch: WhPictureMatch
  options: WhCheckpointId[]
  selectedId: string | null
  wobbleId: string | null
  isLocked: boolean
  getWordLabel: (id: WhCheckpointId) => string
  onSelect: (id: WhCheckpointId) => void
}

export function PictureMatchChallenge({
  pictureMatch,
  options,
  selectedId,
  wobbleId,
  isLocked,
  getWordLabel,
  onSelect,
}: PictureMatchChallengeProps) {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div className="flex h-40 w-40 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-xl md:h-48 md:w-48">
        {pictureMatch.emoji ? (
          <span className="text-7xl md:text-8xl" aria-hidden>
            {pictureMatch.emoji}
          </span>
        ) : null}
      </div>
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
