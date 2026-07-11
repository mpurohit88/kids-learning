import { useMemo, useState, type RefObject } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuestionHearButton } from '../game/QuestionHearButton'
import { FoodVisual } from './FoodVisual'
import { TapHereHint } from './TapHereHint'

export interface SyllableChunk {
  id: string
  text: string
  /** Correct feed order (0-based). */
  orderIndex: number
}

interface FeedBearSyllableBoardProps {
  word: string
  emoji?: string
  imagePath?: string
  chunks: SyllableChunk[]
  fedChunkIds: string[]
  activeListenIndex: number
  disabled?: boolean
  showFeedHint?: boolean
  tapHereLabel: string
  hearWordLabel: string
  bowlLabel: string
  trayLabel: string
  wrongChunkLabel: string
  foodRef?: RefObject<HTMLDivElement | null>
  foodFlying?: boolean
  onHearWord: () => void
  onFeedChunk: (chunk: SyllableChunk) => void
  onWrongChunk: () => void
}

function shuffleChunks(chunks: SyllableChunk[]): SyllableChunk[] {
  const next = [...chunks]
  for (let i = next.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[next[i], next[j]] = [next[j], next[i]]
  }
  return next
}

export function FeedBearSyllableBoard({
  word,
  emoji,
  imagePath,
  chunks,
  fedChunkIds,
  activeListenIndex,
  disabled = false,
  showFeedHint = false,
  tapHereLabel,
  hearWordLabel,
  bowlLabel,
  trayLabel,
  wrongChunkLabel,
  foodRef,
  foodFlying = false,
  onHearWord,
  onFeedChunk,
  onWrongChunk,
}: FeedBearSyllableBoardProps) {
  const [trayOrder] = useState(() => shuffleChunks(chunks))
  const [shakeId, setShakeId] = useState<string | null>(null)

  const fedSet = useMemo(() => new Set(fedChunkIds), [fedChunkIds])
  const nextExpected = fedChunkIds.length
  const expectedText = chunks[nextExpected]?.text
  const remaining = trayOrder.filter((chunk) => !fedSet.has(chunk.id))

  const handleTap = (chunk: SyllableChunk) => {
    if (disabled) return
    if (!expectedText || chunk.text !== expectedText) {
      setShakeId(chunk.id)
      window.setTimeout(() => setShakeId((current) => (current === chunk.id ? null : current)), 450)
      onWrongChunk()
      return
    }
    onFeedChunk(chunk)
  }

  return (
    <div className="flex w-full max-w-xl flex-col items-center gap-5">
      <div className="flex flex-col items-center gap-3">
        <motion.div
          ref={foodRef}
          animate={{ opacity: foodFlying ? 0.25 : 1, scale: foodFlying ? 0.88 : 1 }}
          transition={{ duration: 0.25 }}
          className="flex h-24 w-24 items-center justify-center rounded-3xl border-4 border-amber-100 bg-gradient-to-b from-amber-50 to-orange-50 shadow-md md:h-28 md:w-28"
          aria-label={word}
        >
          <FoodVisual word={word} emoji={emoji} imagePath={imagePath} size="board" />
        </motion.div>
        <div className="flex items-center justify-center gap-3">
          <p className="text-2xl font-bold capitalize text-slate-800 md:text-3xl">{word}</p>
          <QuestionHearButton onClick={onHearWord} ariaLabel={hearWordLabel} size="md" />
        </div>
      </div>

      <div
        className="relative flex w-full flex-col items-center gap-3 rounded-[2rem] border-4 border-amber-200 bg-gradient-to-b from-amber-50 to-orange-50 px-4 py-5 shadow-inner"
        aria-label={bowlLabel}
      >
        <span className="text-4xl" aria-hidden>
          🥣
        </span>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {chunks.map((chunk, index) => {
            const fed = index < fedChunkIds.length
            const isNext = index === nextExpected && !fed
            const listening = activeListenIndex === index
            return (
              <motion.div
                key={`slot-${chunk.id}`}
                animate={{
                  scale: listening || isNext ? 1.06 : 1,
                  borderColor: fed
                    ? '#2dd4bf'
                    : listening
                      ? '#fbbf24'
                      : isNext
                        ? '#fb923c'
                        : '#e2e8f0',
                  backgroundColor: fed ? '#ccfbf1' : '#ffffff',
                }}
                className="flex min-h-14 min-w-16 items-center justify-center rounded-2xl border-4 px-3 py-2 text-2xl font-bold text-slate-700 md:min-h-16 md:min-w-20 md:text-3xl"
              >
                {fed ? chunk.text : listening ? chunk.text : isNext ? '?' : '·'}
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="flex w-full flex-col items-center gap-3" aria-label={trayLabel}>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <AnimatePresence mode="popLayout">
            {remaining.map((chunk) => {
              const isWrongShake = shakeId === chunk.id
              const isNextOption = expectedText !== undefined && chunk.text === expectedText
              const hintThis = showFeedHint && isNextOption
              const isListening =
                activeListenIndex >= 0 && chunks[activeListenIndex]?.text === chunk.text
              return (
                <div key={chunk.id} className="relative">
                  <motion.button
                    type="button"
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: isListening ? 1.12 : 1,
                      x: isWrongShake ? [0, -8, 8, -6, 6, 0] : 0,
                      backgroundColor: isListening ? '#fbbf24' : '#38bdf8',
                      borderColor: isListening ? '#f59e0b' : '#bae6fd',
                    }}
                    exit={{ opacity: 0, scale: 0.5, y: -40 }}
                    transition={{ duration: isWrongShake ? 0.4 : 0.2 }}
                    disabled={disabled}
                    onClick={() => handleTap(chunk)}
                    aria-label={chunk.text}
                    aria-current={isListening ? 'true' : undefined}
                    className={`rounded-3xl border-4 px-5 py-4 text-2xl font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-60 md:text-3xl ${
                      hintThis ? 'ring-4 ring-amber-300 ring-offset-2' : ''
                    } ${isListening ? 'ring-4 ring-amber-200 ring-offset-2' : ''}`}
                  >
                    {chunk.text}
                  </motion.button>
                  <AnimatePresence>
                    {hintThis ? <TapHereHint label={tapHereLabel} /> : null}
                  </AnimatePresence>
                </div>
              )
            })}
          </AnimatePresence>
        </div>
        {shakeId ? (
          <p className="text-center text-base font-semibold text-rose-600">{wrongChunkLabel}</p>
        ) : null}
      </div>
    </div>
  )
}
