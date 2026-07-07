import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { getProfileById } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'

export function HomeScreen() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const profile = getProfileById(profileId)

  useEffect(() => {
    if (!profileId) {
      navigate('/', { replace: true })
    }
  }, [profileId, navigate])

  const handleLanguageSelect = (language: 'hindi' | 'kannada') => {
    setLanguage(language)
    navigate('/activities')
  }

  if (!profile) return null

  return (
    <AppShell title="Pick a Language" showBack backTo="/" showProgressLink>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <p className="max-w-xl text-center text-xl text-slate-600 md:text-2xl">
          Hi {profile.name}! Choose Hindi or Kannada to play fun letter games.
        </p>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
          <BigButton
            color="#ff7043"
            ariaLabel="Choose Hindi"
            onClick={() => handleLanguageSelect('hindi')}
          >
            <span className="block text-5xl">🇮🇳</span>
            <span className="mt-2 block">Hindi</span>
            <span className="mt-1 block text-3xl font-normal">हिन्दी</span>
          </BigButton>

          <BigButton
            color="#5c6bc0"
            ariaLabel="Choose Kannada"
            onClick={() => handleLanguageSelect('kannada')}
          >
            <span className="block text-5xl">🌸</span>
            <span className="mt-2 block">Kannada</span>
            <span className="mt-1 block text-3xl font-normal">ಕನ್ನಡ</span>
          </BigButton>
        </div>
      </div>
    </AppShell>
  )
}
