import { create } from 'zustand'
import { dataService } from '../data'
import type { ProgressMap, Subject } from '../types'

interface AppState {
  profileId: string | null
  subject: Subject | null
  progress: ProgressMap
  setProfile: (profileId: string) => void
  clearProfile: () => void
  setSubject: (subject: Subject) => void
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

  setProfile: (profileId) => set({ profileId, subject: null }),

  clearProfile: () => set({ profileId: null, subject: null }),

  setSubject: (subject) => set({ subject }),

  saveGameResult: (input) => {
    const progress = dataService.saveGameResult(input)
    set({ progress })
  },

  getTotalStars: (profileId) => dataService.getTotalStars(profileId, get().progress),
}))
