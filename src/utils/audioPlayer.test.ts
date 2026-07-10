import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const unlockAudio = vi.fn(async () => undefined)
const primeSpeechSynthesis = vi.fn()
const isAudioUnlocked = vi.fn(() => false)

vi.mock('./audioUnlock', () => ({
  unlockAudio: () => unlockAudio(),
  primeSpeechSynthesis: () => primeSpeechSynthesis(),
  isAudioUnlocked: () => isAudioUnlocked(),
}))

vi.mock('./soundEffects', () => ({
  playSuccessSound: vi.fn(),
  playWrongSound: vi.fn(),
}))

type HowlHandler = (() => void) | undefined

function createHowlMock(options: { playSucceeds?: boolean } = {}) {
  const playSucceeds = options.playSucceeds ?? false
  const handlers: Record<string, HowlHandler> = {}

  return {
    play: vi.fn(() => {
      if (playSucceeds) {
        queueMicrotask(() => handlers.play?.())
      }
      return 1
    }),
    stop: vi.fn(),
    unload: vi.fn(),
    playing: vi.fn(() => playSucceeds),
    once: vi.fn((event: string, cb: () => void) => {
      handlers[event] = cb
    }),
  }
}

let lastHowl: ReturnType<typeof createHowlMock> | null = null
let howlPlaySucceeds = false

vi.mock('howler', () => {
  class Howl {
    constructor(_opts: unknown) {
      lastHowl = createHowlMock({ playSucceeds: howlPlaySucceeds })
      return lastHowl
    }
  }

  return {
    Howl,
    Howler: {
      mute: vi.fn(),
      volume: vi.fn(),
      ctx: null,
    },
  }
})

class FakeUtterance {
  text: string
  lang = ''
  rate = 1
  pitch = 1
  volume = 1
  voice: { name: string; lang: string } | null = null
  constructor(text: string) {
    this.text = text
  }
}

function installWindowSpeech(voices: Array<{ name: string; lang: string }> = []) {
  const speak = vi.fn()
  const cancel = vi.fn()
  const getVoices = vi.fn(() => voices)
  const speechSynthesis = {
    speak,
    cancel,
    getVoices,
    resume: vi.fn(),
    pause: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  }

  const win = {
    speechSynthesis,
    SpeechSynthesisUtterance: FakeUtterance,
    setTimeout: globalThis.setTimeout.bind(globalThis),
    clearTimeout: globalThis.clearTimeout.bind(globalThis),
  }

  vi.stubGlobal('window', win)
  vi.stubGlobal('speechSynthesis', speechSynthesis)
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)

  return { speak, cancel, getVoices }
}

describe('audioPlayer speak-first contract', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    lastHowl = null
    howlPlaySucceeds = false
    unlockAudio.mockClear()
    primeSpeechSynthesis.mockClear()
    isAudioUnlocked.mockReturnValue(false)
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('speakText primes unlock and speaks immediately with kid-friendly rate/pitch', async () => {
    const { speak } = installWindowSpeech([
      { name: 'Microsoft Neerja', lang: 'hi-IN' },
    ])

    const { speakText, SPEECH_RATE, SPEECH_PITCH } = await import('./audioPlayer')
    await speakText('क', 'hi-IN')

    expect(primeSpeechSynthesis).toHaveBeenCalled()
    expect(unlockAudio).toHaveBeenCalled()
    expect(speak).toHaveBeenCalledTimes(1)

    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.text).toBe('क')
    expect(utterance.lang).toBe('hi-IN')
    expect(utterance.rate).toBe(SPEECH_RATE)
    expect(utterance.pitch).toBe(SPEECH_PITCH)
    expect(utterance.voice?.name).toBe('Microsoft Neerja')
  })

  it('speakText skips priming once audio is already unlocked', async () => {
    isAudioUnlocked.mockReturnValue(true)
    installWindowSpeech([{ name: 'Microsoft Neerja', lang: 'hi-IN' }])
    const { speakText } = await import('./audioPlayer')
    await speakText('क', 'hi-IN')
    expect(primeSpeechSynthesis).not.toHaveBeenCalled()
  })

  it('speakText ignores blank text', async () => {
    const { speak } = installWindowSpeech()
    const { speakText } = await import('./audioPlayer')
    await speakText('   ', 'hi-IN')
    expect(speak).not.toHaveBeenCalled()
  })

  it('playAudio speaks fallback before waiting on Howler (missing MP3 safe)', async () => {
    vi.useFakeTimers()
    const { speak } = installWindowSpeech([
      { name: 'Microsoft Heera', lang: 'hi-IN' },
    ])

    const { playAudio } = await import('./audioPlayer')
    const pending = playAudio('/missing/hi-ka.mp3', 'क', 'hi-IN', 'ka')

    // Speech must already have started before Howl timeout settles.
    expect(speak).toHaveBeenCalled()
    expect(primeSpeechSynthesis).toHaveBeenCalled()
    expect(unlockAudio).toHaveBeenCalled()

    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.text).toBe('क')

    await vi.advanceTimersByTimeAsync(300)
    await pending
  })

  it('playAudio keeps speech when Howl fails to play', async () => {
    vi.useFakeTimers()
    const { speak, cancel } = installWindowSpeech([
      { name: 'Microsoft Heera', lang: 'hi-IN' },
    ])
    const { playAudio } = await import('./audioPlayer')

    const pending = playAudio('/missing.mp3', 'कमल', 'hi-IN')
    expect(speak).toHaveBeenCalled()
    const cancelsBeforeHowl = cancel.mock.calls.length

    await vi.advanceTimersByTimeAsync(300)
    await pending

    // Failed file must not cancel the speech fallback after Howl fails.
    expect(cancel.mock.calls.length).toBe(cancelsBeforeHowl)
  })

  it('playAudio cancels speech when Howl actually plays on desktop', async () => {
    howlPlaySucceeds = true
    const { speak, cancel } = installWindowSpeech([
      { name: 'Microsoft Heera', lang: 'hi-IN' },
    ])
    const { playAudio } = await import('./audioPlayer')

    await playAudio('/real.mp3', 'कमल', 'hi-IN')

    expect(speak).toHaveBeenCalled()
    // stopSpeech before speak + stopSpeech after successful Howl
    expect(cancel.mock.calls.length).toBeGreaterThanOrEqual(2)
  })

  it('playAudio with empty path still speaks fallback', async () => {
    const { speak } = installWindowSpeech([
      { name: 'Microsoft Zira', lang: 'en-IN' },
    ])
    const { playAudio } = await import('./audioPlayer')
    await playAudio('', 'hello', 'en-IN')
    expect(speak).toHaveBeenCalled()
    expect(lastHowl).toBeNull()
  })
})

describe('audioPlayer mobile speech clarity', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    lastHowl = null
    howlPlaySucceeds = true
    isAudioUnlocked.mockReturnValue(true)
    vi.stubGlobal(
      'navigator',
      {
        userAgent:
          'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
      },
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('uses a milder mobile rate without repeating short phrases', async () => {
    vi.useFakeTimers()
    const { speak } = installWindowSpeech([
      { name: 'Google हिन्दी', lang: 'hi-IN' },
    ])
    const { speakText, SPEECH_RATE_ANDROID, SPEECH_PITCH_ANDROID } = await import(
      './audioPlayer'
    )

    const pending = speakText('क', 'hi-IN')
    await vi.advanceTimersByTimeAsync(100)
    await pending

    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.rate).toBe(SPEECH_RATE_ANDROID)
    expect(utterance.pitch).toBe(SPEECH_PITCH_ANDROID)
    expect(utterance.text).toBe('क')
    // Android should not force a voice — OS default is clearer.
    expect(utterance.voice).toBeNull()
  })

  it('only speaks the latest utterance when two speakText calls race', async () => {
    vi.useFakeTimers()
    const { speak } = installWindowSpeech([
      { name: 'Google हिन्दी', lang: 'hi-IN' },
    ])
    const { speakText } = await import('./audioPlayer')

    const first = speakText('क', 'hi-IN')
    const second = speakText('ख', 'hi-IN')
    await vi.advanceTimersByTimeAsync(100)
    await Promise.all([first, second])

    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.text).toBe('ख')
  })

  it('does not race Howler against TTS on mobile (avoids cut-off speech)', async () => {
    vi.useFakeTimers()
    const { speak, cancel } = installWindowSpeech([
      { name: 'Google हिन्दी', lang: 'hi-IN' },
    ])
    const { playAudio } = await import('./audioPlayer')

    const pending = playAudio('/maybe-real.mp3', 'कमल', 'hi-IN')
    await vi.advanceTimersByTimeAsync(120)
    await pending

    expect(speak).toHaveBeenCalled()
    expect(lastHowl).toBeNull()
    // Only the pre-speak cancel — never a Howl-driven cancel mid-phrase.
    expect(cancel).toHaveBeenCalledTimes(1)
  })
})

describe('audioPlayer iOS speech hardening', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    lastHowl = null
    howlPlaySucceeds = false
    isAudioUnlocked.mockReturnValue(true)
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('speaks immediately when voices are already loaded (no settle gap)', async () => {
    const { speak } = installWindowSpeech([
      { name: 'Samantha', lang: 'en-US' },
    ])
    const { speakText, SPEECH_RATE_MOBILE } = await import('./audioPlayer')

    // No fake-timer advance — iOS should speak in the same turn when voices exist.
    await speakText('hello', 'en-US')

    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.rate).toBe(SPEECH_RATE_MOBILE)
    expect(utterance.text).toBe('hello')
  })

  it('does not force an English voice onto Hindi text', async () => {
    const { speak } = installWindowSpeech([
      { name: 'Samantha', lang: 'en-US' },
      { name: 'Google US English', lang: 'en-US' },
    ])
    const { speakText } = await import('./audioPlayer')

    await speakText('क', 'hi-IN')

    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.lang).toBe('hi-IN')
    expect(utterance.voice).toBeNull()
  })

  it('uses a matching Hindi voice when iOS has one', async () => {
    const { speak } = installWindowSpeech([
      { name: 'Samantha', lang: 'en-US' },
      { name: 'Lekha', lang: 'hi-IN' },
    ])
    const { speakText } = await import('./audioPlayer')

    await speakText('क', 'hi-IN')

    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.voice?.name).toBe('Lekha')
  })
})
