import { describe, expect, it } from 'vitest'
import {
  MAX_PROFILES,
  ageGroupToClassChoice,
  buildProfile,
  classChoiceToAgeGroup,
} from '../data/repositories/local/profileStorage'

describe('profileStorage helpers', () => {
  it('maps class choices to age groups used by games', () => {
    expect(classChoiceToAgeGroup('lkg')).toBe('lkg')
    expect(classChoiceToAgeGroup('class12')).toBe('class2')
    expect(ageGroupToClassChoice('lkg')).toBe('lkg')
    expect(ageGroupToClassChoice('class2')).toBe('class12')
  })

  it('builds a profile with name and class only', () => {
    const profile = buildProfile({
      name: '  Chetanya  ',
      classChoice: 'lkg',
      existingCount: 0,
    })

    expect(profile.name).toBe('Chetanya')
    expect(profile.ageGroup).toBe('lkg')
    expect(profile.description).toBe('LKG / UKG')
    expect(profile.avatar).toBeTruthy()
    expect(profile.color).toBeTruthy()
  })

  it('allows at most two profiles', () => {
    expect(MAX_PROFILES).toBe(2)
  })
})
