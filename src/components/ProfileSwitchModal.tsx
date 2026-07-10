import { useNavigate } from 'react-router-dom'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { prepareAudio } from '../utils/audio'
import type { Profile } from '../types'

interface ProfileSwitchModalProps {
  open: boolean
  onClose: () => void
}

export function ProfileSwitchModal({ open, onClose }: ProfileSwitchModalProps) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const setProfile = useAppStore((state) => state.setProfile)
  const profiles = dataService.getProfiles()

  if (!open || profiles.length < 2) return null

  const selectProfile = (profile: Profile) => {
    if (profile.id === profileId) {
      onClose()
      return
    }
    void prepareAudio()
    setProfile(profile.id)
    onClose()
    navigate('/home')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 px-4 pb-6 pt-16 sm:items-center sm:pb-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('launch.switchKid', undefined, 'Switch kid')}
        className="w-full max-w-lg rounded-[2rem] border-4 border-white bg-gradient-to-b from-orange-50 to-sky-50 p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-center text-5xl" aria-hidden>
          👋
        </p>
        <h2 className="mt-3 text-center text-2xl font-extrabold text-slate-800 md:text-3xl">
          {t('launch.heading')}
        </h2>
        <p className="mt-2 text-center text-lg text-slate-600">
          {t('launch.switchSubtitle', undefined, 'Tap a friend to keep learning')}
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {profiles.map((profile) => {
            const isActive = profile.id === profileId
            return (
              <button
                key={profile.id}
                type="button"
                onClick={() => selectProfile(profile)}
                className={`relative flex min-h-36 flex-col items-center justify-center rounded-[1.75rem] border-4 p-5 text-white shadow-lg transition active:scale-95 ${
                  isActive
                    ? 'border-amber-300 ring-4 ring-amber-200'
                    : 'border-white hover:-translate-y-0.5 hover:shadow-xl'
                }`}
                style={{ backgroundColor: profile.color }}
                aria-current={isActive ? 'true' : undefined}
                aria-label={
                  isActive
                    ? t('launch.playingAs', { name: profile.name }, `Playing as ${profile.name}`)
                    : t('launch.switchTo', { name: profile.name }, `Switch to ${profile.name}`)
                }
              >
                {isActive ? (
                  <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-amber-700">
                    {t('launch.you', undefined, 'You')}
                  </span>
                ) : null}
                <span className="text-5xl">{profile.avatar}</span>
                <span className="mt-3 text-2xl font-bold">{profile.name}</span>
                <span className="mt-1 text-sm opacity-90">{profile.description}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 w-full rounded-2xl bg-white/90 px-4 py-3 text-lg font-bold text-slate-700 shadow transition hover:bg-white"
        >
          {t('common.cancel', undefined, 'Cancel')}
        </button>
      </div>
    </div>
  )
}
