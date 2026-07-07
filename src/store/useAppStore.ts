import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ActivityType, Language, ProgressMap } from '../types'

interface AppState {
  profileId: string | null
  language: Language | null
  progress: ProgressMap
  setProfile: (profileId: string) => void
  clearProfile: () => void
  setLanguage: (language: Language) => void
  addStars: (
    profileId: string,
    language: Language,
    activity: ActivityType,
    stars: number,
  ) => void
  getTotalStars: (profileId: string) => number
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      profileId: null,
      language: null,
      progress: {},

      setProfile: (profileId) => set({ profileId, language: null }),

      clearProfile: () => set({ profileId: null, language: null }),

      setLanguage: (language) => set({ language }),

      addStars: (profileId, language, activity, stars) => {
        set((state) => {
          const profileProgress = state.progress[profileId] ?? {}
          const languageProgress = profileProgress[language] ?? {}
          const activityProgress = languageProgress[activity] ?? {
            stars: 0,
            timesPlayed: 0,
          }

          return {
            progress: {
              ...state.progress,
              [profileId]: {
                ...profileProgress,
                [language]: {
                  ...languageProgress,
                  [activity]: {
                    stars: activityProgress.stars + stars,
                    timesPlayed: activityProgress.timesPlayed + 1,
                  },
                },
              },
            },
          }
        })
      },

      getTotalStars: (profileId) => {
        const profileProgress = get().progress[profileId]
        if (!profileProgress) return 0

        return Object.values(profileProgress).reduce((languageTotal, activities) => {
          const activityTotal = Object.values(activities ?? {}).reduce(
            (sum, entry) => sum + (entry?.stars ?? 0),
            0,
          )
          return languageTotal + activityTotal
        }, 0)
      },
    }),
    {
      name: 'kids-language-learning-progress',
      partialize: (state) => ({ progress: state.progress }),
    },
  ),
)
