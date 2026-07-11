import { create } from 'zustand'
import { dataService } from '../data'
import type { ProgressMap, Subject, UiLocale } from '../types'

const SESSION_STORAGE_KEY = 'kids-learning-player-session'

interface PersistedSession {
  profileId: string | null
  subject: Subject | null
}

function readPersistedSession(): PersistedSession {
  if (typeof sessionStorage === 'undefined') {
    return { profileId: null, subject: null }
  }
  try {
    const raw = sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return { profileId: null, subject: null }
    const parsed = JSON.parse(raw) as Partial<PersistedSession>
    const profileId = typeof parsed.profileId === 'string' ? parsed.profileId : null
    const subject =
      parsed.subject === 'hindi' ||
      parsed.subject === 'kannada' ||
      parsed.subject === 'english' ||
      parsed.subject === 'maths'
        ? parsed.subject
        : null

    // Drop stale profile ids left over from older hardcoded profiles.
    if (profileId && !dataService.getProfileById(profileId)) {
      return { profileId: null, subject: null }
    }

    return { profileId, subject }
  } catch {
    return { profileId: null, subject: null }
  }
}

function writePersistedSession(session: PersistedSession) {
  if (typeof sessionStorage === 'undefined') return
  try {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session))
  } catch {
    // ignore quota / private mode failures
  }
}

const initialSession = readPersistedSession()

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
  profileId: initialSession.profileId,
  subject: initialSession.subject,
  progress: dataService.getProgress(),
  uiLocale: null,
  localeReady: false,

  setProfile: (profileId) => {
    const next = { profileId, subject: null as Subject | null }
    writePersistedSession(next)
    set(next)
  },

  clearProfile: () => {
    const next = { profileId: null, subject: null }
    writePersistedSession(next)
    set(next)
  },

  setSubject: (subject) => {
    const profileId = get().profileId
    writePersistedSession({ profileId, subject })
    set({ subject })
  },

  initLocale: () => {
    if (get().localeReady) return
    const saved = dataService.getSavedUiLocale()
    const locale = saved ?? dataService.getDefaultUiLocale()
    set({
      uiLocale: locale,
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
