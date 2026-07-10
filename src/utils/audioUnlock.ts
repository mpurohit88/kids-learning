import { Howl, Howler } from 'howler'

let unlocked = false
let unlockPromise: Promise<void> | null = null
const unlockListeners = new Set<() => void>()

/** Tiny silent WAV — used to force Howler / Web Audio awake on mobile. */
const SILENT_WAV =
  'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'

export function isAudioUnlocked(): boolean {
  return unlocked
}

export function onAudioUnlocked(listener: () => void): () => void {
  if (unlocked) {
    listener()
    return () => undefined
  }
  unlockListeners.add(listener)
  return () => {
    unlockListeners.delete(listener)
  }
}

function notifyUnlocked() {
  unlocked = true
  for (const listener of unlockListeners) {
    try {
      listener()
    } catch {
      // Ignore listener errors so one bad callback cannot block unlock.
    }
  }
  unlockListeners.clear()
}

/**
 * Mobile browsers (especially iOS/Android Chrome) only enable speechSynthesis
 * after speak() runs inside a real user gesture. Kannada worked first because
 * it called speakText() immediately on tap; Hindi waited on missing MP3s.
 * Call this synchronously from click/touch handlers.
 */
export function primeSpeechSynthesis(): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
  try {
    void window.speechSynthesis.getVoices()
    const priming = new SpeechSynthesisUtterance(' ')
    priming.volume = 0
    priming.rate = 1
    priming.pitch = 1
    // Do NOT cancel afterward — canceling can wipe the unlock on some mobiles.
    window.speechSynthesis.speak(priming)
  } catch {
    // ignore
  }
}

async function primeHowler(): Promise<void> {
  Howler.autoUnlock = true
  Howler.html5PoolSize = 10
  Howler.mute(false)
  Howler.volume(1)

  await new Promise<void>((resolve) => {
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve()
    }

    const silent = new Howl({
      src: [SILENT_WAV],
      volume: 0,
      html5: false,
      onend: () => {
        silent.unload()
        finish()
      },
      onloaderror: () => {
        silent.unload()
        finish()
      },
      onplayerror: () => {
        silent.once('unlock', () => {
          try {
            silent.play()
          } catch {
            finish()
          }
        })
        finish()
      },
    })

    try {
      silent.play()
    } catch {
      silent.unload()
      finish()
    }

    window.setTimeout(() => {
      try {
        silent.stop()
        silent.unload()
      } catch {
        // ignore
      }
      finish()
    }, 300)
  })

  if (Howler.ctx?.state === 'suspended') {
    try {
      await Howler.ctx.resume()
    } catch {
      // ignore
    }
  }
}

/**
 * Unlock Web Audio + speech. Safe to call repeatedly.
 * When called from a tap, speech priming runs synchronously first.
 */
export async function unlockAudio(): Promise<void> {
  // Prime only until unlocked. Repeating silent speak() on every tap floods
  // the mobile TTS queue and makes real phrases rush / cut out.
  if (!unlocked) {
    primeSpeechSynthesis()
  }

  if (unlocked) {
    if (Howler.ctx?.state === 'suspended') {
      try {
        await Howler.ctx.resume()
      } catch {
        // ignore
      }
    }
    return
  }
  if (unlockPromise) return unlockPromise

  unlockPromise = (async () => {
    try {
      await primeHowler()
      if ('speechSynthesis' in window) {
        void window.speechSynthesis.getVoices()
      }
      notifyUnlocked()
    } catch {
      unlockPromise = null
    }
  })()

  return unlockPromise
}

/** Attach once at app start — unlocks on the first real tap/click/key. */
export function installAudioUnlockListeners(): () => void {
  if (typeof window === 'undefined') return () => undefined

  const events: Array<keyof WindowEventMap> = ['pointerdown', 'touchend', 'click', 'keydown']

  const onGesture = () => {
    // Sync prime inside the gesture, then finish Howler unlock.
    primeSpeechSynthesis()
    void unlockAudio().then(() => {
      for (const event of events) {
        window.removeEventListener(event, onGesture, true)
      }
    })
  }

  for (const event of events) {
    window.addEventListener(event, onGesture, { capture: true, passive: true })
  }

  return () => {
    for (const event of events) {
      window.removeEventListener(event, onGesture, true)
    }
  }
}
