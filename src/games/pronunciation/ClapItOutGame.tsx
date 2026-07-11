import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AppShell } from '../../components/layout/AppShell'
import {
  AnswerFeedbackOverlay,
  type AnswerFeedbackType,
} from '../../components/AnswerFeedbackOverlay'
import { ConfettiBurst } from '../../components/ConfettiBurst'
import { GameCompleteModal } from '../../components/GameCompleteModal'
import { GameMascotHeader } from '../../components/game/GameMascotHeader'
import {
  FeedBearSyllableBoard,
  type SyllableChunk,
} from '../../components/pronunciation/FeedBearSyllableBoard'
import { FoodFlyToMascot } from '../../components/pronunciation/FoodFlyToMascot'
import { dataService } from '../../data'
import { usePlayerSessionGate } from '../../hooks/usePlayerSessionGate'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { playCelebrationSound, playEncouragementSound, prepareAudio, speakText, speechLangForLocale, stopAudio } from '../../utils/audio'
import { buildRoundResult } from '../../utils/gameHelpers'
import { speakSyllableBreakdown, speakWordNormal } from '../../utils/pronunciationSpeech'
import type { PronunciationWord } from '../../types'

const FEED_HINT_IDLE_MS = 3000

function toChunks(word: PronunciationWord): SyllableChunk[] {
  return word.syllables.map((text, orderIndex) => ({
    id: `${word.id}-${orderIndex}-${text}`,
    text,
    orderIndex,
  }))
}

export function ClapItOutGame() {
  const { t, locale } = useTranslation()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const saveGameResult = useAppStore((state) => state.saveGameResult)
  const profile = dataService.getProfileById(profileId)

  const roundCount =
    profile && subject ? dataService.getRoundCount(profile.ageGroup, subject) : 5

  const [words, setWords] = useState<PronunciationWord[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [activeChunk, setActiveChunk] = useState(-1)
  const [fedChunkIds, setFedChunkIds] = useState<string[]>([])
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAdvancing, setIsAdvancing] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))
  const [showFeedHint, setShowFeedHint] = useState(false)
  const [idleEpoch, setIdleEpoch] = useState(0)
  const [flyFood, setFlyFood] = useState<{
    word: string
    emoji?: string
    imagePath?: string
    key: number
  } | null>(null)
  const [isFlying, setIsFlying] = useState(false)
  const [bearChomp, setBearChomp] = useState(false)
  const playTokenRef = useRef(0)
  const advanceTimerRef = useRef<number | null>(null)
  const wrongFeedbackTimerRef = useRef<number | null>(null)
  const foodRef = useRef<HTMLDivElement>(null)
  const bearRef = useRef<HTMLDivElement>(null)

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

  const clearWrongFeedbackTimer = () => {
    if (wrongFeedbackTimerRef.current !== null) {
      window.clearTimeout(wrongFeedbackTimerRef.current)
      wrongFeedbackTimerRef.current = null
    }
  }

  const setupRound = useCallback(
    (index: number, pool: PronunciationWord[]) => {
      const word = pool[index]
      if (!word) return
      clearAdvanceTimer()
      clearWrongFeedbackTimer()
      setActiveChunk(-1)
      setFedChunkIds([])
      setIsAdvancing(false)
      setMood('idle')
      setMessage(t('games.sayIt.feed.prompt'))
      setShowConfetti(false)
      setFeedbackType(null)
      setFlyFood(null)
      setIsFlying(false)
      setBearChomp(false)
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
      clearWrongFeedbackTimer()
      stopAudio()
    }
  }, [])

  const waitingToFeed =
    Boolean(currentWord) &&
    !isPlaying &&
    !isAdvancing &&
    !isFlying &&
    !isComplete &&
    fedChunkIds.length < currentWord.syllables.length

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
  }, [waitingToFeed, idleEpoch, currentWord?.id, fedChunkIds.length])

  const noteActivity = () => {
    setShowFeedHint(false)
    setIdleEpoch((value) => value + 1)
  }

  const playBreakdown = async () => {
    if (!currentWord || isPlaying || isAdvancing || isFlying) return
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
      setMessage(t('games.sayIt.feed.yourTurn'))
    } finally {
      if (token === playTokenRef.current) setIsPlaying(false)
    }
  }

  const playFullWord = useCallback(
    async (word: PronunciationWord) => {
      if (isAdvancing) return
      void prepareAudio()
      const token = ++playTokenRef.current
      setIsPlaying(true)
      setActiveChunk(-1)
      setMessage(t('games.sayIt.feed.listenWord'))
      try {
        await speakWordNormal(word.word)
        if (token !== playTokenRef.current) return
        setMessage(t('games.sayIt.feed.prompt'))
      } finally {
        if (token === playTokenRef.current) setIsPlaying(false)
      }
    },
    [isAdvancing, t],
  )

  // Play the complete word when each new round appears.
  useEffect(() => {
    if (!ready || subject !== 'english' || !currentWord || isComplete) return
    void playFullWord(currentWord)
    // Only re-run when the word identity changes (new round).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional: play once per word id
  }, [ready, subject, currentWord?.id, isComplete])


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

  const celebrateWordFed = useCallback(() => {
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
  }, [advanceAfterWord, t])

  const handleFlyComplete = useCallback(() => {
    setFlyFood(null)
    setIsFlying(false)
    setBearChomp(true)
    window.setTimeout(() => setBearChomp(false), 420)
    celebrateWordFed()
  }, [celebrateWordFed])

  const handleFeedChunk = (chunk: SyllableChunk) => {
    if (!currentWord || isPlaying || isAdvancing || isFlying) return
    const nextFed = [...fedChunkIds, chunk.id]
    setFedChunkIds(nextFed)
    setMood('idle')
    void prepareAudio()
    void speakWordNormal(chunk.text)

    if (nextFed.length >= currentWord.syllables.length) {
      setIsFlying(true)
      setFlyFood({
        word: currentWord.word,
        emoji: currentWord.emoji,
        imagePath: currentWord.imagePath,
        key: Date.now(),
      })
      setMessage(t('games.sayIt.feed.feeding'))
    } else {
      setMessage(t('games.sayIt.feed.keepFeeding'))
    }
  }

  const handleWrongChunk = () => {
    if (isPlaying || isAdvancing || isFlying) return
    setMood('encourage')
    setMessage(t('games.sayIt.feed.wrongOrder'))
    setFeedbackType('wrong')
    playEncouragementSound()
    void prepareAudio()
    void speakText(t('games.sayIt.feed.wrongSpoken'), speechLangForLocale(locale))
    clearWrongFeedbackTimer()
    wrongFeedbackTimerRef.current = window.setTimeout(() => {
      setFeedbackType((current) => (current === 'wrong' ? null : current))
    }, 1000)
  }

  const handleSkipToNext = () => {
    if (!currentWord || isPlaying || isAdvancing || isFlying) return
    setMood('encourage')
    setMessage(t('games.sayIt.keepGoing'))
    setIsAdvancing(true)
    advanceAfterWord()
  }

  if (!ready || subject !== 'english' || !currentWord) return null

  const controlsLocked = isPlaying || isAdvancing || isFlying

  return (
    <AppShell title={t('challenges.clap-it-out.title')} showBack backTo="/games/say-it" denseHeader>
      <AnswerFeedbackOverlay type={feedbackType} />
      <ConfettiBurst active={showConfetti} />
      {isComplete ? (
        <GameCompleteModal
          result={result}
          challengeId="clap-it-out"
          onPlayAgain={startGame}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 md:gap-4">
          <motion.div
            className="w-full max-w-xl shrink-0"
            animate={
              bearChomp
                ? { scale: [1, 1.2, 0.94, 1.06, 1], rotate: [0, -4, 4, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.42, ease: 'easeOut' }}
          >
            <GameMascotHeader
              roundIndex={roundIndex}
              roundCount={words.length}
              roundLabel={t('games.sayIt.wordLabel')}
              mood={mood}
              message={message || t('games.sayIt.feed.prompt')}
              denseMessage
              bearRef={bearRef}
            />
          </motion.div>

          {flyFood ? (
            <FoodFlyToMascot
              key={flyFood.key}
              word={flyFood.word}
              emoji={flyFood.emoji}
              imagePath={flyFood.imagePath}
              sourceRef={foodRef}
              targetRef={bearRef}
              onComplete={handleFlyComplete}
            />
          ) : null}

          <div
            className="flex w-full max-w-xl flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white px-4 py-5 shadow-xl md:gap-4 md:px-6 md:py-6"
            onPointerDown={waitingToFeed ? noteActivity : undefined}
          >
            {/* {currentWord.priority ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
                {t('games.sayIt.priorityBadge')}
              </span>
            ) : null} */}

            <FeedBearSyllableBoard
              key={currentWord.id}
              word={currentWord.word}
              emoji={currentWord.emoji}
              imagePath={currentWord.imagePath}
              foodRef={foodRef}
              foodFlying={isFlying}
              chunks={chunks}
              fedChunkIds={fedChunkIds}
              activeListenIndex={activeChunk}
              disabled={controlsLocked}
              showFeedHint={showFeedHint}
              tapHereLabel={t('games.sayIt.feed.tapChunk')}
              hearWordLabel={t('games.sayIt.feed.hearWord')}
              bowlLabel={t('games.sayIt.feed.bowlLabel')}
              trayLabel={t('games.sayIt.feed.trayLabel')}
              wrongChunkLabel={t('games.sayIt.feed.wrongOrder')}
              onHearWord={() => void playFullWord(currentWord)}
              onFeedChunk={handleFeedChunk}
              onWrongChunk={handleWrongChunk}
            />

            <div className="mt-2 flex w-full flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => void playBreakdown()}
                disabled={controlsLocked}
                className="flex-1 rounded-3xl bg-teal-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-teal-400 active:scale-95 disabled:opacity-60"
              >
                {t('games.sayIt.feed.hearChunks')}
              </button>
              <button
                type="button"
                onClick={handleSkipToNext}
                disabled={controlsLocked}
                className="flex-1 rounded-3xl bg-slate-200 px-5 py-4 text-xl font-bold text-slate-700 shadow-md transition hover:bg-slate-100 active:scale-95 disabled:opacity-60"
              >
                {t('games.sayIt.feed.skipWord')}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
