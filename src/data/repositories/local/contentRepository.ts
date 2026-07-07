import hindiData from '../../seed/hindi.json'
import kannadaData from '../../seed/kannada.json'
import { KANNADA_ALPHABET } from '../../seed/kannadaAlphabet'
import englishData from '../../seed/subjects/english.json'
import { HINDI_LETTER_EXAMPLES } from '../../seed/letterExamples/hindi'
import { KANNADA_LETTER_EXAMPLES } from '../../seed/letterExamples/kannada'
import type { AgeGroup, Language, LanguageContent, Letter } from '../../../types'
import type { ContentRepository } from '../types'

const contentMap: Record<Language, LanguageContent> = {
  hindi: hindiData as LanguageContent,
  kannada: { ...(kannadaData as LanguageContent), letters: KANNADA_ALPHABET },
  english: englishData as LanguageContent,
}

function enrichLetterWithExample(language: Language, letter: Letter): Letter {
  if (language === 'hindi') {
    const example = HINDI_LETTER_EXAMPLES[letter.id]
    return example ? { ...letter, example } : letter
  }
  if (language === 'kannada') {
    const example = KANNADA_LETTER_EXAMPLES[letter.id]
    return example ? { ...letter, example } : letter
  }
  return letter
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

  getLetterReference(language: Language, ageGroup: AgeGroup) {
    const letters =
      language === 'hindi' || language === 'kannada'
        ? this.getAllLetters(language)
        : this.getLettersForProfile(language, ageGroup)

    return letters.map((letter) => enrichLetterWithExample(language, letter))
  }
}

export { hindiData, kannadaData, englishData }
