import type { Letter, VocabularyWord } from '../../types'

export interface LetterTypeOption {
  id: string
  label: string
  value: 'vowel' | 'consonant'
}

export interface FirstLetterQuestion {
  type: 'first-letter'
  word: VocabularyWord
  options: Letter[]
  answerId: string
}

export interface LetterTypeQuestion {
  type: 'letter-type'
  letter: Letter
  options: LetterTypeOption[]
  answerId: string
}

export type ExamQuestion = FirstLetterQuestion | LetterTypeQuestion
