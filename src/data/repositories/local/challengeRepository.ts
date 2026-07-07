import { CHALLENGE_CATALOG, getChallengeFromCatalog } from '../../seed/challenges/catalog'
import type { AgeGroup, ChallengeDefinition, Subject } from '../../../types'
import type { ChallengeRepository } from '../types'

export class LocalChallengeRepository implements ChallengeRepository {
  getAllChallenges(): ChallengeDefinition[] {
    return CHALLENGE_CATALOG
  }

  getChallenges(subject: Subject, grade: AgeGroup): ChallengeDefinition[] {
    return CHALLENGE_CATALOG.filter(
      (challenge) =>
        challenge.subject === subject && challenge.gradeLevels.includes(grade),
    )
  }

  getChallenge(subject: Subject, challengeId: string): ChallengeDefinition | undefined {
    return getChallengeFromCatalog(subject, challengeId)
  }
}
