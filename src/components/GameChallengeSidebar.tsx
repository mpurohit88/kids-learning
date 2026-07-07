import { useState } from 'react'
import { MangoTreeCollect } from './MangoTreeCollect'
import { TigerGoatRescue } from './TigerGoatRescue'

export type GameChallengeType = 'goat' | 'mango'

export interface GameChallengeSidebarProps {
  totalQuestions: number
  correctCount: number
  wrongCount: number
  passThreshold?: number
  isComplete?: boolean
  className?: string
}

const CHALLENGE_TYPES: GameChallengeType[] = ['goat', 'mango']

function pickChallengeType(): GameChallengeType {
  return CHALLENGE_TYPES[Math.floor(Math.random() * CHALLENGE_TYPES.length)]
}

export function GameChallengeSidebar(props: GameChallengeSidebarProps) {
  const [challengeType] = useState(pickChallengeType)

  if (challengeType === 'mango') {
    return <MangoTreeCollect variant="vertical" {...props} />
  }

  return <TigerGoatRescue variant="vertical" {...props} />
}
