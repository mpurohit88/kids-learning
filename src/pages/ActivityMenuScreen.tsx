import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useAppStore } from '../store/useAppStore'

export function ActivityMenuScreen() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const profile = dataService.getProfileById(profileId)

  useEffect(() => {
    if (!profileId) {
      navigate('/', { replace: true })
      return
    }
    if (!subject) {
      navigate('/home', { replace: true })
    }
  }, [profileId, subject, navigate])

  if (!subject || !profile) return null

  const subjectInfo = dataService.getSubject(subject)
  const challenges = dataService.getChallenges(subject, profile.ageGroup)

  return (
    <AppShell
      title={`${subjectInfo?.nativeName ?? subject} Challenges`}
      showBack
      backTo="/home"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          Pick a challenge to play!
        </p>

        {challenges.length === 0 ? (
          <div className="rounded-[2rem] border-4 border-dashed border-white bg-white/70 p-10 text-center">
            <p className="text-5xl">🚧</p>
            <p className="mt-4 text-2xl font-bold text-slate-700">Coming soon!</p>
            <p className="mt-2 text-slate-500">
              Challenges for {subjectInfo?.title ?? subject} are being added.
            </p>
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-5 ${
              challenges.length >= 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'
            }`}
          >
            {challenges.map((challenge) => (
              <button
                key={challenge.id}
                type="button"
                onClick={() => navigate(challenge.route)}
                className="group relative flex min-h-52 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                style={{ backgroundColor: challenge.color }}
              >
                {challenge.badge ? (
                  <span className="absolute right-4 top-4 rounded-full bg-white/25 px-3 py-1 text-sm font-bold">
                    {challenge.badge}
                  </span>
                ) : null}
                <span className="text-5xl transition group-hover:animate-bounce-soft">
                  {challenge.emoji}
                </span>
                <span className="mt-4 text-2xl font-bold">{challenge.title}</span>
              <span className="mt-2 text-center text-base font-normal opacity-90">
                {challenge.description}
              </span>
              {challenge.bookReference ? (
                <span className="mt-1 text-center text-xs font-normal opacity-80">
                  {challenge.bookReference}
                </span>
              ) : null}
              </button>
            ))}
          </div>
        )}

        <div className="mt-auto flex justify-center">
          <BigButton color="#ffb74d" onClick={() => navigate('/progress')} className="max-w-md">
            ⭐ See My Stars
          </BigButton>
        </div>
      </div>
    </AppShell>
  )
}
