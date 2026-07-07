import { motion } from 'framer-motion'

const colors = ['#ffd966', '#ff8a80', '#81c784', '#64b5f6', '#ba68c8', '#ffb74d']

export function ConfettiBurst({ active }: { active: boolean }) {
  if (!active) return null

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 24 }).map((_, index) => (
        <motion.span
          key={index}
          initial={{
            opacity: 1,
            x: '50%',
            y: '40%',
            scale: 0,
          }}
          animate={{
            opacity: [1, 1, 0],
            x: `${20 + Math.random() * 60}%`,
            y: `${10 + Math.random() * 70}%`,
            scale: [0, 1.2, 0.8],
            rotate: Math.random() * 360,
          }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="absolute text-2xl"
          style={{ color: colors[index % colors.length] }}
        >
          {index % 2 === 0 ? '★' : '●'}
        </motion.span>
      ))}
    </div>
  )
}
