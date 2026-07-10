export type GradeLevel = 'lkg' | 'class1' | 'class2' | 'class3' | 'class4' | 'class5'
export type AgeGroup = Extract<GradeLevel, 'lkg' | 'class2'>
export type Language = 'hindi' | 'kannada' | 'english'
export type Subject = Language | 'maths'
export type UiLocale = 'en' | 'hi' | 'kn'

export interface MotherTongueLanguage {
  id: UiLocale
  label: string
  nativeLabel: string
  emoji: string
  isDefault?: boolean
}

export type TranslationValue = string | TranslationDictionary
export interface TranslationDictionary {
  [key: string]: TranslationValue
}

export type ActivityType =
  | 'letter-recognition'
  | 'picture-word-match'
  | 'letter-tracing'
  | 'exam-practice'
  | 'class-practice'

export type ChallengeSource = 'bank' | 'generator' | 'group'

export type PracticeQuestionType =
  | 'fill-in-blank'
  | 'match-the-column'
  | 'sentence-rearrange'
  | 'reading-comprehension'

export interface Profile {
  id: string
  name: string
  ageGroup: AgeGroup
  avatar: string
  color: string
  description: string
}

export interface LetterExample {
  word: string
  transliteration: string
  emoji: string
  imagePath?: string
}

export interface Letter {
  id: string
  character: string
  name: string
  type: 'vowel' | 'consonant'
  audioPath: string
  difficulty: AgeGroup[]
  lowerCase?: string
  example?: LetterExample
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

export interface PracticeOption {
  id: string
  text: string
}

export interface PracticeQuestion {
  id: string
  type: PracticeQuestionType
  gradeLevels: GradeLevel[]
  prompt: string
  promptHint?: string
  audioPath?: string
  options: PracticeOption[]
  correctOptionId: string
  explanation?: string
}

export interface LanguageContent {
  language: Language
  languageName: string
  nativeName: string
  speechLang: string
  letters: Letter[]
  vocabulary: VocabularyWord[]
  practiceQuestions?: PracticeQuestion[]
}

export interface ChallengeDefinition {
  id: string
  subject: Subject
  topic: string
  title: string
  description: string
  emoji: string
  color: string
  route: string
  gradeLevels: GradeLevel[]
  source: ChallengeSource
  generatorId?: string
  bankType?: ActivityType
  bankId?: string
  badge?: string
  bookReference?: string
  menuGroup?: string
}

export interface QuestionVisualItem {
  label: string
  emoji?: string
  imagePath?: string
}

export interface MathsQuestionBankEntry {
  id: string
  gradeLevels: GradeLevel[]
  prompt: string
  promptHint?: string
  emoji?: string
  visualItems?: QuestionVisualItem[]
  options: SessionQuestionOption[]
  correctOptionId: string
  explanation?: string
}

export interface MathsContent {
  subject: 'maths'
  questionBanks: Record<string, MathsQuestionBankEntry[]>
}

export interface SubjectDefinition {
  id: Subject
  title: string
  nativeName: string
  emoji: string
  color: string
  description: string
}

export interface SessionQuestionOption {
  id: string
  text: string
  emoji?: string
  imagePath?: string
}

export type ComparisonSymbol = '>' | '<'

/** Structured greater/less-than payload for quiz UI + future DB rows. */
export interface ComparisonPayload {
  mode: 'symbol' | 'complete'
  left: number
  /** Present for symbol mode; blank side for complete mode. */
  right: number | null
  /** Present for complete mode; blank for symbol mode. */
  symbol: ComparisonSymbol | null
}

export interface SessionQuestion {
  id: string
  prompt: string
  promptHint?: string
  audioPath?: string
  emoji?: string
  imagePath?: string
  visualItems?: QuestionVisualItem[]
  addends?: number[]
  comparison?: ComparisonPayload
  options: SessionQuestionOption[]
  correctOptionId: string
  explanation?: string
}

export interface GenerateSessionInput {
  subject: Subject
  challengeId: string
  grade: AgeGroup
  count?: number
  instructionLanguage?: Language
}

export interface ProgressEntry {
  stars: number
  timesPlayed: number
}

export type ProgressMap = Record<
  string,
  Partial<Record<Subject, Partial<Record<string, ProgressEntry>>>>
>

export interface GameRoundResult {
  correct: number
  total: number
  stars: number
}

export function isLanguageSubject(subject: Subject): subject is Language {
  return subject === 'hindi' || subject === 'kannada' || subject === 'english'
}
