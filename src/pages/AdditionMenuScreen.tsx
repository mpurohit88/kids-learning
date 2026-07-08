import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { getLocalizedChallenge } from '../utils/localizedContent'

export function AdditionMenuScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const profile = dataService.getProfileById(profileId)

  useEffect(() => {
    if (!profileId) {
      navigate('/', { replace: true })
      return
    }
    if (!subject || subject !== 'maths') {
      navigate('/home', { replace: true })
    }
  }, [profileId, subject, navigate])

  if (!profile || subject !== 'maths') return null

  const practices = dataService.getGroupedChallenges('maths', 'addition', profile.ageGroup)
  const hubChallenge = dataService.getChallenge('maths', 'addition')
  const localizedHub = hubChallenge ? getLocalizedChallenge(t, hubChallenge) : null

  return (
    <AppShell
      title={localizedHub?.title ?? 'Addition'}
      showBack
      backTo="/activities"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          {t('maths.additionPickPractice', undefined, 'Pick an addition practice!')}
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {practices.map((challenge) => {
            const localized = getLocalizedChallenge(t, challenge)
            return (
              <button
                key={challenge.id}
                type="button"
                onClick={() => navigate(challenge.route)}
                className="group relative flex min-h-44 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: challenge.color }}
              >
                <span className="text-5xl transition group-hover:animate-bounce-soft">
                  {challenge.emoji}
                </span>
                <span className="mt-4 text-2xl font-bold">{localized.title}</span>
                <span className="mt-2 text-center text-base font-normal opacity-90">
                  {localized.description}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </AppShell>
  )
}
