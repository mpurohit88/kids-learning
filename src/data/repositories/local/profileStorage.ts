import type { AgeGroup, Profile } from '../../../types'

const PROFILES_STORAGE_KEY = 'kids-learning-profiles-v2'
/** Legacy key from the old name-overlay system — cleared on first read of v2. */
const LEGACY_NAMES_KEY = 'kids-learning-profile-names'

export const MAX_PROFILES = 2

export const PROFILE_AVATARS = ['🦁', '🦋', '🐯', '🐼', '🦊', '🐰'] as const
export const PROFILE_COLORS = ['#ff8a65', '#64b5f6', '#81c784', '#ba68c8', '#ffb74d', '#4db6ac'] as const

export type ClassChoice = 'lkg' | 'class12'

export function classChoiceToAgeGroup(choice: ClassChoice): AgeGroup {
  return choice === 'lkg' ? 'lkg' : 'class2'
}

export function ageGroupToClassChoice(ageGroup: AgeGroup): ClassChoice {
  return ageGroup === 'lkg' ? 'lkg' : 'class12'
}

export function classChoiceLabel(choice: ClassChoice): string {
  return choice === 'lkg' ? 'LKG / UKG' : 'Class 1 / 2'
}

function isAgeGroup(value: unknown): value is AgeGroup {
  return value === 'lkg' || value === 'class2'
}

function isValidProfile(value: unknown): value is Profile {
  if (!value || typeof value !== 'object') return false
  const profile = value as Record<string, unknown>
  return (
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    profile.name.trim().length > 0 &&
    isAgeGroup(profile.ageGroup) &&
    typeof profile.avatar === 'string' &&
    typeof profile.color === 'string' &&
    typeof profile.description === 'string'
  )
}

function clearLegacyStorage() {
  try {
    localStorage.removeItem(LEGACY_NAMES_KEY)
  } catch {
    // ignore
  }
}

let profilesCacheRaw: string | null = null
let profilesCache: Profile[] = []

function invalidateProfilesCache() {
  profilesCacheRaw = null
  profilesCache = []
}

export function readStoredProfiles(): Profile[] {
  clearLegacyStorage()
  try {
    const raw = localStorage.getItem(PROFILES_STORAGE_KEY)
    if (!raw) {
      invalidateProfilesCache()
      return []
    }
    if (profilesCacheRaw === raw) return profilesCache

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      invalidateProfilesCache()
      return []
    }

    profilesCacheRaw = raw
    profilesCache = parsed.filter(isValidProfile).slice(0, MAX_PROFILES)
    return profilesCache
  } catch {
    invalidateProfilesCache()
    return []
  }
}

export function writeStoredProfiles(profiles: Profile[]): Profile[] {
  const next = profiles.filter(isValidProfile).slice(0, MAX_PROFILES)
  localStorage.setItem(PROFILES_STORAGE_KEY, JSON.stringify(next))
  invalidateProfilesCache()
  return readStoredProfiles()
}

export function createProfileId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `kid-${crypto.randomUUID()}`
  }
  return `kid-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export function buildProfile(input: {
  name: string
  classChoice: ClassChoice
  existingCount: number
  id?: string
}): Profile {
  const index = input.existingCount % PROFILE_AVATARS.length
  const ageGroup = classChoiceToAgeGroup(input.classChoice)
  return {
    id: input.id ?? createProfileId(),
    name: input.name.trim(),
    ageGroup,
    avatar: PROFILE_AVATARS[index],
    color: PROFILE_COLORS[index],
    description: classChoiceLabel(input.classChoice),
  }
}
