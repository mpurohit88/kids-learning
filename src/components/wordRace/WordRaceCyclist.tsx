import { motion } from 'framer-motion'

export type CyclistPhase = 'idle' | 'pedaling' | 'riding' | 'wobble'

interface WordRaceCyclistProps {
  phase: CyclistPhase
}

export function WordRaceCyclist({ phase }: WordRaceCyclistProps) {
  const isPedaling = phase === 'pedaling' || phase === 'riding'

  return (
    <motion.svg
      viewBox="0 0 96 58"
      className="h-14 w-[4.5rem] drop-shadow-md md:h-16 md:w-20"
      aria-hidden
      animate={
        phase === 'wobble'
          ? { rotate: [-6, 6, -4, 4, 0], x: [0, -2, 2, 0] }
          : phase === 'riding'
            ? { y: [0, -2, 0] }
            : { rotate: 0, x: 0, y: 0 }
      }
      transition={{
        duration: phase === 'wobble' ? 0.35 : 0.25,
        repeat: phase === 'riding' ? Infinity : 0,
      }}
    >
      {/* Rear wheel */}
      <motion.g
        style={{ transformOrigin: '24px 46px' }}
        animate={isPedaling ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isPedaling
            ? { repeat: Infinity, duration: 0.45, ease: 'linear' }
            : { duration: 0.2 }
        }
      >
        <circle cx="24" cy="46" r="11" fill="#fff" stroke="#334155" strokeWidth="2.5" />
        <line x1="24" y1="35" x2="24" y2="57" stroke="#64748b" strokeWidth="1.5" />
        <line x1="13" y1="46" x2="35" y2="46" stroke="#64748b" strokeWidth="1.5" />
        <line x1="16" y1="38" x2="32" y2="54" stroke="#64748b" strokeWidth="1.5" />
        <line x1="16" y1="54" x2="32" y2="38" stroke="#64748b" strokeWidth="1.5" />
      </motion.g>

      {/* Front wheel */}
      <motion.g
        style={{ transformOrigin: '68px 46px' }}
        animate={isPedaling ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isPedaling
            ? { repeat: Infinity, duration: 0.45, ease: 'linear' }
            : { duration: 0.2 }
        }
      >
        <circle cx="68" cy="46" r="11" fill="#fff" stroke="#334155" strokeWidth="2.5" />
        <line x1="68" y1="35" x2="68" y2="57" stroke="#64748b" strokeWidth="1.5" />
        <line x1="57" y1="46" x2="79" y2="46" stroke="#64748b" strokeWidth="1.5" />
        <line x1="60" y1="38" x2="76" y2="54" stroke="#64748b" strokeWidth="1.5" />
        <line x1="60" y1="54" x2="76" y2="38" stroke="#64748b" strokeWidth="1.5" />
      </motion.g>

      {/* Frame */}
      <path
        d="M24 46 L42 30 L52 30 L68 46"
        fill="none"
        stroke="#ef4444"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <line x1="42" y1="30" x2="36" y2="46" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <line x1="52" y1="30" x2="62" y2="22" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <line x1="62" y1="22" x2="68" y2="46" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />

      {/* Seat */}
      <ellipse cx="38" cy="28" rx="5" ry="2" fill="#334155" />

      {/* Rider body */}
      <circle cx="46" cy="14" r="6" fill="#fcd34d" stroke="#d97706" strokeWidth="1.5" />
      <path
        d="M42 20 Q46 24 50 20 L48 30 L44 30 Z"
        fill="#3b82f6"
        stroke="#1d4ed8"
        strokeWidth="1"
      />
      {/* Arms on handlebars */}
      <line x1="44" y1="22" x2="58" y2="24" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="22" x2="62" y2="22" stroke="#fcd34d" strokeWidth="3" strokeLinecap="round" />

      {/* Pedals + legs (rotate together) */}
      <motion.g
        style={{ transformOrigin: '36px 44px' }}
        animate={isPedaling ? { rotate: 360 } : { rotate: 0 }}
        transition={
          isPedaling
            ? { repeat: Infinity, duration: 0.5, ease: 'linear' }
            : { duration: 0.2 }
        }
      >
        <line x1="32" y1="44" x2="40" y2="44" stroke="#64748b" strokeWidth="2.5" strokeLinecap="round" />
        <rect x="30" y="42" width="4" height="4" rx="1" fill="#f59e0b" />
        <rect x="38" y="42" width="4" height="4" rx="1" fill="#f59e0b" />
        {/* Legs */}
        <line x1="44" y1="30" x2="32" y2="44" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
        <line x1="46" y1="30" x2="40" y2="44" stroke="#1e40af" strokeWidth="3.5" strokeLinecap="round" />
      </motion.g>
    </motion.svg>
  )
}
