import {
  getSpeechRate,
  isAndroidBrowser,
  speakTextAndWait,
  stopAudio,
} from './audio'

const ENGLISH_SPEECH_LANG = 'en-IN'

/** Slightly slower than the app default — clearer for syllable practice. */
export function getSlowPronunciationRate(): number {
  const base = getSpeechRate()
  if (isAndroidBrowser()) return Math.max(0.75, base * 0.85)
  return Math.max(0.55, base * 0.75)
}

export async function speakWordNormal(word: string): Promise<void> {
  await speakTextAndWait(word, ENGLISH_SPEECH_LANG, { rate: getSpeechRate() })
}

export async function speakWordSlow(word: string): Promise<void> {
  await speakTextAndWait(word, ENGLISH_SPEECH_LANG, {
    rate: getSlowPronunciationRate(),
  })
}

export async function speakSyllable(chunk: string): Promise<void> {
  await speakTextAndWait(chunk, ENGLISH_SPEECH_LANG, {
    rate: getSlowPronunciationRate(),
  })
}

/** Play each syllable slowly, then the full word at normal speed. */
export async function speakSyllableBreakdown(
  syllables: string[],
  fullWord: string,
  onChunk?: (index: number) => void,
): Promise<void> {
  stopAudio()
  for (let index = 0; index < syllables.length; index += 1) {
    onChunk?.(index)
    await speakSyllable(syllables[index])
  }
  onChunk?.(-1)
  await speakWordNormal(fullWord)
}
