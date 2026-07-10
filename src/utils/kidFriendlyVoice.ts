/**
 * Kid-friendly voice selection — pure helpers (no browser audio APIs).
 * Used by audioPlayer and unit-tested directly so scoring regressions are caught.
 */

const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'girl',
  'zira',
  'hazel',
  'susan',
  'samantha',
  'karen',
  'moira',
  'tessa',
  'fiona',
  'veena',
  'raveena',
  'aditi',
  'neerja',
  'kalpana',
  'swara',
  'ananya',
  'priya',
  'heera',
  'google हिन्दी',
  'google uk english female',
  'google us english',
  'microsoft zira',
  'microsoft hazel',
  'microsoft heera',
  'microsoft neerja',
]

const MALE_VOICE_HINTS = [
  'male',
  'man',
  'boy',
  'david',
  'mark',
  'george',
  'daniel',
  'alex',
  'fred',
  'ravi',
  'hemant',
  'microsoft david',
  'microsoft mark',
  'microsoft ravi',
  'microsoft hemant',
  'google uk english male',
]

/** Minimal voice shape so tests can run without SpeechSynthesisVoice. */
export interface VoiceLike {
  name: string
  lang: string
  localService?: boolean
  default?: boolean
}

export function voiceMatchesLang(voice: VoiceLike, lang: string): boolean {
  const norm = lang.toLowerCase()
  const prefix = norm.split('-')[0]
  const voiceLang = voice.lang.toLowerCase()
  const voiceName = voice.name.toLowerCase()

  if (voiceLang === norm || voiceLang.startsWith(prefix)) return true
  if (prefix === 'kn' && voiceName.includes('kannada')) return true
  if (prefix === 'hi' && (voiceName.includes('hindi') || voiceName.includes('हिन्दी'))) {
    return true
  }
  return false
}

export function isLikelyFemaleVoice(voice: VoiceLike): boolean {
  const name = voice.name.toLowerCase()
  if (MALE_VOICE_HINTS.some((hint) => name.includes(hint))) return false
  return FEMALE_VOICE_HINTS.some((hint) => name.includes(hint))
}

export function isLikelyMaleVoice(voice: VoiceLike): boolean {
  const name = voice.name.toLowerCase()
  return MALE_VOICE_HINTS.some((hint) => name.includes(hint))
}

export function scoreKidFriendlyVoice(voice: VoiceLike, lang: string): number {
  let score = 0
  const norm = lang.toLowerCase()
  const voiceLang = voice.lang.toLowerCase()

  if (voiceLang === norm) score += 40
  else if (voiceMatchesLang(voice, lang)) score += 25

  if (isLikelyFemaleVoice(voice)) score += 50
  if (isLikelyMaleVoice(voice)) score -= 40

  if (voice.localService) score += 5
  if (voice.default) score += 2

  return score
}

export function findKidFriendlyVoice<T extends VoiceLike>(
  voices: T[],
  lang: string,
): T | null {
  const matching = voices.filter((voice) => voiceMatchesLang(voice, lang))
  const pool = matching.length > 0 ? matching : voices
  if (pool.length === 0) return null

  const ranked = [...pool].sort(
    (a, b) => scoreKidFriendlyVoice(b, lang) - scoreKidFriendlyVoice(a, lang),
  )
  return ranked[0] ?? null
}
