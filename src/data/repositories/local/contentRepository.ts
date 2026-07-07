import hindiData from '../../seed/hindi.json'
import kannadaData from '../../seed/kannada.json'
import englishData from '../../seed/subjects/english.json'
import type { AgeGroup, Language, LanguageContent } from '../../../types'
import type { ContentRepository } from '../types'

const contentMap: Record<Language, LanguageContent> = {
  hindi: hindiData as LanguageContent,
  kannada: kannadaData as LanguageContent,
  english: englishData as LanguageContent,
}

export class LocalContentRepository implements ContentRepository {
  getLanguageContent(language: Language): LanguageContent {
    return contentMap[language]
  }

  getLettersForProfile(language: Language, ageGroup: AgeGroup) {
    return this.getLanguageContent(language).letters.filter((letter) =>
      letter.difficulty.includes(ageGroup),
    )
  }

  getAllLetters(language: Language) {
    return this.getLanguageContent(language).letters
  }

  getLettersForLetterGames(language: Language, ageGroup: AgeGroup) {
    if (language === 'hindi') {
      return this.getAllLetters(language)
    }
    return this.getLettersForProfile(language, ageGroup)
  }

  getVocabularyForProfile(language: Language, ageGroup: AgeGroup) {
    return this.getLanguageContent(language).vocabulary.filter((word) =>
      word.difficulty.includes(ageGroup),
    )
  }

  getPracticeQuestionsForProfile(language: Language, ageGroup: AgeGroup) {
    return (this.getLanguageContent(language).practiceQuestions ?? []).filter((question) =>
      question.gradeLevels.includes(ageGroup),
    )
  }
}

export { hindiData, kannadaData, englishData }
