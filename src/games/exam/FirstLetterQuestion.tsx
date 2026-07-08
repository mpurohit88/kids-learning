import { motion } from 'framer-motion'
import { AnswerOptionButton } from '../../components/game/AnswerOptionButton'
import { QuestionPromptRow } from '../../components/game/QuestionPromptRow'
import type { FirstLetterQuestion } from './types'

interface FirstLetterQuestionViewProps {
  question: FirstLetterQuestion
  selectedId: string | null
  isLocked: boolean
  onAnswer: (choiceId: string) => void
  onHearAgain?: () => void
  hearAgainLabel?: string
}

export function FirstLetterQuestionView({
  question,
  selectedId,
  isLocked,
  onAnswer,
  onHearAgain,
  hearAgainLabel = 'Hear again',
}: FirstLetterQuestionViewProps) {
  return (
    <>
      <motion.div
        key={question.word.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-44 w-44 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-xl md:h-52 md:w-52"
      >
        <span className="text-7xl md:text-8xl">{question.word.emoji}</span>
        <span className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl">
          {question.word.word}
        </span>
      </motion.div>

      <QuestionPromptRow onHearAgain={onHearAgain} hearAgainLabel={hearAgainLabel}>
        Which letter does this word <span className="text-blue-600">start</span> with?
      </QuestionPromptRow>

      <div className="grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
        {question.options.map((letter) => (
          <AnswerOptionButton
            key={letter.id}
            id={letter.id}
            correctId={question.answerId}
            selectedId={selectedId}
            isLocked={isLocked}
            onClick={onAnswer}
            className="min-h-28 rounded-3xl border-4 border-white text-5xl font-bold shadow-lg transition md:min-h-32 md:text-6xl"
          >
            {letter.character}
          </AnswerOptionButton>
        ))}
      </div>
    </>
  )
}
