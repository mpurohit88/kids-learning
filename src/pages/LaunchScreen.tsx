import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { getLocalizedProfileDescription } from '../utils/localizedContent'

export function LaunchScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setProfile = useAppStore((state) => state.setProfile)
  const profiles = dataService.getProfiles()

  return (
    <AppShell title={t('app.name')} showProgressLink={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-6xl">🎒</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-800 md:text-5xl">
            {t('launch.heading')}
          </h1>
          <p className="mt-3 text-xl text-slate-600">{t('launch.subtitle')}</p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
          {profiles.map((profile, index) => (
            <button
              key={profile.id}
              type="button"
              onClick={() => {
                setProfile(profile.id)
                navigate('/home')
              }}
              className="flex min-h-48 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-8 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: profile.color,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <span className="text-6xl">{profile.avatar}</span>
              <span className="mt-4 text-3xl font-bold">{profile.name}</span>
              <span className="mt-2 text-lg opacity-90">
                {getLocalizedProfileDescription(t, profile.id, profile.description)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}
