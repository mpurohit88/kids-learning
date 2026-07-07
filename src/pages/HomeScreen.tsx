import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useAppStore } from '../store/useAppStore'
import type { Subject } from '../types'

export function HomeScreen() {
  const navigate = useNavigate()
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
    <AppShell title="Pick a Subject" showBack backTo="/" showProgressLink>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <p className="max-w-xl text-center text-xl text-slate-600 md:text-2xl">
          Hi {profile.name}! What would you like to learn today?
        </p>

        <div className="grid w-full max-w-3xl grid-cols-1 gap-6 md:grid-cols-2">
          {subjects.map((entry) => (
            <BigButton
              key={entry.id}
              color={entry.color}
              ariaLabel={`Choose ${entry.title}`}
              onClick={() => handleSubjectSelect(entry.id)}
            >
              <span className="block text-5xl">{entry.emoji}</span>
              <span className="mt-2 block">{entry.title}</span>
              <span className="mt-1 block text-2xl font-normal">{entry.nativeName}</span>
              <span className="mt-2 block text-base font-normal opacity-90">
                {entry.description}
              </span>
            </BigButton>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
