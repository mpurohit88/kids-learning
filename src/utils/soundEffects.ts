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
  volume = 0.18,
) {
  const context = getAudioContext()
  const oscillator = context.createOscillator()
  const gain = context.createGain()

  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)
  gain.gain.setValueAtTime(volume, startTime)
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(context.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration)
}

export async function playSuccessSound() {
  try {
    const context = await ensureAudioReady()
    const now = context.currentTime

    playTone(523.25, now, 0.12)
    playTone(659.25, now + 0.08, 0.12)
    playTone(783.99, now + 0.16, 0.18)
    playTone(1046.5, now + 0.28, 0.35, 'triangle', 0.16)
  } catch {
    // Audio may be blocked until user interaction; fail silently.
  }
}

export async function playWrongSound() {
  try {
    const context = await ensureAudioReady()
    const now = context.currentTime

    playTone(349.23, now, 0.18, 'triangle', 0.12)
    playTone(293.66, now + 0.14, 0.22, 'triangle', 0.1)
    playTone(246.94, now + 0.28, 0.28, 'sine', 0.08)
  } catch {
    // Audio may be blocked until user interaction; fail silently.
  }
}
