import type { Letter } from '../types'
import { playLetterSound } from './letterSound'

/**
 * @deprecated Prefer `playLetterSound(letter, 'kannada', { speechLang })` from audioPlayer.
 * Kept as a thin alias so older call sites keep working during migration.
 */
export function playKannadaLetterAudio(
  letter: Letter,
  fallbackSpeechLang?: string,
): void {
  playLetterSound(letter, 'kannada', {
    mode: 'character',
    speechLang: fallbackSpeechLang,
  })
}
