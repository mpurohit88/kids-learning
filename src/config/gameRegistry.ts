import type { ComponentType } from 'react'
import { dataService } from '../data'
import type { GameMetadata } from '../data/seed/games'
import { ExamPracticeGame } from '../games/exam/ExamPracticeGame'
import { LetterRecognitionGame } from '../games/LetterRecognitionGame'
import { LetterTracingGame } from '../games/LetterTracingGame'
import { PictureWordMatchGame } from '../games/PictureWordMatchGame'
import type { ActivityType, AgeGroup } from '../types'

const GAME_COMPONENTS: Record<ActivityType, ComponentType> = {
  'letter-recognition': LetterRecognitionGame,
  'picture-word-match': PictureWordMatchGame,
  'letter-tracing': LetterTracingGame,
  'exam-practice': ExamPracticeGame,
  'class-practice': LetterRecognitionGame,
}

export interface GameDefinition extends GameMetadata {
  component: ComponentType
}

export const GAME_REGISTRY: GameDefinition[] = dataService.getGames().map((game) => ({
  ...game,
  component: GAME_COMPONENTS[game.id],
}))

/** Paths registered for dedicated language mini-games (leading slash). */
export function getRegisteredGameRoutes(): string[] {
  return GAME_REGISTRY.map((game) => game.route)
}

/**
 * Every challenge menu card must navigate to a route the router knows about.
 * Language games use GAME_REGISTRY routes; maths uses /games/challenge/:id (or addition hub).
 */
export function getPlayableChallengeRoutes(subject: 'hindi' | 'kannada' | 'english' | 'maths', grade: AgeGroup): string[] {
  return dataService.getChallenges(subject, grade).map((challenge) => challenge.route)
}

export function getGamesForGrade(grade: AgeGroup): GameDefinition[] {
  return GAME_REGISTRY.filter((game) => game.gradeLevels.includes(grade))
}

export function getGameById(id: ActivityType): GameDefinition | undefined {
  return GAME_REGISTRY.find((game) => game.id === id)
}
