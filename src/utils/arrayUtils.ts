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

export function pickDistractors<T extends { id: string }>(
  pool: T[],
  target: T,
  count: number,
): T[] {
  const others = pool.filter((item) => item.id !== target.id)
  return pickRandomItems(others, count - 1)
}
