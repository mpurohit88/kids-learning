import pronunciationWords from '../../seed/subjects/pronunciationWords.json'
import type { PronunciationContent, PronunciationWord } from '../../../types'
import { pickRandomItems, shuffleArray } from '../../../utils/arrayUtils'

const content = pronunciationWords as PronunciationContent

/**
 * Prefer priority (worksheet) words, then fill from the rest of the bank.
 * Safe to call repeatedly — returns a fresh shuffled round each time.
 */
export function pickPronunciationRound(
  count: number,
  words: PronunciationWord[] = content.words,
): PronunciationWord[] {
  if (words.length === 0 || count <= 0) return []

  const priority = words.filter((word) => word.priority)
  const regular = words.filter((word) => !word.priority)

  const priorityPick = pickRandomItems(
    priority,
    Math.min(priority.length, Math.max(1, Math.ceil(count * 0.4))),
  )
  const remaining = count - priorityPick.length
  const regularPick = pickRandomItems(
    regular.filter((word) => !priorityPick.some((picked) => picked.id === word.id)),
    Math.min(remaining, regular.length),
  )

  let round = [...priorityPick, ...regularPick]

  if (round.length < count) {
    const used = new Set(round.map((word) => word.id))
    const filler = shuffleArray(words.filter((word) => !used.has(word.id))).slice(
      0,
      count - round.length,
    )
    round = [...round, ...filler]
  }

  // If the bank is smaller than count, allow reuse by cycling.
  while (round.length < count && words.length > 0) {
    round.push(words[round.length % words.length])
  }

  return shuffleArray(round).slice(0, count)
}

export class LocalPronunciationRepository {
  getAllWords(): PronunciationWord[] {
    return content.words
  }

  getWordById(id: string): PronunciationWord | undefined {
    return content.words.find((word) => word.id === id)
  }

  getRound(count: number): PronunciationWord[] {
    return pickPronunciationRound(count, content.words)
  }
}
