import type { Language, Letter } from '../types'
import { playAudio, speakText } from './audioPlayer'
import { getHindiLetterHint, getKannadaSoundHints } from './kannadaLetterHints'

export type LetterSoundMode = 'character' | 'phrase'

export interface LetterSoundOptions {
  /** `character` for games; `phrase` for learn cards / overlay ("क से कमल"). */
  mode?: LetterSoundMode
  /** BCP-47 speech lang from content (e.g. hi-IN, kn-IN, en-IN). */
  speechLang?: string
}

/** Build the full spoken phrase, e.g. "A for Apple", "क से कमल". */
export function buildLetterPhrase(
  letter: Letter,
  subject: Language,
): { text: string; lang: string } {
  const ex = letter.example

  if (subject === 'english') {
    const word = ex?.word ?? letter.name.toUpperCase()
    return { text: `${letter.name.toUpperCase()} for ${word}`, lang: 'en-IN' }
  }

  if (subject === 'hindi') {
    const word = ex?.word ?? letter.character
    return { text: `${letter.character} से ${word}`, lang: 'hi-IN' }
  }

  if (subject === 'kannada') {
    const hints = getKannadaSoundHints(letter.name)
    const word = ex?.word ?? letter.character
    if (hints.hindi) {
      const exWord = ex?.word ?? ''
      return {
        text: hints.hindi + (exWord ? ` से ${exWord}` : ''),
        lang: 'hi-IN',
      }
    }
    return { text: `${letter.character} ${word}`, lang: 'kn-IN' }
  }

  return { text: letter.name, lang: 'en-IN' }
}

/**
 * Single entry point for letter audio on every page/game.
 * Always speaks immediately (mobile gesture unlock); optional MP3 is secondary.
 */
export function playLetterSound(
  letter: Letter,
  subject: Language,
  options: LetterSoundOptions = {},
): void {
  const mode = options.mode ?? 'character'
  const speechLang = options.speechLang ?? defaultSpeechLang(subject)

  try {
    if (mode === 'phrase') {
      playLetterPhrase(letter, subject, speechLang)
      return
    }
    playLetterCharacter(letter, subject, speechLang)
  } catch {
    // Audio must never block UI / round start.
  }
}

function defaultSpeechLang(subject: Language): string {
  if (subject === 'english') return 'en-IN'
  if (subject === 'kannada') return 'kn-IN'
  return 'hi-IN'
}

function playLetterPhrase(letter: Letter, subject: Language, speechLang: string): void {
  const { text, lang } = buildLetterPhrase(letter, subject)

  // Hindi/Kannada: speak phrase immediately (files often missing).
  if (subject === 'kannada' || subject === 'hindi') {
    void speakText(text, lang)
    return
  }

  void playAudio(letter.audioPath, text, speechLang, letter.name)
}

function playLetterCharacter(
  letter: Letter,
  subject: Language,
  speechLang: string,
): void {
  if (subject === 'kannada') {
    const hindiHint = getHindiLetterHint(letter.name)
    if (hindiHint) {
      void speakText(hindiHint, 'hi-IN')
      return
    }
  }

  // Speak-first via playAudio so missing MP3s never delay mobile unlock.
  void playAudio(letter.audioPath, letter.character, speechLang, letter.name)
}

/** Vocabulary / word prompts — same speak-first contract as letters. */
export function playWordSound(
  word: { audioPath: string; word: string; transliteration?: string },
  speechLang = 'hi-IN',
): void {
  try {
    void playAudio(word.audioPath, word.word, speechLang, word.transliteration)
  } catch {
    // ignore
  }
}
