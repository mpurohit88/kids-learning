import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Eraser, Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { ConfettiBurst } from '../components/ConfettiBurst'
import { GameCompleteModal } from '../components/GameCompleteModal'
import { Mascot } from '../components/Mascot'
import { getLanguageContent, getLettersForProfile } from '../data'
import { getProfileById } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'
import { playAudio, playCelebrationSound } from '../utils/audioPlayer'
import { buildRoundResult, getRoundCount, shuffleArray } from '../utils/gameHelpers'
import type { Letter } from '../types'

export function LetterTracingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)
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

  const [roundIndex, setRoundIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [roundLetters, setRoundLetters] = useState<Letter[]>([])
  const [currentLetter, setCurrentLetter] = useState<Letter | null>(null)
  const [hasDrawn, setHasDrawn] = useState(false)
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('Trace the letter with your finger or mouse!')
  const [showConfetti, setShowConfetti] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))

  useEffect(() => {
    if (!profileId || !language) {
      navigate('/', { replace: true })
    }
  }, [profileId, language, navigate])

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, canvas.width, canvas.height)

    if (currentLetter) {
      context.font = 'bold 220px Segoe UI, Nirmala UI, Tunga, sans-serif'
      context.fillStyle = '#e2e8f0'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(currentLetter.character, canvas.width / 2, canvas.height / 2 + 10)
    }
  }, [currentLetter])

  const setupRound = useCallback(
    (index: number, lettersPool: Letter[]) => {
      const letter = lettersPool[index % lettersPool.length]
      setCurrentLetter(letter)
      setHasDrawn(false)
      setMood('idle')
      setMessage('Trace the letter with your finger or mouse!')
      setShowConfetti(false)
      void playAudio(letter.audioPath, letter.character, content?.speechLang)
    },
    [content?.speechLang],
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
    startGame()
  }, [startGame])

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
    setMessage(hasDrawn ? 'Great job tracing!' : 'Good try! You can trace more next time!')
    setShowConfetti(true)
    playCelebrationSound()

    window.setTimeout(() => {
      const nextIndex = roundIndex + 1
      if (nextIndex >= roundCount) {
        const finalCompleted = completedCount + 1
        const roundResult = buildRoundResult(finalCompleted, roundCount)
        setResult(roundResult)
        setIsComplete(true)
        if (profileId && language) {
          addStars(profileId, language, 'letter-tracing', roundResult.stars)
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
    setMessage('Trace the letter with your finger or mouse!')
  }

  const replayAudio = () => {
    if (currentLetter) {
      void playAudio(currentLetter.audioPath, currentLetter.character, content?.speechLang)
    }
  }

  if (!profile || !content || !currentLetter) return null

  return (
    <AppShell title="Trace the Letter" showBack backTo="/activities">
      <div className="relative flex flex-1 flex-col items-center gap-5">
        <ConfettiBurst active={showConfetti} />

        <div className="flex w-full items-center justify-between">
          <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
            Letter {Math.min(roundIndex + 1, roundCount)} / {roundCount}
          </p>
        </div>

        <Mascot mood={mood} message={message} />

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
            aria-label="Hear letter sound"
            onClick={replayAudio}
            className="flex h-20 w-20 items-center justify-center rounded-3xl border-4 border-white bg-orange-400 text-white shadow-lg transition hover:bg-orange-300 md:h-24 md:w-24"
          >
            <Volume2 size={36} strokeWidth={2.5} />
          </button>

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
            onClick={handleDone}
            className="rounded-3xl bg-purple-500 px-10 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-purple-400"
          >
            Done! ⭐
          </button>
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
