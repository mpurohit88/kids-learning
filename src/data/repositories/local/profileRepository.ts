import type { AgeGroup, Profile } from '../../../types'
import type { ProfileRepository } from '../types'
import {
  MAX_PROFILES,
  ageGroupToClassChoice,
  buildProfile,
  classChoiceLabel,
  readStoredProfiles,
  writeStoredProfiles,
  type ClassChoice,
} from './profileStorage'

export class LocalProfileRepository implements ProfileRepository {
  getAllProfiles(): Profile[] {
    return readStoredProfiles()
  }

  getProfileById(id: string | null): Profile | undefined {
    if (!id) return undefined
    return this.getAllProfiles().find((profile) => profile.id === id)
  }

  createProfile(input: { name: string; classChoice: ClassChoice }): Profile {
    const existing = this.getAllProfiles()
    if (existing.length >= MAX_PROFILES) {
      throw new Error(`Maximum of ${MAX_PROFILES} profiles allowed`)
    }
    const profile = buildProfile({
      name: input.name,
      classChoice: input.classChoice,
      existingCount: existing.length,
    })
    writeStoredProfiles([...existing, profile])
    return profile
  }

  updateProfile(
    profileId: string,
    input: { name: string; classChoice: ClassChoice },
  ): Profile | undefined {
    const existing = this.getAllProfiles()
    const index = existing.findIndex((profile) => profile.id === profileId)
    if (index < 0) return undefined

    const updated = buildProfile({
      id: profileId,
      name: input.name,
      classChoice: input.classChoice,
      existingCount: index,
    })
    // Keep original avatar/color when editing
    updated.avatar = existing[index].avatar
    updated.color = existing[index].color
    updated.description = classChoiceLabel(input.classChoice)

    const next = [...existing]
    next[index] = updated
    writeStoredProfiles(next)
    return updated
  }

  deleteProfile(profileId: string): boolean {
    const existing = this.getAllProfiles()
    if (existing.length <= 1) return false
    const next = existing.filter((profile) => profile.id !== profileId)
    if (next.length === existing.length) return false
    writeStoredProfiles(next)
    return true
  }

  /** @deprecated Kept for compatibility — custom profiles always have names. */
  saveProfileName(profileId: string, name: string): void {
    const profile = this.getProfileById(profileId)
    if (!profile) return
    this.updateProfile(profileId, {
      name,
      classChoice: ageGroupToClassChoice(profile.ageGroup),
    })
  }

  hasAnyCustomProfileName(): boolean {
    return this.getAllProfiles().length > 0
  }
}

export type { ClassChoice, AgeGroup }
