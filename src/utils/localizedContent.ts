import type { ChallengeDefinition, SubjectDefinition } from '../types'
import type { TranslateFn } from './translate'

export function getLocalizedSubject(
  t: TranslateFn,
  subject: SubjectDefinition,
) {
  const key = `subjects.${subject.id}`
  return {
    title: t(`${key}.title`, undefined, subject.title),
    description: t(`${key}.description`, undefined, subject.description),
  }
}

export function getLocalizedChallenge(
  t: TranslateFn,
  challenge: ChallengeDefinition,
) {
  const key = `challenges.${challenge.id}`
  return {
    title: t(`${key}.title`, undefined, challenge.title),
    description: t(`${key}.description`, undefined, challenge.description),
    badge: challenge.badge
      ? t(`${key}.badge`, undefined, challenge.badge)
      : undefined,
    bookReference: challenge.bookReference
      ? t(`${key}.bookReference`, undefined, challenge.bookReference)
      : undefined,
  }
}

export function getLocalizedProfileDescription(
  _t: TranslateFn,
  _profileId: string,
  fallback: string,
) {
  return fallback
}
