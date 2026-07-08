import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { QuizGameShell } from '../../components/game/QuizGameShell'
import { dataService } from '../../data'
import { useGameSession } from '../../hooks/useGameSession'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { playAudio } from '../../utils/audioPlayer'
import { buildExamQuestions } from './buildExamQuestions'
import { FirstLetterQuestionView } from './FirstLetterQuestion'
import { LetterTypeQuestionView } from './LetterTypeQuestion'
import type { ExamQuestion } from './types'
import { isLanguageSubject } from '../../types'

export function ExamPracticeGame() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)

  const profile = dataService.getProfileById(profileId)
  const content =
    subject && isLanguageSubject(subject)
      ? dataService.getLanguageContent(subject)
      : null
  const letters = useMemo(() => {
    if (!subject || !profile || !isLanguageSubject(subject)) return []
    return dataService.getLettersForProfile(subject, profile.ageGroup)
  }, [subject, profile])
  const vocabulary = useMemo(() => {
    if (!subject || !profile || !isLanguageSubject(subject)) return []
    return dataService.getVocabularyForProfile(subject, profile.ageGroup)
  }, [subject, profile])

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
    if (!profileId || !subject) {
      navigate('/', { replace: true })
      return
    }
    if (profile?.ageGroup !== 'class2') {
      navigate('/activities', { replace: true })
    }
  }, [profileId, subject, profile?.ageGroup, navigate])

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
    startGame()
  }, [startGame])

  const replayPrompt = useCallback(() => {
    if (!currentQuestion || !content) return

    if (currentQuestion.type === 'first-letter') {
      void playAudio(
        currentQuestion.word.audioPath,
        currentQuestion.word.word,
        content.speechLang,
        currentQuestion.word.transliteration,
      )
      return
    }

    void playAudio(
      currentQuestion.letter.audioPath,
      currentQuestion.letter.character,
      content.speechLang,
      currentQuestion.letter.name,
    )
  }, [content, currentQuestion])

  useEffect(() => {
    if (!currentQuestion || !content) return

    if (currentQuestion.type === 'first-letter') {
      resetRoundUi('Which letter does this word START with?')
      void playAudio(
        currentQuestion.word.audioPath,
        currentQuestion.word.word,
        content.speechLang,
        currentQuestion.word.transliteration,
      )
      return
    }

    resetRoundUi('Is this letter a Swar or Vyanjan?')
    void playAudio(
      currentQuestion.letter.audioPath,
      currentQuestion.letter.character,
      content.speechLang,
      currentQuestion.letter.name,
    )
  }, [currentQuestion, content, resetRoundUi])

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

  if (!profile || !content || !currentQuestion) return null

  return (
    <QuizGameShell
      title="Exam Practice"
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
