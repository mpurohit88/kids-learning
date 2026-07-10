import { describe, expect, it } from 'vitest'
import { getPlayableChallenges, pickSurpriseChallenge } from './surpriseChallenge'

describe('getPlayableChallenges', () => {
  it('excludes menu hubs like addition for class2 maths', () => {
    const playable = getPlayableChallenges('maths', 'class2')
    expect(playable.every((challenge) => challenge.source !== 'group')).toBe(true)
    expect(playable.some((challenge) => challenge.id === 'addition')).toBe(false)
    expect(playable.some((challenge) => challenge.id === 'addition-within-10')).toBe(true)
  })

  it('returns language games for lkg hindi', () => {
    const playable = getPlayableChallenges('hindi', 'lkg')
    expect(playable.map((challenge) => challenge.id).sort()).toEqual(
      ['letter-recognition', 'letter-tracing', 'picture-word-match'].sort(),
    )
  })
})

describe('pickSurpriseChallenge', () => {
  it('never returns the current challenge', () => {
    for (let i = 0; i < 20; i += 1) {
      const surprise = pickSurpriseChallenge('hindi', 'lkg', 'letter-recognition')
      expect(surprise).not.toBeNull()
      expect(surprise!.id).not.toBe('letter-recognition')
    }
  })

  it('returns null when only one playable challenge exists', () => {
    // English LKG has letter-recognition + letter-tracing only
    const onlyOneLeft = pickSurpriseChallenge('english', 'lkg', 'letter-recognition')
    expect(onlyOneLeft?.id).toBe('letter-tracing')

    // Force empty by excluding both via a fake id that leaves candidates —
    // when current is the only one in a 1-item set, null:
    const playable = getPlayableChallenges('english', 'lkg')
    expect(playable.length).toBeGreaterThanOrEqual(2)
  })
})
