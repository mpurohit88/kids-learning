import { playSuccessSound, playWrongSound } from './soundEffects'

let currentAudio: HTMLAudioElement | null = null

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

export function speakText(text: string, lang: string) {
  if (!('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = 0.85
  window.speechSynthesis.speak(utterance)
}

export async function playAudio(
  path: string,
  fallbackText?: string,
  speechLang = 'hi-IN',
): Promise<void> {
  stopAudio()

  try {
    const audio = new Audio(path)
    currentAudio = audio
    await audio.play()
    return
  } catch {
    currentAudio = null
  }

  if (fallbackText) {
    speakText(fallbackText, speechLang)
  }
}

export function playCelebrationSound() {
  void playSuccessSound()
}

export function playEncouragementSound() {
  void playWrongSound()
}
