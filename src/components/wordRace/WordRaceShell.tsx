import type { ReactNode } from 'react'
import { ConfettiBurst } from '../ConfettiBurst'
import { GameCompleteModal } from '../GameCompleteModal'
import { GameMascotHeader } from '../game/GameMascotHeader'
import type { MascotMood } from '../Mascot'
import { AppShell } from '../layout/AppShell'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameRoundResult } from '../../types'
import type { CyclistPhase } from './WordRaceCyclist'
import { WordRaceTrack } from './WordRaceTrack'
import type { WhCheckpointId } from '../../types'

interface WordRaceShellProps {
  checkpointIndex: number
  checkpointCount: number
  completedCheckpoints: number
  bikeDisplayIndex: number
  rideTargetIndex: number | null
  cyclistPhase: CyclistPhase
  mood: MascotMood
  message: string
  isComplete: boolean
  result: GameRoundResult
  onPlayAgain: () => void
  showConfetti?: boolean
  overlay?: ReactNode
  children: ReactNode
}

export function WordRaceShell({
  checkpointIndex,
  checkpointCount,
  completedCheckpoints,
  bikeDisplayIndex,
  rideTargetIndex,
  cyclistPhase,
  mood,
  message,
  isComplete,
  result,
  onPlayAgain,
  showConfetti = false,
  overlay,
  children,
}: WordRaceShellProps) {
  const { t } = useTranslation()

  const getWordLabel = (id: WhCheckpointId) =>
    t(`games.wordRace.checkpoints.${id}`, undefined, id)

  return (
    <AppShell
      title={t('games.wordRace.title')}
      showBack
      backTo="/activities"
      profileGoesHome
      showProgressLink={false}
      showLanguageButton={false}
      denseHeader
    >
      {overlay}
      <ConfettiBurst active={showConfetti} />
      {isComplete ? (
        <GameCompleteModal
          result={result}
          challengeId="word-race"
          onPlayAgain={onPlayAgain}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 md:gap-4">
          <div className="w-full max-w-xl shrink-0">
            <GameMascotHeader
              roundIndex={checkpointIndex}
              roundCount={checkpointCount}
              roundLabel={t('games.wordRace.checkpointLabel')}
              mood={mood}
              message={message}
              denseMessage
            />
          </div>

          <WordRaceTrack
            bikeDisplayIndex={bikeDisplayIndex}
            rideTargetIndex={rideTargetIndex}
            completedCheckpoints={completedCheckpoints}
            currentCheckpointIndex={checkpointIndex}
            cyclistPhase={cyclistPhase}
            getWordLabel={getWordLabel}
          />

          {children}
        </div>
      )}
    </AppShell>
  )
}
