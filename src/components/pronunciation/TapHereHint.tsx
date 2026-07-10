import { motion } from 'framer-motion'
import { MousePointerClick } from 'lucide-react'

interface TapHereHintProps {
  label: string
  /** Prefer 'bottom' so the badge sits on the button without covering the label. */
  placement?: 'top' | 'bottom'
}

/** Bouncing “tap here” badge for idle help on a primary action. */
export function TapHereHint({ label, placement = 'bottom' }: TapHereHintProps) {
  const positionClass =
    placement === 'top'
      ? 'left-1/2 top-0 -translate-x-1/2 -translate-y-1/2'
      : 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2'

  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1, y: [0, 6, 0] }}
      exit={{ opacity: 0, scale: 0.85 }}
      transition={{
        opacity: { duration: 0.2 },
        scale: { duration: 0.2 },
        y: { duration: 0.9, repeat: Infinity, ease: 'easeInOut' },
      }}
      className={`pointer-events-none absolute z-20 ${positionClass}`}
    >
      <span className="flex items-center gap-1.5 rounded-full border-2 border-amber-400 bg-amber-300 px-3 py-1.5 text-sm font-bold text-amber-950 shadow-lg md:text-base">
        <MousePointerClick size={20} strokeWidth={2.5} aria-hidden />
        {label}
      </span>
    </motion.div>
  )
}
