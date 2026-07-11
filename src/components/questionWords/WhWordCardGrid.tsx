import { useNavigate } from 'react-router-dom'
import { LearnSectionLabel } from '../learn/LearnSectionLabel'
import type { WhCheckpoint } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'
import { prepareAudio } from '../../utils/audio'

interface WhWordCardGridProps {
  words: WhCheckpoint[]
  compact?: boolean
  onWordSelect?: (word: WhCheckpoint) => void
}

export function WhWordCardGrid({ words, compact = false, onWordSelect }: WhWordCardGridProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()

  const handleSelect = (word: WhCheckpoint) => {
    void prepareAudio()
    if (onWordSelect) {
      onWordSelect(word)
      return
    }
    navigate(`/learn/question-words/${word.id}`)
  }

  return (
    <div className="flex flex-col gap-3">
      {compact ? (
        <LearnSectionLabel>{t('learn.questionWords.sectionTitle')}</LearnSectionLabel>
      ) : null}
      <div
        className={`grid gap-3 ${
          compact ? 'grid-cols-3 sm:grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'
        }`}
      >
        {words.map((word) => (
          <button
            key={word.id}
            type="button"
            onClick={() => handleSelect(word)}
            className={`flex flex-col items-center justify-center rounded-[1.25rem] border-4 border-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg active:scale-95 ${
              compact ? 'min-h-28 px-2 py-3' : 'min-h-36 px-3 py-4'
            }`}
            style={{ backgroundColor: word.color ?? '#42a5f5' }}
          >
            <span className={compact ? 'text-3xl' : 'text-4xl'} aria-hidden>
              {word.emoji}
            </span>
            <span
              className={`mt-1 font-bold text-white drop-shadow ${
                compact ? 'text-lg' : 'text-2xl'
              }`}
            >
              {word.word}
            </span>
            <span className="mt-1 line-clamp-2 text-center text-xs font-semibold text-white/90">
              {t(`learn.questionWords.words.${word.id}.hint`)}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
