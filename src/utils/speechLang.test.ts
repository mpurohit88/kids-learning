import { describe, expect, it } from 'vitest'
import { SPEECH_LANG_BY_LOCALE, speechLangForLocale } from './speechLang'

describe('speechLang', () => {
  it('maps UI locales to BCP-47 speech languages', () => {
    expect(speechLangForLocale('en')).toBe('en-IN')
    expect(speechLangForLocale('hi')).toBe('hi-IN')
    expect(speechLangForLocale('kn')).toBe('kn-IN')
  })

  it('exposes a complete locale map', () => {
    expect(Object.keys(SPEECH_LANG_BY_LOCALE).sort()).toEqual(['en', 'hi', 'kn'])
  })
})
