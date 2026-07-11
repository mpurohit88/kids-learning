import type { GameMetadata } from '../seed/games'
import type {
  ActivityType,
  AgeGroup,
  ChallengeDefinition,
  GenerateSessionInput,
  Language,
  LanguageContent,
  PracticeQuestion,
  Profile,
  ProgressMap,
  PronunciationWord,
  SessionQuestion,
  Subject,
  SubjectDefinition,
  MotherTongueLanguage,
  TranslationDictionary,
  UiLocale,
  WordRaceRound,
  WhCheckpoint,
  WhCheckpointId,
} from '../../types'

export interface SaveGameResultInput {
  profileId: string
  subject: Subject
  challengeId: string
  correct: number
  total: number
  stars: number
}

export interface ContentRepository {
  getLanguageContent(language: Language): LanguageContent
  getLettersForProfile(language: Language, ageGroup: AgeGroup): LanguageContent['letters']
  getAllLetters(language: Language): LanguageContent['letters']
  getLettersForLetterGames(language: Language, ageGroup: AgeGroup): LanguageContent['letters']
  getVocabularyForProfile(language: Language, ageGroup: AgeGroup): LanguageContent['vocabulary']
  getPracticeQuestionsForProfile(language: Language, ageGroup: AgeGroup): PracticeQuestion[]
  getLetterReference(language: Language, ageGroup: AgeGroup): LanguageContent['letters']
}

export interface MathsRepository {
  getSessionQuestions(bankId: string, grade: AgeGroup, count?: number): SessionQuestion[]
}

export interface PronunciationRepository {
  getAllWords(): PronunciationWord[]
  getWordById(id: string): PronunciationWord | undefined
  getRound(
    count: number,
    options?: { minSyllables?: number },
  ): PronunciationWord[]
}

export interface WhQuestionRepository {
  buildSession(): WordRaceRound[]
  getLearnWords(): WhCheckpoint[]
  getLearnWord(id: WhCheckpointId): WhCheckpoint | undefined
}

export interface ProfileRepository {
  getAllProfiles(): Profile[]
  getProfileById(id: string | null): Profile | undefined
  createProfile(input: { name: string; classChoice: 'lkg' | 'class12' }): Profile
  updateProfile(
    profileId: string,
    input: { name: string; classChoice: 'lkg' | 'class12' },
  ): Profile | undefined
  deleteProfile(profileId: string): boolean
  saveProfileName(profileId: string, name: string): void
  hasAnyCustomProfileName(): boolean
}

export interface ProgressRepository {
  getProgress(): ProgressMap
  saveGameResult(input: SaveGameResultInput): ProgressMap
  getTotalStars(profileId: string, progress?: ProgressMap): number
}

export interface GameSettingsRepository {
  getOptionCount(ageGroup: AgeGroup, subject?: Subject): number
  getRoundCount(ageGroup: AgeGroup, subject?: Subject): number
  getExamRoundCount(): number
}

export interface GameCatalogRepository {
  getAllGames(): GameMetadata[]
  getGamesForGrade(grade: AgeGroup): GameMetadata[]
  getGameById(id: ActivityType): GameMetadata | undefined
}

export interface ChallengeRepository {
  getAllChallenges(): ChallengeDefinition[]
  getChallenges(subject: Subject, grade: AgeGroup): ChallengeDefinition[]
  getGroupedChallenges(subject: Subject, menuGroup: string, grade: AgeGroup): ChallengeDefinition[]
  getChallenge(subject: Subject, challengeId: string): ChallengeDefinition | undefined
}

export interface SubjectRepository {
  getAllSubjects(): SubjectDefinition[]
  getSubject(id: Subject): SubjectDefinition | undefined
}

export interface LocaleRepository {
  getMotherTongueLanguages(): MotherTongueLanguage[]
  getDefaultLocale(): UiLocale
  getTranslations(locale: UiLocale): TranslationDictionary
  getSavedLocale(): UiLocale | null
  saveLocale(locale: UiLocale): void
  clearSavedLocale(): void
}

export interface DataRepositories {
  content: ContentRepository
  profiles: ProfileRepository
  progress: ProgressRepository
  gameSettings: GameSettingsRepository
  gameCatalog: GameCatalogRepository
  challenges: ChallengeRepository
  subjects: SubjectRepository
  maths: MathsRepository
  pronunciation: PronunciationRepository
  whQuestions: WhQuestionRepository
  locale: LocaleRepository
}

export type { GenerateSessionInput, SessionQuestion }
