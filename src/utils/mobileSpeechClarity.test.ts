import { describe, expect, it, afterEach, vi } from 'vitest'

describe('mobile speech clarity helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('leaves desktop text and rate unchanged', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })
    const { prepareSpokenText, getSpeechRate, getSpeechPitch, SPEECH_RATE, SPEECH_PITCH } =
      await import('./audioPlayer')
    expect(prepareSpokenText('क')).toBe('क')
    expect(getSpeechRate()).toBe(SPEECH_RATE)
    expect(getSpeechPitch()).toBe(SPEECH_PITCH)
  })

  it('does not repeat short letter sounds on iOS', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    })
    const { prepareSpokenText, getSpeechRate, SPEECH_RATE_MOBILE } = await import(
      './audioPlayer'
    )
    expect(prepareSpokenText('क')).toBe('क')
    expect(prepareSpokenText('क से कमल')).toBe('क से कमल')
    expect(getSpeechRate()).toBe(SPEECH_RATE_MOBILE)
  })

  it('uses near-default rate/pitch on Android without repeating letters', async () => {
    vi.stubGlobal('navigator', {
      userAgent:
        'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36',
    })
    const {
      prepareSpokenText,
      getSpeechRate,
      getSpeechPitch,
      SPEECH_RATE_ANDROID,
      SPEECH_PITCH_ANDROID,
    } = await import('./audioPlayer')
    expect(prepareSpokenText('क')).toBe('क')
    expect(getSpeechRate()).toBe(SPEECH_RATE_ANDROID)
    expect(getSpeechPitch()).toBe(SPEECH_PITCH_ANDROID)
  })
})
