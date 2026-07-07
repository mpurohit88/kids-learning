import { motion } from 'framer-motion'

interface StarDisplayProps {
  count: number
  max?: number
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-3xl',
  lg: 'text-5xl',
}

export function StarDisplay({ count, max = 3, size = 'md' }: StarDisplayProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: max }).map((_, index) => (
        <motion.span
          key={index}
          initial={{ scale: 0 }}
          animate={{ scale: index < count ? 1 : 0.85 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 260 }}
          className={`${sizeMap[size]} ${index < count ? 'opacity-100' : 'opacity-30'}`}
        >
          ⭐
        </motion.span>
      ))}
    </div>
  )
}
