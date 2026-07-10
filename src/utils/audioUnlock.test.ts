import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const speak = vi.fn()
const getVoices = vi.fn(() => [])

vi.mock('howler', () => ({
  Howl: class {
    play = vi.fn()
    stop = vi.fn()
    unload = vi.fn()
    once = vi.fn()
  },
  Howler: {
    mute: vi.fn(),
    volume: vi.fn(),
    autoUnlock: true,
    html5PoolSize: 10,
    ctx: null,
  },
}))

class FakeUtterance {
  text: string
  volume = 1
  rate = 1
  pitch = 1
  constructor(text: string) {
    this.text = text
  }
}

describe('audioUnlock', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    const speechSynthesis = {
      speak,
      getVoices,
      cancel: vi.fn(),
      resume: vi.fn(),
      pause: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }

    vi.stubGlobal('window', {
      speechSynthesis,
      SpeechSynthesisUtterance: FakeUtterance,
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal('speechSynthesis', speechSynthesis)
    vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('primeSpeechSynthesis speaks a silent utterance synchronously', async () => {
    const { primeSpeechSynthesis } = await import('./audioUnlock')
    primeSpeechSynthesis()
    expect(speak).toHaveBeenCalledTimes(1)
    const utterance = speak.mock.calls[0][0] as FakeUtterance
    expect(utterance.volume).toBe(0)
    expect(utterance.text).toBe(' ')
  })

  it('unlockAudio always primes speech first', async () => {
    const { unlockAudio } = await import('./audioUnlock')
    await unlockAudio()
    expect(speak).toHaveBeenCalled()
  })
})
