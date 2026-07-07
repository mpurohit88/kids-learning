import type { AgeGroup, GameRoundResult, Language } from '../types'

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }
  return copy
}

export function pickRandomItems<T>(items: T[], count: number): T[] {
  return shuffleArray(items).slice(0, Math.min(count, items.length))
}

export function getOptionCount(ageGroup: AgeGroup, language?: Language): number {
  if (language === 'hindi') return 4
  return ageGroup === 'lkg' ? 3 : 4
}

export function getRoundCount(ageGroup: AgeGroup, language?: Language): number {
  if (language === 'hindi') return ageGroup === 'lkg' ? 7 : 10
  return ageGroup === 'lkg' ? 5 : 7
}

export function getOptionGridClass(optionCount: number): string {
  if (optionCount >= 7) return 'grid-cols-4 sm:grid-cols-7'
  if (optionCount === 3) return 'grid-cols-3'
  return 'grid-cols-2 md:grid-cols-4'
}

export function getOptionButtonClass(optionCount: number): string {
  if (optionCount >= 7) {
    return 'min-h-20 rounded-2xl border-4 border-white text-3xl font-bold shadow-lg transition md:min-h-24 md:text-4xl'
  }
  return 'min-h-28 rounded-3xl border-4 border-white text-5xl font-bold shadow-lg transition md:min-h-32 md:text-6xl'
}

export function calculateStars(correct: number, total: number): number {
  const ratio = correct / total
  if (ratio >= 0.85) return 3
  if (ratio >= 0.55) return 2
  return 1
}

export function getFirstGrapheme(text: string): string {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter('en', { granularity: 'grapheme' })
    const first = [...segmenter.segment(text)][0]
    if (first?.segment) return first.segment
  }
  return text.charAt(0)
}

export function getExamRoundCount(): number {
  return 10
}

export function buildRoundResult(correct: number, total: number): GameRoundResult {
  return {
    correct,
    total,
    stars: calculateStars(correct, total),
  }
}

export function pickDistractors<T extends { id: string }>(
  pool: T[],
  target: T,
  count: number,
): T[] {
  const others = pool.filter((item) => item.id !== target.id)
  return pickRandomItems(others, count - 1)
}
