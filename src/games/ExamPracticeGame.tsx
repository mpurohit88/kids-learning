import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { GameSideLayout } from '../components/layout/GameSideLayout'
import { AnswerFeedbackOverlay, type AnswerFeedbackType } from '../components/AnswerFeedbackOverlay'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { GameCompleteModal } from '../components/GameCompleteModal'
import { Mascot } from '../components/Mascot'
import { GameChallengeSidebar } from '../components/GameChallengeSidebar'
import { getLanguageContent, getLettersForProfile, getVocabularyForProfile } from '../data'
import { getProfileById } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'
import {
  playAudio,
  playCelebrationSound,
  playEncouragementSound,
} from '../utils/audioPlayer'
import {
  buildRoundResult,
  getExamRoundCount,
  getFirstGrapheme,
  getOptionCount,
  pickDistractors,
  shuffleArray,
} from '../utils/gameHelpers'
import type { Language, Letter, VocabularyWord } from '../types'

interface LetterTypeOption {
  id: string
  label: string
  value: 'vowel' | 'consonant'
}

interface FirstLetterQuestion {
  type: 'first-letter'
  word: VocabularyWord
  options: Letter[]
  answerId: string
}

interface LetterTypeQuestion {
  type: 'letter-type'
  letter: Letter
  options: LetterTypeOption[]
  answerId: string
}

type ExamQuestion = FirstLetterQuestion | LetterTypeQuestion

function getLetterTypeLabels(language: Language) {
  if (language === 'kannada') {
    return { vowel: 'ಸ್ವರ (Vowel)', consonant: 'ವ್ಯಂಜನ (Consonant)' }
  }
  return { vowel: 'स्वर (Vowel)', consonant: 'व्यंजन (Consonant)' }
}

function buildExamQuestions(
  language: Language,
  letters: Letter[],
  vocabulary: VocabularyWord[],
  roundCount: number,
): ExamQuestion[] {
  const letterByChar = new Map(letters.map((letter) => [letter.character, letter]))
  const examWords = vocabulary.filter((word) => {
    const first = getFirstGrapheme(word.word)
    return letterByChar.has(first)
  })

  const firstLetterPool: FirstLetterQuestion[] = examWords.map((word) => {
    const firstChar = getFirstGrapheme(word.word)
    const answer = letterByChar.get(firstChar)!
    const optionCount = getOptionCount('class2')
    const distractors = pickDistractors(letters, answer, optionCount)
    return {
      type: 'first-letter',
      word,
      options: shuffleArray([answer, ...distractors]),
      answerId: answer.id,
    }
  })

  const typeLabels = getLetterTypeLabels(language)
  const letterTypePool: LetterTypeQuestion[] = letters.map((letter) => ({
    type: 'letter-type',
    letter,
    options: shuffleArray([
      { id: 'vowel', label: typeLabels.vowel, value: 'vowel' as const },
      { id: 'consonant', label: typeLabels.consonant, value: 'consonant' as const },
    ]),
    answerId: letter.type,
  }))

  const mixed = shuffleArray([
    ...firstLetterPool.slice(0, Math.ceil(roundCount * 0.6)),
    ...letterTypePool.slice(0, Math.ceil(roundCount * 0.4)),
  ])

  return mixed.slice(0, roundCount)
}

export function ExamPracticeGame() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const language = useAppStore((state) => state.language)
  const addStars = useAppStore((state) => state.addStars)

  const profile = getProfileById(profileId)
  const content = language ? getLanguageContent(language) : null
  const letters = useMemo(() => {
    if (!language || !profile) return []
    return getLettersForProfile(language, profile.ageGroup)
  }, [language, profile])
  const vocabulary = useMemo(() => {
    if (!language || !profile) return []
    return getVocabularyForProfile(language, profile.ageGroup)
  }, [language, profile])

  const roundCount = getExamRoundCount()

  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad'>('idle')
  const [message, setMessage] = useState('Get ready for exam practice!')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [challengeSession, setChallengeSession] = useState(0)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))

  const currentQuestion = questions[roundIndex]

  useEffect(() => {
    if (!profileId || !language) {
      navigate('/', { replace: true })
      return
    }
    if (profile?.ageGroup !== 'class2') {
      navigate('/activities', { replace: true })
    }
  }, [profileId, language, profile?.ageGroup, navigate])

  const resetRoundUi = useCallback((prompt: string) => {
    setSelectedId(null)
    setIsLocked(false)
    setMood('idle')
    setMessage(prompt)
    setShowConfetti(false)
    setFeedbackType(null)
  }, [])

  const startGame = useCallback(() => {
    if (!language || letters.length === 0 || vocabulary.length === 0) return
    const built = buildExamQuestions(language, letters, vocabulary, roundCount)
    if (built.length === 0) return

    setQuestions(built)
    setRoundIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setIsComplete(false)
    resetRoundUi('Get ready for exam practice!')
  }, [language, letters, vocabulary, roundCount, resetRoundUi])

  const handlePlayAgain = () => {
    setChallengeSession((session) => session + 1)
    startGame()
  }

  useEffect(() => {
    startGame()
  }, [startGame])

  const replayPrompt = () => {
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
  }

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
    if (isLocked || !currentQuestion) return

    setSelectedId(choiceId)
    setIsLocked(true)

    const isCorrect = choiceId === currentQuestion.answerId

    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      setMood('happy')
      setMessage('Super star! You got it!')
      setShowConfetti(true)
      setFeedbackType('success')
      playCelebrationSound()
    } else {
      setWrongCount((count) => count + 1)
      setMood('sad')
      setMessage('Good try! Keep practicing for the exam.')
      setFeedbackType('wrong')
      playEncouragementSound()
    }

    window.setTimeout(() => {
      const nextIndex = roundIndex + 1
      if (nextIndex >= questions.length) {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0)
        const roundResult = buildRoundResult(finalCorrect, questions.length)
        setResult(roundResult)
        setIsComplete(true)
        if (profileId && language) {
          addStars(profileId, language, 'exam-practice', roundResult.stars)
        }
        return
      }

      setRoundIndex(nextIndex)
    }, 1600)
  }

  if (!profile || !content || !currentQuestion) return null

  return (
    <AppShell title="Exam Practice" showBack backTo="/activities">
      <AnswerFeedbackOverlay type={feedbackType} />
      <div className="relative flex flex-1 flex-col gap-4">
        <ConfettiBurst active={showConfetti} />

        <GameSideLayout
          sidePanel={
            <GameChallengeSidebar
              key={challengeSession}
              totalQuestions={questions.length}
              correctCount={correctCount}
              wrongCount={wrongCount}
              isComplete={isComplete}
            />
          }
        >
          <div className="flex w-full items-center justify-between">
            <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
              Question {Math.min(roundIndex + 1, questions.length)} / {questions.length}
            </p>
            <button
              type="button"
              onClick={replayPrompt}
              className="flex items-center gap-2 rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-orange-300"
            >
              <Volume2 size={20} />
              Hear Again
            </button>
          </div>

          <Mascot mood={mood} message={message} />

          {currentQuestion.type === 'first-letter' ? (
          <>
            <motion.div
              key={currentQuestion.word.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-44 w-44 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-xl md:h-52 md:w-52"
            >
              <span className="text-7xl md:text-8xl">{currentQuestion.word.emoji}</span>
              <span className="mt-2 text-3xl font-bold text-slate-800 md:text-4xl">
                {currentQuestion.word.word}
              </span>
            </motion.div>

            <p className="text-xl font-semibold text-slate-700">
              Which letter does this word <span className="text-blue-600">start</span> with?
            </p>

            <div className="grid w-full max-w-3xl grid-cols-2 gap-4 md:grid-cols-4">
              {currentQuestion.options.map((letter) => {
                const isSelected = selectedId === letter.id
                const isCorrectOption = letter.id === currentQuestion.answerId
                let buttonClass = 'bg-white text-slate-800 hover:bg-blue-50'

                if (isLocked && isSelected && isCorrectOption) {
                  buttonClass = 'bg-green-400 text-white'
                } else if (isLocked && isSelected && !isCorrectOption) {
                  buttonClass = 'bg-red-300 text-white'
                } else if (isLocked && isCorrectOption) {
                  buttonClass = 'bg-green-300 text-white'
                }

                return (
                  <motion.button
                    key={letter.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    disabled={isLocked}
                    onClick={() => handleAnswer(letter.id)}
                    className={`min-h-28 rounded-3xl border-4 border-white text-5xl font-bold shadow-lg transition md:min-h-32 md:text-6xl ${buttonClass}`}
                  >
                    {letter.character}
                  </motion.button>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <motion.div
              key={currentQuestion.letter.id}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-44 w-44 items-center justify-center rounded-[2rem] border-4 border-white bg-white text-8xl font-bold text-slate-800 shadow-xl md:h-52 md:w-52"
            >
              {currentQuestion.letter.character}
            </motion.div>

            <p className="text-xl font-semibold text-slate-700">
              Is this letter a Swar (vowel) or Vyanjan (consonant)?
            </p>

            <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedId === option.id
                const isCorrectOption = option.id === currentQuestion.answerId
                let buttonClass = 'bg-white text-slate-800 hover:bg-blue-50'

                if (isLocked && isSelected && isCorrectOption) {
                  buttonClass = 'bg-green-400 text-white'
                } else if (isLocked && isSelected && !isCorrectOption) {
                  buttonClass = 'bg-red-300 text-white'
                } else if (isLocked && isCorrectOption) {
                  buttonClass = 'bg-green-300 text-white'
                }

                return (
                  <motion.button
                    key={option.id}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    disabled={isLocked}
                    onClick={() => handleAnswer(option.id)}
                    className={`min-h-28 rounded-3xl border-4 border-white px-4 py-4 text-2xl font-bold shadow-lg transition md:min-h-32 md:text-3xl ${buttonClass}`}
                  >
                    {option.label}
                  </motion.button>
                )
              })}
            </div>
          </>
        )}
        </GameSideLayout>
      </div>

      {isComplete ? (
        <GameCompleteModal
          result={result}
          onPlayAgain={handlePlayAgain}
          onBackToMenu={() => navigate('/activities')}
        />
      ) : null}
    </AppShell>
  )
}
