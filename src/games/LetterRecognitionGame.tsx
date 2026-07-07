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
import { getLanguageContent, getLettersForLetterGames } from '../data'
import { getProfileById } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'
import {
  playAudio,
  playCelebrationSound,
  playEncouragementSound,
} from '../utils/audioPlayer'
import {
  buildRoundResult,
  getOptionButtonClass,
  getOptionCount,
  getOptionGridClass,
  getRoundCount,
  pickDistractors,
  shuffleArray,
} from '../utils/gameHelpers'
import type { Letter } from '../types'

export function LetterRecognitionGame() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const language = useAppStore((state) => state.language)
  const addStars = useAppStore((state) => state.addStars)

  const profile = getProfileById(profileId)
  const content = language ? getLanguageContent(language) : null
  const letters = useMemo(() => {
    if (!language || !profile) return []
    return getLettersForLetterGames(language, profile.ageGroup)
  }, [language, profile])

  const roundCount = profile && language ? getRoundCount(profile.ageGroup, language) : 5
  const optionCount = profile && language ? getOptionCount(profile.ageGroup, language) : 3

  const [roundIndex, setRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [roundLetters, setRoundLetters] = useState<Letter[]>([])
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null)
  const [options, setOptions] = useState<Letter[]>([])
  const [mood, setMood] = useState<'idle' | 'happy' | 'sad'>('idle')
  const [message, setMessage] = useState('Listen and find the letter!')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [challengeSession, setChallengeSession] = useState(0)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))

  useEffect(() => {
    if (!profileId || !language) {
      navigate('/', { replace: true })
    }
  }, [profileId, language, navigate])

  const setupRound = useCallback(
    (index: number, lettersPool: Letter[]) => {
      const target = lettersPool[index % lettersPool.length]
      const distractors = pickDistractors(lettersPool, target, optionCount)
      const nextOptions = shuffleArray([target, ...distractors])

      setTargetLetter(target)
      setOptions(nextOptions)
      setSelectedId(null)
      setIsLocked(false)
      setMood('idle')
      setMessage('Listen and find the letter!')
      setShowConfetti(false)
      setFeedbackType(null)

      void playAudio(
        target.audioPath,
        target.character,
        content?.speechLang,
        target.name,
      )
    },
    [content?.speechLang, optionCount],
  )

  const startGame = useCallback(() => {
    if (letters.length === 0) return
    const shuffled = shuffleArray(letters).slice(0, roundCount)
    setRoundLetters(shuffled.length > 0 ? shuffled : letters)
    setRoundIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setIsComplete(false)
    setupRound(0, shuffled.length > 0 ? shuffled : letters)
  }, [letters, roundCount, setupRound])

  const handlePlayAgain = () => {
    setChallengeSession((session) => session + 1)
    startGame()
  }

  useEffect(() => {
    startGame()
  }, [startGame])

  const handleSelect = (letter: Letter) => {
    if (isLocked || !targetLetter) return

    setSelectedId(letter.id)
    setIsLocked(true)

    const isCorrect = letter.id === targetLetter.id

    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      setMood('happy')
      setMessage('Yes! Great job!')
      setShowConfetti(true)
      setFeedbackType('success')
      playCelebrationSound()
    } else {
      setWrongCount((count) => count + 1)
      setMood('sad')
      setMessage('Good try! The answer was ' + targetLetter.character)
      setFeedbackType('wrong')
      playEncouragementSound()
    }

    window.setTimeout(() => {
      const nextIndex = roundIndex + 1
      if (nextIndex >= roundCount) {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0)
        const roundResult = buildRoundResult(finalCorrect, roundCount)
        setResult(roundResult)
        setIsComplete(true)
        if (profileId && language) {
          addStars(profileId, language, 'letter-recognition', roundResult.stars)
        }
        return
      }

      setRoundIndex(nextIndex)
      setupRound(nextIndex, roundLetters)
    }, 1500)
  }

  const replayAudio = () => {
    if (targetLetter) {
      void playAudio(
        targetLetter.audioPath,
        targetLetter.character,
        content?.speechLang,
        targetLetter.name,
      )
    }
  }

  if (!profile || !content || !targetLetter) return null

  return (
    <AppShell title="Find the Letter" showBack backTo="/activities">
      <AnswerFeedbackOverlay type={feedbackType} />
      <div className="relative flex flex-1 flex-col gap-4">
        <ConfettiBurst active={showConfetti} />

        <GameSideLayout
          sidePanel={
            <GameChallengeSidebar
              key={challengeSession}
              totalQuestions={roundCount}
              correctCount={correctCount}
              wrongCount={wrongCount}
              isComplete={isComplete}
            />
          }
        >
          <div className="flex w-full items-center justify-start">
            <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
              Round {Math.min(roundIndex + 1, roundCount)} / {roundCount}
            </p>
          </div>

          <Mascot mood={mood} message={message} />

          <div className="flex items-center gap-4">
            <motion.div
              key={targetLetter.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex h-36 w-36 items-center justify-center rounded-[2rem] bg-white text-7xl font-bold text-slate-800 shadow-xl md:h-44 md:w-44 md:text-8xl"
            >
              ?
            </motion.div>

            <button
              type="button"
              aria-label="Hear again"
              onClick={replayAudio}
              className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-orange-400 text-white shadow-lg transition hover:bg-orange-300 md:h-24 md:w-24"
            >
              <Volume2 size={36} strokeWidth={2.5} />
            </button>
          </div>

          <p className="text-xl text-slate-600">Tap the matching letter</p>

          <div
            className={`grid w-full max-w-5xl gap-3 ${getOptionGridClass(optionCount)}`}
          >
            {options.map((letter) => {
              const isSelected = selectedId === letter.id
              const isCorrectOption = letter.id === targetLetter.id
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
                  onClick={() => handleSelect(letter)}
                  className={`${getOptionButtonClass(optionCount)} ${buttonClass}`}
                >
                  {letter.character}
                </motion.button>
              )
            })}
          </div>
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
