import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { ProfileSwitchModal } from '../components/ProfileSwitchModal'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { prepareAudio } from '../utils/audio'
import { getLocalizedSubject } from '../utils/localizedContent'
import type { Subject } from '../types'

export function HomeScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const clearProfile = useAppStore((state) => state.clearProfile)
  const setSubject = useAppStore((state) => state.setSubject)
  const profile = dataService.getProfileById(profileId)
  const subjects = dataService.getSubjects()
  const canSwitchProfile = dataService.getProfiles().length >= 2
  const [switchOpen, setSwitchOpen] = useState(false)

  useEffect(() => {
    if (!profileId || !profile) {
      if (profileId && !profile) clearProfile()
      navigate('/', { replace: true })
    }
  }, [profileId, profile, clearProfile, navigate])

  const handleSubjectSelect = (subject: Subject) => {
    void prepareAudio()
    setSubject(subject)
    navigate('/activities')
  }

  if (!profile) return null

  return (
    <AppShell title={t('home.title')} showBack backTo="/" showProgressLink>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="flex flex-col items-center gap-3">
          <p className="max-w-xl text-center text-xl text-slate-600 md:text-2xl">
            {t('home.greeting', { name: profile.name })}
          </p>
          {canSwitchProfile ? (
            <button
              type="button"
              onClick={() => setSwitchOpen(true)}
              className="flex items-center gap-2 rounded-2xl border-2 border-white bg-white/80 px-4 py-2 text-base font-bold text-slate-700 shadow transition hover:bg-white active:scale-95"
            >
              <span aria-hidden>{profile.avatar}</span>
              <span>{t('launch.switchKid', undefined, 'Switch kid')}</span>
            </button>
          ) : null}
        </div>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {subjects.map((entry) => {
            const localized = getLocalizedSubject(t, entry)
            return (
              <BigButton
                key={entry.id}
                color={entry.color}
                ariaLabel={t('home.chooseSubject', { subject: localized.title })}
                onClick={() => handleSubjectSelect(entry.id)}
              >
                <span className="block text-5xl">{entry.emoji}</span>
                <span className="mt-2 block">{localized.title}</span>
                <span className="mt-1 block text-2xl font-normal">{entry.nativeName}</span>
                <span className="mt-2 block text-base font-normal opacity-90">
                  {localized.description}
                </span>
              </BigButton>
            )
          })}
        </div>
      </div>

      <ProfileSwitchModal open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </AppShell>
  )
}
