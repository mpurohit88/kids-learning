import type { Profile } from '../../types'

/**
 * Profiles are no longer seeded. Kids are created by the parent/child on first launch
 * and stored in localStorage (see profileStorage.ts).
 */
export const profiles: Profile[] = []
