import { profiles } from '../../seed/profiles'
import type { Profile } from '../../../types'
import type { ProfileRepository } from '../types'
import {
  hasAnyProfileName,
  readProfileNames,
  writeProfileName,
  type ProfileNameMap,
} from './profileNameStorage'

let cachedNamesKey = ''
let cachedProfiles: Profile[] | null = null

function namesKey(names: ProfileNameMap): string {
  return JSON.stringify(names)
}

function withCustomNames(list: Profile[]): Profile[] {
  const customNames = readProfileNames()
  const key = namesKey(customNames)
  if (cachedProfiles && cachedNamesKey === key) {
    return cachedProfiles
  }

  cachedNamesKey = key
  cachedProfiles = list.map((profile) => {
    const customName = customNames[profile.id]
    return customName ? { ...profile, name: customName } : profile
  })
  return cachedProfiles
}

function invalidateCache() {
  cachedNamesKey = ''
  cachedProfiles = null
}

export class LocalProfileRepository implements ProfileRepository {
  getAllProfiles() {
    return withCustomNames(profiles)
  }

  getProfileById(id: string | null) {
    if (!id) return undefined
    return this.getAllProfiles().find((profile) => profile.id === id)
  }

  saveProfileName(profileId: string, name: string) {
    writeProfileName(profileId, name)
    invalidateCache()
  }

  hasAnyCustomProfileName() {
    return hasAnyProfileName()
  }
}
