import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '../../components/layout/AppShell'
import { ConfettiBurst } from '../../components/ConfettiBurst'
import { GameCompleteModal } from '../../components/GameCompleteModal'
import { Mascot } from '../../components/Mascot'
import { PronunciationProgress } from '../../components/pronunciation/PronunciationProgress'
import { dataService } from '../../data'
import { usePlayerSessionGate } from '../../hooks/usePlayerSessionGate'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { playCelebrationSound, prepareAudio, stopAudio } from '../../utils/audio'
import { buildRoundResult } from '../../utils/gameHelpers'
import { speakSyllableBreakdown, speakWordNormal } from '../../utils/pronunciationSpeech'
import type { PronunciationWord } from '../../types'

export function ClapItOutGame() {
  const { t } = useTranslation()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const saveGameResult = useAppStore((state) => state.saveGameResult)
  const profile = dataService.getProfileById(profileId)

  const roundCount =
    profile && subject ? dataService.getRoundCount(profile.ageGroup, subject) : 5

  const [words, setWords] = useState<PronunciationWord[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [activeChunk, setActiveChunk] = useState(-1)
  const [clapIndex, setClapIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))
  const playTokenRef = useRef(0)

  const currentWord = words[roundIndex] ?? null

  const setupRound = useCallback(
    (index: number, pool: PronunciationWord[]) => {
      const word = pool[index]
      if (!word) return
      setActiveChunk(-1)
      setClapIndex(0)
      setMood('idle')
      setMessage(t('games.sayIt.clap.prompt'))
      setShowConfetti(false)
    },
    [t],
  )

  const startGame = useCallback(() => {
    const pool = dataService.getPronunciationRound(roundCount)
    if (pool.length === 0) return
    setWords(pool)
    setRoundIndex(0)
    setCompletedCount(0)
    setIsComplete(false)
    setupRound(0, pool)
  }, [roundCount, setupRound])

  useEffect(() => {
    if (!ready || subject !== 'english') return
    startGame()
  }, [ready, subject, startGame])

  useEffect(() => {
    return () => {
      playTokenRef.current += 1
      stopAudio()
    }
  }, [])

  const playBreakdown = async () => {
    if (!currentWord || isPlaying) return
    void prepareAudio()
    const token = ++playTokenRef.current
    setIsPlaying(true)
    setMessage(t('games.sayIt.clap.listen'))
    try {
      await speakSyllableBreakdown(currentWord.syllables, currentWord.word, (index) => {
        if (token !== playTokenRef.current) return
        setActiveChunk(index)
      })
      if (token !== playTokenRef.current) return
      setActiveChunk(-1)
      setMessage(t('games.sayIt.clap.yourTurn'))
    } finally {
      if (token === playTokenRef.current) setIsPlaying(false)
    }
  }

  const handleClap = () => {
    if (!currentWord || isPlaying) return
    const next = clapIndex + 1
    setClapIndex(next)
    setActiveChunk(Math.min(next - 1, currentWord.syllables.length - 1))
    void prepareAudio()
    void speakWordNormal(
      currentWord.syllables[Math.min(next - 1, currentWord.syllables.length - 1)],
    )

    if (next >= currentWord.syllables.length) {
      setMood('happy')
      setMessage(t('games.sayIt.clap.niceClapping'))
      setShowConfetti(true)
      playCelebrationSound()
      window.setTimeout(() => advanceAfterWord(), 900)
    }
  }

  const advanceAfterWord = () => {
    const nextCompleted = completedCount + 1
    setCompletedCount(nextCompleted)
    const nextIndex = roundIndex + 1
    if (nextIndex >= words.length) {
      const roundResult = buildRoundResult(nextCompleted, words.length)
      setResult(roundResult)
      setIsComplete(true)
      if (profileId && subject) {
        saveGameResult({
          profileId,
          subject,
          challengeId: 'clap-it-out',
          correct: nextCompleted,
          total: words.length,
          stars: roundResult.stars,
        })
      }
      return
    }
    setRoundIndex(nextIndex)
    setupRound(nextIndex, words)
  }

  const handleSkipToNext = () => {
    if (!currentWord || isPlaying) return
    setMood('encourage')
    setMessage(t('games.sayIt.keepGoing'))
    advanceAfterWord()
  }

  if (!ready || subject !== 'english' || !currentWord) return null

  return (
    <AppShell title={t('challenges.clap-it-out.title')} showBack backTo="/games/say-it">
      <ConfettiBurst active={showConfetti} />
      {isComplete ? (
        <GameCompleteModal
          result={result}
          challengeId="clap-it-out"
          onPlayAgain={startGame}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-5">
          <PronunciationProgress
            completed={completedCount}
            total={words.length}
            label={t('games.sayIt.progress', {
              current: Math.min(completedCount + 1, words.length),
              total: words.length,
            })}
          />

          <Mascot mood={mood} message={message || t('games.sayIt.clap.prompt')} />

          <div className="flex w-full max-w-xl flex-col items-center gap-4 rounded-[2rem] border-4 border-white bg-white px-6 py-8 shadow-xl">
            {currentWord.priority ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                {t('games.sayIt.priorityBadge')}
              </span>
            ) : null}

            <p className="text-4xl font-bold capitalize text-slate-800 md:text-5xl">
              {currentWord.word}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-1">
              {currentWord.syllables.map((chunk, index) => (
                <div key={`${currentWord.id}-${chunk}-${index}`} className="flex items-center gap-1">
                  <motion.span
                    animate={{
                      scale: activeChunk === index ? 1.15 : 1,
                      backgroundColor:
                        activeChunk === index ? '#99f6e4' : '#f1f5f9',
                    }}
                    className="rounded-2xl px-3 py-2 text-2xl font-bold text-slate-700 md:text-3xl"
                  >
                    {chunk}
                  </motion.span>
                  {index < currentWord.syllables.length - 1 ? (
                    <span className="text-2xl font-bold text-slate-400" aria-hidden>
                      •
                    </span>
                  ) : null}
                </div>
              ))}
            </div>

            <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void playBreakdown()}
                disabled={isPlaying}
                className="flex-1 rounded-3xl bg-teal-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-teal-400 active:scale-95 disabled:opacity-60"
              >
                {t('games.sayIt.clap.hearChunks')}
              </button>
              <button
                type="button"
                onClick={handleClap}
                disabled={isPlaying}
                className="flex-1 rounded-3xl bg-sky-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-400 active:scale-95 disabled:opacity-60"
              >
                {t('games.sayIt.clap.clapButton', {
                  current: Math.min(clapIndex + 1, currentWord.syllables.length),
                  total: currentWord.syllables.length,
                })}
              </button>
            </div>

            <button
              type="button"
              onClick={handleSkipToNext}
              disabled={isPlaying}
              className="text-base font-semibold text-slate-500 underline-offset-2 hover:underline"
            >
              {t('games.sayIt.nextWord')}
            </button>
          </div>
        </div>
      )}
    </AppShell>
  )
}
