import { Howl, Howler } from 'howler'
import { isAudioUnlocked, primeSpeechSynthesis, unlockAudio } from './audioUnlock'
import { findKidFriendlyVoice } from './kidFriendlyVoice'
import { playSuccessSound, playWrongSound } from './soundEffects'

/** Desktop pacing — clear for young students */
export const SPEECH_RATE = 0.7
/** iOS / generic mobile — mild slowdown (strong slowdowns garble many engines) */
export const SPEECH_RATE_MOBILE = 0.85
/**
 * Android Chrome often distorts or rushes speech when rate is far from 1.
 * Stay near default and slow short letter sounds via text instead.
 */
export const SPEECH_RATE_ANDROID = 0.95
/** Higher pitch on desktop/iOS — clearer kid-friendly voice */
export const SPEECH_PITCH = 0.9
/** Android pitch ≠ 1 frequently sounds robotic / clipped */
export const SPEECH_PITCH_ANDROID = 1

/** Brief settle after cancel() — mobile TTS truncates if speak() follows instantly. */
const MOBILE_SPEECH_GAP_MS = 50

let currentHowl: Howl | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null
/** Only the latest speakNow call may reach speechSynthesis.speak(). */
let speakSequence = 0

export function isMobileBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent)
}

export function isAndroidBrowser(): boolean {
  if (typeof navigator === 'undefined') return false
  return /Android/i.test(navigator.userAgent)
}

function isIos(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/i.test(navigator.userAgent)
}

export function getSpeechRate(): number {
  if (isAndroidBrowser()) return SPEECH_RATE_ANDROID
  if (isMobileBrowser()) return SPEECH_RATE_MOBILE
  return SPEECH_RATE
}

export function getSpeechPitch(): number {
  return isAndroidBrowser() ? SPEECH_PITCH_ANDROID : SPEECH_PITCH
}

/**
 * Normalize spoken text. Keep it natural on all platforms — do not repeat
 * letters or append ellipsis (both sound like double/garbled audio on mobile).
 */
export function prepareSpokenText(text: string): string {
  return text.trim()
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

  const token = ++speakSequence

  // Prime only until unlocked. Re-priming every letter floods the mobile queue.
  if (!isAudioUnlocked()) {
    primeSpeechSynthesis()
  }
  void unlockAudio()

  const prefix = lang.toLowerCase().split('-')[0]
  let voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    voices = await loadVoices()
    if (token !== speakSequence) return
  }

  // Settle before cancel+speak on mobile so cancel is not lost in the gap race.
  if (isMobileBrowser()) {
    await wait(MOBILE_SPEECH_GAP_MS)
    if (token !== speakSequence) return
  }

  // Cancel immediately before speak so only this (latest) utterance plays.
  stopSpeech()

  const hasVoice = findKidFriendlyVoice(voices, lang) !== null
  const useRomanized = !!(romanizedHint && prefix === 'kn' && !hasVoice)

  const spokenText = prepareSpokenText(useRomanized ? romanizedHint! : text)
  const spokenLang = useRomanized ? 'en-IN' : lang

  const utterance = new SpeechSynthesisUtterance(spokenText)
  utterance.lang = spokenLang
  utterance.rate = getSpeechRate()
  utterance.pitch = getSpeechPitch()
  utterance.volume = 1

  // Android: forcing a mismatched voice often sounds worse than lang-only.
  // Let the OS pick the default voice for the language.
  if (!isAndroidBrowser()) {
    const voice = useRomanized
      ? (findKidFriendlyVoice(voices, 'en-IN') ??
          findKidFriendlyVoice(voices, 'en-US') ??
          voices[0] ??
          null)
      : findKidFriendlyVoice(voices, lang)
    if (voice) utterance.voice = voice
  }

  if (isIos()) {
    try {
      window.speechSynthesis.resume()
    } catch {
      // ignore
    }
  }

  if (token !== speakSequence) return
  window.speechSynthesis.speak(utterance)
}

export async function speakText(
  text: string,
  lang: string,
  romanizedHint?: string,
): Promise<void> {
  if (!text.trim()) return
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
 * On mobile: speech only when fallback exists (no Howler cancel race).
 * On desktop: speak-first, then Howl may take over if the file plays.
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

  if (hasSpeechFallback) {
    void speakNow(fallbackText ?? romanizedHint ?? '', speechLang, romanizedHint)
  }

  // Avoid Howler canceling mid-phrase on phones (MP3s are often missing anyway).
  if (isMobileBrowser() && hasSpeechFallback) {
    return
  }

  if (!path) return

  const url = resolveAssetUrl(path)
  const played = await playHowl(url)
  if (played) {
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
