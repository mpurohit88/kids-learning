import { useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Dice5, Home, RefreshCw } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import type { GameRoundResult } from '../types'
import { speakText, speechLangForLocale } from '../utils/audio'
import { pickSurpriseChallenge } from '../utils/surpriseChallenge'
import { Mascot } from './Mascot'
import { StarDisplay } from './StarDisplay'

interface GameCompleteModalProps {
  result: GameRoundResult
  challengeId: string
  onPlayAgain: () => void
}

export function GameCompleteModal({
  result,
  challengeId,
  onPlayAgain,
}: GameCompleteModalProps) {
  const navigate = useNavigate()
  const { t, locale } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const profile = dataService.getProfileById(profileId)
  const name = profile?.name ?? ''

  const heading = t('whatsNext.heading', { name })
  const subtitle = t('whatsNext.subtitle', {
    correct: result.correct,
    total: result.total,
  })

  const choices = useMemo(
    () => [
      {
        id: 'keep-playing' as const,
        label: t('whatsNext.keepPlaying'),
        icon: RefreshCw,
        className:
          'bg-green-100 text-green-800 ring-green-200 hover:bg-green-200 hover:ring-green-300',
        iconClassName: 'text-green-700',
      },
      {
        id: 'surprise' as const,
        label: t('whatsNext.surpriseMe'),
        icon: Dice5,
        className:
          'bg-rose-100 text-rose-800 ring-rose-200 hover:bg-rose-200 hover:ring-rose-300',
        iconClassName: 'text-rose-700',
      },
      {
        id: 'all-done' as const,
        label: t('whatsNext.allDone'),
        icon: Home,
        className:
          'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50 hover:ring-slate-300',
        iconClassName: 'text-slate-500',
      },
    ],
    [t],
  )

  useEffect(() => {
    const prompt = t('whatsNext.spokenPrompt', { name })
    void speakText(prompt, speechLangForLocale(locale))
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel()
      }
    }
  }, [locale, name, t])

  const handleSurprise = () => {
    if (!subject || !profile) {
      navigate('/activities')
      return
    }
    const surprise = pickSurpriseChallenge(subject, profile.ageGroup, challengeId)
    if (!surprise) {
      onPlayAgain()
      return
    }
    navigate(surprise.route)
  }

  const handleChoice = (id: (typeof choices)[number]['id']) => {
    if (id === 'keep-playing') {
      onPlayAgain()
      return
    }
    if (id === 'surprise') {
      handleSurprise()
      return
    }
    navigate('/home')
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-[2rem] bg-white p-6 text-center shadow-2xl md:p-8"
      >
        <Mascot mood="happy" message={heading} />
        <div className="my-4">
          <StarDisplay count={result.stars} size="lg" />
        </div>
        <p className="text-base font-medium text-slate-600 md:text-lg">{subtitle}</p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {choices.map((choice, index) => {
            const Icon = choice.icon
            return (
              <motion.button
                key={choice.id}
                type="button"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.08 }}
                onClick={() => handleChoice(choice.id)}
                className={`flex min-h-[7.5rem] flex-col items-center justify-center gap-3 rounded-3xl p-4 ring-2 transition ${choice.className}`}
              >
                <Icon size={36} strokeWidth={2.25} className={choice.iconClassName} aria-hidden />
                <span className="text-base font-bold leading-tight md:text-lg">{choice.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>
    </motion.div>
  )
}
