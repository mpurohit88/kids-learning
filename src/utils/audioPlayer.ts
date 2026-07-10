import { Howl, Howler } from 'howler'
import { isAudioUnlocked, onAudioUnlocked, unlockAudio } from './audioUnlock'
import { playSuccessSound, playWrongSound } from './soundEffects'

/** Slower pacing so young students can follow each word */
const SPEECH_RATE = .7
/** Higher pitch — clearer, more kid-friendly lady voice */
const SPEECH_PITCH = .9

let currentHowl: Howl | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null
let pendingSpeech: { text: string; lang: string; romanizedHint?: string } | null = null

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

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
}

function resolveAssetUrl(path: string): string {
  if (!path) return path
  if (/^(https?:|data:|blob:)/i.test(path)) return path
  const base = import.meta.env.BASE_URL || '/'
  if (path.startsWith('/')) {
    return `${base.replace(/\/$/, '')}${path}`
  }
  return `${base}${path}`
}

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
      window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 1500)
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

function stopHowl() {
  if (currentHowl) {
    currentHowl.stop()
    currentHowl.unload()
    currentHowl = null
  }
}

function stopSpeech() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}

export function stopAudio() {
  stopHowl()
  stopSpeech()
  pendingSpeech = null
}

async function speakNow(text: string, lang: string, romanizedHint?: string): Promise<void> {
  if (!('speechSynthesis' in window) || !text.trim()) return

  await unlockAudio()
  const voices = await loadVoices()

  // Cancel only the previous utterance, then speak immediately.
  stopSpeech()

  const prefix = lang.toLowerCase().split('-')[0]
  const hasVoice = findVoice(voices, lang) !== null
  const useRomanized = !!(romanizedHint && prefix === 'kn' && !hasVoice)

  const spokenText = useRomanized ? romanizedHint! : text
  const spokenLang = useRomanized ? 'en-IN' : lang

  const utterance = new SpeechSynthesisUtterance(spokenText)
  utterance.lang = spokenLang
  utterance.rate = SPEECH_RATE
  utterance.pitch = SPEECH_PITCH
  utterance.volume = 1

  const voice = useRomanized
    ? (findVoice(voices, 'en-IN') ?? findVoice(voices, 'en-US') ?? voices[0] ?? null)
    : findVoice(voices, lang)
  if (voice) utterance.voice = voice

  // iOS-only: unstick a silent speech queue. Do NOT run on desktop Chrome —
  // pause() before speak() can leave speech permanently silent there.
  if (isIos()) {
    try {
      window.speechSynthesis.resume()
    } catch {
      // ignore
    }
  }

  window.speechSynthesis.speak(utterance)

  if (isIos()) {
    window.setTimeout(() => {
      try {
        window.speechSynthesis.pause()
        window.speechSynthesis.resume()
      } catch {
        // ignore
      }
    }, 0)
  }
}

export async function speakText(
  text: string,
  lang: string,
  romanizedHint?: string,
): Promise<void> {
  if (!text.trim()) return

  // If audio is still locked (common on first mobile screen), queue and speak after unlock.
  if (!isAudioUnlocked()) {
    pendingSpeech = { text, lang, romanizedHint }
    onAudioUnlocked(() => {
      if (!pendingSpeech) return
      const next = pendingSpeech
      pendingSpeech = null
      void speakNow(next.text, next.lang, next.romanizedHint)
    })
    void unlockAudio()
    return
  }

  await speakNow(text, lang, romanizedHint)
}

function playHowl(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    let settled = false
    const finish = (ok: boolean) => {
      if (settled) return
      settled = true
      resolve(ok)
    }

    const sound = new Howl({
      src: [src],
      html5: true,
      preload: true,
      volume: 1,
      onplayerror: () => {
        sound.once('unlock', () => {
          sound.play()
        })
        finish(false)
      },
      onloaderror: () => {
        sound.unload()
        finish(false)
      },
      onend: () => {
        if (currentHowl === sound) currentHowl = null
        sound.unload()
      },
    })

    currentHowl = sound

    // Missing letter MP3s should fall back to speech quickly (most assets are absent).
    const timer = window.setTimeout(() => {
      if (!sound.playing()) {
        sound.unload()
        if (currentHowl === sound) currentHowl = null
        finish(false)
      }
    }, 600)

    sound.once('play', () => {
      window.clearTimeout(timer)
      finish(true)
    })

    try {
      sound.play()
    } catch {
      window.clearTimeout(timer)
      finish(false)
    }
  })
}

export async function playAudio(
  path: string,
  fallbackText?: string,
  speechLang = 'hi-IN',
  romanizedHint?: string,
): Promise<void> {
  // Stop previous playback but keep unlock state.
  stopHowl()
  stopSpeech()

  await unlockAudio()
  Howler.mute(false)
  Howler.volume(1)

  if (Howler.ctx?.state === 'suspended') {
    try {
      await Howler.ctx.resume()
    } catch {
      // Continue — speech fallback may still work.
    }
  }

  // Prefer speech when we have fallback text and no reliable file set —
  // try the file briefly, then speak.
  const url = resolveAssetUrl(path)
  const played = path ? await playHowl(url) : false
  if (played) return

  if (fallbackText || romanizedHint) {
    // Don't clear pending via stopAudio — speak directly.
    await speakNow(fallbackText ?? romanizedHint ?? '', speechLang, romanizedHint)
  }
}

export function playCelebrationSound() {
  void playSuccessSound()
}

export function playEncouragementSound() {
  void playWrongSound()
}

if (typeof window !== 'undefined') {
  void loadVoices()
}
