import { playSuccessSound, playWrongSound } from './soundEffects'

/** Slower speech rate so students can follow along */
const SPEECH_RATE = 0.75

let currentAudio: HTMLAudioElement | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

// ---------------------------------------------------------------------------
// Voices
// ---------------------------------------------------------------------------

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

function findVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const norm = lang.toLowerCase()
  const prefix = norm.split('-')[0]
  return (
    voices.find((v) => v.lang.toLowerCase() === norm) ??
    voices.find((v) => v.lang.toLowerCase().startsWith(prefix)) ??
    voices.find((v) => v.name.toLowerCase().includes('kannada') && prefix === 'kn') ??
    voices.find((v) => v.name.toLowerCase().includes('hindi') && prefix === 'hi') ??
    null
  )
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
  utterance.pitch = 1

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
