import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { getLanguageContent } from '../data'
import { getProfileById } from '../data/profiles'
import { useAppStore } from '../store/useAppStore'
import type { AgeGroup } from '../types'

const baseActivities = [
  {
    id: 'letter-recognition',
    title: 'Find the Letter',
    emoji: '🔤',
    color: '#66bb6a',
    path: '/games/letter-recognition',
    description: 'Listen and tap the matching letter',
    ageGroups: ['lkg', 'class2'] as AgeGroup[],
  },
  {
    id: 'picture-word-match',
    title: 'Picture Match',
    emoji: '🖼️',
    color: '#42a5f5',
    path: '/games/picture-word-match',
    description: 'Match the picture to the right word',
    ageGroups: ['lkg', 'class2'] as AgeGroup[],
  },
  {
    id: 'letter-tracing',
    title: 'Trace the Letter',
    emoji: '✏️',
    color: '#ab47bc',
    path: '/games/letter-tracing',
    description: 'Draw the letter shape on screen',
    ageGroups: ['lkg', 'class2'] as AgeGroup[],
  },
  {
    id: 'exam-practice',
    title: 'Exam Practice',
    emoji: '📝',
    color: '#ef5350',
    path: '/games/exam-practice',
    description: 'Class 2 exam-style letter questions',
    ageGroups: ['class2'] as AgeGroup[],
  },
] as const

export function ActivityMenuScreen() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const language = useAppStore((state) => state.language)
  const profile = getProfileById(profileId)

  useEffect(() => {
    if (!profileId) {
      navigate('/', { replace: true })
      return
    }
    if (!language) {
      navigate('/home', { replace: true })
    }
  }, [profileId, language, navigate])

  if (!language || !profile) return null

  const content = getLanguageContent(language)
  const activities = baseActivities.filter((activity) =>
    activity.ageGroups.includes(profile.ageGroup),
  )

  return (
    <AppShell title={`${content.nativeName} Games`} showBack backTo="/home">
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          Pick a mini-game to play!
        </p>

        <div
          className={`grid grid-cols-1 gap-5 ${
            activities.length >= 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'
          }`}
        >
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => navigate(activity.path)}
              className="group relative flex min-h-52 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: activity.color }}
            >
              {activity.id === 'exam-practice' ? (
                <span className="absolute right-4 top-4 rounded-full bg-white/25 px-3 py-1 text-sm font-bold">
                  Class 2
                </span>
              ) : null}
              <span className="text-5xl transition group-hover:animate-bounce-soft">
                {activity.emoji}
              </span>
              <span className="mt-4 text-2xl font-bold">{activity.title}</span>
              <span className="mt-2 text-center text-base font-normal opacity-90">
                {activity.description}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-auto flex justify-center">
          <BigButton color="#ffb74d" onClick={() => navigate('/progress')} className="max-w-md">
            ⭐ See My Stars
          </BigButton>
        </div>
      </div>
    </AppShell>
  )
}
