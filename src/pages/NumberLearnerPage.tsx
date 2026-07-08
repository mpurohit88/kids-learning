import { useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { speakText } from '../utils/audioPlayer'

const NUMBER_WORDS: Record<number, string> = {
  1: 'One', 2: 'Two', 3: 'Three', 4: 'Four', 5: 'Five',
  6: 'Six', 7: 'Seven', 8: 'Eight', 9: 'Nine', 10: 'Ten',
  11: 'Eleven', 12: 'Twelve', 13: 'Thirteen', 14: 'Fourteen', 15: 'Fifteen',
  16: 'Sixteen', 17: 'Seventeen', 18: 'Eighteen', 19: 'Nineteen', 20: 'Twenty',
  21: 'Twenty-one', 22: 'Twenty-two', 23: 'Twenty-three', 24: 'Twenty-four',
  25: 'Twenty-five', 26: 'Twenty-six', 27: 'Twenty-seven', 28: 'Twenty-eight',
  29: 'Twenty-nine', 30: 'Thirty', 31: 'Thirty-one', 32: 'Thirty-two',
  33: 'Thirty-three', 34: 'Thirty-four', 35: 'Thirty-five', 36: 'Thirty-six',
  37: 'Thirty-seven', 38: 'Thirty-eight', 39: 'Thirty-nine', 40: 'Forty',
  41: 'Forty-one', 42: 'Forty-two', 43: 'Forty-three', 44: 'Forty-four',
  45: 'Forty-five', 46: 'Forty-six', 47: 'Forty-seven', 48: 'Forty-eight',
  49: 'Forty-nine', 50: 'Fifty',
  51: 'Fifty-one', 52: 'Fifty-two', 53: 'Fifty-three', 54: 'Fifty-four',
  55: 'Fifty-five', 56: 'Fifty-six', 57: 'Fifty-seven', 58: 'Fifty-eight',
  59: 'Fifty-nine', 60: 'Sixty',
  61: 'Sixty-one', 62: 'Sixty-two', 63: 'Sixty-three', 64: 'Sixty-four',
  65: 'Sixty-five', 66: 'Sixty-six', 67: 'Sixty-seven', 68: 'Sixty-eight',
  69: 'Sixty-nine', 70: 'Seventy',
  71: 'Seventy-one', 72: 'Seventy-two', 73: 'Seventy-three', 74: 'Seventy-four',
  75: 'Seventy-five', 76: 'Seventy-six', 77: 'Seventy-seven', 78: 'Seventy-eight',
  79: 'Seventy-nine', 80: 'Eighty',
  81: 'Eighty-one', 82: 'Eighty-two', 83: 'Eighty-three', 84: 'Eighty-four',
  85: 'Eighty-five', 86: 'Eighty-six', 87: 'Eighty-seven', 88: 'Eighty-eight',
  89: 'Eighty-nine', 90: 'Ninety',
  91: 'Ninety-one', 92: 'Ninety-two', 93: 'Ninety-three', 94: 'Ninety-four',
  95: 'Ninety-five', 96: 'Ninety-six', 97: 'Ninety-seven', 98: 'Ninety-eight',
  99: 'Ninety-nine', 100: 'One Hundred',
}

const COUNT_EMOJIS = ['', '⭐', '⭐⭐', '⭐⭐⭐', '⭐⭐⭐⭐', '⭐⭐⭐⭐⭐']

const CARD_COLORS = [
  '#ef5350', '#ff7043', '#ffa726', '#ffca28',
  '#26c6da', '#42a5f5', '#66bb6a', '#7e57c2',
  '#ec407a', '#00acc1', '#43a047', '#5e35b1',
]

interface NumberDetailProps {
  value: number
  total: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}

function NumberDetail({ value, total, onClose, onPrev, onNext }: NumberDetailProps) {
  const color = CARD_COLORS[(value - 1) % CARD_COLORS.length]
  const word = NUMBER_WORDS[value] ?? String(value)
  const countEmoji = value <= 5 ? COUNT_EMOJIS[value] : null

  useEffect(() => {
    void speakText(word, 'en-IN')
  }, [value, word])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && value > 1) onPrev()
      if (e.key === 'ArrowRight' && value < total) onNext()
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [value, total, onPrev, onNext, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.85, opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="relative flex w-full max-w-xs flex-col items-center gap-5 rounded-[2.5rem] border-4 border-white p-8 shadow-2xl"
          style={{ backgroundColor: color }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/25 text-white transition hover:bg-white/40"
          >
            <X size={20} />
          </button>

          <span className="text-sm font-bold text-white/80">{value} / {total}</span>

          <span className="text-9xl font-bold text-white drop-shadow-lg leading-none">
            {value}
          </span>

          <span className="rounded-full bg-white/25 px-5 py-2 text-2xl font-bold text-white">
            {word}
          </span>

          {countEmoji ? (
            <span className="text-3xl leading-relaxed">{countEmoji}</span>
          ) : null}

          <button
            type="button"
            onClick={() => void speakText(word, 'en-IN')}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-4 border-white/40 bg-white/25 text-white transition hover:bg-white/40"
            aria-label="Play sound"
          >
            <span className="text-2xl">🔊</span>
          </button>
        </motion.div>
      </AnimatePresence>

      {value > 1 ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-lg transition hover:bg-white/40 md:left-8"
          aria-label="Previous"
        >
          <ChevronLeft size={32} />
        </button>
      ) : null}
      {value < total ? (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-3 top-1/2 flex h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 text-white shadow-lg transition hover:bg-white/40 md:right-8"
          aria-label="Next"
        >
          <ChevronRight size={32} />
        </button>
      ) : null}
    </div>
  )
}

export function NumberLearnerPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const profile = dataService.getProfileById(profileId)
  const [activeNumber, setActiveNumber] = useState<number | null>(null)

  useEffect(() => {
    if (!profileId) navigate('/', { replace: true })
  }, [profileId, navigate])

  if (!profile) return null

  const maxNumber = profile.ageGroup === 'lkg' ? 20 : 100
  const numbers = Array.from({ length: maxNumber }, (_, i) => i + 1)

  return (
    <AppShell
      title={t('learn.numbersTitle', undefined, 'Learn Numbers')}
      showBack
      backTo="/activities"
    >
      <div className="flex flex-col gap-4">
        <p className="text-center text-slate-600">
          {t('learn.numbersIntro', undefined, `Numbers 1 – ${maxNumber}. Tap any number to learn it!`).replace('${maxNumber}', String(maxNumber))}
        </p>

        <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {numbers.map((n) => {
            const color = CARD_COLORS[(n - 1) % CARD_COLORS.length]
            return (
              <button
                key={n}
                type="button"
                onClick={() => setActiveNumber(n)}
                className="group flex flex-col items-center justify-center gap-0.5 rounded-2xl border-4 border-white py-3 shadow-md transition hover:-translate-y-1 hover:shadow-xl active:scale-95"
                style={{ backgroundColor: color }}
              >
                <span className="text-xl font-bold text-white drop-shadow sm:text-2xl">{n}</span>
                {n <= 5 ? (
                  <span className="text-xs leading-none">
                    {'⭐'.repeat(n)}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      </div>

      {activeNumber !== null ? (
        <NumberDetail
          value={activeNumber}
          total={maxNumber}
          onClose={() => setActiveNumber(null)}
          onPrev={() => setActiveNumber((v) => (v !== null && v > 1 ? v - 1 : v))}
          onNext={() => setActiveNumber((v) => (v !== null && v < maxNumber ? v + 1 : v))}
        />
      ) : null}
    </AppShell>
  )
}
