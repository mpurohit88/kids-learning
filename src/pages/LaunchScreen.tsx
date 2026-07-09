import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { getLocalizedProfileDescription } from '../utils/localizedContent'
import type { Profile } from '../types'

export function LaunchScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setProfile = useAppStore((state) => state.setProfile)
  const [profiles, setProfiles] = useState(() => dataService.getProfiles())
  const [needsNameSetup, setNeedsNameSetup] = useState(
    () => !dataService.hasAnyCustomProfileName(),
  )
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)
  const [nameDraft, setNameDraft] = useState('')
  const [setupNames, setSetupNames] = useState<Record<string, string>>(() =>
    Object.fromEntries(dataService.getProfiles().map((p) => [p.id, ''])),
  )

  const refreshProfiles = () => {
    setProfiles(dataService.getProfiles())
  }

  const openEdit = (profile: Profile) => {
    setEditingProfile(profile)
    setNameDraft(profile.name)
  }

  const saveEdit = () => {
    if (!editingProfile) return
    const trimmed = nameDraft.trim()
    if (!trimmed) return
    dataService.saveProfileName(editingProfile.id, trimmed)
    setEditingProfile(null)
    setNameDraft('')
    refreshProfiles()
  }

  const saveFirstTimeNames = () => {
    const filled = profiles.every((profile) => setupNames[profile.id]?.trim())
    if (!filled) return

    for (const profile of profiles) {
      dataService.saveProfileName(profile.id, setupNames[profile.id].trim())
    }
    setNeedsNameSetup(false)
    refreshProfiles()
  }

  if (needsNameSetup) {
    const canContinue = profiles.every((profile) => setupNames[profile.id]?.trim())

    return (
      <AppShell title={t('app.name')} showProgressLink={false}>
        <div className="flex flex-1 flex-col items-center justify-center gap-8">
          <div className="text-center">
            <p className="text-6xl">👋</p>
            <h1 className="mt-4 text-4xl font-extrabold text-slate-800 md:text-5xl">
              {t('launch.nameSetupTitle', undefined, "What's your name?")}
            </h1>
            <p className="mt-3 max-w-xl text-xl text-slate-600">
              {t(
                'launch.nameSetupSubtitle',
                undefined,
                'Enter a name for each learner. You can change it later.',
              )}
            </p>
          </div>

          <div className="grid w-full max-w-2xl grid-cols-1 gap-6 md:grid-cols-2">
            {profiles.map((profile) => (
              <div
                key={profile.id}
                className="flex flex-col items-center rounded-[2rem] border-4 border-white p-6 text-white shadow-lg"
                style={{ backgroundColor: profile.color }}
              >
                <span className="text-5xl">{profile.avatar}</span>
                <p className="mt-2 text-lg opacity-90">
                  {getLocalizedProfileDescription(t, profile.id, profile.description)}
                </p>
                <label className="mt-4 w-full">
                  <span className="sr-only">
                    {t('launch.nameLabel', undefined, 'Name')}
                  </span>
                  <input
                    type="text"
                    value={setupNames[profile.id] ?? ''}
                    onChange={(event) =>
                      setSetupNames((prev) => ({
                        ...prev,
                        [profile.id]: event.target.value,
                      }))
                    }
                    placeholder={t('launch.namePlaceholder', undefined, 'Enter name')}
                    maxLength={24}
                    className="w-full rounded-2xl border-2 border-white/40 bg-white px-4 py-3 text-center text-xl font-bold text-slate-800 outline-none placeholder:font-normal placeholder:text-slate-400 focus:ring-4 focus:ring-white/50"
                  />
                </label>
              </div>
            ))}
          </div>

          <button
            type="button"
            disabled={!canContinue}
            onClick={saveFirstTimeNames}
            className="rounded-3xl bg-blue-500 px-12 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {t('launch.nameSetupContinue', undefined, 'Continue')}
          </button>
        </div>
      </AppShell>
    )
  }

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
            <div
              key={profile.id}
              className="relative flex min-h-48 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-8 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              style={{
                backgroundColor: profile.color,
                animationDelay: `${index * 0.1}s`,
              }}
            >
              <button
                type="button"
                aria-label={t('launch.editName', undefined, 'Edit name')}
                title={t('launch.editName', undefined, 'Edit name')}
                onClick={() => openEdit(profile)}
                className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 text-white transition hover:bg-white/40"
              >
                <Pencil size={20} strokeWidth={2.5} />
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfile(profile.id)
                  navigate('/home')
                }}
                className="flex w-full flex-col items-center justify-center"
              >
                <span className="text-6xl">{profile.avatar}</span>
                <span className="mt-4 text-3xl font-bold">{profile.name}</span>
                <span className="mt-2 text-lg opacity-90">
                  {getLocalizedProfileDescription(t, profile.id, profile.description)}
                </span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {editingProfile ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setEditingProfile(null)}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border-4 border-white bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-4xl">{editingProfile.avatar}</span>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  {t('launch.editNameTitle', undefined, 'Edit name')}
                </h2>
                <p className="text-slate-500">
                  {getLocalizedProfileDescription(
                    t,
                    editingProfile.id,
                    editingProfile.description,
                  )}
                </p>
              </div>
            </div>

            <input
              type="text"
              value={nameDraft}
              onChange={(event) => setNameDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') saveEdit()
              }}
              maxLength={24}
              autoFocus
              className="mt-5 w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-xl font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={() => setEditingProfile(null)}
                className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-lg font-bold text-slate-700 transition hover:bg-slate-200"
              >
                {t('common.cancel', undefined, 'Cancel')}
              </button>
              <button
                type="button"
                disabled={!nameDraft.trim()}
                onClick={saveEdit}
                className="flex-1 rounded-2xl bg-blue-500 px-4 py-3 text-lg font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {t('common.save', undefined, 'Save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
