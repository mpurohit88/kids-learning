import { Howl, Howler } from 'howler'
import { primeSpeechSynthesis, unlockAudio } from './audioUnlock'
import { findKidFriendlyVoice } from './kidFriendlyVoice'
import { playSuccessSound, playWrongSound } from './soundEffects'

/** Slower pacing so young students can follow each word */
export const SPEECH_RATE = 0.7
/** Higher pitch — clearer, more kid-friendly lady voice */
export const SPEECH_PITCH = 0.9

let currentHowl: Howl | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

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
}

async function speakNow(text: string, lang: string, romanizedHint?: string): Promise<void> {
  if (!('speechSynthesis' in window) || !text.trim()) return

  // Sync prime first so mobile gesture unlock is not lost to awaits.
  primeSpeechSynthesis()
  void unlockAudio()

  const prefix = lang.toLowerCase().split('-')[0]
  // Prefer already-loaded voices so we can speak in the same turn as a tap.
  let voices = window.speechSynthesis.getVoices()
  if (voices.length === 0) {
    voices = await loadVoices()
  }

  stopSpeech()

  const hasVoice = findKidFriendlyVoice(voices, lang) !== null
  const useRomanized = !!(romanizedHint && prefix === 'kn' && !hasVoice)

  const spokenText = useRomanized ? romanizedHint! : text
  const spokenLang = useRomanized ? 'en-IN' : lang

  const utterance = new SpeechSynthesisUtterance(spokenText)
  utterance.lang = spokenLang
  utterance.rate = SPEECH_RATE
  utterance.pitch = SPEECH_PITCH
  utterance.volume = 1

  const voice = useRomanized
    ? (findKidFriendlyVoice(voices, 'en-IN') ??
        findKidFriendlyVoice(voices, 'en-US') ??
        voices[0] ??
        null)
    : findKidFriendlyVoice(voices, lang)
  if (voice) utterance.voice = voice

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
