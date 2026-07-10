import { describe, expect, it } from 'vitest'

/**
 * Mirrors the kid-friendly voice scoring used in audioPlayer.
 * Kept as a pure unit so we can verify female preference without a browser.
 */
const FEMALE_VOICE_HINTS = [
  'female',
  'zira',
  'hazel',
  'samantha',
  'veena',
  'neerja',
  'heera',
  'google हिन्दी',
]

const MALE_VOICE_HINTS = [
  'male',
  'david',
  'mark',
  'ravi',
  'hemant',
  'google uk english male',
]

function isLikelyFemale(name: string): boolean {
  const n = name.toLowerCase()
  if (MALE_VOICE_HINTS.some((h) => n.includes(h))) return false
  return FEMALE_VOICE_HINTS.some((h) => n.includes(h))
}

function isLikelyMale(name: string): boolean {
  return MALE_VOICE_HINTS.some((h) => name.toLowerCase().includes(h))
}

function score(name: string, lang: string, voiceLang: string): number {
  let s = 0
  if (voiceLang.toLowerCase() === lang.toLowerCase()) s += 40
  else if (voiceLang.toLowerCase().startsWith(lang.toLowerCase().split('-')[0])) s += 25
  if (isLikelyFemale(name)) s += 50
  if (isLikelyMale(name)) s -= 40
  return s
}

describe('kid-friendly voice preference', () => {
  it('prefers Microsoft Zira over Microsoft David for English', () => {
    const zira = score('Microsoft Zira - English (United States)', 'en-US', 'en-US')
    const david = score('Microsoft David - English (United States)', 'en-US', 'en-US')
    expect(zira).toBeGreaterThan(david)
  })

  it('prefers Neerja / Heera over Ravi / Hemant for Indian languages', () => {
    const neerja = score('Microsoft Neerja - English (India)', 'en-IN', 'en-IN')
    const ravi = score('Microsoft Ravi - English (India)', 'en-IN', 'en-IN')
    expect(neerja).toBeGreaterThan(ravi)

    const heera = score('Microsoft Heera - Hindi (India)', 'hi-IN', 'hi-IN')
    const hemant = score('Microsoft Hemant - Hindi (India)', 'hi-IN', 'hi-IN')
    expect(heera).toBeGreaterThan(hemant)
  })

  it('treats Google UK English Male as male', () => {
    expect(isLikelyMale('Google UK English Male')).toBe(true)
    expect(isLikelyFemale('Google UK English Male')).toBe(false)
  })
})
