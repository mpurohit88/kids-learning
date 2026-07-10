import type { ReactNode } from 'react'
import { AnswerFeedbackOverlay, type AnswerFeedbackType } from '../AnswerFeedbackOverlay'
import { ConfettiBurst } from '../ConfettiBurst'
import { GameChallengeSidebar } from '../challenges/GameChallengeSidebar'
import { GameCompleteModal } from '../GameCompleteModal'
import { Mascot, type MascotMood } from '../Mascot'
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
  children,
}: QuizGameShellProps) {
  const { t } = useTranslation()
  const resolvedHearAgain = hearAgainLabel ?? t('common.hearAgain')
  const resolvedRoundLabel = roundLabel ?? t('common.round')

  return (
    <AppShell
      title={title}
      showBack={false}
      profileGoesHome
      showProgressLink={false}
      showLanguageButton={false}
    >
      <AnswerFeedbackOverlay type={feedbackType} />
      <div className="relative flex flex-1 flex-col gap-4">
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
          <div className="flex w-full items-center justify-start">
            <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
              {resolvedRoundLabel} {Math.min(roundIndex + 1, roundCount)} / {roundCount}
            </p>
          </div>

          <Mascot
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
