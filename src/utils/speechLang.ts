import type { UiLocale } from '../types'

/** UI locale → BCP-47 speech language for prompts / celebration. */
export const SPEECH_LANG_BY_LOCALE: Record<UiLocale, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  kn: 'kn-IN',
}

export function speechLangForLocale(locale: UiLocale): string {
  return SPEECH_LANG_BY_LOCALE[locale]
}
