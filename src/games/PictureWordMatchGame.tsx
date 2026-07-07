import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { AnswerFeedbackOverlay, type AnswerFeedbackType } from '../components/AnswerFeedbackOverlay'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { GameCompleteModal } from '../components/GameCompleteModal'
import { Mascot } from '../components/Mascot'
import { getLanguageContent, getVocabularyForProfile } from '../data'
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
import type { VocabularyWord } from '../types'

export function PictureWordMatchGame() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const language = useAppStore((state) => state.language)
  const addStars = useAppStore((state) => state.addStars)

  const profile = getProfileById(profileId)
  const content = language ? getLanguageContent(language) : null
  const vocabulary = useMemo(() => {
    if (!language || !profile) return []
    return getVocabularyForProfile(language, profile.ageGroup)
  }, [language, profile])

  const roundCount = profile ? getRoundCount(profile.ageGroup) : 5
  const optionCount = profile ? getOptionCount(profile.ageGroup) : 3

  const [roundIndex, setRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [roundWords, setRoundWords] = useState<VocabularyWord[]>([])
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null)
  const [options, setOptions] = useState<VocabularyWord[]>([])
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('What word matches the picture?')
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
    (index: number, wordsPool: VocabularyWord[]) => {
      const target = wordsPool[index % wordsPool.length]
      const distractors = pickDistractors(wordsPool, target, optionCount)
      const nextOptions = shuffleArray([target, ...distractors])

      setTargetWord(target)
      setOptions(nextOptions)
      setSelectedId(null)
      setIsLocked(false)
      setMood('idle')
      setMessage('What word matches the picture?')
      setShowConfetti(false)
      setFeedbackType(null)

      void playAudio(
        target.audioPath,
        target.word,
        content?.speechLang,
        target.transliteration,
      )
    },
    [content?.speechLang, optionCount],
  )

  const startGame = useCallback(() => {
    if (vocabulary.length === 0) return
    const shuffled = shuffleArray(vocabulary).slice(0, roundCount)
    setRoundWords(shuffled.length > 0 ? shuffled : vocabulary)
    setRoundIndex(0)
    setCorrectCount(0)
    setIsComplete(false)
    setupRound(0, shuffled.length > 0 ? shuffled : vocabulary)
  }, [vocabulary, roundCount, setupRound])

  useEffect(() => {
    startGame()
  }, [startGame])

  const handleSelect = (word: VocabularyWord) => {
    if (isLocked || !targetWord) return

    setSelectedId(word.id)
    setIsLocked(true)

    const isCorrect = word.id === targetWord.id

    if (isCorrect) {
      setCorrectCount((count) => count + 1)
      setMood('happy')
      setMessage('Wonderful! You got it!')
      setShowConfetti(true)
      setFeedbackType('success')
      playCelebrationSound()
    } else {
      setMood('encourage')
      setMessage('Nice try! It was ' + targetWord.word)
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
          addStars(profileId, language, 'picture-word-match', roundResult.stars)
        }
        return
      }

      setRoundIndex(nextIndex)
      setupRound(nextIndex, roundWords)
    }, 1500)
  }

  const replayAudio = () => {
    if (targetWord) {
      void playAudio(
        targetWord.audioPath,
        targetWord.word,
        content?.speechLang,
        targetWord.transliteration,
      )
    }
  }

  if (!profile || !content || !targetWord) return null

  return (
    <AppShell title="Picture Match" showBack backTo="/activities">
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
            Hear Word
          </button>
        </div>

        <Mascot mood={mood} message={message} />

        <motion.div
          key={targetWord.id}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex h-48 w-48 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-xl md:h-56 md:w-56"
        >
          <img
            src={targetWord.imagePath}
            alt=""
            className="h-28 w-28 object-contain"
            onError={(event) => {
              event.currentTarget.style.display = 'none'
            }}
          />
          <span className="text-7xl md:text-8xl">{targetWord.emoji}</span>
        </motion.div>

        <div
          className={`grid w-full max-w-3xl gap-4 ${
            optionCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2'
          }`}
        >
          {options.map((word) => {
            const isSelected = selectedId === word.id
            const isCorrectOption = word.id === targetWord.id
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
                key={word.id}
                type="button"
                whileTap={{ scale: 0.95 }}
                disabled={isLocked}
                onClick={() => handleSelect(word)}
                className={`min-h-24 rounded-3xl border-4 border-white px-4 py-4 text-3xl font-bold shadow-lg transition md:min-h-28 md:text-4xl ${buttonClass}`}
              >
                {word.word}
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
