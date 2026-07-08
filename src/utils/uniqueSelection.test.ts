import { describe, expect, it } from 'vitest'
import { generateMathsQuestions } from '../engine/generators/maths'
import { generateSession } from '../engine/questionEngine'
import { LocalChallengeRepository } from '../data/repositories/local/challengeRepository'
import { LocalContentRepository } from '../data/repositories/local/contentRepository'
import { LocalGameSettingsRepository } from '../data/repositories/local/gameSettingsRepository'
import { LocalMathsRepository } from '../data/repositories/local/mathsRepository'
import {
  additionPairKey,
  buildAdditionPairPool,
  pickUniqueByKey,
} from './uniqueSelection'

describe('pickUniqueByKey', () => {
  it('returns items with unique keys only', () => {
    const pool = [
      { a: 10, b: 20 },
      { a: 20, b: 10 },
      { a: 11, b: 22 },
      { a: 12, b: 13 },
    ]

    const picked = pickUniqueByKey(pool, 3, ({ a, b }) => additionPairKey(a, b))

    expect(picked).toHaveLength(3)

    const keys = picked.map(({ a, b }) => additionPairKey(a, b))
    expect(new Set(keys).size).toBe(3)
    expect(keys.filter((key) => key === additionPairKey(10, 20))).toHaveLength(1)
  })

  it('never returns more items than requested', () => {
    const pool = buildAdditionPairPool(10, 100)
    const picked = pickUniqueByKey(pool, 10, ({ a, b }) => additionPairKey(a, b))

    expect(picked).toHaveLength(10)
  })
})

describe('buildAdditionPairPool', () => {
  it('builds two-digit pairs that sum to 100 or less', () => {
    const pool = buildAdditionPairPool(10, 100)

    expect(pool.length).toBeGreaterThan(0)

    for (const { a, b } of pool) {
      expect(a).toBeGreaterThanOrEqual(10)
      expect(b).toBeGreaterThanOrEqual(10)
      expect(a + b).toBeLessThanOrEqual(100)
    }
  })

  it('includes examples like 10 + 33 and 44 + 55', () => {
    const pool = buildAdditionPairPool(10, 100)
    const keys = new Set(pool.map(({ a, b }) => additionPairKey(a, b)))

    expect(keys.has(additionPairKey(10, 33))).toBe(true)
    expect(keys.has(additionPairKey(44, 55))).toBe(true)
  })
})

describe('addition-within-100 generator', () => {
  it('creates two-digit equations with unique combinations per session', () => {
    const questions = generateMathsQuestions('addition-within-100', 10, 4)

    expect(questions).toHaveLength(10)

    const pairKeys = questions.map((question) => {
      const match = question.prompt.match(/^(\d+) \+ (\d+) = \?$/)
      expect(match).not.toBeNull()

      const left = Number(match![1])
      const right = Number(match![2])

      expect(left).toBeGreaterThanOrEqual(10)
      expect(right).toBeGreaterThanOrEqual(10)
      expect(left + right).toBeLessThanOrEqual(100)

      return additionPairKey(left, right)
    })

    expect(new Set(pairKeys).size).toBe(10)
  })

  it('uses numeric answer options up to 100', () => {
    const questions = generateMathsQuestions('addition-within-100', 5, 4)

    for (const question of questions) {
      const correct = question.options.find((option) => option.id === question.correctOptionId)
      expect(correct).toBeDefined()
      expect(Number(correct!.text)).toBeLessThanOrEqual(100)
      expect(Number(correct!.text)).toBeGreaterThanOrEqual(20)
    }
  })
})

describe('addition-within-10 generator uses unique pairs', () => {
  it('returns unique equations within a session', () => {
    const questions = generateMathsQuestions('addition-within-10', 10, 4)
    const pairKeys = questions.map((question) => {
      const match = question.prompt.match(/^(\d+) \+ (\d+) = \?$/)
      expect(match).not.toBeNull()
      return additionPairKey(Number(match![1]), Number(match![2]))
    })

    expect(new Set(pairKeys).size).toBe(10)
  })
})

describe('questionEngine addition-within-100 session', () => {
  const deps = {
    content: new LocalContentRepository(),
    gameSettings: new LocalGameSettingsRepository(),
    challenges: new LocalChallengeRepository(),
    maths: new LocalMathsRepository(),
  }

  it('exposes the new class 2 challenge with unique two-digit questions', () => {
    const challenge = deps.challenges.getChallenge('maths', 'addition-within-100')

    expect(challenge).toBeDefined()
    expect(challenge?.gradeLevels).toContain('class2')

    const questions = generateSession(
      {
        subject: 'maths',
        challengeId: 'addition-within-100',
        grade: 'class2',
        count: 10,
      },
      deps,
    )

    expect(questions).toHaveLength(10)

    const pairKeys = questions.map((question) => {
      const match = question.prompt.match(/^(\d+) \+ (\d+) = \?$/)
      expect(match).not.toBeNull()
      return additionPairKey(Number(match![1]), Number(match![2]))
    })

    expect(new Set(pairKeys).size).toBe(10)
  })
})
