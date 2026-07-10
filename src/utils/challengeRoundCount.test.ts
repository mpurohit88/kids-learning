import { describe, expect, it } from 'vitest'
import { dataService } from '../data'
import {
  buggyRoundCountFromQuestions,
  buildChallengeSessionKey,
  getChallengeRoundCount,
  shouldStartChallengeSession,
  wouldBuggyRoundCountCauseRestartLoop,
} from './challengeRoundCount'

describe('getChallengeRoundCount', () => {
  it('returns a stable count that does not depend on loaded questions', () => {
    const first = getChallengeRoundCount('counting-objects', 'lkg', 'maths')
    const second = getChallengeRoundCount('counting-objects', 'lkg', 'maths')
    expect(first).toBe(second)
    expect(first).toBeGreaterThan(0)
  })

  it('uses the heavy-and-light special case', () => {
    expect(getChallengeRoundCount('heavy-and-light', 'lkg', 'maths')).toBe(8)
  })

  it('falls back when session pieces are missing', () => {
    expect(getChallengeRoundCount('counting-objects', undefined, 'maths')).toBe(5)
    expect(getChallengeRoundCount('counting-objects', 'lkg', null)).toBe(5)
  })
})

describe('Count the Objects infinite-loop regression', () => {
  it('documents that questions.length || 5 changes after load (the old bug)', () => {
    const beforeLoad = buggyRoundCountFromQuestions(0)
    const afterLoad = buggyRoundCountFromQuestions(7)
    expect(beforeLoad).toBe(5)
    expect(afterLoad).toBe(7)
    expect(beforeLoad).not.toBe(afterLoad)
    expect(wouldBuggyRoundCountCauseRestartLoop(7)).toBe(true)
  })

  it('keeps roundCount stable before and after generating counting-objects questions', () => {
    const roundCountBefore = getChallengeRoundCount('counting-objects', 'lkg', 'maths')

    const questions = dataService.generateSession({
      subject: 'maths',
      challengeId: 'counting-objects',
      grade: 'lkg',
      count: roundCountBefore,
    })

    expect(questions.length).toBeGreaterThan(0)

    const roundCountAfter = getChallengeRoundCount('counting-objects', 'lkg', 'maths')
    expect(roundCountAfter).toBe(roundCountBefore)

    // Session hook must keep using the stable count — never questions.length || 5
    expect(roundCountAfter).not.toBe(buggyRoundCountFromQuestions(0))
    expect(wouldBuggyRoundCountCauseRestartLoop(questions.length)).toBe(true)
    expect(roundCountBefore).toBe(roundCountAfter)
  })

  it('only starts a challenge session once per session key', () => {
    const roundCount = getChallengeRoundCount('counting-objects', 'lkg', 'maths')
    const key = buildChallengeSessionKey({
      profileId: 'kid-1',
      subject: 'maths',
      challengeId: 'counting-objects',
      ageGroup: 'lkg',
      roundCount,
    })

    expect(shouldStartChallengeSession(null, key)).toBe(true)
    expect(shouldStartChallengeSession(key, key)).toBe(false)

    // Simulates the old loop: empty questions used fallback 5, then recount after load
    const keyBeforeQuestionsLoaded = buildChallengeSessionKey({
      profileId: 'kid-1',
      subject: 'maths',
      challengeId: 'counting-objects',
      ageGroup: 'lkg',
      roundCount: buggyRoundCountFromQuestions(0),
    })
    const keyAfterQuestionsLoaded = buildChallengeSessionKey({
      profileId: 'kid-1',
      subject: 'maths',
      challengeId: 'counting-objects',
      ageGroup: 'lkg',
      roundCount: buggyRoundCountFromQuestions(roundCount),
    })
    expect(keyBeforeQuestionsLoaded).not.toBe(keyAfterQuestionsLoaded)
    expect(shouldStartChallengeSession(keyBeforeQuestionsLoaded, keyAfterQuestionsLoaded)).toBe(
      true,
    )
  })

  it('builds the same session key when roundCount stays stable across question load', () => {
    const roundCount = getChallengeRoundCount('counting-objects', 'lkg', 'maths')
    const before = buildChallengeSessionKey({
      profileId: 'kid-laddu',
      subject: 'maths',
      challengeId: 'counting-objects',
      ageGroup: 'lkg',
      roundCount,
    })

    dataService.generateSession({
      subject: 'maths',
      challengeId: 'counting-objects',
      grade: 'lkg',
      count: roundCount,
    })

    const after = buildChallengeSessionKey({
      profileId: 'kid-laddu',
      subject: 'maths',
      challengeId: 'counting-objects',
      ageGroup: 'lkg',
      roundCount: getChallengeRoundCount('counting-objects', 'lkg', 'maths'),
    })

    expect(after).toBe(before)
    expect(shouldStartChallengeSession(before, after)).toBe(false)
  })

  it('registers Count the Objects on the challenge quiz route', () => {
    const challenge = dataService.getChallenge('maths', 'counting-objects')
    expect(challenge).toBeDefined()
    expect(challenge!.route).toBe('/games/challenge/counting-objects')
    expect(challenge!.gradeLevels).toContain('lkg')
  })

  it('keeps ChallengeQuizGame free of the questions.length || fallback anti-pattern', async () => {
    const { readFileSync } = await import('node:fs')
    const { fileURLToPath } = await import('node:url')
    const { dirname, join } = await import('node:path')
    const dir = dirname(fileURLToPath(import.meta.url))
    const source = readFileSync(join(dir, '../games/ChallengeQuizGame.tsx'), 'utf8')

    // The loop was caused by feeding this into useGameSession({ roundCount })
    expect(source).not.toMatch(/useGameSession\(\s*\{[^}]*questions\.length\s*\|\|/s)
    expect(source).toMatch(/useGameSession\(\s*\{\s*roundCount,/s)
    expect(source).toContain('getChallengeRoundCount')
    expect(source).toContain('shouldStartChallengeSession')
    expect(source).toContain('buildChallengeSessionKey')
  })
})
