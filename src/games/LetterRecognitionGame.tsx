import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AnswerOptionButton } from '../components/game/AnswerOptionButton'
import { LetterOptionLabel } from '../components/game/LetterOptionLabel'
import { QuizGameShell } from '../components/game/QuizGameShell'
import { dataService } from '../data'
import { useGameSession } from '../hooks/useGameSession'
import { useAppStore } from '../store/useAppStore'
import { playAudio } from '../utils/audioPlayer'
import { playKannadaLetterAudio } from '../utils/kannadaLetterAudio'
import { pickDistractors, shuffleArray } from '../utils/arrayUtils'
import { getOptionButtonClass, getOptionGridClass } from '../utils/gameConfig'
import type { Letter } from '../types'
import { isLanguageSubject } from '../types'

export function LetterRecognitionGame() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)

  const profile = dataService.getProfileById(profileId)
  const content =
    subject && isLanguageSubject(subject)
      ? dataService.getLanguageContent(subject)
      : null
  const letters = useMemo(() => {
    if (!subject || !profile || !isLanguageSubject(subject)) return []
    return dataService.getLettersForLetterGames(subject, profile.ageGroup)
  }, [subject, profile])

  const roundCount =
    profile && subject ? dataService.getRoundCount(profile.ageGroup, subject) : 5
  const optionCount =
    profile && subject ? dataService.getOptionCount(profile.ageGroup, subject) : 3

  const [roundLetters, setRoundLetters] = useState<Letter[]>([])
  const [targetLetter, setTargetLetter] = useState<Letter | null>(null)
  const [options, setOptions] = useState<Letter[]>([])

  const session = useGameSession({
    roundCount,
    challengeId: 'letter-recognition',
  })

  const { resetSession, resetRoundUi, recordAnswer, handlePlayAgain } = session

  useEffect(() => {
    if (!profileId || !subject) {
      navigate('/', { replace: true })
    }
  }, [profileId, subject, navigate])

  const showSoundHints = subject === 'kannada'

  const playTargetLetterAudio = useCallback(
    (letter: Letter) => {
      if (showSoundHints) {
        playKannadaLetterAudio(letter, content?.speechLang)
        return
      }

      void playAudio(
        letter.audioPath,
        letter.character,
        content?.speechLang,
        letter.name,
      )
    },
    [content?.speechLang, showSoundHints],
  )

  const setupRound = useCallback(
    (index: number, lettersPool: Letter[]) => {
      const target = lettersPool[index % lettersPool.length]
      const distractors = pickDistractors(lettersPool, target, optionCount)
      const nextOptions = shuffleArray([target, ...distractors])

      setTargetLetter(target)
      setOptions(nextOptions)
      resetRoundUi('Listen and find the letter!')

      playTargetLetterAudio(target)
    },
    [optionCount, playTargetLetterAudio, resetRoundUi],
  )

  const startGame = useCallback(() => {
    if (letters.length === 0) return
    const shuffled = shuffleArray(letters).slice(0, roundCount)
    const pool = shuffled.length > 0 ? shuffled : letters
    setRoundLetters(pool)
    resetSession()
    setupRound(0, pool)
  }, [letters, roundCount, resetSession, setupRound])

  useEffect(() => {
    startGame()
  }, [startGame])

  const handleSelect = (letterId: string) => {
    if (!targetLetter) return

    recordAnswer({
      selectedId: letterId,
      correctId: targetLetter.id,
      correctMessage: 'Yes! Great job!',
      wrongMessage: 'Good try! The answer was ' + targetLetter.character,
      onAdvance: (nextIndex) => setupRound(nextIndex, roundLetters),
    })
  }

  const replayAudio = () => {
    if (targetLetter) {
      playTargetLetterAudio(targetLetter)
    }
  }

  if (!profile || !content || !targetLetter) return null

  return (
    <QuizGameShell
      title="Find the Letter"
      roundIndex={session.roundIndex}
      roundCount={roundCount}
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
    >
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

      <p className="text-lg text-slate-600">
        {showSoundHints
          ? 'Tap the matching letter. Hindi and English hints are shown below each option.'
          : 'Tap the matching letter.'}
      </p>

      <div className={`grid w-full max-w-5xl gap-3 ${getOptionGridClass(optionCount)}`}>
        {options.map((letter) => (
          <AnswerOptionButton
            key={letter.id}
            id={letter.id}
            correctId={targetLetter.id}
            selectedId={session.selectedId}
            isLocked={session.isLocked}
            onClick={handleSelect}
            className={getOptionButtonClass(optionCount)}
          >
            <LetterOptionLabel letter={letter} showSoundHints={showSoundHints} />
          </AnswerOptionButton>
        ))}
      </div>
    </QuizGameShell>
  )
}
