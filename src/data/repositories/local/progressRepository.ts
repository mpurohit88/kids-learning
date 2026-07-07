import type { ProgressMap } from '../../../types'
import type { ProgressRepository, SaveGameResultInput } from '../types'

const STORAGE_KEY = 'kids-language-learning-progress'

function readStoredProgress(): ProgressMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}

    const parsed = JSON.parse(raw) as {
      state?: { progress?: ProgressMap }
      progress?: ProgressMap
    }
    return parsed.state?.progress ?? parsed.progress ?? {}
  } catch {
    return {}
  }
}

function writeStoredProgress(progress: ProgressMap) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      state: { progress },
      version: 1,
    }),
  )
}

export class LocalProgressRepository implements ProgressRepository {
  getProgress(): ProgressMap {
    return readStoredProgress()
  }

  saveGameResult(input: SaveGameResultInput): ProgressMap {
    const progress = { ...this.getProgress() }
    const profileProgress = progress[input.profileId] ?? {}
    const subjectProgress = profileProgress[input.subject] ?? {}
    const challengeProgress = subjectProgress[input.challengeId] ?? {
      stars: 0,
      timesPlayed: 0,
    }

    const nextProgress: ProgressMap = {
      ...progress,
      [input.profileId]: {
        ...profileProgress,
        [input.subject]: {
          ...subjectProgress,
          [input.challengeId]: {
            stars: challengeProgress.stars + input.stars,
            timesPlayed: challengeProgress.timesPlayed + 1,
          },
        },
      },
    }

    writeStoredProgress(nextProgress)
    return nextProgress
  }

  getTotalStars(profileId: string, progress = this.getProgress()): number {
    const profileProgress = progress[profileId]
    if (!profileProgress) return 0

    return Object.values(profileProgress).reduce((subjectTotal, challenges) => {
      const challengeTotal = Object.values(challenges ?? {}).reduce(
        (sum, entry) => sum + (entry?.stars ?? 0),
        0,
      )
      return subjectTotal + challengeTotal
    }, 0)
  }
}
