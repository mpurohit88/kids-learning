import whQuestionWords from '../../seed/subjects/whQuestionWords.json'
import type {
  WhCheckpoint,
  WhCheckpointId,
  WhPictureMatch,
  WhQuestionContent,
  WordRaceRound,
} from '../../../types'
import { shuffleArray } from '../../../utils/arrayUtils'

const content = whQuestionWords as WhQuestionContent

const CHECKPOINT_ORDER: WhCheckpointId[] = ['what', 'who', 'where', 'when', 'why', 'how']

const FILL_BLANK_DISTRACTORS: Record<WhCheckpointId, WhCheckpointId[]> = {
  what: ['who', 'where'],
  who: ['what', 'where'],
  where: ['what', 'when'],
  when: ['what', 'who'],
  why: ['how', 'what'],
  how: ['why', 'what'],
}

function pickRandom<T>(items: T[]): T | undefined {
  if (items.length === 0) return undefined
  return items[Math.floor(Math.random() * items.length)]
}

function buildOptions(answerId: WhCheckpointId, distractors: WhCheckpointId[]): WhCheckpointId[] {
  return shuffleArray([answerId, ...distractors.slice(0, 2)])
}

export class LocalWhQuestionRepository {
  getCheckpoints(): WhCheckpoint[] {
    return content.checkpoints
  }

  getCheckpoint(id: WhCheckpointId): WhCheckpoint | undefined {
    return content.checkpoints.find((checkpoint) => checkpoint.id === id)
  }

  getPictureMatches(): WhPictureMatch[] {
    return content.pictureMatches
  }

  getPictureMatchesForAnswer(answerId: WhCheckpointId): WhPictureMatch[] {
    return content.pictureMatches.filter((match) => match.answerId === answerId)
  }

  getLearnWords(): WhCheckpoint[] {
    return CHECKPOINT_ORDER.map((id) => this.getCheckpoint(id)).filter(
      (word): word is WhCheckpoint => word !== undefined,
    )
  }

  getLearnWord(id: WhCheckpointId): WhCheckpoint | undefined {
    return this.getCheckpoint(id)
  }

  buildSession(): WordRaceRound[] {
    return CHECKPOINT_ORDER.map((checkpointId) => {
      const checkpoint = this.getCheckpoint(checkpointId)
      if (!checkpoint) {
        throw new Error(`Missing WH checkpoint: ${checkpointId}`)
      }

      const example = pickRandom(checkpoint.examples)
      const answerId = example?.answerId ?? checkpointId
      const options = buildOptions(answerId, FILL_BLANK_DISTRACTORS[checkpointId])

      return {
        checkpointId,
        challengeType: 'fill-blank' as const,
        checkpoint,
        example,
        options,
      }
    })
  }
}
