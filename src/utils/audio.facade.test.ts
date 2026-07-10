import { describe, expect, it } from 'vitest'
import * as audio from './audio'

/**
 * Guards the public facade: pages/games must keep importing from `utils/audio`.
 * If a helper is renamed/removed, this fails before UI regressions ship.
 */
describe('audio facade exports', () => {
  it('exports the shared playback API used by every page', () => {
    expect(typeof audio.playLetterSound).toBe('function')
    expect(typeof audio.playWordSound).toBe('function')
    expect(typeof audio.speakText).toBe('function')
    expect(typeof audio.playAudio).toBe('function')
    expect(typeof audio.prepareAudio).toBe('function')
    expect(typeof audio.unlockAudio).toBe('function')
    expect(typeof audio.installAudioUnlockListeners).toBe('function')
    expect(typeof audio.stopAudio).toBe('function')
    expect(typeof audio.playCelebrationSound).toBe('function')
    expect(typeof audio.playEncouragementSound).toBe('function')
    expect(typeof audio.buildLetterPhrase).toBe('function')
    expect(typeof audio.speechLangForLocale).toBe('function')
    expect(typeof audio.getSpeechRate).toBe('function')
    expect(typeof audio.prepareSpokenText).toBe('function')
  })
})
