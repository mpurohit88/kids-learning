import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { dataService } from '../data'
import { useAppStore } from '../store/useAppStore'
import { getSessionGateRedirect } from '../utils/sessionGate'

/**
 * Keeps kids on the learning path: missing profile → launch, missing subject → home.
 * Returns whether the current screen may render game/menu content.
 */
export function usePlayerSessionGate(): {
  ready: boolean
  profileId: string | null
  subject: ReturnType<typeof useAppStore.getState>['subject']
} {
  const navigate = useNavigate()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const profileExists = Boolean(dataService.getProfileById(profileId))

  const redirect = getSessionGateRedirect({
    profileId,
    subject,
    profileExists,
  })

  useEffect(() => {
    if (redirect) {
      navigate(redirect, { replace: true })
    }
  }, [redirect, navigate])

  return {
    ready: redirect === null,
    profileId,
    subject,
  }
}
