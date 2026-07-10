import type { Subject } from '../types'

export type SessionGateRedirect = '/' | '/home' | null

/**
 * Decides where to send the player when opening a game/menu screen.
 * - No profile → launch (/)
 * - Profile but no subject → subject picker (/home)
 * - Both present → stay (null)
 */
export function getSessionGateRedirect(input: {
  profileId: string | null
  subject: Subject | null
  profileExists: boolean
}): SessionGateRedirect {
  if (!input.profileId || !input.profileExists) return '/'
  if (!input.subject) return '/home'
  return null
}

/** True when a challenge route is a playable game path registered by the app. */
export function isRegisteredGameRoute(
  route: string,
  registeredRoutes: readonly string[],
): boolean {
  return registeredRoutes.includes(route)
}
