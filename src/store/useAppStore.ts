import { create } from 'zustand'
import { dataService } from '../data'
import type { ProgressMap, Subject, UiLocale } from '../types'

interface AppState {
  profileId: string | null
  subject: Subject | null
  progress: ProgressMap
  uiLocale: UiLocale | null
  localeReady: boolean
  setProfile: (profileId: string) => void
  clearProfile: () => void
  setSubject: (subject: Subject) => void
  initLocale: () => void
  setUiLocale: (locale: UiLocale) => void
  saveGameResult: (input: {
    profileId: string
    subject: Subject
    challengeId: string
    correct: number
    total: number
    stars: number
  }) => void
  getTotalStars: (profileId: string) => number
}

export const useAppStore = create<AppState>((set, get) => ({
  profileId: null,
  subject: null,
  progress: dataService.getProgress(),
  uiLocale: null,
  localeReady: false,

  setProfile: (profileId) => set({ profileId, subject: null }),

  clearProfile: () => set({ profileId: null, subject: null }),

  setSubject: (subject) => set({ subject }),

  initLocale: () => {
    // Default to English; multi-language UI is preserved but not forced on first launch.
    const DEFAULT_LOCALE: UiLocale = 'en'
    const saved = dataService.getSavedUiLocale()
    set({
      uiLocale: DEFAULT_LOCALE,
      localeReady: true,
    })
  },

  setUiLocale: (locale) => {
    dataService.saveUiLocale(locale)
    set({ uiLocale: locale })
  },

  saveGameResult: (input) => {
    const progress = dataService.saveGameResult(input)
    set({ progress })
  },

  getTotalStars: (profileId) => dataService.getTotalStars(profileId, get().progress),
}))
