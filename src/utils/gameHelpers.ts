import type { AgeGroup, GameRoundResult } from '../types'

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

export function getOptionCount(ageGroup: AgeGroup): number {
  return ageGroup === 'lkg' ? 3 : 4
}

export function getRoundCount(ageGroup: AgeGroup): number {
  return ageGroup === 'lkg' ? 5 : 7
}

export function calculateStars(correct: number, total: number): number {
  const ratio = correct / total
  if (ratio >= 0.85) return 3
  if (ratio >= 0.55) return 2
  return 1
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
