import { GAME_SETTINGS, getRoundSettings } from '../../seed/gameSettings'
import type { AgeGroup, Subject } from '../../../types'
import type { GameSettingsRepository } from '../types'

export class LocalGameSettingsRepository implements GameSettingsRepository {
  getOptionCount(ageGroup: AgeGroup, subject?: Subject) {
    return getRoundSettings(subject, ageGroup).optionCount
  }

  getRoundCount(ageGroup: AgeGroup, subject?: Subject) {
    return getRoundSettings(subject, ageGroup).roundCount
  }

  getExamRoundCount() {
    return GAME_SETTINGS.examRoundCount
  }
}
