import { Howler } from 'howler'
import { unlockAudio } from './audioUnlock'

let fallbackContext: AudioContext | null = null

function getOrCreateContext(): AudioContext | null {
  if (Howler.ctx) return Howler.ctx
  if (typeof window === 'undefined') return null
  if (!fallbackContext) {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctx) return null
    fallbackContext = new Ctx()
  }
  return fallbackContext
}

async function ensureContext(): Promise<AudioContext | null> {
  await unlockAudio()
  const context = getOrCreateContext()
  if (!context) return null
  if (context.state === 'suspended') {
    try {
      await context.resume()
    } catch {
      return null
    }
  }
  return context
}

function playTone(
  context: AudioContext,
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
) {
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(0.001, startTime)
  gain.gain.exponentialRampToValueAtTime(volume, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

/** Soft ascending chime — playful, not sharp */
export async function playSuccessSound() {
  try {
    const context = await ensureContext()
    if (!context) return
    const now = context.currentTime

    playTone(context, 523.25, now, 0.16, 'sine', 0.16)
    playTone(context, 659.25, now + 0.09, 0.18, 'sine', 0.16)
    playTone(context, 783.99, now + 0.18, 0.28, 'triangle', 0.14)
    playTone(context, 1046.5, now + 0.28, 0.35, 'sine', 0.12)
  } catch {
    // Audio may still be blocked; fail silently.
  }
}

/** Gentle descending tones — encouraging, not harsh */
export async function playWrongSound() {
  try {
    const context = await ensureContext()
    if (!context) return
    const now = context.currentTime

    playTone(context, 392.0, now, 0.2, 'sine', 0.12)
    playTone(context, 329.63, now + 0.14, 0.28, 'triangle', 0.1)
  } catch {
    // Audio may still be blocked; fail silently.
  }
}
