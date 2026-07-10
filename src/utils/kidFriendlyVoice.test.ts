import { describe, expect, it } from 'vitest'
import {
  findKidFriendlyVoice,
  isLikelyFemaleVoice,
  isLikelyMaleVoice,
  scoreKidFriendlyVoice,
} from './kidFriendlyVoice'

describe('kid-friendly voice preference', () => {
  it('prefers Microsoft Zira over Microsoft David for English', () => {
    const zira = scoreKidFriendlyVoice(
      { name: 'Microsoft Zira - English (United States)', lang: 'en-US' },
      'en-US',
    )
    const david = scoreKidFriendlyVoice(
      { name: 'Microsoft David - English (United States)', lang: 'en-US' },
      'en-US',
    )
    expect(zira).toBeGreaterThan(david)
  })

  it('prefers Neerja / Heera over Ravi / Hemant for Indian languages', () => {
    const neerja = scoreKidFriendlyVoice(
      { name: 'Microsoft Neerja - English (India)', lang: 'en-IN' },
      'en-IN',
    )
    const ravi = scoreKidFriendlyVoice(
      { name: 'Microsoft Ravi - English (India)', lang: 'en-IN' },
      'en-IN',
    )
    expect(neerja).toBeGreaterThan(ravi)

    const heera = scoreKidFriendlyVoice(
      { name: 'Microsoft Heera - Hindi (India)', lang: 'hi-IN' },
      'hi-IN',
    )
    const hemant = scoreKidFriendlyVoice(
      { name: 'Microsoft Hemant - Hindi (India)', lang: 'hi-IN' },
      'hi-IN',
    )
    expect(heera).toBeGreaterThan(hemant)
  })

  it('treats Google UK English Male as male', () => {
    const voice = { name: 'Google UK English Male', lang: 'en-GB' }
    expect(isLikelyMaleVoice(voice)).toBe(true)
    expect(isLikelyFemaleVoice(voice)).toBe(false)
  })

  it('picks the highest-scoring matching voice', () => {
    const picked = findKidFriendlyVoice(
      [
        { name: 'Microsoft David', lang: 'en-IN' },
        { name: 'Microsoft Neerja', lang: 'en-IN' },
        { name: 'Microsoft Hemant', lang: 'hi-IN' },
      ],
      'en-IN',
    )
    expect(picked?.name).toBe('Microsoft Neerja')
  })

  it('matches Hindi voices by name when lang prefix differs', () => {
    const picked = findKidFriendlyVoice(
      [{ name: 'Google हिन्दी', lang: 'hi' }],
      'hi-IN',
    )
    expect(picked?.name).toBe('Google हिन्दी')
  })
})
