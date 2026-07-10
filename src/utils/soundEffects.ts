let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

async function ensureAudioReady() {
  const context = getAudioContext()
  if (context.state === 'suspended') {
    await context.resume()
  }
  return context
}

function playTone(
  frequency: number,
  startTime: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume = 0.12,
) {
  const context = getAudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  // Soft attack so it feels like a chime, not a beep
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
    const context = await ensureAudioReady()
    const now = context.currentTime

    playTone(523.25, now, 0.16, 'sine', 0.1)
    playTone(659.25, now + 0.09, 0.18, 'sine', 0.1)
    playTone(783.99, now + 0.18, 0.28, 'triangle', 0.09)
    playTone(1046.5, now + 0.28, 0.35, 'sine', 0.07)
  } catch {
    // Audio may be blocked until user interaction; fail silently.
  }
}

/** Gentle descending tones — encouraging, not harsh */
export async function playWrongSound() {
  try {
    const context = await ensureAudioReady()
    const now = context.currentTime

    playTone(392.0, now, 0.2, 'sine', 0.08)
    playTone(329.63, now + 0.14, 0.28, 'triangle', 0.07)
  } catch {
    // Audio may be blocked until user interaction; fail silently.
  }
}
