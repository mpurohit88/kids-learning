import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eraser } from 'lucide-react'
import { AppShell } from '../components/layout/AppShell'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { GameCompleteModal } from '../components/GameCompleteModal'
import { Mascot } from '../components/Mascot'
import { KannadaSoundHints } from '../components/game/KannadaSoundHints'
import { dataService } from '../data'
import { usePlayerSessionGate } from '../hooks/usePlayerSessionGate'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { playCelebrationSound, playLetterSound } from '../utils/audio'
import { buildRoundResult, shuffleArray } from '../utils/gameHelpers'
import type { Letter } from '../types'
import { isLanguageSubject } from '../types'

export function LetterTracingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
  const { t } = useTranslation()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const saveGameResult = useAppStore((state) => state.saveGameResult)

  const profile = dataService.getProfileById(profileId)
  const content =
    subject && isLanguageSubject(subject)
      ? dataService.getLanguageContent(subject)
      : null
  const ageGroup = profile?.ageGroup
  const letters = useMemo(() => {
    if (!subject || !ageGroup || !isLanguageSubject(subject)) return []
    return dataService.getLettersForLetterGames(subject, ageGroup)
  }, [subject, ageGroup])

  const roundCount =
    profile && subject ? dataService.getRoundCount(profile.ageGroup, subject) : 5

  const [roundIndex, setRoundIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [roundLetters, setRoundLetters] = useState<Letter[]>([])
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState(t('games.traceLetter.prompt'))
  const [showConfetti, setShowConfetti] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    if (currentLetter) {
      const hasBothCases =
        currentLetter.lowerCase && currentLetter.lowerCase !== currentLetter.character

      if (hasBothCases) {
        const halfW = canvas.width / 2
        const midY = canvas.height / 2 + 10
        const fontSize = Math.min(canvas.height * 0.55, 200)
        context.font = `bold ${fontSize}px Segoe UI, Arial, sans-serif`
        context.fillStyle = '#e2e8f0'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(currentLetter.character, halfW * 0.55, midY)
        context.fillText(currentLetter.lowerCase!, halfW * 1.45, midY)
      } else {
        const fontSize = currentLetter.character.length > 1 ? 150 : 220
        context.font = `bold ${fontSize}px Segoe UI, Nirmala UI, Tunga, sans-serif`
        context.fillStyle = '#e2e8f0'
        context.textAlign = 'center'
        context.textBaseline = 'middle'
        context.fillText(currentLetter.character, canvas.width / 2, canvas.height / 2 + 10)
      }
    }
  }, [currentLetter])

  const showSoundHints = subject === 'kannada'

  const playLetterAudio = useCallback(
    (letter: Letter) => {
      if (!subject || !isLanguageSubject(subject)) return
      playLetterSound(letter, subject, {
        mode: 'character',
        speechLang: content?.speechLang,
      })
    },
    [content?.speechLang, subject],
  )

  const setupRound = useCallback(
    (index: number, lettersPool: Letter[]) => {
      const letter = lettersPool[index % lettersPool.length]
      setCurrentLetter(letter)
      setHasDrawn(false)
      setShowHint(false)
      setMood('idle')
      setMessage(t('games.traceLetter.prompt'))
      setShowConfetti(false)
      playLetterAudio(letter)
    },
    [playLetterAudio],
  )

  const startGame = useCallback(() => {
    if (letters.length === 0) return
    const shuffled = shuffleArray(letters).slice(0, roundCount)
    setRoundLetters(shuffled.length > 0 ? shuffled : letters)
    setRoundIndex(0)
    setCompletedCount(0)
    setIsComplete(false)
    setupRound(0, shuffled.length > 0 ? shuffled : letters)
  }, [letters, roundCount, setupRound])

  useEffect(() => {
    if (!ready) return
    startGame()
  }, [ready, startGame])

  useEffect(() => {
    clearCanvas()
  }, [clearCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
      clearCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [clearCanvas])

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    isDrawingRef.current = true
    setHasDrawn(true)
    canvas.setPointerCapture(event.pointerId)

    const point = getPoint(event)
    context.strokeStyle = '#2563eb'
    context.lineWidth = 14
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const point = getPoint(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    const canvas = canvasRef.current
    canvas?.releasePointerCapture(event.pointerId)
  }

  const handleDone = () => {
    if (!currentLetter) return

    setCompletedCount((count) => count + 1)
    setMood('happy')
    setMessage(hasDrawn ? t('games.traceLetter.traceSuccess') : t('games.traceLetter.traceEmpty'))
    setShowConfetti(true)
    playCelebrationSound()

    window.setTimeout(() => {
      const nextIndex = roundIndex + 1
      if (nextIndex >= roundCount) {
        const finalCompleted = completedCount + 1
        const roundResult = buildRoundResult(finalCompleted, roundCount)
        setResult(roundResult)
        setIsComplete(true)
        if (profileId && subject) {
          saveGameResult({
            profileId,
            subject,
            challengeId: 'letter-tracing',
            correct: finalCompleted,
            total: roundCount,
            stars: roundResult.stars,
          })
        }
        return
      }

      setRoundIndex(nextIndex)
      setupRound(nextIndex, roundLetters)
    }, 1200)
  }

  const handleErase = () => {
    clearCanvas()
    setHasDrawn(false)
    setMood('idle')
    setMessage(t('games.traceLetter.prompt'))
  }

  const replayAudio = () => {
    if (currentLetter) {
      playLetterAudio(currentLetter)
    }
  }

  if (!ready || !profile || !content || !currentLetter) return null

  return (
    <AppShell
      title={t('games.traceLetter.title')}
      showBack={false}
      profileGoesHome
      showProgressLink={false}
      showLanguageButton={false}
    >
      <div className="relative flex flex-1 flex-col items-center gap-5">
        <ConfettiBurst active={showConfetti} />

        <div className="flex w-full items-center justify-between">
          <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
            {t('common.letter')} {Math.min(roundIndex + 1, roundCount)} / {roundCount}
          </p>
        </div>

        <Mascot
          mood={mood}
          message={message}
          onHearAgain={replayAudio}
          hearAgainLabel={t('common.hearAgain')}
        />

        {showSoundHints ? (
          <KannadaSoundHints letter={currentLetter} layout="inline" />
        ) : null}

        {showHint ? (
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-center gap-4 rounded-[1.5rem] border-4 border-white bg-white px-6 py-4 shadow-lg"
          >
            {currentLetter.example ? (
              <span className="text-4xl">{currentLetter.example.emoji}</span>
            ) : null}
            <div className="flex flex-col">
              <span className="text-5xl font-bold leading-none text-slate-800 md:text-6xl">
                {currentLetter.character}
                {currentLetter.lowerCase && currentLetter.lowerCase !== currentLetter.character
                  ? ` / ${currentLetter.lowerCase}`
                  : ''}
              </span>
              {currentLetter.example ? (
                <span className="text-base font-semibold text-slate-500">
                  {currentLetter.character} for {currentLetter.example.word}
                </span>
              ) : null}
            </div>
          </motion.div>
        ) : null}

        <motion.div
          key={currentLetter.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <canvas
            ref={canvasRef}
            className="h-72 w-full touch-none rounded-[2rem] border-4 border-white bg-white shadow-xl md:h-96"
            onPointerDown={startDrawing}
            onPointerMove={draw}
            onPointerUp={stopDrawing}
            onPointerLeave={stopDrawing}
          />
        </motion.div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Erase and try again"
            onClick={handleErase}
            className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-slate-500 text-white shadow-lg transition hover:bg-slate-400 md:h-24 md:w-24"
          >
            <Eraser size={36} strokeWidth={2.5} />
          </button>

          <button
            type="button"
            onClick={() => setShowHint((v) => !v)}
            className={`flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white text-3xl shadow-lg transition md:h-24 md:w-24 ${
              showHint
                ? 'bg-amber-300 hover:bg-amber-200'
                : 'bg-amber-100 hover:bg-amber-200'
            }`}
            title={showHint ? 'Hide hint' : 'Show letter hint'}
          >
            {showHint ? '🙈' : '👁️'}
          </button>

          <button
            type="button"
            onClick={handleDone}
            className="rounded-3xl bg-purple-500 px-10 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-purple-400"
          >
            {t('common.done')}
          </button>
        </div>
      </div>

      {isComplete ? (
        <GameCompleteModal
          result={result}
          challengeId="letter-tracing"
          onPlayAgain={startGame}
        />
      ) : null}
    </AppShell>
  )
}
