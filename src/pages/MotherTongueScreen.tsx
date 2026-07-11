import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AppShell } from '../components/layout/AppShell'
import { dataService } from '../data'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import type { UiLocale } from '../types'

export function MotherTongueScreen() {
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const uiLocale = useAppStore((state) => state.uiLocale)
  const setUiLocale = useAppStore((state) => state.setUiLocale)
  const defaultLocale = dataService.getDefaultUiLocale()
  const languages = dataService.getMotherTongueLanguages()
  const isChangeFlow = location.pathname === '/language'
  const [selected, setSelected] = useState<UiLocale>(uiLocale ?? defaultLocale)

  useEffect(() => {
    setSelected(uiLocale ?? defaultLocale)
  }, [uiLocale, defaultLocale])

  const handleContinue = () => {
    setUiLocale(selected)
    if (isChangeFlow) {
      navigate('/home')
    }
  }

  return (
    <AppShell
      title={t('app.name')}
      showBack={isChangeFlow}
      backTo="/home"
      showProgressLink={false}
      showLanguageButton={false}
    >
      <div className="flex flex-1 flex-col items-center justify-center gap-8">
        <div className="text-center">
          <p className="text-6xl">🌐</p>
          <h1 className="mt-4 text-4xl font-extrabold text-slate-800 md:text-5xl">
            {t('motherTongue.title')}
          </h1>
          <p className="mt-3 max-w-xl text-xl text-slate-600">{t('motherTongue.subtitle')}</p>
        </div>

        <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-3">
          {languages.map((language) => {
            const isSelected = selected === language.id
            return (
              <button
                key={language.id}
                type="button"
                onClick={() => setSelected(language.id)}
                className={`flex min-h-40 flex-col items-center justify-center rounded-[2rem] border-4 p-6 shadow-lg transition hover:-translate-y-1 ${
                  isSelected
                    ? 'border-blue-500 bg-white ring-4 ring-blue-200'
                    : 'border-white bg-white/90 hover:shadow-xl'
                }`}
              >
                <span className="text-5xl">{language.emoji}</span>
                <span className="mt-3 text-2xl font-bold text-slate-800">{language.nativeLabel}</span>
                <span className="mt-1 text-base text-slate-500">{language.label}</span>
              </button>
            )
          })}
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="rounded-3xl bg-blue-500 px-12 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-blue-400"
        >
          {t('motherTongue.continue')}
        </button>
      </div>
    </AppShell>
  )
}
