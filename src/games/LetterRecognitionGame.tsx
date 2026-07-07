import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AnswerFeedbackOverlay, type AnswerFeedbackType } from '../components/AnswerFeedbackOverlay'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { GameCompleteModal } from '../components/GameCompleteModal'
import { Mascot } from '../components/Mascot'
import { getLanguageContent, getLettersForProfile } from '../data'
import { getProfileById } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'
import {
  playAudio,
  playCelebrationSound,
  playEncouragementSound,
} from '../utils/audioPlayer'
import {
  buildRoundResult,
  getOptionCount,
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
    return getLettersForProfile(language, profile.ageGroup)
  }, [language, profile])

  const roundCount = profile ? getRoundCount(profile.ageGroup) : 5
  const optionCount = profile ? getOptionCount(profile.ageGroup) : 3

  const [roundIndex, setRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [roundLetters, setRoundLetters] = useState<Letter[]>([])
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null)
  const [options, setOptions] = useState<Letter[]>([])
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('Listen and find the letter!')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
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
    setIsComplete(false)
    setupRound(0, shuffled.length > 0 ? shuffled : letters)
  }, [letters, roundCount, setupRound])

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
      setMood('encourage')
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
      <div className="relative flex flex-1 flex-col items-center gap-6">
        <ConfettiBurst active={showConfetti} />

        <div className="flex w-full items-center justify-between">
          <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
            Round {Math.min(roundIndex + 1, roundCount)} / {roundCount}
          </p>
          <button
            type="button"
            onClick={replayAudio}
            className="flex items-center gap-2 rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-orange-300"
          >
            <Volume2 size={20} />
            Hear Again
          </button>
        </div>

        <Mascot mood={mood} message={message} />

        <motion.div
          key={targetLetter.id}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-36 w-36 items-center justify-center rounded-[2rem] bg-white text-7xl font-bold text-slate-800 shadow-xl md:h-44 md:w-44 md:text-8xl"
        >
          ?
        </motion.div>

        <p className="text-xl text-slate-600">Tap the matching letter</p>

        <div
          className={`grid w-full max-w-3xl gap-4 ${
            optionCount === 3 ? 'grid-cols-3' : 'grid-cols-2 md:grid-cols-4'
          }`}
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
                className={`min-h-28 rounded-3xl border-4 border-white text-5xl font-bold shadow-lg transition md:min-h-32 md:text-6xl ${buttonClass}`}
              >
                {letter.character}
              </motion.button>
            )
          })}
        </div>
      </div>

      {isComplete ? (
        <GameCompleteModal
          result={result}
          onPlayAgain={startGame}
          onBackToMenu={() => navigate('/activities')}
        />
      ) : null}
    </AppShell>
  )
}
