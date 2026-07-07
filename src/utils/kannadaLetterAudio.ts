import type { Letter } from '../types'
import { playAudio, speakText } from './audioPlayer'
import { getHindiLetterHint } from './kannadaLetterHints'

export function playKannadaLetterAudio(
  letter: Letter,
  fallbackSpeechLang?: string,
): void {
  const hindiHint = getHindiLetterHint(letter.name)
  if (hindiHint) {
    void speakText(hindiHint, 'hi-IN')
    return
  }

  void playAudio(
    letter.audioPath,
    letter.character,
    fallbackSpeechLang,
    letter.name,
  )
}
