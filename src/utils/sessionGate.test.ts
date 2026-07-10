import { describe, expect, it } from 'vitest'
import {
  getPlayableChallengeRoutes,
  getRegisteredGameRoutes,
} from '../config/gameRegistry'
import { dataService } from '../data'
import { getSessionGateRedirect, isRegisteredGameRoute } from './sessionGate'

describe('getSessionGateRedirect', () => {
  it('sends players to launch when profile is missing', () => {
    expect(
      getSessionGateRedirect({
        profileId: null,
        subject: 'hindi',
        profileExists: false,
      }),
    ).toBe('/')
  })

  it('sends players to launch when profile id is stale', () => {
    expect(
      getSessionGateRedirect({
        profileId: 'aarav',
        subject: 'hindi',
        profileExists: false,
      }),
    ).toBe('/')
  })

  it('sends players to subject home when profile exists but subject is missing', () => {
    expect(
      getSessionGateRedirect({
        profileId: 'kid-1',
        subject: null,
        profileExists: true,
      }),
    ).toBe('/home')
  })

  it('allows gameplay when profile and subject are both present', () => {
    expect(
      getSessionGateRedirect({
        profileId: 'kid-1',
        subject: 'hindi',
        profileExists: true,
      }),
    ).toBeNull()
  })
})

describe('Find the Letter route registration', () => {
  it('registers /games/letter-recognition in the game registry', () => {
    const routes = getRegisteredGameRoutes()
    expect(routes).toContain('/games/letter-recognition')
    expect(isRegisteredGameRoute('/games/letter-recognition', routes)).toBe(true)
  })

  it('keeps Hindi Find the Letter challenge pointing at the registered game route', () => {
    for (const grade of ['lkg', 'class2'] as const) {
      const challenges = dataService.getChallenges('hindi', grade)
      const findLetter = challenges.find((challenge) => challenge.id === 'letter-recognition')
      expect(findLetter).toBeDefined()
      expect(findLetter!.route).toBe('/games/letter-recognition')
      expect(
        isRegisteredGameRoute(findLetter!.route, getRegisteredGameRoutes()),
      ).toBe(true)
    }
  })

  it('ensures every language challenge route is a registered mini-game route', () => {
    const registered = getRegisteredGameRoutes()
    for (const subject of ['hindi', 'kannada', 'english'] as const) {
      for (const grade of ['lkg', 'class2'] as const) {
        for (const route of getPlayableChallengeRoutes(subject, grade)) {
          expect(registered).toContain(route)
        }
      }
    }
  })
})

describe('letter bank for Find the Letter', () => {
  it('returns letters for hindi at both class levels so the game can start', () => {
    expect(dataService.getLettersForLetterGames('hindi', 'lkg').length).toBeGreaterThan(0)
    expect(dataService.getLettersForLetterGames('hindi', 'class2').length).toBeGreaterThan(0)
  })
})
