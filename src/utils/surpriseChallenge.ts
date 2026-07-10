import { dataService } from '../data'
import type { AgeGroup, ChallengeDefinition, Subject } from '../types'
import { pickRandomItems } from './arrayUtils'

/** Challenges that start a game directly (excludes menu hubs like Addition). */
export function getPlayableChallenges(
  subject: Subject,
  grade: AgeGroup,
): ChallengeDefinition[] {
  return dataService
    .getAllChallenges()
    .filter(
      (challenge) =>
        challenge.subject === subject &&
        challenge.gradeLevels.includes(grade) &&
        challenge.source !== 'group',
    )
}

/**
 * Pick a random other playable challenge in the same subject.
 * Returns null when nothing else is available (caller should fall back).
 */
export function pickSurpriseChallenge(
  subject: Subject,
  grade: AgeGroup,
  currentChallengeId: string,
): ChallengeDefinition | null {
  const candidates = getPlayableChallenges(subject, grade).filter(
    (challenge) => challenge.id !== currentChallengeId,
  )
  if (candidates.length === 0) return null
  return pickRandomItems(candidates, 1)[0] ?? null
}
