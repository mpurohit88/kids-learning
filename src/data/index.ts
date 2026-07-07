import hindiData from './hindi.json'
import kannadaData from './kannada.json'
import type { AgeGroup, Language, LanguageContent } from '../types'

const contentMap: Record<Language, LanguageContent> = {
  hindi: hindiData as LanguageContent,
  kannada: kannadaData as LanguageContent,
}

export function getLanguageContent(language: Language): LanguageContent {
  return contentMap[language]
}

export function getLettersForProfile(language: Language, ageGroup: AgeGroup) {
  return getLanguageContent(language).letters.filter((letter) =>
    letter.difficulty.includes(ageGroup),
  )
}

export function getVocabularyForProfile(language: Language, ageGroup: AgeGroup) {
  return getLanguageContent(language).vocabulary.filter((word) =>
    word.difficulty.includes(ageGroup),
  )
}

export { hindiData, kannadaData }
