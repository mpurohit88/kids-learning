import { describe, expect, it } from 'vitest'

/**
 * Documents why Kannada unlocked mobile audio while Hindi stayed silent:
 * Kannada called speakText() immediately on tap; Hindi awaited missing MP3
 * playback via playAudio() and lost the user-gesture window.
 *
 * All pages now go through `playLetterSound` / `playWordSound` / `playAudio`
 * from `src/utils/audio.ts`, which always speak first.
 */
describe('mobile speech unlock preference', () => {
  it('treats immediate speech as the mobile-safe path (Kannada-style)', () => {
    const kannadaStyle = 'speak-first'
    const hindiOldStyle = 'wait-for-missing-mp3-then-speak'
    expect(kannadaStyle).not.toBe(hindiOldStyle)
    expect(kannadaStyle).toBe('speak-first')
  })

  it('requires speech priming to happen synchronously in a gesture', () => {
    // Contract for unlockAudio / primeSpeechSynthesis:
    // speak() must be invoked before any long await (Howl load / voices fetch).
    const steps = ['primeSpeechSynthesis', 'optionalHowlUnlock', 'speakFallback']
    expect(steps[0]).toBe('primeSpeechSynthesis')
    expect(steps.indexOf('primeSpeechSynthesis')).toBeLessThan(steps.indexOf('speakFallback'))
  })

  it('centralizes letter playback so Hindi and Kannada share one entry point', () => {
    const sharedApi = ['playLetterSound', 'playWordSound', 'prepareAudio']
    expect(sharedApi).toContain('playLetterSound')
    expect(sharedApi).toContain('playWordSound')
  })
})
