import type { ReactNode } from 'react'
import { AnswerFeedbackOverlay, type AnswerFeedbackType } from '../AnswerFeedbackOverlay'
import { ConfettiBurst } from '../ConfettiBurst'
import { GameChallengeSidebar } from '../challenges/GameChallengeSidebar'
import { GameCompleteModal } from '../GameCompleteModal'
import { GameMascotHeader } from './GameMascotHeader'
import type { MascotMood } from '../Mascot'
import { AppShell } from '../layout/AppShell'
import { GameSideLayout } from '../layout/GameSideLayout'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameRoundResult } from '../../types'

interface QuizGameShellProps {
  title: string
  challengeId: string
  roundIndex: number
  roundCount: number
  correctCount: number
  wrongCount: number
  isComplete: boolean
  challengeSession: number
  feedbackType: AnswerFeedbackType
  showConfetti: boolean
  mood: MascotMood
  message: string
  result: GameRoundResult
  onPlayAgain: () => void
  onHearAgain?: () => void
  hearAgainLabel?: string
  roundLabel?: string
  /** Where Back returns — usually the activities menu or a practice hub. */
  backTo?: string
  children: ReactNode
}

export function QuizGameShell({
  title,
  challengeId,
  roundIndex,
  roundCount,
  correctCount,
  wrongCount,
  isComplete,
  challengeSession,
  feedbackType,
  showConfetti,
  mood,
  message,
  result,
  onPlayAgain,
  onHearAgain,
  hearAgainLabel,
  roundLabel,
  backTo = '/activities',
  children,
}: QuizGameShellProps) {
  const { t } = useTranslation()
  const resolvedHearAgain = hearAgainLabel ?? t('common.hearAgain')
  const resolvedRoundLabel = roundLabel ?? t('common.round')

  return (
    <AppShell
      title={title}
      showBack
      backTo={backTo}
      profileGoesHome
      showProgressLink={false}
      showLanguageButton={false}
      denseHeader
    >
      <AnswerFeedbackOverlay type={feedbackType} />
      <div className="relative flex min-h-0 flex-1 flex-col gap-2">
        <ConfettiBurst active={showConfetti} />

        <GameSideLayout
          sidePanel={
            <GameChallengeSidebar
              key={challengeSession}
              totalQuestions={roundCount}
              correctCount={correctCount}
              wrongCount={wrongCount}
              isComplete={isComplete}
            />
          }
        >
          <GameMascotHeader
            roundIndex={roundIndex}
            roundCount={roundCount}
            roundLabel={resolvedRoundLabel}
            mood={mood}
            message={message}
            onHearAgain={onHearAgain}
            hearAgainLabel={resolvedHearAgain}
          />
          {children}
        </GameSideLayout>
      </div>

      {isComplete ? (
        <GameCompleteModal
          result={result}
          challengeId={challengeId}
          onPlayAgain={onPlayAgain}
        />
      ) : null}
    </AppShell>
  )
}
