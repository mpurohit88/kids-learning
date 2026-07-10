import { useEffect } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Language, Letter } from '../../types'
import { playLetterSound } from '../../utils/audio'

interface LetterDetailOverlayProps {
  letters: Letter[]
  activeIndex: number
  subject: Language
  speechLang: string
  onClose: () => void
  onNavigate: (index: number) => void
}

const CARD_COLORS = [
  '#ef5350', '#ff7043', '#ffa726', '#ffca28',
  '#26c6da', '#42a5f5', '#66bb6a', '#7e57c2',
  '#ec407a', '#00acc1', '#43a047', '#5e35b1',
  '#f4511e', '#039be5', '#00897b', '#d81b60',
]

function playLetter(letter: Letter, subject: Language, speechLang: string) {
  playLetterSound(letter, subject, { mode: 'phrase', speechLang })
}

export function LetterDetailOverlay({
  letters,
  activeIndex,
  subject,
  speechLang,
  onClose,
  onNavigate,
}: LetterDetailOverlayProps) {
  const letter = letters[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < letters.length - 1
  const color = CARD_COLORS[activeIndex % CARD_COLORS.length]
  const isEnglish = subject === 'english'
  const hasBothCases = isEnglish && letter.lowerCase && letter.lowerCase !== letter.character

  // Auto-play when letter changes
  useEffect(() => {
    if (letter) playLetter(letter, subject, speechLang)
  }, [letter, subject, speechLang])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) onNavigate(activeIndex - 1)
      if (e.key === 'ArrowRight' && hasNext) onNavigate(activeIndex + 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIndex, hasPrev, hasNext, onNavigate, onClose])

  if (!letter) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={letter.id}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative flex w-full max-w-sm flex-col items-center gap-5 rounded-[2.5rem] border-4 border-white p-8 shadow-2xl"
          style={{ backgroundColor: color }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/40"
            aria-label="Close"
          >
            <X size={20} />
          </button>

          {/* Counter */}
          <span className="text-sm font-bold text-white/80">
            {activeIndex + 1} / {letters.length}
          </span>

          {/* Letter display */}
          <div className="flex flex-col items-center gap-1">
            {hasBothCases ? (
              <div className="flex items-center gap-4">
                <span className="text-8xl font-bold text-white drop-shadow-lg md:text-9xl">
                  {letter.character}
                </span>
                <span className="text-5xl font-bold text-white/75 drop-shadow-md md:text-6xl">
                  {letter.lowerCase}
                </span>
              </div>
            ) : (
              <span className="text-8xl font-bold text-white drop-shadow-lg md:text-9xl">
                {letter.character}
              </span>
            )}
            <span className="rounded-full bg-white/25 px-4 py-1 text-sm font-bold uppercase tracking-wide text-white">
              {letter.name}
            </span>
          </div>

          {/* Example */}
          {letter.example ? (
            <div className="flex flex-col items-center gap-2">
              {letter.example.imagePath ? (
                <img
                  src={letter.example.imagePath}
                  alt={letter.example.word}
                  className="h-20 w-20 rounded-2xl bg-white/20 object-contain p-2"
                />
              ) : (
                <span className="text-5xl">{letter.example.emoji}</span>
              )}
              <span className="text-xl font-bold text-white drop-shadow-sm">
                {isEnglish
                  ? `${letter.character} for ${letter.example.word}`
                  : letter.example.word}
              </span>
            </div>
          ) : null}

          {/* Sound button */}
          <button
            type="button"
            onClick={() => playLetter(letter, subject, speechLang)}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white/40 bg-white/25 text-white shadow-lg transition hover:bg-white/40"
            aria-label="Play sound"
          >
            <span className="text-2xl">🔊</span>
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next – outside the card so they don't close on click */}
      {hasPrev ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex - 1) }}
          className="absolute left-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-lg transition hover:bg-white/40 md:left-8"
          aria-label="Previous letter"
        >
          <ChevronLeft size={32} />
        </button>
      ) : null}
      {hasNext ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNavigate(activeIndex + 1) }}
          className="absolute right-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-lg transition hover:bg-white/40 md:right-8"
          aria-label="Next letter"
        >
          <ChevronRight size={32} />
        </button>
      ) : null}
    </div>
  )
}
