import { playSuccessSound, playWrongSound } from './soundEffects'

/** Slower pacing so young students can follow each word */
const SPEECH_RATE = 0.72
/** Higher pitch — clearer, more kid-friendly lady voice */
const SPEECH_PITCH = 1.35

let currentAudio: HTMLAudioElement | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

// ---------------------------------------------------------------------------
// Voices — prefer female / child-friendly system voices when available
// ---------------------------------------------------------------------------

/** Names commonly used by Windows / macOS / Chrome for female or soft voices */
const FEMALE_VOICE_HINTS = [
  'female',
  'woman',
  'girl',
  'zira', // Windows English
  'hazel',
  'susan',
  'samantha', // macOS
  'karen',
  'moira',
  'tessa',
  'fiona',
  'veena', // Indian English (often female)
  'raveena',
  'aditi',
  'neerja',
  'kalpana',
  'swara',
  'ananya',
  'priya',
  'heera',
  'google हिन्दी', // Chrome Hindi female
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

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!('speechSynthesis' in window)) return Promise.resolve([])

  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const tryResolve = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          resolve(voices)
          return true
        }
        return false
      }

      if (tryResolve()) return

      const onChanged = () => {
        if (tryResolve()) {
          window.speechSynthesis.removeEventListener('voiceschanged', onChanged)
        }
      }
      window.speechSynthesis.addEventListener('voiceschanged', onChanged)

      // Fallback: give up waiting after 1 s and use whatever is available
      window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1000)
    })
  }

  return voicesPromise
}

function voiceMatchesLang(voice: SpeechSynthesisVoice, lang: string): boolean {
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

function isLikelyFemaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase()
  if (MALE_VOICE_HINTS.some((hint) => name.includes(hint))) return false
  return FEMALE_VOICE_HINTS.some((hint) => name.includes(hint))
}

function isLikelyMaleVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase()
  return MALE_VOICE_HINTS.some((hint) => name.includes(hint))
}

function scoreKidFriendlyVoice(voice: SpeechSynthesisVoice, lang: string): number {
  let score = 0
  const norm = lang.toLowerCase()
  const voiceLang = voice.lang.toLowerCase()

  if (voiceLang === norm) score += 40
  else if (voiceMatchesLang(voice, lang)) score += 25

  if (isLikelyFemaleVoice(voice)) score += 50
  if (isLikelyMaleVoice(voice)) score -= 40

  // Prefer local / higher-quality voices when the browser marks them
  if (voice.localService) score += 5
  if (voice.default) score += 2

  return score
}

function findVoice(voices: SpeechSynthesisVoice[], lang: string): SpeechSynthesisVoice | null {
  const matching = voices.filter((voice) => voiceMatchesLang(voice, lang))
  const pool = matching.length > 0 ? matching : voices
  if (pool.length === 0) return null

  const ranked = [...pool].sort(
    (a, b) => scoreKidFriendlyVoice(b, lang) - scoreKidFriendlyVoice(a, lang),
  )
  return ranked[0] ?? null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function stopAudio() {
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export async function speakText(
  text: string,
  lang: string,
  romanizedHint?: string,
): Promise<void> {
  if (!('speechSynthesis' in window) || !text) return

  const voices = await loadVoices()

  window.speechSynthesis.cancel()

  const prefix = lang.toLowerCase().split('-')[0]
  const hasVoice = findVoice(voices, lang) !== null
  const useRomanized = !!(romanizedHint && prefix === 'kn' && !hasVoice)

  const spokenText = useRomanized ? romanizedHint! : text
  const spokenLang = useRomanized ? 'en-IN' : lang

  const utterance = new SpeechSynthesisUtterance(spokenText)
  utterance.lang = spokenLang
  utterance.rate = SPEECH_RATE
  utterance.pitch = SPEECH_PITCH

  const voice = useRomanized
    ? (findVoice(voices, 'en-IN') ?? findVoice(voices, 'en-US') ?? voices[0] ?? null)
    : findVoice(voices, lang)
  if (voice) utterance.voice = voice

  window.speechSynthesis.speak(utterance)
}

export async function playAudio(
  path: string,
  fallbackText?: string,
  speechLang = 'hi-IN',
  romanizedHint?: string,
): Promise<void> {
  stopAudio()

  const played = await tryPlayFile(path)
  if (played) return

  if (fallbackText || romanizedHint) {
    await speakText(fallbackText ?? romanizedHint ?? '', speechLang, romanizedHint)
  }
}

function tryPlayFile(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio()
    let settled = false

    const finish = (success: boolean) => {
      if (settled) return
      settled = true
      resolve(success)
    }

    audio.addEventListener(
      'canplaythrough',
      () => {
        currentAudio = audio
        audio
          .play()
          .then(() => finish(true))
          .catch(() => {
            currentAudio = null
            finish(false)
          })
      },
      { once: true },
    )

    audio.addEventListener('error', () => finish(false), { once: true })

    audio.src = path
    audio.load()

    // Timeout: if audio hasn't loaded in 3 s, fall back to speech
    window.setTimeout(() => finish(false), 3000)
  })
}

export function playCelebrationSound() {
  void playSuccessSound()
}

export function playEncouragementSound() {
  void playWrongSound()
}

// Warm up voices as soon as possible so they're ready when needed
if (typeof window !== 'undefined') {
  // On first user interaction, kick off voice loading and unblock any
  // browser that requires a gesture before speech synthesis works.
  const warmUp = () => {
    void loadVoices()
    window.removeEventListener('pointerdown', warmUp, true)
    window.removeEventListener('touchstart', warmUp, true)
    window.removeEventListener('keydown', warmUp, true)
  }
  window.addEventListener('pointerdown', warmUp, { capture: true, passive: true })
  window.addEventListener('touchstart', warmUp, { capture: true, passive: true })
  window.addEventListener('keydown', warmUp, { capture: true, passive: true })

  // Also start loading immediately (works on desktop without any gesture)
  void loadVoices()
}
