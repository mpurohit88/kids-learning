import { GAME_CATALOG } from '../../seed/games'
import type { ActivityType, AgeGroup } from '../../../types'
import type { GameCatalogRepository } from '../types'

export class LocalGameCatalogRepository implements GameCatalogRepository {
  getAllGames() {
    return GAME_CATALOG
  }

  getGamesForGrade(grade: AgeGroup) {
    return GAME_CATALOG.filter((game) => game.gradeLevels.includes(grade))
  }

  getGameById(id: ActivityType) {
    return GAME_CATALOG.find((game) => game.id === id)
  }
}
