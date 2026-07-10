import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { AppShell } from '../../components/layout/AppShell'
import {
  AnswerFeedbackOverlay,
  type AnswerFeedbackType,
} from '../../components/AnswerFeedbackOverlay'
import { ConfettiBurst } from '../../components/ConfettiBurst'
import { GameCompleteModal } from '../../components/GameCompleteModal'
import { Mascot } from '../../components/Mascot'
import {
  FeedBearSyllableBoard,
  type SyllableChunk,
} from '../../components/pronunciation/FeedBearSyllableBoard'
import { PronunciationProgress } from '../../components/pronunciation/PronunciationProgress'
import { TapHereHint } from '../../components/pronunciation/TapHereHint'
import { dataService } from '../../data'
import { usePlayerSessionGate } from '../../hooks/usePlayerSessionGate'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { playCelebrationSound, prepareAudio, stopAudio } from '../../utils/audio'
import { buildRoundResult } from '../../utils/gameHelpers'
import { speakSyllableBreakdown, speakWordNormal } from '../../utils/pronunciationSpeech'
import type { PronunciationWord } from '../../types'

const HEAR_HINT_IDLE_MS = 4000
const FEED_HINT_IDLE_MS = 3000

function toChunks(word: PronunciationWord): SyllableChunk[] {
  return word.syllables.map((text, orderIndex) => ({
    id: `${word.id}-${orderIndex}-${text}`,
    text,
    orderIndex,
  }))
}

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
  const [fedOrderIndexes, setFedOrderIndexes] = useState<number[]>([])
  const [hasHeard, setHasHeard] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))
  const [showHearHint, setShowHearHint] = useState(false)
  const [showFeedHint, setShowFeedHint] = useState(false)
  const [idleEpoch, setIdleEpoch] = useState(0)
  const playTokenRef = useRef(0)
  const advanceTimerRef = useRef<number | null>(null)

  const currentWord = words[roundIndex] ?? null
  const chunks = useMemo(
    () => (currentWord ? toChunks(currentWord) : []),
    [currentWord],
  )

  const clearAdvanceTimer = () => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }

  const setupRound = useCallback(
    (index: number, pool: PronunciationWord[]) => {
      const word = pool[index]
      if (!word) return
      clearAdvanceTimer()
      setActiveChunk(-1)
      setFedOrderIndexes([])
      setHasHeard(false)
      setIsAdvancing(false)
      setMood('idle')
      setMessage(t('games.sayIt.feed.prompt'))
      setShowConfetti(false)
      setFeedbackType(null)
    },
    [t],
  )

  const startGame = useCallback(() => {
    const pool = dataService.getPronunciationRound(roundCount, { minSyllables: 2 })
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
      clearAdvanceTimer()
      stopAudio()
    }
  }, [])

  const waitingToHear =
    Boolean(currentWord) && !hasHeard && !isPlaying && !isAdvancing && !isComplete

  const waitingToFeed =
    Boolean(currentWord) &&
    hasHeard &&
    !isPlaying &&
    !isAdvancing &&
    !isComplete &&
    fedOrderIndexes.length < currentWord.syllables.length

  useEffect(() => {
    if (!waitingToHear) {
      setShowHearHint(false)
      return
    }
    setShowHearHint(false)
    const timerId = window.setTimeout(() => {
      setShowHearHint(true)
    }, HEAR_HINT_IDLE_MS)
    return () => window.clearTimeout(timerId)
  }, [waitingToHear, idleEpoch, currentWord?.id])

  useEffect(() => {
    if (!waitingToFeed) {
      setShowFeedHint(false)
      return
    }
    setShowFeedHint(false)
    const timerId = window.setTimeout(() => {
      setShowFeedHint(true)
    }, FEED_HINT_IDLE_MS)
    return () => window.clearTimeout(timerId)
  }, [waitingToFeed, idleEpoch, currentWord?.id, fedOrderIndexes.length])

  const noteActivity = () => {
    setShowHearHint(false)
    setShowFeedHint(false)
    setIdleEpoch((value) => value + 1)
  }

  const playBreakdown = async () => {
    if (!currentWord || isPlaying || isAdvancing) return
    void prepareAudio()
    const token = ++playTokenRef.current
    setIsPlaying(true)
    setMessage(t('games.sayIt.feed.listen'))
    try {
      await speakSyllableBreakdown(currentWord.syllables, currentWord.word, (index) => {
        if (token !== playTokenRef.current) return
        setActiveChunk(index)
      })
      if (token !== playTokenRef.current) return
      setActiveChunk(-1)
      setHasHeard(true)
      setMessage(t('games.sayIt.feed.yourTurn'))
    } finally {
      if (token === playTokenRef.current) setIsPlaying(false)
    }
  }

  const advanceAfterWord = useCallback(() => {
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
  }, [
    completedCount,
    profileId,
    roundIndex,
    saveGameResult,
    setupRound,
    subject,
    words,
  ])

  const handleFeedChunk = (chunk: SyllableChunk) => {
    if (!currentWord || isPlaying || isAdvancing) return
    const nextFed = [...fedOrderIndexes, chunk.orderIndex]
    setFedOrderIndexes(nextFed)
    setMood('idle')
    void prepareAudio()
    void speakWordNormal(chunk.text)

    if (nextFed.length >= currentWord.syllables.length) {
      setIsAdvancing(true)
      setMood('happy')
      setMessage(t('games.sayIt.feed.yum'))
      setShowConfetti(true)
      setFeedbackType('success')
      playCelebrationSound()
      clearAdvanceTimer()
      advanceTimerRef.current = window.setTimeout(() => {
        advanceAfterWord()
      }, 1100)
    } else {
      setMessage(t('games.sayIt.feed.keepFeeding'))
    }
  }

  const handleWrongChunk = () => {
    if (isPlaying || isAdvancing) return
    setMood('encourage')
    setMessage(t('games.sayIt.feed.wrongOrder'))
  }

  const handleSkipToNext = () => {
    if (!currentWord || isPlaying || isAdvancing || !hasHeard) return
    setMood('encourage')
    setMessage(t('games.sayIt.keepGoing'))
    setIsAdvancing(true)
    advanceAfterWord()
  }

  if (!ready || subject !== 'english' || !currentWord) return null

  const controlsLocked = isPlaying || isAdvancing

  return (
    <AppShell title={t('challenges.clap-it-out.title')} showBack backTo="/games/say-it">
      <AnswerFeedbackOverlay type={feedbackType} />
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

          <Mascot mood={mood} message={message || t('games.sayIt.feed.prompt')} />

          <div
            className="flex w-full max-w-xl flex-col items-center gap-4 rounded-[2rem] border-4 border-white bg-white px-6 py-8 shadow-xl"
            onPointerDown={waitingToHear || waitingToFeed ? noteActivity : undefined}
          >
            {currentWord.priority ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                {t('games.sayIt.priorityBadge')}
              </span>
            ) : null}

            <FeedBearSyllableBoard
              key={currentWord.id}
              word={currentWord.word}
              chunks={chunks}
              fedOrderIndexes={fedOrderIndexes}
              activeListenIndex={activeChunk}
              disabled={controlsLocked || !hasHeard}
              showFeedHint={showFeedHint}
              tapHereLabel={t('games.sayIt.feed.tapChunk')}
              bowlLabel={t('games.sayIt.feed.bowlLabel')}
              trayLabel={t('games.sayIt.feed.trayLabel')}
              wrongChunkLabel={t('games.sayIt.feed.wrongOrder')}
              onFeedChunk={handleFeedChunk}
              onWrongChunk={handleWrongChunk}
            />

            <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <button
                  type="button"
                  onClick={() => void playBreakdown()}
                  disabled={controlsLocked}
                  className={`w-full rounded-3xl bg-teal-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-teal-400 active:scale-95 disabled:opacity-60 ${
                    showHearHint ? 'ring-4 ring-amber-300 ring-offset-2' : ''
                  }`}
                >
                  {t('games.sayIt.feed.hearChunks')}
                </button>
                <AnimatePresence>
                  {showHearHint ? (
                    <TapHereHint label={t('games.sayIt.feed.tapHere')} />
                  ) : null}
                </AnimatePresence>
              </div>
              {hasHeard ? (
                <button
                  type="button"
                  onClick={handleSkipToNext}
                  disabled={controlsLocked}
                  className="flex-1 rounded-3xl bg-slate-200 px-5 py-4 text-xl font-bold text-slate-700 shadow-md transition hover:bg-slate-100 active:scale-95 disabled:opacity-60"
                >
                  {t('games.sayIt.feed.skipWord')}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
