import { dataService } from '../data'
import type { UiLocale } from '../types'
import { prepareAudio, speakTextAndWait, stopAudio } from './audio'
import { primeSpeechSynthesis } from './audioUnlock'
import { getSlowPronunciationRate } from './pronunciationSpeech'
import { speechLangForLocale } from './speechLang'
import { getNestedTranslation } from './translate'

const ENGLISH_SPEECH_LANG = 'en-US'
const GAP_BETWEEN_LANG_MS = 400
const GAP_BETWEEN_WORDS_MS = 280

let speakChainToken = 0

export function splitQuestionPromptWords(prompt: string): string[] {
  return prompt.match(/\S+/g) ?? []
}

/** -1 = idle, -2 = full sentence (highlight all words) */
export type QuestionWordHighlightIndex = number

export function shouldShowMotherTonguePrompt(uiLocale: UiLocale): boolean {
  return uiLocale === 'hi' || uiLocale === 'kn'
}

export function getQuestionWordMotherTongueLocale(uiLocale: UiLocale): 'hi' | 'kn' | null {
  if (uiLocale === 'kn') return 'kn'
  if (uiLocale === 'hi') return 'hi'
  return null
}

export function getQuestionWordMotherTonguePrompt(
  exampleId: string,
  uiLocale: UiLocale,
): string | undefined {
  const mtLocale = getQuestionWordMotherTongueLocale(uiLocale)
  if (!mtLocale) return undefined
  const dictionary = dataService.getTranslations(mtLocale)
  return getNestedTranslation(dictionary, `learn.questionWords.prompts.${exampleId}`)
}

export function getQuestionContextText(
  exampleId: string,
  uiLocale: UiLocale,
): string | undefined {
  const dictionary = dataService.getTranslations(uiLocale)
  return getNestedTranslation(dictionary, `learn.questionWords.contexts.${exampleId}`)
}

function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms))
}

export async function speakQuestionExample(
  exampleId: string,
  englishPrompt: string,
  uiLocale: UiLocale,
): Promise<void> {
  const token = ++speakChainToken

  void prepareAudio()
  if (token !== speakChainToken) return

  await speakTextAndWait(englishPrompt, ENGLISH_SPEECH_LANG)
  if (token !== speakChainToken) return

  const mtLocale = getQuestionWordMotherTongueLocale(uiLocale)
  if (!mtLocale) return

  const motherTonguePrompt = getQuestionWordMotherTonguePrompt(exampleId, uiLocale)
  if (!motherTonguePrompt) return

  await waitMs(GAP_BETWEEN_LANG_MS)
  if (token !== speakChainToken) return

  await speakTextAndWait(motherTonguePrompt, speechLangForLocale(mtLocale))
}

export async function speakQuestionSlowWordByWord(
  englishPrompt: string,
  onWord?: (index: QuestionWordHighlightIndex) => void,
): Promise<void> {
  const token = ++speakChainToken
  const words = splitQuestionPromptWords(englishPrompt)
  if (words.length === 0) return

  primeSpeechSynthesis()
  void prepareAudio()
  if (token !== speakChainToken) return

  const slowRate = getSlowPronunciationRate()

  for (let index = 0; index < words.length; index += 1) {
    onWord?.(index)
    await speakTextAndWait(words[index], ENGLISH_SPEECH_LANG, { rate: slowRate })
    if (token !== speakChainToken) return

    await waitMs(GAP_BETWEEN_WORDS_MS)
    if (token !== speakChainToken) return
  }

  onWord?.(-1)
  await waitMs(320)
  if (token !== speakChainToken) return

  onWord?.(-2)
  await speakTextAndWait(englishPrompt, ENGLISH_SPEECH_LANG, { rate: slowRate })
  if (token !== speakChainToken) return

  onWord?.(-1)
}

export async function speakQuestionExplanation(
  exampleId: string,
  uiLocale: UiLocale,
): Promise<void> {
  const token = ++speakChainToken
  const context = getQuestionContextText(exampleId, uiLocale)
  if (!context) return

  void prepareAudio()
  if (token !== speakChainToken) return

  await speakTextAndWait(context, speechLangForLocale(uiLocale))
}

export function cancelQuestionWordSpeech(): void {
  speakChainToken += 1
  stopAudio()
}
