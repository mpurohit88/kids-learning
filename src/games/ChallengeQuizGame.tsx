import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { AnswerOptionButton } from '../components/game/AnswerOptionButton'
import { QuizGameShell } from '../components/game/QuizGameShell'
import { dataService } from '../data'
import { useGameSession } from '../hooks/useGameSession'
import { useAppStore } from '../store/useAppStore'
import type { SessionQuestion } from '../types'

export function ChallengeQuizGame() {
  const navigate = useNavigate()
  const { challengeId = '' } = useParams()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)

  const profile = dataService.getProfileById(profileId)
  const challenge =
    subject && challengeId
      ? dataService.getChallenge(subject, challengeId)
      : undefined

  const [questions, setQuestions] = useState<SessionQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<SessionQuestion | null>(null)

  const session = useGameSession({
    roundCount: questions.length || 5,
    challengeId,
  })

  const { resetSession, resetRoundUi, recordAnswer, handlePlayAgain } = session

  useEffect(() => {
    if (!profileId || !subject) {
      navigate('/', { replace: true })
      return
    }
    if (!challenge) {
      navigate('/activities', { replace: true })
    }
  }, [profileId, subject, challenge, navigate])

  const startGame = useCallback(() => {
    if (!subject || !profile || !challengeId) return

    const generated = dataService.generateSession({
      subject,
      challengeId,
      grade: profile.ageGroup,
      count: 5,
    })

    if (generated.length === 0) return

    setQuestions(generated)
    setCurrentQuestion(generated[0])
    resetSession()
    resetRoundUi(generated[0]?.prompt ?? 'Let\'s begin!')
  }, [subject, profile, challengeId, resetSession, resetRoundUi])

  useEffect(() => {
    startGame()
  }, [startGame])

  useEffect(() => {
    const question = questions[session.roundIndex]
    if (!question) return
    setCurrentQuestion(question)
    resetRoundUi(question.prompt)
  }, [session.roundIndex, questions, resetRoundUi])

  const handleSelect = (optionId: string) => {
    if (!currentQuestion) return

    recordAnswer({
      selectedId: optionId,
      correctId: currentQuestion.correctOptionId,
      correctMessage: 'Great job!',
      wrongMessage: currentQuestion.explanation ?? 'Good try!',
      onAdvance: () => {},
    })
  }

  if (!profile || !challenge || !currentQuestion) return null

  const optionGridClass =
    currentQuestion.options.length <= 2
      ? 'grid-cols-2'
      : currentQuestion.options.length === 3
        ? 'grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4'

  return (
    <QuizGameShell
      title={challenge.title}
      roundIndex={session.roundIndex}
      roundCount={questions.length}
      correctCount={session.correctCount}
      wrongCount={session.wrongCount}
      isComplete={session.isComplete}
      challengeSession={session.challengeSession}
      feedbackType={session.feedbackType}
      showConfetti={session.showConfetti}
      mood={session.mood}
      message={session.message}
      result={session.result}
      onPlayAgain={() => handlePlayAgain(startGame)}
      roundLabel="Question"
    >
      <motion.div
        key={currentQuestion.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex min-h-44 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white px-6 py-8 shadow-xl"
      >
        {currentQuestion.emoji ? (
          <span className="whitespace-pre-wrap text-center text-4xl leading-relaxed md:text-5xl">
            {currentQuestion.emoji}
          </span>
        ) : null}
        <p className="mt-3 text-center text-2xl font-bold text-slate-800 md:text-3xl">
          {currentQuestion.prompt}
        </p>
      </motion.div>

      <div className={`grid w-full max-w-3xl gap-4 ${optionGridClass}`}>
        {currentQuestion.options.map((option) => (
          <AnswerOptionButton
            key={option.id}
            id={option.id}
            correctId={currentQuestion.correctOptionId}
            selectedId={session.selectedId}
            isLocked={session.isLocked}
            onClick={handleSelect}
            className="min-h-24 rounded-3xl border-4 border-white px-4 py-4 text-2xl font-bold shadow-lg transition md:min-h-28 md:text-3xl"
          >
            {option.text}
          </AnswerOptionButton>
        ))}
      </div>
    </QuizGameShell>
  )
}
