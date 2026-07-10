import { Howl, Howler } from 'howler'
import { isAudioUnlocked, primeSpeechSynthesis, unlockAudio } from './audioUnlock'
import { findKidFriendlyVoice } from './kidFriendlyVoice'
import { playSuccessSound, playWrongSound } from './soundEffects'

/** Desktop pacing — clear for young students */
export const SPEECH_RATE = 0.7
/**
 * Mobile engines (esp. Android Chrome) often ignore mild slowdowns and clip
 * short phrases. Use a stronger slowdown on phones/tablets.
 */
export const SPEECH_RATE_MOBILE = 0.55
/** Higher pitch — clearer, more kid-friendly lady voice */
export const SPEECH_PITCH = 0.9

/** Brief settle after cancel() — mobile TTS truncates if speak() follows too fast. */
const MOBILE_SPEECH_GAP_MS = 80

let currentHowl: Howl | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
}

export function getSpeechRate(): number {
  return isMobileBrowser() ? SPEECH_RATE_MOBILE : SPEECH_RATE
}

/**
 * Android Chrome often chops the end of short utterances ("क" vanishes).
 * A trailing ellipsis gives the engine a soft landing without changing meaning.
 */
export function prepareSpokenText(text: string): string {
  const trimmed = text.trim()
  if (!trimmed) return trimmed
  if (!isMobileBrowser()) return trimmed
  if (/[.!?…,，。।]$/u.test(trimmed)) return trimmed
  return `${trimmed}…`
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

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

export function stopAudio() {
  stopHowl()
  stopSpeech()
}

async function speakNow(text: string, lang: string, romanizedHint?: string): Promise<void> {
  if (!('speechSynthesis' in window) || !text.trim()) return

  // Prime only until unlocked. Re-priming every letter queues silent utterances
  // that make mobile speech rush and cut out ("come and go").
  if (!isAudioUnlocked()) {
    primeSpeechSynthesis()
  }
  void unlockAudio()

  const prefix = lang.toLowerCase().split('-')[0]
  // Prefer already-loaded voices so we can speak in the same turn as a tap.
  let voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    voices = await loadVoices()
  }

  stopSpeech()
  if (isMobileBrowser()) {
    await wait(MOBILE_SPEECH_GAP_MS)
  }

  const hasVoice = findKidFriendlyVoice(voices, lang) !== null
  const useRomanized = !!(romanizedHint && prefix === 'kn' && !hasVoice)

  const spokenText = prepareSpokenText(useRomanized ? romanizedHint! : text)
  const spokenLang = useRomanized ? 'en-IN' : lang

  const utterance = new SpeechSynthesisUtterance(spokenText)
  utterance.lang = spokenLang
  utterance.rate = getSpeechRate()
  utterance.pitch = SPEECH_PITCH
  utterance.volume = 1

  const voice = useRomanized
    ? (findKidFriendlyVoice(voices, 'en-IN') ??
        findKidFriendlyVoice(voices, 'en-US') ??
        voices[0] ??
        null)
    : findKidFriendlyVoice(voices, lang)
  if (voice) utterance.voice = voice

  // Resume only — the old pause()/resume() kick can chop phrases on iOS.
  if (isIos()) {
    try {
      window.speechSynthesis.resume()
    } catch {
      // ignore
    }
  }

  window.speechSynthesis.speak(utterance)
}

export async function speakText(
  text: string,
  lang: string,
  romanizedHint?: string,
): Promise<void> {
  if (!text.trim()) return

  // Always attempt to speak now. Queuing-only when locked caused Hindi to stay
  // silent until Kannada (which calls speakText immediately) unlocked speech.
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

    // Missing letter MP3s should fail fast so speech can take over.
    const timer = window.setTimeout(() => {
      if (!sound.playing()) {
        sound.unload()
        if (currentHowl === sound) currentHowl = null
        finish(false)
      }
    }, 250)

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

/**
 * Play a file when present; otherwise speak fallback.
 * Speech runs first on purpose: Hindi letter MP3s are often missing, and waiting
 * on Howler left mobile outside the user-gesture window (Kannada spoke immediately).
 */
export async function playAudio(
  path: string,
  fallbackText?: string,
  speechLang = 'hi-IN',
  romanizedHint?: string,
): Promise<void> {
  stopHowl()

  void unlockAudio()
  Howler.mute(false)
  Howler.volume(1)

  const hasSpeechFallback = Boolean(fallbackText || romanizedHint)

  // Speak immediately (Kannada-style) so mobile unlocks and kids hear something.
  if (hasSpeechFallback) {
    void speakNow(fallbackText ?? romanizedHint ?? '', speechLang, romanizedHint)
  }

  // On mobile, do not race Howler against TTS. A brief/false Howl "play"
  // was canceling speech mid-phrase so audio "came and went".
  if (isMobileBrowser() && hasSpeechFallback) {
    return
  }

  if (!path) return

  const url = resolveAssetUrl(path)
  const played = await playHowl(url)
  if (played) {
    // Real file won — stop the speech fallback to avoid double audio.
    stopSpeech()
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
