import { describe, expect, it, afterEach, vi } from 'vitest'

describe('prepareSpokenText / getSpeechRate helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.resetModules()
  })

  it('leaves desktop text unchanged and uses desktop rate', async () => {
    vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0)' })
    const { prepareSpokenText, getSpeechRate, SPEECH_RATE } = await import('./audioPlayer')
    expect(prepareSpokenText('क')).toBe('क')
    expect(getSpeechRate()).toBe(SPEECH_RATE)
  })

  it('pads short mobile phrases and uses mobile rate', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    })
    const { prepareSpokenText, getSpeechRate, SPEECH_RATE_MOBILE } = await import(
      './audioPlayer'
    )
    expect(prepareSpokenText('क')).toBe('क…')
    expect(prepareSpokenText('कमल।')).toBe('कमल।')
    expect(getSpeechRate()).toBe(SPEECH_RATE_MOBILE)
  })
})
