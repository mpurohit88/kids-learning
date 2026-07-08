import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { getLocalizedSubject } from '../utils/localizedContent'
import type { Subject } from '../types'

export function HomeScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const setSubject = useAppStore((state) => state.setSubject)
  const profile = dataService.getProfileById(profileId)
  const subjects = dataService.getSubjects()

  useEffect(() => {
    if (!profileId) {
      navigate('/', { replace: true })
    }
  }, [profileId, navigate])

  const handleSubjectSelect = (subject: Subject) => {
    setSubject(subject)
    navigate('/activities')
  }

  if (!profile) return null

  return (
    <AppShell title={t('home.title')} showBack backTo="/" showProgressLink>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <p className="max-w-xl text-center text-xl text-slate-600 md:text-2xl">
          {t('home.greeting', { name: profile.name })}
        </p>

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
    </AppShell>
  )
}
