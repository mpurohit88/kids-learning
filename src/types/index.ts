export type AgeGroup = 'lkg' | 'class2'
export type Language = 'hindi' | 'kannada'
export type ActivityType =
  | 'letter-recognition'
  | 'picture-word-match'
  | 'letter-tracing'
  | 'exam-practice'

export interface Profile {
  id: string
  name: string
  ageGroup: AgeGroup
  avatar: string
  color: string
  description: string
}

export interface Letter {
  id: string
  character: string
  name: string
  type: 'vowel' | 'consonant'
  audioPath: string
  difficulty: AgeGroup[]
}

export interface VocabularyWord {
  id: string
  word: string
  transliteration: string
  imagePath: string
  emoji: string
  audioPath: string
  category: string
  difficulty: AgeGroup[]
}

export interface LanguageContent {
  language: Language
  languageName: string
  nativeName: string
  speechLang: string
  letters: Letter[]
  vocabulary: VocabularyWord[]
}

export interface ProgressEntry {
  stars: number
  timesPlayed: number
}

export type ProgressMap = Record<
  string,
  Partial<Record<Language, Partial<Record<ActivityType, ProgressEntry>>>>
>

export interface GameRoundResult {
  correct: number
  total: number
  stars: number
}
