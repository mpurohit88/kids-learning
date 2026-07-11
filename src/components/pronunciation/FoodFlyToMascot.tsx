import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { FoodVisual } from './FoodVisual'

interface FoodFlyToMascotProps {
  word: string
  emoji?: string
  imagePath?: string
  sourceRef: React.RefObject<HTMLElement | null>
  targetRef: React.RefObject<HTMLElement | null>
  onComplete: () => void
}

interface FlyCoords {
  startX: number
  startY: number
  midX: number
  arcY: number
  endX: number
  endY: number
}

const MAX_MEASURE_ATTEMPTS = 12

export function FoodFlyToMascot({
  word,
  emoji,
  imagePath,
  sourceRef,
  targetRef,
  onComplete,
}: FoodFlyToMascotProps) {
  const [coords, setCoords] = useState<FlyCoords | null>(null)

  useEffect(() => {
    let cancelled = false
    let attempts = 0

    const measure = () => {
      if (cancelled) return
      attempts += 1

      const source = sourceRef.current
      const target = targetRef.current
      if (!source || !target) {
        if (attempts < MAX_MEASURE_ATTEMPTS) {
          requestAnimationFrame(measure)
        } else {
          onComplete()
        }
        return
      }

      const src = source.getBoundingClientRect()
      const tgt = target.getBoundingClientRect()
      const startX = src.left + src.width / 2
      const startY = src.top + src.height / 2
      const endX = tgt.left + tgt.width / 2
      const endY = tgt.top + tgt.height / 2

      setCoords({
        startX,
        startY,
        midX: (startX + endX) / 2,
        arcY: Math.min(startY, endY) - 80,
        endX,
        endY,
      })
    }

    measure()
    return () => {
      cancelled = true
    }
  }, [onComplete, sourceRef, targetRef])

  if (!coords || typeof document === 'undefined') return null

  return createPortal(
    <motion.div
      className="pointer-events-none fixed z-50 flex items-center justify-center rounded-3xl border-4 border-amber-200 bg-white p-3 shadow-2xl md:p-4"
      style={{ left: coords.startX, top: coords.startY, x: '-50%', y: '-50%' }}
      initial={{ opacity: 1, scale: 1, rotate: 0 }}
      animate={{
        left: [coords.startX, coords.midX, coords.endX],
        top: [coords.startY, coords.arcY, coords.endY],
        scale: [1, 1.12, 0.3],
        opacity: [1, 1, 0],
        rotate: [0, -8, 6],
      }}
      transition={{ duration: 0.8, ease: 'easeInOut', times: [0, 0.42, 1] }}
      onAnimationComplete={onComplete}
      aria-hidden
    >
      <FoodVisual word={word} emoji={emoji} imagePath={imagePath} size="fly" />
    </motion.div>,
    document.body,
  )
}
