import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BigButton } from '../components/BigButton'
import { LetterCardGrid } from '../components/letters/LetterCardGrid'
import { AppShell } from '../components/layout/AppShell'
import { AccessibleExamCursor } from '../components/accessibility/AccessibleExamCursor'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import {
  getLocalizedChallenge,
  getLocalizedSubject,
} from '../utils/localizedContent'
import { isLanguageSubject } from '../types'

type ActivityTab = 'practice' | 'letters'

export function ActivityMenuScreen() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const profile = dataService.getProfileById(profileId)
  const [activeTab, setActiveTab] = useState<ActivityTab>('letters')

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
  const localizedSubject = subjectInfo ? getLocalizedSubject(t, subjectInfo) : null
  const challenges = dataService.getChallenges(subject, profile.ageGroup)
  const showLetterTab = isLanguageSubject(subject)
  const languageContent = showLetterTab ? dataService.getLanguageContent(subject) : null
  const letterReference =
    showLetterTab && activeTab === 'letters'
      ? dataService.getLetterReference(subject, profile.ageGroup)
      : []

  const useAccessibleCursor = subject === 'maths'

  const page = (
    <AppShell
      title={t('activities.challengesTitle', {
        subject: localizedSubject?.title ?? subjectInfo?.nativeName ?? subject,
      })}
      showBack
      backTo="/home"
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          {activeTab === 'letters' ? t('activities.lettersIntro') : t('activities.pickChallenge')}
        </p>

        {showLetterTab ? (
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('letters')}
              className={`rounded-full px-6 py-3 text-lg font-bold transition ${
                activeTab === 'letters'
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              }`}
            >
              📚 {t('activities.tabLearn', undefined, 'Learn')}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('practice')}
              className={`rounded-full px-6 py-3 text-lg font-bold transition ${
                activeTab === 'practice'
                  ? 'bg-white text-slate-800 shadow-lg'
                  : 'bg-white/50 text-slate-600 hover:bg-white/70'
              }`}
            >
              🎮 {t('activities.tabPractice')}
            </button>
          </div>
        ) : null}

        {activeTab === 'letters' && showLetterTab && languageContent ? (
          <LetterCardGrid
            subject={subject}
            letters={letterReference}
            speechLang={languageContent.speechLang}
          />
        ) : challenges.length === 0 ? (
          <div className="rounded-[2rem] border-4 border-dashed border-white bg-white/70 p-10 text-center">
            <p className="text-5xl">🚧</p>
            <p className="mt-4 text-2xl font-bold text-slate-700">{t('activities.comingSoon')}</p>
            <p className="mt-2 text-slate-500">
              {t('activities.comingSoonDetail', {
                subject: localizedSubject?.title ?? subjectInfo?.title ?? subject,
              })}
            </p>
            {showLetterTab ? (
              <button
                type="button"
                onClick={() => setActiveTab('letters')}
                className="mt-6 rounded-full bg-teal-500 px-6 py-3 text-lg font-bold text-white shadow transition hover:bg-teal-400"
              >
                {t('activities.viewAllLetters')}
              </button>
            ) : null}
          </div>
        ) : (
          <div
            className={`grid grid-cols-1 gap-5 ${
              challenges.length >= 4 ? 'md:grid-cols-2' : 'md:grid-cols-3'
            }`}
          >
            {challenges.map((challenge) => {
              const localized = getLocalizedChallenge(t, challenge)
              return (
                <button
                  key={challenge.id}
                  type="button"
                  onClick={() => navigate(challenge.route)}
                  className="group relative flex min-h-52 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-6 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
                  style={{ backgroundColor: challenge.color }}
                >
                  {localized.badge ? (
                    <span className="absolute right-4 top-4 rounded-full bg-white/25 px-3 py-1 text-sm font-bold">
                      {localized.badge}
                    </span>
                  ) : null}
                  <span className="text-5xl transition group-hover:animate-bounce-soft">
                    {challenge.emoji}
                  </span>
                  <span className="mt-4 text-2xl font-bold">{localized.title}</span>
                  <span className="mt-2 text-center text-base font-normal opacity-90">
                    {localized.description}
                  </span>
                  {localized.bookReference ? (
                    <span className="mt-1 text-center text-xs font-normal opacity-80">
                      {localized.bookReference}
                    </span>
                  ) : null}
                </button>
              )
            })}
          </div>
        )}

        {subject === 'maths' ? (
          <button
            type="button"
            onClick={() => navigate('/learn/numbers')}
            className="group flex min-h-28 w-full items-center gap-5 rounded-[2rem] border-4 border-white bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-5 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl"
          >
            <span className="text-5xl transition group-hover:animate-bounce-soft">🔢</span>
            <div className="text-left">
              <p className="text-2xl font-bold">
                {t('learn.numbersTitle', undefined, 'Learn Numbers')}
              </p>
              <p className="text-base font-normal opacity-90">
                {profile.ageGroup === 'lkg'
                  ? t('learn.numbersBadgeLkg', undefined, 'Numbers 1 – 20')
                  : t('learn.numbersBadgeClass2', undefined, 'Numbers 1 – 100')}
              </p>
            </div>
          </button>
        ) : null}

        <div className="mt-auto flex justify-center">
          <BigButton color="#ffb74d" onClick={() => navigate('/progress')} className="max-w-md">
            ⭐ {t('activities.seeMyStars')}
          </BigButton>
        </div>
      </div>
    </AppShell>
  )

  return useAccessibleCursor ? (
    <AccessibleExamCursor className="min-h-screen">{page}</AccessibleExamCursor>
  ) : (
    page
  )
}
