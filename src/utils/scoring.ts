import type { GameRoundResult } from '../types'

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
