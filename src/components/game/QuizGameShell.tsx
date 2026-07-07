import type { ReactNode } from 'react'
import { Volume2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AnswerFeedbackOverlay, type AnswerFeedbackType } from '../AnswerFeedbackOverlay'
import { ConfettiBurst } from '../ConfettiBurst'
import { GameChallengeSidebar } from '../challenges/GameChallengeSidebar'
import { GameCompleteModal } from '../GameCompleteModal'
import { Mascot, type MascotMood } from '../Mascot'
import { AppShell } from '../layout/AppShell'
import { GameSideLayout } from '../layout/GameSideLayout'
import type { GameRoundResult } from '../../types'

interface QuizGameShellProps {
  title: string
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
  hearAgainLabel = 'Hear Again',
  roundLabel = 'Round',
  children,
}: QuizGameShellProps) {
  const navigate = useNavigate()

  return (
    <AppShell title={title} showBack backTo="/activities">
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
          <div
            className={`flex w-full items-center ${onHearAgain ? 'justify-between' : 'justify-start'}`}
          >
            <p className="rounded-full bg-white/80 px-4 py-2 font-semibold text-slate-600 shadow">
              {roundLabel} {Math.min(roundIndex + 1, roundCount)} / {roundCount}
            </p>
            {onHearAgain ? (
              <button
                type="button"
                onClick={onHearAgain}
                className="flex items-center gap-2 rounded-2xl bg-orange-400 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-orange-300"
              >
                <Volume2 size={20} />
                {hearAgainLabel}
              </button>
            ) : null}
          </div>

          <Mascot mood={mood} message={message} />
          {children}
        </GameSideLayout>
      </div>

      {isComplete ? (
        <GameCompleteModal
          result={result}
          onPlayAgain={onPlayAgain}
          onBackToMenu={() => navigate('/activities')}
        />
      ) : null}
    </AppShell>
  )
}
