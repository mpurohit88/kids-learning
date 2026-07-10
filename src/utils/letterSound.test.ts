import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { Letter } from '../types'

vi.mock('./audioPlayer', () => ({
  speakText: vi.fn(),
  playAudio: vi.fn(),
}))

import { playAudio, speakText } from './audioPlayer'
import { buildLetterPhrase, playLetterSound, playWordSound } from './letterSound'

const hindiKa: Letter = {
  id: 'hi-ka',
  character: 'क',
  name: 'ka',
  type: 'consonant',
  difficulty: ['lkg', 'class2'],
  audioPath: '/audio/hi/ka.mp3',
  example: { word: 'कमल', emoji: '🌸', transliteration: 'kamal' },
}

const kannadaKa: Letter = {
  id: 'kn-ka',
  character: 'ಕ',
  name: 'ka',
  type: 'consonant',
  difficulty: ['lkg', 'class2'],
  audioPath: '/audio/kn/ka.mp3',
  example: { word: 'ಕಮಲ', emoji: '🌸', transliteration: 'kamala' },
}

const englishA: Letter = {
  id: 'en-a',
  character: 'A',
  lowerCase: 'a',
  name: 'a',
  type: 'vowel',
  difficulty: ['lkg', 'class2'],
  audioPath: '/audio/en/a.mp3',
  example: { word: 'Apple', emoji: '🍎', transliteration: 'apple' },
}

describe('buildLetterPhrase', () => {
  it('builds English "A for Apple"', () => {
    expect(buildLetterPhrase(englishA, 'english')).toEqual({
      text: 'A for Apple',
      lang: 'en-IN',
    })
  })

  it('builds Hindi "क से कमल"', () => {
    expect(buildLetterPhrase(hindiKa, 'hindi')).toEqual({
      text: 'क से कमल',
      lang: 'hi-IN',
    })
  })

  it('builds Kannada phrase using Hindi sound hint', () => {
    expect(buildLetterPhrase(kannadaKa, 'kannada')).toEqual({
      text: 'क से ಕಮಲ',
      lang: 'hi-IN',
    })
  })
})

describe('playLetterSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('defaults to character mode', () => {
    playLetterSound(hindiKa, 'hindi')
    expect(playAudio).toHaveBeenCalledWith('/audio/hi/ka.mp3', 'क', 'hi-IN', 'ka')
  })

  it('uses the same character path for Hindi (speak-first via playAudio)', () => {
    playLetterSound(hindiKa, 'hindi', { mode: 'character', speechLang: 'hi-IN' })
    expect(playAudio).toHaveBeenCalledWith('/audio/hi/ka.mp3', 'क', 'hi-IN', 'ka')
    expect(speakText).not.toHaveBeenCalled()
  })

  it('uses Hindi hint for Kannada character mode', () => {
    playLetterSound(kannadaKa, 'kannada', { mode: 'character', speechLang: 'kn-IN' })
    expect(speakText).toHaveBeenCalledWith('क', 'hi-IN')
    expect(playAudio).not.toHaveBeenCalled()
  })

  it('uses playAudio for English character mode', () => {
    playLetterSound(englishA, 'english', { mode: 'character', speechLang: 'en-IN' })
    expect(playAudio).toHaveBeenCalledWith('/audio/en/a.mp3', 'A', 'en-IN', 'a')
  })

  it('speaks phrase immediately for Hindi learn mode', () => {
    playLetterSound(hindiKa, 'hindi', { mode: 'phrase', speechLang: 'hi-IN' })
    expect(speakText).toHaveBeenCalledWith('क से कमल', 'hi-IN')
  })

  it('speaks phrase immediately for Kannada learn mode', () => {
    playLetterSound(kannadaKa, 'kannada', { mode: 'phrase', speechLang: 'kn-IN' })
    expect(speakText).toHaveBeenCalledWith('क से ಕಮಲ', 'hi-IN')
  })

  it('uses playAudio for English phrase mode', () => {
    playLetterSound(englishA, 'english', { mode: 'phrase', speechLang: 'en-IN' })
    expect(playAudio).toHaveBeenCalledWith(
      '/audio/en/a.mp3',
      'A for Apple',
      'en-IN',
      'a',
    )
  })
})

describe('playWordSound', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('routes vocabulary through playAudio speak-first contract', () => {
    playWordSound(
      { audioPath: '/w.mp3', word: 'कमल', transliteration: 'kamal' },
      'hi-IN',
    )
    expect(playAudio).toHaveBeenCalledWith('/w.mp3', 'कमल', 'hi-IN', 'kamal')
  })
})
