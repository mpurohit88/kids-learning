import { playSuccessSound, playWrongSound } from './soundEffects'

let currentAudio: HTMLAudioElement | null = null
let voicesPromise: Promise<SpeechSynthesisVoice[]> | null = null

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

function loadVoices(): Promise<SpeechSynthesisVoice[]> {
  if (!('speechSynthesis' in window)) {
    return Promise.resolve([])
  }

  if (!voicesPromise) {
    voicesPromise = new Promise((resolve) => {
      const pickVoices = () => {
        const voices = window.speechSynthesis.getVoices()
        if (voices.length > 0) {
          resolve(voices)
          return true
        }
        return false
      }

      if (pickVoices()) return

      const handleVoicesChanged = () => {
        if (pickVoices()) {
          window.speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged)
        }
      }

      window.speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged)
      window.setTimeout(() => resolve(window.speechSynthesis.getVoices()), 500)
    })
  }

  return voicesPromise
}

function findVoice(voices: SpeechSynthesisVoice[], lang: string) {
  const normalized = lang.toLowerCase()
  const langPrefix = normalized.split('-')[0]

  return (
    voices.find((voice) => voice.lang.toLowerCase() === normalized) ??
    voices.find((voice) => voice.lang.toLowerCase().startsWith(langPrefix)) ??
    voices.find((voice) => voice.name.toLowerCase().includes('kannada') && langPrefix === 'kn') ??
    voices.find((voice) => voice.name.toLowerCase().includes('hindi') && langPrefix === 'hi') ??
    null
  )
}

function hasVoiceForLang(voices: SpeechSynthesisVoice[], lang: string) {
  return findVoice(voices, lang) !== null
}

export async function speakText(
  text: string,
  lang: string,
  romanizedHint?: string,
): Promise<void> {
  if (!('speechSynthesis' in window) || !text) return

  const voices = await loadVoices()
  window.speechSynthesis.cancel()

  const langPrefix = lang.toLowerCase().split('-')[0]
  const voice = findVoice(voices, lang)
  const useRomanized =
    romanizedHint &&
    langPrefix === 'kn' &&
    !hasVoiceForLang(voices, lang)

  const utterance = new SpeechSynthesisUtterance(useRomanized ? romanizedHint : text)
  utterance.lang = useRomanized ? 'en-IN' : lang
  utterance.rate = 0.82
  utterance.pitch = 1

  if (voice && !useRomanized) {
    utterance.voice = voice
  } else if (useRomanized) {
    const englishVoice =
      findVoice(voices, 'en-IN') ?? findVoice(voices, 'en-US') ?? voices[0] ?? null
    if (englishVoice) utterance.voice = englishVoice
  }

  window.speechSynthesis.speak(utterance)
}

function tryPlayFile(path: string): Promise<boolean> {
  return new Promise((resolve) => {
    const audio = new Audio()

    const finish = (success: boolean) => {
      audio.removeEventListener('canplaythrough', onReady)
      audio.removeEventListener('error', onError)
      resolve(success)
    }

    const onReady = async () => {
      currentAudio = audio
      try {
        await audio.play()
        finish(true)
      } catch {
        currentAudio = null
        finish(false)
      }
    }

    const onError = () => {
      finish(false)
    }

    audio.addEventListener('canplaythrough', onReady, { once: true })
    audio.addEventListener('error', onError, { once: true })
    audio.src = path
    audio.load()

    window.setTimeout(() => {
      if (audio.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
        finish(false)
      }
    }, 1500)
  })
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

export function playCelebrationSound() {
  void playSuccessSound()
}

export function playEncouragementSound() {
  void playWrongSound()
}

// Warm up voices after first user interaction so Kannada/Hindi detection is ready.
if (typeof window !== 'undefined') {
  window.addEventListener(
    'pointerdown',
    () => {
      void loadVoices()
    },
    { once: true },
  )
}
