import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { LetterReferenceTable } from '../components/letters/LetterReferenceTable'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useAppStore } from '../store/useAppStore'
import { isLanguageSubject } from '../types'

type ActivityTab = 'practice' | 'letters'

export function ActivityMenuScreen() {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const profile = dataService.getProfileById(profileId)
  const [activeTab, setActiveTab] = useState<ActivityTab>('practice')

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
  const showLetterTab = isLanguageSubject(subject)
  const languageContent = showLetterTab ? dataService.getLanguageContent(subject) : null
  const letterReference =
    showLetterTab && activeTab === 'letters'
      ? dataService.getLetterReference(subject, profile.ageGroup)
      : []

  return (
    <AppShell
      title={`${subjectInfo?.nativeName ?? subject} Challenges`}
      showBack
      backTo="/home"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          {activeTab === 'letters'
            ? 'See all letters with examples before you practice!'
            : 'Pick a challenge to play!'}
        </p>

        {showLetterTab ? (
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`rounded-full px-6 py-3 text-lg font-bold transition ${
                activeTab === 'practice'
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              }`}
            >
              🎮 Practice
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('letters')}
              className={`rounded-full px-6 py-3 text-lg font-bold transition ${
                activeTab === 'letters'
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              }`}
            >
              📋 All Letters
            </button>
          </div>
        ) : null}

        {activeTab === 'letters' && showLetterTab && languageContent ? (
          <LetterReferenceTable
            subject={subject}
            letters={letterReference}
            speechLang={languageContent.speechLang}
          />
        ) : challenges.length === 0 ? (
          <div className="rounded-[2rem] border-4 border-dashed border-white bg-white/70 p-10 text-center">
            <p className="text-5xl">🚧</p>
            <p className="mt-4 text-2xl font-bold text-slate-700">Coming soon!</p>
            <p className="mt-2 text-slate-500">
              Challenges for {subjectInfo?.title ?? subject} are being added.
            </p>
            {showLetterTab ? (
              <button
                type="button"
                onClick={() => setActiveTab('letters')}
                className="mt-6 rounded-full bg-teal-500 px-6 py-3 text-lg font-bold text-white shadow transition hover:bg-teal-400"
              >
                View All Letters →
              </button>
            ) : null}
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
