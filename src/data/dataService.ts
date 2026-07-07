import { generateSession as runQuestionEngine } from '../engine/questionEngine'
import { LocalChallengeRepository } from './repositories/local/challengeRepository'
import { LocalMathsRepository } from './repositories/local/mathsRepository'
import { LocalContentRepository } from './repositories/local/contentRepository'
import { LocalGameCatalogRepository } from './repositories/local/gameCatalogRepository'
import { LocalGameSettingsRepository } from './repositories/local/gameSettingsRepository'
import { LocalProfileRepository } from './repositories/local/profileRepository'
import { LocalProgressRepository } from './repositories/local/progressRepository'
import { LocalSubjectRepository } from './repositories/local/subjectRepository'
import type {
  DataRepositories,
  GenerateSessionInput,
  SaveGameResultInput,
} from './repositories/types'
import type {
  ActivityType,
  AgeGroup,
  ChallengeDefinition,
  Language,
  ProgressMap,
  SessionQuestion,
  Subject,
  SubjectDefinition,
} from '../types'

function createLocalRepositories(): DataRepositories {
  return {
    content: new LocalContentRepository(),
    profiles: new LocalProfileRepository(),
    progress: new LocalProgressRepository(),
    gameSettings: new LocalGameSettingsRepository(),
    gameCatalog: new LocalGameCatalogRepository(),
    challenges: new LocalChallengeRepository(),
    subjects: new LocalSubjectRepository(),
    maths: new LocalMathsRepository(),
  }
}

/**
 * Single data access layer for the app.
 * Swap `createLocalRepositories()` with API-backed repositories when moving to a database.
 */
class DataService {
  private readonly repositories: DataRepositories

  constructor(repositories: DataRepositories) {
    this.repositories = repositories
  }

  getSubjects(): SubjectDefinition[] {
    return this.repositories.subjects.getAllSubjects()
  }

  getSubject(id: Subject): SubjectDefinition | undefined {
    return this.repositories.subjects.getSubject(id)
  }

  getProfiles() {
    return this.repositories.profiles.getAllProfiles()
  }

  getProfileById(id: string | null) {
    return this.repositories.profiles.getProfileById(id)
  }

  getChallenges(subject: Subject, grade: AgeGroup): ChallengeDefinition[] {
    return this.repositories.challenges.getChallenges(subject, grade)
  }

  getChallenge(subject: Subject, challengeId: string): ChallengeDefinition | undefined {
    return this.repositories.challenges.getChallenge(subject, challengeId)
  }

  generateSession(input: GenerateSessionInput): SessionQuestion[] {
    return runQuestionEngine(input, {
      content: this.repositories.content,
      gameSettings: this.repositories.gameSettings,
      challenges: this.repositories.challenges,
      maths: this.repositories.maths,
    })
  }

  getLanguageContent(language: Language) {
    return this.repositories.content.getLanguageContent(language)
  }

  getLettersForProfile(language: Language, ageGroup: AgeGroup) {
    return this.repositories.content.getLettersForProfile(language, ageGroup)
  }

  getAllLetters(language: Language) {
    return this.repositories.content.getAllLetters(language)
  }

  getLettersForLetterGames(language: Language, ageGroup: AgeGroup) {
    return this.repositories.content.getLettersForLetterGames(language, ageGroup)
  }

  getVocabularyForProfile(language: Language, ageGroup: AgeGroup) {
    return this.repositories.content.getVocabularyForProfile(language, ageGroup)
  }

  getPracticeQuestionsForProfile(language: Language, ageGroup: AgeGroup) {
    return this.repositories.content.getPracticeQuestionsForProfile(language, ageGroup)
  }

  getGames() {
    return this.repositories.gameCatalog.getAllGames()
  }

  getGamesForGrade(grade: AgeGroup) {
    return this.repositories.gameCatalog.getGamesForGrade(grade)
  }

  getGameById(id: ActivityType) {
    return this.repositories.gameCatalog.getGameById(id)
  }

  getOptionCount(ageGroup: AgeGroup, subject?: Subject) {
    return this.repositories.gameSettings.getOptionCount(ageGroup, subject)
  }

  getRoundCount(ageGroup: AgeGroup, subject?: Subject) {
    return this.repositories.gameSettings.getRoundCount(ageGroup, subject)
  }

  getExamRoundCount() {
    return this.repositories.gameSettings.getExamRoundCount()
  }

  getProgress() {
    return this.repositories.progress.getProgress()
  }

  saveGameResult(input: SaveGameResultInput) {
    return this.repositories.progress.saveGameResult(input)
  }

  getTotalStars(profileId: string, progress?: ProgressMap) {
    return this.repositories.progress.getTotalStars(
      profileId,
      progress ?? this.getProgress(),
    )
  }
}

export const dataService = new DataService(createLocalRepositories())

export type { SaveGameResultInput, GenerateSessionInput, SessionQuestion } from './repositories/types'
export type { GameMetadata } from './seed/games'
