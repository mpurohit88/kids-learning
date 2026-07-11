interface FoodVisualProps {
  word: string
  emoji?: string
  imagePath?: string
  size?: 'board' | 'fly'
}

const boardEmojiClass = 'text-6xl md:text-7xl'
const flyEmojiClass = 'text-7xl md:text-8xl'
const boardImageClass = 'h-16 w-16 object-contain md:h-20 md:w-20'
const flyImageClass = 'h-20 w-20 object-contain md:h-24 md:w-24'

export function FoodVisual({
  emoji,
  imagePath,
  size = 'board',
}: FoodVisualProps) {
  const emojiClass = size === 'fly' ? flyEmojiClass : boardEmojiClass
  const imageClass = size === 'fly' ? flyImageClass : boardImageClass

  if (imagePath) {
    return <img src={imagePath} alt="" className={imageClass} />
  }

  return (
    <span className={emojiClass} aria-hidden>
      {emoji ?? '🍽️'}
    </span>
  )
}
