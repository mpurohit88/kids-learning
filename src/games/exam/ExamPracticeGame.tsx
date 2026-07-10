import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuizGameShell } from '../../components/game/QuizGameShell'
import { dataService } from '../../data'
import { useGameSession } from '../../hooks/useGameSession'
import { usePlayerSessionGate } from '../../hooks/usePlayerSessionGate'
import { useTranslation } from '../../hooks/useTranslation'
import { playLetterSound, playWordSound } from '../../utils/audio'
import { buildExamQuestions } from './buildExamQuestions'
import { FirstLetterQuestionView } from './FirstLetterQuestion'
import { LetterTypeQuestionView } from './LetterTypeQuestion'
import type { ExamQuestion } from './types'
import { isLanguageSubject } from '../../types'

export function ExamPracticeGame() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { ready, profileId, subject } = usePlayerSessionGate()

  const profile = dataService.getProfileById(profileId)
  const content =
    subject && isLanguageSubject(subject)
      ? dataService.getLanguageContent(subject)
      : null
  const ageGroup = profile?.ageGroup
  const letters = useMemo(() => {
    if (!subject || !ageGroup || !isLanguageSubject(subject)) return []
    return dataService.getLettersForProfile(subject, ageGroup)
  }, [subject, ageGroup])
  const vocabulary = useMemo(() => {
    if (!subject || !ageGroup || !isLanguageSubject(subject)) return []
    return dataService.getVocabularyForProfile(subject, ageGroup)
  }, [subject, ageGroup])

  const roundCount = dataService.getExamRoundCount()
  const [questions, setQuestions] = useState<ExamQuestion[]>([])

  const {
    roundIndex,
    correctCount,
    wrongCount,
    mood,
    message,
    showConfetti,
    feedbackType,
    selectedId,
    isLocked,
    isComplete,
    challengeSession,
    result,
    resetSession,
    resetRoundUi,
    recordAnswer,
    handlePlayAgain,
  } = useGameSession({
    roundCount,
    challengeId: 'exam-practice',
    advanceDelay: 1600,
  })

  const currentQuestion = questions[roundIndex]

  useEffect(() => {
    if (!ready) return
    if (profile?.ageGroup !== 'class2') {
      navigate('/activities', { replace: true })
    }
  }, [ready, profile?.ageGroup, navigate])

  const startGame = useCallback(() => {
    if (!subject || !isLanguageSubject(subject) || letters.length === 0 || vocabulary.length === 0) {
      return
    }
    const built = buildExamQuestions(subject, letters, vocabulary, roundCount)
    if (built.length === 0) return

    setQuestions(built)
    resetSession()
    resetRoundUi('Get ready for exam practice!')
  }, [subject, letters, vocabulary, roundCount, resetSession, resetRoundUi])

  useEffect(() => {
    if (!ready) return
    startGame()
  }, [ready, startGame])

  const replayPrompt = useCallback(() => {
    if (!currentQuestion || !content) return

    if (currentQuestion.type === 'first-letter') {
      playWordSound(currentQuestion.word, content.speechLang)
      return
    }

    if (!subject || !isLanguageSubject(subject)) return
    playLetterSound(currentQuestion.letter, subject, {
      mode: 'character',
      speechLang: content.speechLang,
    })
  }, [content, currentQuestion, subject])

  useEffect(() => {
    if (!currentQuestion || !content) return

    if (currentQuestion.type === 'first-letter') {
      resetRoundUi('Which letter does this word START with?')
      playWordSound(currentQuestion.word, content.speechLang)
      return
    }

    resetRoundUi('Is this letter a Swar or Vyanjan?')
    if (!subject || !isLanguageSubject(subject)) return
    playLetterSound(currentQuestion.letter, subject, {
      mode: 'character',
      speechLang: content.speechLang,
    })
  }, [currentQuestion, content, resetRoundUi, subject])

  const handleAnswer = (choiceId: string) => {
    if (!currentQuestion) return

    recordAnswer({
      selectedId: choiceId,
      correctId: currentQuestion.answerId,
      correctMessage: 'Super star! You got it!',
      wrongMessage: 'Good try! Keep practicing for the exam.',
      onAdvance: () => {},
    })
  }

  if (!ready || !profile || !content || !currentQuestion) return null

  return (
    <QuizGameShell
      title="Exam Practice"
      challengeId="exam-practice"
      roundIndex={roundIndex}
      roundCount={questions.length}
      correctCount={correctCount}
      wrongCount={wrongCount}
      isComplete={isComplete}
      challengeSession={challengeSession}
      feedbackType={feedbackType}
      showConfetti={showConfetti}
      mood={mood}
      message={message}
      result={result}
      onPlayAgain={() => handlePlayAgain(startGame)}
      roundLabel={t('common.question', undefined, 'Question')}
    >
      {currentQuestion.type === 'first-letter' ? (
        <FirstLetterQuestionView
          question={currentQuestion}
          selectedId={selectedId}
          isLocked={isLocked}
          onAnswer={handleAnswer}
          onHearAgain={isLocked ? undefined : replayPrompt}
          hearAgainLabel={t('common.hearAgain')}
        />
      ) : (
        <LetterTypeQuestionView
          question={currentQuestion}
          selectedId={selectedId}
          isLocked={isLocked}
          onAnswer={handleAnswer}
          onHearAgain={isLocked ? undefined : replayPrompt}
          hearAgainLabel={t('common.hearAgain')}
        />
      )}
    </QuizGameShell>
  )
}
