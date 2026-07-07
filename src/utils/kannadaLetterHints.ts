import { hindiData } from '../data/repositories/local/contentRepository'

const hindiLetterBySoundName = new Map(
  hindiData.letters.map((letter) => [letter.name, letter.character]),
)

/** Maps Kannada-specific sound names to Hindi letter name keys. */
const HINDI_SOUND_ALIASES: Record<string, string> = {
  ae: 'e',
  oh: 'o',
  lla: 'la',
  sha2: 'sha',
}

const ENGLISH_SOUND_LABELS: Record<string, string> = {
  ae: 'ee',
  oh: 'oo',
  ee: 'ee',
  oo: 'oo',
  'ta-retro': 'Ta',
  'tha-retro': 'Tha',
  'da-retro': 'Da',
  'dha-retro': 'Dha',
  'na-retro': 'Na',
  sha2: 'sha',
  lla: 'la',
}

/** Hindi (Devanagari) equivalent for a Kannada letter sound, matched by romanized name. */
export function getHindiLetterHint(soundName: string): string | undefined {
  const resolved = HINDI_SOUND_ALIASES[soundName] ?? soundName
  return hindiLetterBySoundName.get(resolved)
}

/** English romanized sound for a Kannada letter (e.g. "u", "ka", "ma"). */
export function getEnglishLetterHint(soundName: string): string {
  return ENGLISH_SOUND_LABELS[soundName] ?? soundName
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
