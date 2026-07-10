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

async function primeHowler(): Promise<void> {
  Howler.autoUnlock = true
  Howler.html5PoolSize = 10
  Howler.mute(false)
  Howler.volume(1)

  // Creating + playing a silent clip forces AudioContext creation and unlocks HTML5 pool.
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
 * Mobile browsers block Web Audio / speech until a real user gesture.
 * Safe to call repeatedly — no-ops after the first successful unlock.
 */
export async function unlockAudio(): Promise<void> {
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

      // Warm speech voices only — do NOT speak+cancel here.
      // Canceling during unlock was silencing real speech on desktop Chrome.
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
