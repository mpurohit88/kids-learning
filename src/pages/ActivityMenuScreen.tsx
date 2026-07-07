import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { AppShell } from '../components/layout/AppShell'
import { getLanguageContent } from '../data'
import { useAppStore } from '../store/useAppStore'

const activities = [
  {
    id: 'letter-recognition',
    title: 'Find the Letter',
    emoji: '🔤',
    color: '#66bb6a',
    path: '/games/letter-recognition',
    description: 'Listen and tap the matching letter',
  },
  {
    id: 'picture-word-match',
    title: 'Picture Match',
    emoji: '🖼️',
    color: '#42a5f5',
    path: '/games/picture-word-match',
    description: 'Match the picture to the right word',
  },
  {
    id: 'letter-tracing',
    title: 'Trace the Letter',
    emoji: '✏️',
    color: '#ab47bc',
    path: '/games/letter-tracing',
    description: 'Draw the letter shape on screen',
  },
] as const

export function ActivityMenuScreen() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const language = useAppStore((state) => state.language)

  useEffect(() => {
    if (!profileId) {
      navigate('/', { replace: true })
      return
    }
    if (!language) {
      navigate('/home', { replace: true })
    }
  }, [profileId, language, navigate])

  if (!language) return null

  const content = getLanguageContent(language)

  return (
    <AppShell title={`${content.nativeName} Games`} showBack backTo="/home">
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          Pick a mini-game to play!
        </p>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {activities.map((activity) => (
            <button
              key={activity.id}
              type="button"
              onClick={() => navigate(activity.path)}
              className="group flex min-h-52 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
              style={{ backgroundColor: activity.color }}
            >
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
