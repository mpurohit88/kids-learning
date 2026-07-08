import { shuffleArray } from './arrayUtils'

export function pickUniqueByKey<T>(
  pool: T[],
  count: number,
  getKey: (item: T) => string,
): T[] {
  const shuffled = shuffleArray(pool)
  const picked: T[] = []
  const usedKeys = new Set<string>()

  for (const item of shuffled) {
    const key = getKey(item)
    if (usedKeys.has(key)) continue
    usedKeys.add(key)
    picked.push(item)
    if (picked.length >= count) break
  }

  return picked
}

export interface AdditionPair {
  a: number
  b: number
}

export function additionPairKey(a: number, b: number): string {
  const [left, right] = a <= b ? [a, b] : [b, a]
  return `${left}+${right}`
}

export function buildAdditionPairPool(minOperand: number, maxSum: number): AdditionPair[] {
  const pairs: AdditionPair[] = []

  for (let a = minOperand; a <= maxSum - minOperand; a += 1) {
    for (let b = minOperand; b <= maxSum - a; b += 1) {
      pairs.push({ a, b })
    }
  }

  return pairs
}

export function additionOperandsKey(addends: number[]): string {
  return [...addends].sort((left, right) => left - right).join('+')
}

export function pickUniqueOperands(
  count: number,
  generate: () => number[],
  maxAttempts = 500,
): number[][] {
  const picked: number[][] = []
  const usedKeys = new Set<string>()
  let attempts = 0

  while (picked.length < count && attempts < maxAttempts) {
    attempts += 1
    const addends = generate()
    const key = additionOperandsKey(addends)
    if (usedKeys.has(key)) continue
    usedKeys.add(key)
    picked.push(addends)
  }

  return picked
}

export function maybeSwapOperands(a: number, b: number): AdditionPair {
  if (Math.random() < 0.5) {
    return { a, b }
  }

  return { a: b, b: a }
}
