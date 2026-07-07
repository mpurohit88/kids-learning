import { motion } from 'framer-motion'
import { AnswerOptionButton } from '../../components/game/AnswerOptionButton'
import type { LetterTypeQuestion } from './types'

interface LetterTypeQuestionViewProps {
  question: LetterTypeQuestion
  selectedId: string | null
  isLocked: boolean
  onAnswer: (choiceId: string) => void
}

export function LetterTypeQuestionView({
  question,
  selectedId,
  isLocked,
  onAnswer,
}: LetterTypeQuestionViewProps) {
  return (
    <>
      <motion.div
        key={question.letter.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-44 w-44 items-center justify-center rounded-[2rem] border-4 border-white bg-white text-8xl font-bold text-slate-800 shadow-xl md:h-52 md:w-52"
      >
        {question.letter.character}
      </motion.div>

      <p className="text-xl font-semibold text-slate-700">
        Is this letter a Swar (vowel) or Vyanjan (consonant)?
      </p>

      <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
        {question.options.map((option) => (
          <AnswerOptionButton
            key={option.id}
            id={option.id}
            correctId={question.answerId}
            selectedId={selectedId}
            isLocked={isLocked}
            onClick={onAnswer}
            className="min-h-28 rounded-3xl border-4 border-white px-4 py-4 text-2xl font-bold shadow-lg transition md:min-h-32 md:text-3xl"
          >
            {option.label}
          </AnswerOptionButton>
        ))}
      </div>
    </>
  )
}
