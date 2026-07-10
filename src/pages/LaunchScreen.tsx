import { useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { MAX_PROFILES } from '../data/repositories/local/profileStorage'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { prepareAudio } from '../utils/audio'
import type { Profile } from '../types'
import type { ClassChoice } from '../data/repositories/local/profileStorage'

type FormMode = 'create' | 'edit'

interface ProfileFormState {
  mode: FormMode
  profileId?: string
  name: string
  classChoice: ClassChoice
}

const EMPTY_FORM: ProfileFormState = {
  mode: 'create',
  name: '',
  classChoice: 'lkg',
}

export function LaunchScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const setProfile = useAppStore((state) => state.setProfile)
  const clearProfile = useAppStore((state) => state.clearProfile)
  const activeProfileId = useAppStore((state) => state.profileId)

  const [profiles, setProfiles] = useState(() => dataService.getProfiles())
  const [form, setForm] = useState<ProfileFormState | null>(() =>
    dataService.getProfiles().length === 0 ? { ...EMPTY_FORM } : null,
  )

  const refreshProfiles = () => {
    setProfiles(dataService.getProfiles())
  }

  const openCreate = () => {
    if (profiles.length >= MAX_PROFILES) return
    setForm({ ...EMPTY_FORM })
  }

  const openEdit = (profile: Profile) => {
    setForm({
      mode: 'edit',
      profileId: profile.id,
      name: profile.name,
      classChoice: profile.ageGroup === 'lkg' ? 'lkg' : 'class12',
    })
  }

  const closeForm = () => {
    // Must keep at least one profile — don't allow dismissing create when empty
    if (profiles.length === 0) return
    setForm(null)
  }

  const saveForm = () => {
    if (!form) return
    const trimmed = form.name.trim()
    if (!trimmed) return

    if (form.mode === 'create') {
      dataService.createProfile({ name: trimmed, classChoice: form.classChoice })
    } else if (form.profileId) {
      dataService.updateProfile(form.profileId, {
        name: trimmed,
        classChoice: form.classChoice,
      })
    }

    void prepareAudio()
    refreshProfiles()
    setForm(null)
  }

  const removeProfile = (profile: Profile) => {
    if (profiles.length <= 1) return
    const ok = dataService.deleteProfile(profile.id)
    if (!ok) return
    if (activeProfileId === profile.id) {
      clearProfile()
    }
    refreshProfiles()
  }

  const selectProfile = (profile: Profile) => {
    void prepareAudio()
    setProfile(profile.id)
    navigate('/home')
  }

  const canSave = Boolean(form?.name.trim())
  const showAddButton = profiles.length > 0 && profiles.length < MAX_PROFILES

  return (
    <AppShell title={t('app.name')} showProgressLink={false}>
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-6xl">{profiles.length === 0 ? '👋' : '🎒'}</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-800 md:text-5xl">
            {profiles.length === 0
              ? t('launch.createTitle', undefined, 'Create a kid profile')
              : t('launch.heading')}
          </h1>
          <p className="mt-3 max-w-xl text-xl text-slate-600">
            {profiles.length === 0
              ? t(
                  'launch.createSubtitle',
                  undefined,
                  'Add a name and class to start learning. You can add up to 2 kids.',
                )
              : t('launch.subtitle')}
          </p>
        </div>

        {profiles.length > 0 ? (
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
                <div className="absolute right-4 top-4 z-10 flex gap-2">
                  <button
                    type="button"
                    aria-label={t('launch.editProfile', undefined, 'Edit profile')}
                    title={t('launch.editProfile', undefined, 'Edit profile')}
                    onClick={() => openEdit(profile)}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 text-white transition hover:bg-white/40"
                  >
                    <Pencil size={20} strokeWidth={2.5} />
                  </button>
                  {profiles.length > 1 ? (
                    <button
                      type="button"
                      aria-label={t('launch.deleteProfile', undefined, 'Delete profile')}
                      title={t('launch.deleteProfile', undefined, 'Delete profile')}
                      onClick={() => removeProfile(profile)}
                      className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/25 text-white transition hover:bg-white/40"
                    >
                      <Trash2 size={20} strokeWidth={2.5} />
                    </button>
                  ) : null}
                </div>

                <button
                  type="button"
                  onClick={() => selectProfile(profile)}
                  className="flex w-full flex-col items-center justify-center"
                >
                  <span className="text-6xl">{profile.avatar}</span>
                  <span className="mt-4 text-3xl font-bold">{profile.name}</span>
                  <span className="mt-2 text-lg opacity-90">{profile.description}</span>
                </button>
              </div>
            ))}

            {showAddButton ? (
              <button
                type="button"
                onClick={openCreate}
                className="flex min-h-48 flex-col items-center justify-center rounded-[2rem] border-4 border-dashed border-slate-300 bg-white/70 p-8 text-slate-600 shadow-inner transition hover:border-blue-400 hover:bg-white hover:text-blue-600"
              >
                <Plus size={40} strokeWidth={2.5} />
                <span className="mt-3 text-2xl font-bold">
                  {t('launch.addKid', undefined, 'Add another kid')}
                </span>
                <span className="mt-1 text-base">
                  {t('launch.maxTwo', undefined, 'Up to 2 profiles')}
                </span>
              </button>
            ) : null}
          </div>
        ) : null}

        {profiles.length === 0 && !form ? (
          <button
            type="button"
            onClick={openCreate}
            className="rounded-3xl bg-blue-500 px-12 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-blue-400"
          >
            {t('launch.createProfile', undefined, 'Create profile')}
          </button>
        ) : null}
      </div>

      {form ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeForm}
        >
          <div
            className="w-full max-w-md rounded-[2rem] border-4 border-white bg-white p-6 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 className="text-2xl font-bold text-slate-800">
              {form.mode === 'create'
                ? t('launch.createProfile', undefined, 'Create profile')
                : t('launch.editProfile', undefined, 'Edit profile')}
            </h2>
            <p className="mt-1 text-slate-500">
              {t('launch.formHint', undefined, 'Only a name and class are needed.')}
            </p>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold text-slate-600">
                {t('launch.nameLabel', undefined, 'Name')}
              </span>
              <input
                type="text"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') saveForm()
                }}
                placeholder={t('launch.namePlaceholder', undefined, 'Enter name')}
                maxLength={24}
                autoFocus
                className="w-full rounded-2xl border-2 border-slate-200 px-4 py-3 text-xl font-bold text-slate-800 outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-100"
              />
            </label>

            <fieldset className="mt-5">
              <legend className="mb-2 text-sm font-semibold text-slate-600">
                {t('launch.classLabel', undefined, 'Class')}
              </legend>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, classChoice: 'lkg' })}
                  className={`rounded-2xl px-4 py-4 text-lg font-bold transition ${
                    form.classChoice === 'lkg'
                      ? 'bg-orange-400 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t('launch.classLkg', undefined, 'LKG / UKG')}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, classChoice: 'class12' })}
                  className={`rounded-2xl px-4 py-4 text-lg font-bold transition ${
                    form.classChoice === 'class12'
                      ? 'bg-sky-500 text-white shadow-md'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {t('launch.class12', undefined, 'Class 1 / 2')}
                </button>
              </div>
            </fieldset>

            <div className="mt-6 flex gap-3">
              {profiles.length > 0 ? (
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 rounded-2xl bg-slate-100 px-4 py-3 text-lg font-bold text-slate-700 transition hover:bg-slate-200"
                >
                  {t('common.cancel', undefined, 'Cancel')}
                </button>
              ) : null}
              <button
                type="button"
                disabled={!canSave}
                onClick={saveForm}
                className="flex-1 rounded-2xl bg-blue-500 px-4 py-3 text-lg font-bold text-white transition hover:bg-blue-400 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {form.mode === 'create'
                  ? t('launch.saveProfile', undefined, 'Save profile')
                  : t('common.save', undefined, 'Save')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}
