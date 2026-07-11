import { useEffect, useRef, useState, type Ref } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useTranslation } from '../hooks/useTranslation'
import { QuestionHearButton } from './game/QuestionHearButton'

export type MascotMood = 'idle' | 'happy' | 'sad' | 'encourage'

interface MascotProps {
  mood: MascotMood
  message?: string
  onHearAgain?: () => void
  hearAgainLabel?: string
  /** Horizontal layout with a smaller bear — saves vertical space in tracing games. */
  compact?: boolean
  /** Attach to the bear face circle — used for feed-the-bear fly animations. */
  bearRef?: Ref<HTMLDivElement>
  /** Smaller speech bubble — better for short prompts on mobile. */
  denseMessage?: boolean
}

type BearFace = 'idle' | 'happy' | 'sad'

function faceForMood(mood: MascotMood): BearFace {
  if (mood === 'happy') return 'happy'
  if (mood === 'sad' || mood === 'encourage') return 'sad'
  return 'idle'
}

const JUMPING_STARS = Array.from({ length: 9 }, (_, index) => ({
  id: index,
  x: (index - 4) * 28 + (index % 2 === 0 ? 10 : -10),
  delay: index * 0.06,
  size: index % 3 === 0 ? 'text-3xl' : index % 3 === 1 ? 'text-2xl' : 'text-xl',
}))

const SPARK_ANGLES = Array.from({ length: 10 }, (_, index) => ({
  id: index,
  radius: 58 + (index % 3) * 12,
  angle: (index / 10) * Math.PI * 2,
  delay: 0.04 + index * 0.025,
  emoji: index % 2 === 0 ? '✨' : '💫',
}))

function BearFaceSvg({ face, compact }: { face: BearFace; compact?: boolean }) {
  const mouth =
    face === 'happy' ? (
      <path
        d="M38 58c4 8 20 8 24 0"
        fill="none"
        stroke="#7a3b2e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    ) : face === 'sad' ? (
      <path
        d="M40 64c4-7 16-7 20 0"
        fill="none"
        stroke="#7a3b2e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    ) : (
      <path
        d="M42 60h16"
        fill="none"
        stroke="#7a3b2e"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    )

  const cheeks =
    face === 'happy' ? (
      <>
        <circle cx="28" cy="52" r="5" fill="#ff8a80" opacity="0.85" />
        <circle cx="72" cy="52" r="5" fill="#ff8a80" opacity="0.85" />
      </>
    ) : null

  const eyes =
    face === 'happy' ? (
      <>
        <path
          d="M30 40c3-4 8-4 11 0"
          fill="none"
          stroke="#3e2723"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M59 40c3-4 8-4 11 0"
          fill="none"
          stroke="#3e2723"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </>
    ) : face === 'sad' ? (
      <>
        <circle cx="35" cy="42" r="4.5" fill="#3e2723" />
        <circle cx="65" cy="42" r="4.5" fill="#3e2723" />
        <path
          d="M28 34c4 2 8 2 12 0"
          fill="none"
          stroke="#5d4037"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M60 34c4 2 8 2 12 0"
          fill="none"
          stroke="#5d4037"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </>
    ) : (
      <>
        <circle cx="35" cy="42" r="4.5" fill="#3e2723" />
        <circle cx="65" cy="42" r="4.5" fill="#3e2723" />
        <circle cx="36.5" cy="40.5" r="1.4" fill="#fff" />
        <circle cx="66.5" cy="40.5" r="1.4" fill="#fff" />
      </>
    )

  return (
    <svg
      viewBox="0 0 100 100"
      className={
        compact
          ? 'h-12 w-12'
          : 'h-[4.75rem] w-[4.75rem] md:h-[5.5rem] md:w-[5.5rem]'
      }
      aria-hidden
    >
      <circle cx="22" cy="22" r="14" fill="#a67c52" />
      <circle cx="78" cy="22" r="14" fill="#a67c52" />
      <circle cx="22" cy="22" r="8" fill="#d4a574" />
      <circle cx="78" cy="22" r="8" fill="#d4a574" />
      <circle cx="50" cy="52" r="36" fill="#c48a5a" />
      <ellipse cx="50" cy="60" rx="22" ry="18" fill="#e8c4a0" />
      {cheeks}
      {eyes}
      <ellipse cx="50" cy="52" rx="7" ry="5.5" fill="#3e2723" />
      <circle cx="48" cy="50.5" r="1.5" fill="#fff" opacity="0.55" />
      {mouth}
    </svg>
  )
}

export function Mascot({
  mood,
  message,
  onHearAgain,
  hearAgainLabel,
  compact = false,
  bearRef,
  denseMessage = false,
}: MascotProps) {
  const { t } = useTranslation()
  const targetFace = faceForMood(mood)
  const displayFaceRef = useRef<BearFace>(targetFace)
  const [displayFace, setDisplayFace] = useState<BearFace>(targetFace)
  const [spinning, setSpinning] = useState(false)
  const [spinKey, setSpinKey] = useState(0)
  const [celebrationKey, setCelebrationKey] = useState(0)
  const isHappy = mood === 'happy'
  const isSad = mood === 'sad' || mood === 'encourage'
  const label = hearAgainLabel ?? t('common.hearAgain')

  useEffect(() => {
    if (targetFace === displayFaceRef.current) return

    if (targetFace === 'happy') {
      setCelebrationKey((key) => key + 1)
    }

    setSpinning(true)
    setSpinKey((key) => key + 1)

    const swapId = window.setTimeout(() => {
      displayFaceRef.current = targetFace
      setDisplayFace(targetFace)
    }, 280)

    const endId = window.setTimeout(() => {
      setSpinning(false)
    }, 560)

    return () => {
      window.clearTimeout(swapId)
      window.clearTimeout(endId)
    }
  }, [targetFace])

  const bearCircle = (
    <motion.div
      ref={bearRef}
      animate={
        isHappy && !spinning
          ? { y: [0, -18, -6, 0], scale: [1, 1.08, 1.04, 1] }
          : isSad && !spinning
            ? { y: [0, 6, 2], scale: [1, 0.94, 0.97] }
            : { y: [0, -4, 0] }
      }
      transition={{
        duration: isHappy ? 0.65 : isSad ? 0.5 : 2.5,
        repeat: mood === 'idle' && !spinning ? Infinity : 0,
        ease: 'easeOut',
      }}
      className={`relative flex items-center justify-center overflow-hidden rounded-full shadow-lg ${
        compact ? 'h-14 w-14' : 'h-28 w-28 md:h-32 md:w-32'
      } ${
        isHappy
          ? 'bg-gradient-to-br from-yellow-200 to-amber-300 ring-4 ring-amber-300/80'
          : isSad
            ? 'bg-gradient-to-br from-slate-200 to-sky-200'
            : 'bg-gradient-to-br from-amber-200 to-orange-300'
      }`}
      style={{ perspective: '700px' }}
    >
      <div
        key={spinKey}
        className={`flex items-center justify-center ${spinning ? 'mascot-face-spin' : ''}`}
        role="img"
        aria-label={t('common.mascotAria')}
      >
        <BearFaceSvg face={displayFace} compact={compact} />
      </div>
    </motion.div>
  )

  const celebration = isHappy ? (
    <motion.div
      key={`celebrate-${celebrationKey}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-none absolute inset-0"
      aria-hidden
    >
      {JUMPING_STARS.map((star) => (
        <motion.span
          key={`jump-${star.id}`}
          initial={{ opacity: 0, y: 36, x: star.x, scale: 0.2, rotate: -18 }}
          animate={{
            opacity: [0, 1, 1, 0.85, 0],
            y: [36, -8, -52, -44, -68],
            scale: [0.2, 1.35, 1.05, 1.2, 0.6],
            rotate: [-18, 14, -10, 8, 0],
          }}
          transition={{
            delay: star.delay,
            duration: 0.95,
            ease: 'easeOut',
          }}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 ${
            compact
              ? star.id % 3 === 0
                ? 'text-xl'
                : 'text-lg'
              : star.size
          } drop-shadow-lg`}
        >
          ⭐
        </motion.span>
      ))}

      {!compact
        ? SPARK_ANGLES.map((spark) => (
            <motion.span
              key={`spark-${spark.id}`}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                scale: [0, 1.25, 0.85, 0.4],
                x: Math.cos(spark.angle) * spark.radius,
                y: Math.sin(spark.angle) * spark.radius,
              }}
              transition={{
                duration: 0.8,
                ease: 'easeOut',
                delay: spark.delay,
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-xl md:text-2xl"
            >
              {spark.emoji}
            </motion.span>
          ))
        : null}

      <motion.span
        initial={{ scale: 0, rotate: -20, opacity: 0 }}
        animate={{
          scale: [0, 1.35, 1.1, 1.15, 1],
          rotate: [0, 12, -8, 6, 0],
          opacity: [0, 1, 1, 1, 1],
        }}
        transition={{ duration: 0.7, ease: 'easeOut', delay: 0.08 }}
        className={`absolute -right-1 -top-1 drop-shadow-lg ${
          compact ? 'text-xl' : 'text-3xl md:text-4xl'
        }`}
      >
        ⭐
      </motion.span>
    </motion.div>
  ) : null

  const messageRow = message ? (
    <div
      className={`flex items-center gap-2 ${compact ? 'min-w-0 flex-1' : 'max-w-md justify-center gap-3'}`}
    >
      <motion.p
        key={message}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={`rounded-2xl bg-white/90 font-semibold text-slate-700 shadow-md ${
          compact
            ? 'flex-1 px-3 py-2 text-left text-base'
            : denseMessage
              ? 'max-w-[min(100%,18rem)] px-3 py-2 text-center text-sm md:max-w-md md:text-base'
              : 'px-5 py-3 text-center text-lg'
        }`}
      >
        {message}
      </motion.p>
      {onHearAgain ? (
        <QuestionHearButton
          onClick={onHearAgain}
          ariaLabel={label}
          size={compact ? 'sm' : 'md'}
        />
      ) : null}
    </div>
  ) : null

  if (compact) {
    return (
      <div className="flex w-full items-center gap-2 md:gap-3">
        <div className="relative flex h-16 w-16 shrink-0 items-center justify-center">
          <AnimatePresence mode="wait">{celebration}</AnimatePresence>
          {bearCircle}
        </div>
        <AnimatePresence mode="wait">{messageRow}</AnimatePresence>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative flex h-36 w-44 items-center justify-center md:h-40 md:w-48">
        <AnimatePresence mode="wait">{celebration}</AnimatePresence>
        {bearCircle}
      </div>

      <AnimatePresence mode="wait">{messageRow}</AnimatePresence>
    </div>
  )
}
