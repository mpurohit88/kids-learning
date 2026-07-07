import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const imagesDir = join(process.cwd(), 'public', 'assets', 'images')
const audioDir = join(process.cwd(), 'public', 'assets', 'audio', 'ui')

mkdirSync(imagesDir, { recursive: true })
mkdirSync(audioDir, { recursive: true })

const imageConfig = {
  apple: { emoji: '🍎', color: '#ef5350' },
  banana: { emoji: '🍌', color: '#ffca28' },
  mango: { emoji: '🥭', color: '#ffb300' },
  cat: { emoji: '🐱', color: '#ffab91' },
  dog: { emoji: '🐶', color: '#bcaaa4' },
  cow: { emoji: '🐄', color: '#eeeeee' },
  elephant: { emoji: '🐘', color: '#b0bec5' },
  lion: { emoji: '🦁', color: '#ffb74d' },
  mother: { emoji: '👩', color: '#f48fb1' },
  father: { emoji: '👨', color: '#90caf9' },
  sister: { emoji: '👧', color: '#ce93d8' },
  brother: { emoji: '👦', color: '#81d4fa' },
  red: { emoji: '🔴', color: '#e53935' },
  blue: { emoji: '🔵', color: '#1e88e5' },
  green: { emoji: '🟢', color: '#43a047' },
  yellow: { emoji: '🟡', color: '#fdd835' },
  one: { emoji: '1', color: '#7e57c2' },
  two: { emoji: '2', color: '#26a69a' },
  three: { emoji: '3', color: '#5c6bc0' },
  four: { emoji: '4', color: '#ec407a' },
}

for (const [name, config] of Object.entries(imageConfig)) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">
  <rect width="200" height="200" rx="32" fill="${config.color}" opacity="0.25"/>
  <circle cx="100" cy="100" r="72" fill="white"/>
  <text x="100" y="118" text-anchor="middle" font-size="${name.match(/one|two|three|four/) ? '72' : '88'}">${config.emoji}</text>
</svg>`
  writeFileSync(join(imagesDir, `${name}.svg`), svg)
}

console.log('Generated placeholder assets')
