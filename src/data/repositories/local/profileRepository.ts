import { profiles } from '../../seed/profiles'
import type { ProfileRepository } from '../types'

export class LocalProfileRepository implements ProfileRepository {
  getAllProfiles() {
    return profiles
  }

  getProfileById(id: string | null) {
    if (!id) return undefined
    return profiles.find((profile) => profile.id === id)
  }
}
