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

export function getGamesForGrade(grade: AgeGroup): GameDefinition[] {
  return GAME_REGISTRY.filter((game) => game.gradeLevels.includes(grade))
}

export function getGameById(id: ActivityType): GameDefinition | undefined {
  return GAME_REGISTRY.find((game) => game.id === id)
}
