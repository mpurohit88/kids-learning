import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AnswerOptionButton } from '../components/game/AnswerOptionButton'
import { LetterOptionLabel } from '../components/game/LetterOptionLabel'
import { QuizGameShell } from '../components/game/QuizGameShell'
import { dataService } from '../data'
import { useGameSession } from '../hooks/useGameSession'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { playAudio } from '../utils/audioPlayer'
import { playKannadaLetterAudio } from '../utils/kannadaLetterAudio'
import { pickDistractors, shuffleArray } from '../utils/arrayUtils'
import { getOptionButtonClass, getOptionGridClass } from '../utils/gameConfig'
import type { Letter } from '../types'
import { isLanguageSubject } from '../types'

export function LetterRecognitionGame() {
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
      resetRoundUi(t('games.findLetter.prompt'))

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
      correctMessage: t('feedback.letterCorrect'),
      wrongMessage: t('feedback.letterWrong', { letter: targetLetter.character }),
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
      title={t('games.findLetter.title')}
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
      onHearAgain={session.isLocked ? undefined : replayAudio}
      hearAgainLabel={t('common.hearAgain')}
    >
      <motion.div
        key={targetLetter.id}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex flex-col items-center justify-center gap-2 rounded-[2rem] bg-white px-8 py-6 shadow-xl"
      >
        {targetLetter.example ? (
          <>
            <span className="text-6xl md:text-7xl">{targetLetter.example.emoji}</span>
            <span className="text-xl font-bold text-slate-700 md:text-2xl">
              {targetLetter.character} for {targetLetter.example.word}
            </span>
          </>
        ) : (
          <span className="text-8xl font-bold text-slate-800 md:text-9xl">?</span>
        )}
      </motion.div>

      <p className="text-lg text-slate-600">
        {showSoundHints
          ? t('games.findLetter.instructionWithHints')
          : t('games.findLetter.instruction')}
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
