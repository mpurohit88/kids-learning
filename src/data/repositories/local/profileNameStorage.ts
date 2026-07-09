const PROFILE_NAMES_STORAGE_KEY = 'kids-learning-profile-names'

export type ProfileNameMap = Record<string, string>

export function readProfileNames(): ProfileNameMap {
  try {
    const raw = localStorage.getItem(PROFILE_NAMES_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as unknown
    if (!parsed || typeof parsed !== 'object') return {}

    const result: ProfileNameMap = {}
    for (const [id, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (typeof value === 'string' && value.trim()) {
        result[id] = value.trim()
      }
    }
    return result
  } catch {
    return {}
  }
}

export function writeProfileName(profileId: string, name: string): ProfileNameMap {
  const next = { ...readProfileNames() }
  const trimmed = name.trim()
  if (trimmed) {
    next[profileId] = trimmed
  } else {
    delete next[profileId]
  }
  localStorage.setItem(PROFILE_NAMES_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function hasAnyProfileName(): boolean {
  return Object.keys(readProfileNames()).length > 0
}
