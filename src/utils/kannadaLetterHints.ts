import { hindiData } from '../data/repositories/local/contentRepository'

const hindiLetterBySoundName = new Map(
  hindiData.letters.map((letter) => [letter.name, letter.character]),
)

/** Hindi (Devanagari) equivalent for a Kannada letter sound, matched by romanized name. */
export function getHindiLetterHint(soundName: string): string | undefined {
  return hindiLetterBySoundName.get(soundName)
}

/** English romanized sound for a Kannada letter (e.g. "u", "ka", "ma"). */
export function getEnglishLetterHint(soundName: string): string {
  return soundName
}

export interface KannadaSoundHints {
  hindi?: string
  english: string
}

export function getKannadaSoundHints(soundName: string): KannadaSoundHints {
  return {
    hindi: getHindiLetterHint(soundName),
    english: getEnglishLetterHint(soundName),
  }
}
