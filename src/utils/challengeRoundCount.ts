import { dataService } from '../data'
import type { AgeGroup, Subject } from '../types'

/** Stable round count for challenge quizzes — must not depend on loaded questions. */
export function getChallengeRoundCount(
  challengeId: string,
  ageGroup: AgeGroup | undefined,
  subject: Subject | null,
): number {
  if (!ageGroup || !subject) return 5
  if (challengeId === 'heavy-and-light') return 8
  return dataService.getRoundCount(ageGroup, subject)
}

/**
 * Anti-pattern that caused "Maximum update depth exceeded" on Count the Objects:
 * deriving session roundCount from `questions.length || fallback` makes roundCount
 * change after the first generateSession(), which recreates startGame and loops.
 */
export function buggyRoundCountFromQuestions(loadedQuestionCount: number, fallback = 5): number {
  return loadedQuestionCount || fallback
}

/** True when the buggy formula would change after questions load (loop trigger). */
export function wouldBuggyRoundCountCauseRestartLoop(
  loadedQuestionCount: number,
  fallback = 5,
): boolean {
  if (loadedQuestionCount <= 0) return false
  return buggyRoundCountFromQuestions(0, fallback) !== buggyRoundCountFromQuestions(loadedQuestionCount, fallback)
}

export function buildChallengeSessionKey(input: {
  profileId: string | null
  subject: Subject | null
  challengeId: string
  ageGroup: AgeGroup | undefined
  roundCount: number
}): string {
  return `${input.profileId}:${input.subject}:${input.challengeId}:${input.ageGroup}:${input.roundCount}`
}

/**
 * Start a challenge session only once per key.
 * Returning false on repeat calls is what prevents the infinite startGame loop.
 */
export function shouldStartChallengeSession(
  previousKey: string | null,
  nextKey: string,
): boolean {
  return previousKey !== nextKey
}
