import { profiles } from '../../seed/profiles'
import type { Profile } from '../../../types'
import type { ProfileRepository } from '../types'
import {
  hasAnyProfileName,
  readProfileNames,
  writeProfileName,
} from './profileNameStorage'

function withCustomNames(list: Profile[]): Profile[] {
  const customNames = readProfileNames()
  return list.map((profile) => {
    const customName = customNames[profile.id]
    return customName ? { ...profile, name: customName } : profile
  })
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
  }

  hasAnyCustomProfileName() {
    return hasAnyProfileName()
  }
}
