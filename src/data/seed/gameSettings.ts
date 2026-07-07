import type { AgeGroup, Subject } from '../../types'

export interface RoundSettings {
  roundCount: number
  optionCount: number
}

type GradeRoundSettings = Partial<Record<AgeGroup, RoundSettings>>

export const GAME_SETTINGS = {
  examRoundCount: 10,
  subjects: {
    hindi: {
      lkg: { roundCount: 7, optionCount: 4 },
      class2: { roundCount: 10, optionCount: 4 },
    },
    kannada: {
      lkg: { roundCount: 5, optionCount: 3 },
      class2: { roundCount: 7, optionCount: 4 },
    },
    english: {
      lkg: { roundCount: 5, optionCount: 3 },
      class2: { roundCount: 7, optionCount: 4 },
    },
    maths: {
      lkg: { roundCount: 7, optionCount: 4 },
      class2: { roundCount: 10, optionCount: 4 },
    },
  } satisfies Record<Subject, GradeRoundSettings>,
  defaultRoundSettings: {
    lkg: { roundCount: 5, optionCount: 3 },
    class2: { roundCount: 7, optionCount: 4 },
  } satisfies Record<AgeGroup, RoundSettings>,
} as const

export function getRoundSettings(subject: Subject | undefined, ageGroup: AgeGroup): RoundSettings {
  if (subject && GAME_SETTINGS.subjects[subject]?.[ageGroup]) {
    return GAME_SETTINGS.subjects[subject][ageGroup]!
  }
  return GAME_SETTINGS.defaultRoundSettings[ageGroup]
}

/** @deprecated Use subject-based settings via getRoundSettings */
export type LanguageRoundSettings = Partial<Record<AgeGroup, RoundSettings>>
