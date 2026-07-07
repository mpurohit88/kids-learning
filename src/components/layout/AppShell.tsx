import { ArrowLeft, Star } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { dataService } from '../../data'
import { useAppStore } from '../../store/useAppStore'

interface AppShellProps {
  title: string
  children: React.ReactNode
  showBack?: boolean
  backTo?: string
  showProgressLink?: boolean
}

export function AppShell({
  title,
  children,
  showBack = true,
  backTo = '/home',
  showProgressLink = true,
}: AppShellProps) {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const profile = dataService.getProfileById(profileId)

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 py-6 md:px-8">
      <header className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {showBack ? (
            <button
              type="button"
              aria-label="Go back"
              onClick={() => navigate(backTo)}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/90 text-slate-700 shadow-md transition hover:bg-white"
            >
              <ArrowLeft size={24} />
            </button>
          ) : (
            <div className="h-12 w-12" />
          )}
          <div>
            <p className="text-sm font-medium text-slate-500">Fun Letters</p>
            <h1 className="text-2xl font-bold text-slate-800 md:text-3xl">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {profile ? (
            <div
              className="flex items-center gap-2 rounded-2xl px-4 py-2 text-white shadow-md"
              style={{ backgroundColor: profile.color }}
            >
              <span className="text-2xl">{profile.avatar}</span>
              <span className="font-semibold">{profile.name}</span>
            </div>
          ) : null}
          {showProgressLink && profile ? (
            <button
              type="button"
              aria-label="View progress"
              onClick={() => navigate('/progress')}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-300 text-amber-900 shadow-md transition hover:bg-amber-200"
            >
              <Star size={22} fill="currentColor" />
            </button>
          ) : null}
        </div>
      </header>

      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  )
}
