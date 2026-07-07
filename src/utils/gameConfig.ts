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
