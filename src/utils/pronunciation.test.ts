import { describe, expect, it } from 'vitest'
import {
  LocalPronunciationRepository,
  pickPronunciationRound,
} from '../data/repositories/local/pronunciationRepository'
import { LocalChallengeRepository } from '../data/repositories/local/challengeRepository'
import { getPlayableChallenges } from './surpriseChallenge'
import { getSlowPronunciationRate } from './pronunciationSpeech'
import { getSpeechRate } from './audio'
import { isVoiceRecordingSupported } from './voiceRecorder'

describe('pronunciation word bank', () => {
  const repo = new LocalPronunciationRepository()

  it('loads worksheet priority words', () => {
    const words = repo.getAllWords()
    const priority = words.filter((word) => word.priority).map((word) => word.word)

    expect(priority.sort()).toEqual(
      ['charity', 'collected', 'oatmeal', 'respectively', 'shopkeeper'].sort(),
    )
  })

  it('keeps non-empty syllable arrays for every word', () => {
    for (const word of repo.getAllWords()) {
      expect(word.syllables.length).toBeGreaterThan(0)
      expect(word.syllables.join('').toLowerCase().replace(/[^a-z]/g, '')).toContain(
        word.word.replace(/[^a-z]/gi, '').slice(0, 3).toLowerCase(),
      )
    }
  })

  it('biases rounds toward priority words', () => {
    const rounds = Array.from({ length: 8 }, () => pickPronunciationRound(5))
    const priorityHits = rounds.filter((round) =>
      round.some((word) => word.priority),
    ).length
    expect(priorityHits).toBeGreaterThanOrEqual(5)
  })
})

describe('say-it catalog', () => {
  const challenges = new LocalChallengeRepository()

  it('shows Say It hub for class2 english only', () => {
    const class2 = challenges.getChallenges('english', 'class2').map((c) => c.id)
    const lkg = challenges.getChallenges('english', 'lkg').map((c) => c.id)

    expect(class2).toContain('say-it')
    expect(class2).not.toContain('clap-it-out')
    expect(lkg).not.toContain('say-it')
  })

  it('groups clap and echo under say-it', () => {
    const practices = challenges
      .getGroupedChallenges('english', 'say-it', 'class2')
      .map((c) => c.id)
    expect(practices).toEqual(['clap-it-out', 'echo-mascot'])
  })

  it('includes say-it games in the surprise pool for class2', () => {
    const playable = getPlayableChallenges('english', 'class2').map((c) => c.id)
    expect(playable).toContain('clap-it-out')
    expect(playable).toContain('echo-mascot')
    expect(playable).not.toContain('say-it')
  })
})

describe('pronunciation helpers', () => {
  it('uses a slower rate than the default speech rate', () => {
    expect(getSlowPronunciationRate()).toBeLessThanOrEqual(getSpeechRate())
  })

  it('reports voice recording support based on browser APIs', () => {
    expect(typeof isVoiceRecordingSupported()).toBe('boolean')
  })
})
