import { useState } from 'react'
import { ArrowLeft, ChevronsUpDown, Home, Languages, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dataService } from '../../data'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { ProfileSwitchModal } from '../ProfileSwitchModal'

interface AppShellProps {
  title: string
  children: React.ReactNode
  showBack?: boolean
  backTo?: string
  /** When true, profile avatar navigates home (kid exit during gameplay). */
  profileGoesHome?: boolean
  showProgressLink?: boolean
  showLanguageButton?: boolean
  /** Tighter header for gameplay screens that need more vertical room. */
  denseHeader?: boolean
}

export function AppShell({
  title,
  children,
  showBack = true,
  backTo = '/home',
  profileGoesHome = false,
  showProgressLink = true,
  showLanguageButton = true,
  denseHeader = false,
}: AppShellProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const uiLocale = useAppStore((state) => state.uiLocale)
  const profile = dataService.getProfileById(profileId)
  const canSwitchProfile = dataService.getProfiles().length >= 2
  const [switchOpen, setSwitchOpen] = useState(false)

  const profileBadge = profile ? (
    <div
      className="flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-md"
      style={{ backgroundColor: profile.color }}
    >
      <span className="text-2xl" aria-hidden>
        {profile.avatar}
      </span>
      <span className="font-semibold">{profile.name}</span>
      {profileGoesHome ? (
        <Home size={18} strokeWidth={2.5} className="opacity-90" aria-hidden />
      ) : null}
      {!profileGoesHome && canSwitchProfile ? (
        <ChevronsUpDown size={18} strokeWidth={2.5} className="opacity-90" aria-hidden />
      ) : null}
    </div>
  ) : null

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 md:px-8">
      <header
        className={`flex items-center justify-between gap-4 ${denseHeader ? 'mb-3' : 'mb-6'}`}
      >
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              aria-label={t('common.goBack')}
              onClick={() => navigate(backTo)}
              className={`flex items-center justify-center gap-2 rounded-2xl bg-white/90 font-bold text-slate-700 shadow-md transition hover:bg-white active:scale-95 ${
                denseHeader
                  ? 'h-10 w-10 md:h-10 md:w-auto md:px-3 text-sm md:text-base'
                  : 'h-12 w-12 md:h-12 md:w-auto md:px-4 text-base md:text-lg'
              }`}
            >
              <ArrowLeft size={denseHeader ? 20 : 22} strokeWidth={2.5} aria-hidden />
              <span className="hidden md:inline">{t('common.back')}</span>
            </button>
          ) : (
            <div className={denseHeader ? 'h-10 w-10 shrink-0' : 'h-12 w-12 shrink-0'} />
          )}
          <div>
            {denseHeader ? null : (
              <p className="text-sm font-medium text-slate-500">{t('app.tagline')}</p>
            )}
            <h1
              className={`font-bold text-slate-800 ${
                denseHeader ? 'text-xl md:text-2xl' : 'text-2xl md:text-3xl'
              }`}
            >
              {title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile && profileGoesHome ? (
            <button
              type="button"
              aria-label={t('common.goHome')}
              title={t('common.goHome')}
              onClick={() => navigate('/home')}
              className="transition hover:brightness-110 active:scale-95"
            >
              {profileBadge}
            </button>
          ) : null}
          {profile && !profileGoesHome && canSwitchProfile ? (
            <button
              type="button"
              aria-label={t('launch.switchKid', undefined, 'Switch kid')}
              title={t('launch.switchKid', undefined, 'Switch kid')}
              onClick={() => setSwitchOpen(true)}
              className="transition hover:brightness-110 active:scale-95"
            >
              {profileBadge}
            </button>
          ) : null}
          {profile && !profileGoesHome && !canSwitchProfile ? profileBadge : null}
          {showLanguageButton && uiLocale ? (
            <button
              type="button"
              aria-label={t('common.changeLanguage')}
              title={t('common.changeLanguage')}
              onClick={() => navigate('/language')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-400 text-teal-950 shadow-md transition hover:bg-teal-300"
            >
              <Languages size={22} strokeWidth={2.5} />
            </button>
          ) : null}
          {showProgressLink && profile ? (
            <button
              type="button"
              aria-label={t('common.viewProgress')}
              onClick={() => navigate('/progress')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-amber-900 shadow-md transition hover:bg-amber-200"
            >
              <Star size={22} fill="currentColor" />
            </button>
          ) : null}
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>

      <ProfileSwitchModal open={switchOpen} onClose={() => setSwitchOpen(false)} />
    </div>
  )
}
