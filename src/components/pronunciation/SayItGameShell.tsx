import type { ReactNode, Ref } from 'react'
import { motion } from 'framer-motion'
import { ConfettiBurst } from '../ConfettiBurst'
import { GameCompleteModal } from '../GameCompleteModal'
import { GameMascotHeader } from '../game/GameMascotHeader'
import type { MascotMood } from '../Mascot'
import { AppShell } from '../layout/AppShell'
import { useTranslation } from '../../hooks/useTranslation'
import type { GameRoundResult } from '../../types'

interface SayItGameShellProps {
  title: string
  challengeId: string
  roundIndex: number
  roundCount: number
  mood: MascotMood
  message: string
  isComplete: boolean
  result: GameRoundResult
  onPlayAgain: () => void
  children: ReactNode
  showConfetti?: boolean
  overlay?: ReactNode
  bearRef?: Ref<HTMLDivElement>
  bearChomp?: boolean
  onHearAgain?: () => void
  hearAgainLabel?: string
}

export function SayItGameShell({
  title,
  challengeId,
  roundIndex,
  roundCount,
  mood,
  message,
  isComplete,
  result,
  onPlayAgain,
  children,
  showConfetti = false,
  overlay,
  bearRef,
  bearChomp = false,
  onHearAgain,
  hearAgainLabel,
}: SayItGameShellProps) {
  const { t } = useTranslation()

  return (
    <AppShell
      title={title}
      showBack
      backTo="/games/say-it"
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
          challengeId={challengeId}
          onPlayAgain={onPlayAgain}
        />
      ) : (
        <div className="flex flex-1 flex-col items-center gap-2 md:gap-4">
          <motion.div
            className="w-full max-w-xl shrink-0"
            animate={
              bearChomp
                ? { scale: [1, 1.2, 0.94, 1.06, 1], rotate: [0, -4, 4, 0] }
                : { scale: 1, rotate: 0 }
            }
            transition={{ duration: 0.42, ease: 'easeOut' }}
          >
            <GameMascotHeader
              roundIndex={roundIndex}
              roundCount={roundCount}
              roundLabel={t('games.sayIt.wordLabel')}
              mood={mood}
              message={message}
              denseMessage
              bearRef={bearRef}
              onHearAgain={onHearAgain}
              hearAgainLabel={hearAgainLabel}
            />
          </motion.div>
          {children}
        </div>
      )}
    </AppShell>
  )
}
