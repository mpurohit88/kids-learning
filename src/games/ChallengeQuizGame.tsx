import { useCallback, useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { AnswerOptionButton } from '../components/game/AnswerOptionButton'
import { QuestionPromptRow } from '../components/game/QuestionPromptRow'
import { MathNotesPad } from '../components/game/MathNotesPad'
import { QuizGameShell } from '../components/game/QuizGameShell'
import { VerticalAdditionQuestion } from '../components/game/VerticalAdditionQuestion'
import { dataService } from '../data'
import { useGameSession } from '../hooks/useGameSession'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { speakText } from '../utils/audioPlayer'
import {
  getChallengeQuizDisplayPrompt,
  getChallengeQuizSpeechText,
  getQuestionAddends,
} from '../utils/challengeQuizPrompt'
import { getLocalizedChallenge } from '../utils/localizedContent'
import type { SessionQuestion, SessionQuestionOption, QuestionVisualItem, UiLocale } from '../types'

const SPEECH_LANG: Record<UiLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
}

function VisualItemDisplay({ item }: { item: QuestionVisualItem }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border-2 border-slate-200 bg-slate-50 px-4 py-5">
      {item.imagePath ? (
        <img
          src={item.imagePath}
          alt=""
          className="h-20 w-20 object-contain md:h-24 md:w-24"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : null}
      {item.emoji ? (
        <span className="text-5xl md:text-6xl" aria-hidden>
          {item.emoji}
        </span>
      ) : null}
      <span className="mt-2 text-center text-base font-semibold text-slate-700 md:text-lg">
        {item.label}
      </span>
    </div>
  )
}

function OptionLabel({ option }: { option: SessionQuestionOption }) {
  return (
    <span className="flex flex-col items-center gap-2">
      {option.imagePath ? (
        <img
          src={option.imagePath}
          alt=""
          className="h-12 w-12 object-contain md:h-14 md:w-14"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
      ) : option.emoji ? (
        <span className="text-3xl md:text-4xl" aria-hidden>
          {option.emoji}
        </span>
      ) : null}
      <span>{option.text}</span>
    </span>
  )
}

export function ChallengeQuizGame() {
  const navigate = useNavigate()
  const { challengeId = '' } = useParams()
  const { t, locale } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)

  const profile = dataService.getProfileById(profileId)
  const challenge =
    subject && challengeId
      ? dataService.getChallenge(subject, challengeId)
      : undefined
  const localizedChallenge = challenge ? getLocalizedChallenge(t, challenge) : undefined

  const [questions, setQuestions] = useState<SessionQuestion[]>([])
  const [currentQuestion, setCurrentQuestion] = useState<SessionQuestion | null>(null)

  const session = useGameSession({
    roundCount: questions.length || 5,
    challengeId,
  })

  const { resetSession, resetRoundUi, recordAnswer, handlePlayAgain } = session

  const speakQuestion = useCallback(
    (question: SessionQuestion) => {
      void speakText(getChallengeQuizSpeechText(question, t), SPEECH_LANG[locale])
    },
    [locale, t],
  )

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

    const questionCount =
      challengeId === 'heavy-and-light'
        ? 8
        : dataService.getRoundCount(profile.ageGroup, subject)

    const generated = dataService.generateSession({
      subject,
      challengeId,
      grade: profile.ageGroup,
      count: questionCount,
    })

    if (generated.length === 0) return

    setQuestions(generated)
    setCurrentQuestion(generated[0])
    resetSession()
    resetRoundUi(getChallengeQuizDisplayPrompt(generated[0], t))
  }, [subject, profile, challengeId, resetSession, resetRoundUi, t])

  useEffect(() => {
    startGame()
  }, [startGame])

  useEffect(() => {
    const question = questions[session.roundIndex]
    if (!question) return
    setCurrentQuestion(question)
    resetRoundUi(getChallengeQuizDisplayPrompt(question, t))
    speakQuestion(question)
  }, [session.roundIndex, questions, resetRoundUi, speakQuestion, t])

  const handleSelect = (optionId: string) => {
    if (!currentQuestion) return

    recordAnswer({
      selectedId: optionId,
      correctId: currentQuestion.correctOptionId,
      correctMessage: t('feedback.greatJob', undefined, 'Great job!'),
      wrongMessage: currentQuestion.explanation ?? t('common.tryAgain', undefined, 'Good try!'),
      onAdvance: () => {},
    })
  }

  const replayAudio = () => {
    if (currentQuestion) {
      speakQuestion(currentQuestion)
    }
  }

  if (!profile || !challenge || !currentQuestion || !localizedChallenge) return null

  const optionGridClass =
    currentQuestion.options.length <= 2
      ? 'grid-cols-2'
      : currentQuestion.options.length === 3
        ? 'grid-cols-3'
        : 'grid-cols-2 md:grid-cols-4'

  const localizedPrompt = getChallengeQuizDisplayPrompt(currentQuestion, t)
  const hasVisualItems = (currentQuestion.visualItems?.length ?? 0) >= 2
  const addends = getQuestionAddends(currentQuestion)
  const showVerticalAddition = addends !== null

  return (
    <QuizGameShell
      title={localizedChallenge.title}
      challengeId={challengeId}
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
      roundLabel={t('common.question', undefined, 'Question')}
    >
      <motion.div
        key={currentQuestion.id}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex w-full max-w-5xl flex-col items-stretch gap-4 md:flex-row md:items-stretch md:justify-center"
      >
        <div className="flex flex-1 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white px-6 py-8 shadow-xl">
        {hasVisualItems ? (
          <div className="grid w-full grid-cols-2 gap-4">
            {currentQuestion.visualItems!.map((item) => (
              <VisualItemDisplay key={item.label} item={item} />
            ))}
          </div>
        ) : showVerticalAddition && addends ? (
          <VerticalAdditionQuestion
            addends={addends}
            onHearAgain={session.isLocked ? undefined : replayAudio}
            hearAgainLabel={t('maths.hearQuestion', undefined, 'Listen to question')}
          />
        ) : (
          <>
            {currentQuestion.emoji ? (
              <span className="whitespace-pre-wrap text-center text-4xl leading-relaxed md:text-5xl">
                {currentQuestion.emoji}
              </span>
            ) : null}

            <QuestionPromptRow
              onHearAgain={session.isLocked ? undefined : replayAudio}
              hearAgainLabel={t('maths.hearQuestion', undefined, 'Listen to question')}
              className={currentQuestion.emoji ? 'mt-4' : undefined}
              textClassName="text-center text-2xl font-bold text-slate-800 md:text-3xl"
            >
              {localizedPrompt}
            </QuestionPromptRow>
          </>
        )}

        {hasVisualItems ? (
          <QuestionPromptRow
            onHearAgain={session.isLocked ? undefined : replayAudio}
            hearAgainLabel={t('maths.hearQuestion', undefined, 'Listen to question')}
            className="mt-4"
            textClassName="text-center text-2xl font-bold text-slate-800 md:text-3xl"
          >
            {localizedPrompt}
          </QuestionPromptRow>
        ) : null}
        </div>

        <MathNotesPad
          questionKey={currentQuestion.id}
          label={t('maths.notes', undefined, 'Notes')}
          clearLabel={t('maths.clearNotes', undefined, 'Clear notes')}
          className="shrink-0"
        />
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
            className="min-h-24 rounded-3xl border-4 border-white px-4 py-4 text-xl font-bold shadow-lg transition md:min-h-28 md:text-2xl"
          >
            <OptionLabel option={option} />
          </AnswerOptionButton>
        ))}
      </div>
    </QuizGameShell>
  )
}
