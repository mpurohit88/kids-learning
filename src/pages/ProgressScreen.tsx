import { useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { StarDisplay } from '../components/StarDisplay'
import { profiles } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'
import type { ActivityType, Language } from '../types'

const activityLabels: Record<ActivityType, string> = {
  'letter-recognition': 'Find the Letter',
  'picture-word-match': 'Picture Match',
  'letter-tracing': 'Trace the Letter',
}

const languageLabels: Record<Language, string> = {
  hindi: 'Hindi',
  kannada: 'Kannada',
}

export function ProgressScreen() {
  const navigate = useNavigate()
  const progress = useAppStore((state) => state.progress)
  const getTotalStars = useAppStore((state) => state.getTotalStars)

  return (
    <AppShell title="Stars Earned" showBack backTo="/home" showProgressLink={false}>
      <div className="flex flex-1 flex-col gap-8">
        <p className="text-center text-xl text-slate-600">
          Here is how many stars each child has earned!
        </p>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {profiles.map((profile) => {
            const profileProgress = progress[profile.id] ?? {}
            const totalStars = getTotalStars(profile.id)

            return (
              <div
                key={profile.id}
                className="rounded-[2rem] border-4 border-white bg-white/80 p-6 shadow-lg"
              >
                <div className="mb-4 flex items-center gap-3">
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-2xl text-4xl text-white"
                    style={{ backgroundColor: profile.color }}
                  >
                    {profile.avatar}
                  </span>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
                    <p className="text-slate-500">{profile.description}</p>
                  </div>
                </div>

                <div className="mb-6 rounded-2xl bg-amber-50 px-4 py-3 text-center">
                  <p className="text-sm font-semibold uppercase tracking-wide text-amber-700">
                    Total Stars
                  </p>
                  <p className="text-4xl font-extrabold text-amber-600">{totalStars} ⭐</p>
                </div>

                {(['hindi', 'kannada'] as Language[]).map((language) => {
                  const languageProgress = profileProgress[language] ?? {}

                  return (
                    <div key={language} className="mb-4 last:mb-0">
                      <h3 className="mb-2 text-lg font-bold text-slate-700">
                        {languageLabels[language]}
                      </h3>
                      <div className="space-y-2">
                        {(Object.keys(activityLabels) as ActivityType[]).map((activity) => {
                          const entry = languageProgress[activity]
                          const stars = entry?.stars ?? 0
                          const timesPlayed = entry?.timesPlayed ?? 0

                          return (
                            <div
                              key={activity}
                              className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                            >
                              <div>
                                <p className="font-semibold text-slate-700">
                                  {activityLabels[activity]}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Played {timesPlayed} time{timesPlayed === 1 ? '' : 's'}
                                </p>
                              </div>
                              <div className="text-right">
                                <StarDisplay count={Math.min(stars, 3)} max={3} size="sm" />
                                <p className="mt-1 text-sm font-bold text-amber-600">
                                  {stars} stars
                                </p>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>

        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="rounded-2xl bg-slate-700 px-8 py-4 text-lg font-semibold text-white shadow-md transition hover:bg-slate-600"
          >
            Switch Child Profile
          </button>
        </div>
      </div>
    </AppShell>
  )
}
