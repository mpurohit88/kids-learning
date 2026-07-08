import { describe, expect, it } from 'vitest'
import { generateMathsQuestions } from '../engine/generators/maths'
import { additionOperandsKey } from './uniqueSelection'
import {
  generateAdditionThreeDigit,
  generateAdditionThreeDigitTwoDigit,
  generateAdditionThreeTwoDigitNumbers,
  getQuestionAddends,
} from './additionProblems'

describe('addition practice generators', () => {
  it('generates unique three-digit pairs without carry', () => {
    const questions = generateAdditionThreeDigit(10, 4)
    const keys = new Set<string>()

    for (const question of questions) {
      const addends = getQuestionAddends(question)
      expect(addends).toHaveLength(2)
      expect(addends![0]).toBeGreaterThanOrEqual(100)
      expect(addends![1]).toBeGreaterThanOrEqual(100)

      const sum = addends!.reduce((total, value) => total + value, 0)
      expect(sum).toBeLessThanOrEqual(999)
      keys.add(additionOperandsKey(addends!))
    }

    expect(keys.size).toBe(10)
  })

  it('generates three-digit plus two-digit problems', () => {
    const questions = generateAdditionThreeDigitTwoDigit(8, 4)

    for (const question of questions) {
      const addends = getQuestionAddends(question)
      expect(addends).toHaveLength(2)
      expect(addends![0]).toBeGreaterThanOrEqual(100)
      expect(addends![1]).toBeGreaterThanOrEqual(10)
      expect(addends![1]).toBeLessThan(100)
    }
  })

  it('generates three two-digit addends like worksheet examples', () => {
    const questions = generateAdditionThreeTwoDigitNumbers(10, 4)
    const keys = new Set<string>()

    for (const question of questions) {
      const addends = getQuestionAddends(question)
      expect(addends).toHaveLength(3)

      for (const value of addends!) {
        expect(value).toBeGreaterThanOrEqual(10)
        expect(value).toBeLessThan(100)
      }

      keys.add(additionOperandsKey(addends!))
    }

    expect(keys.size).toBe(10)
  })

  it('creates addends on every generated addition question', () => {
    const generatorIds = [
      'addition-within-10',
      'addition-within-100',
      'addition-three-digit',
      'addition-three-digit-two-digit',
      'addition-three-two-digit-numbers',
    ] as const

    for (const generatorId of generatorIds) {
      const questions = generateMathsQuestions(generatorId, 5, 4)

      for (const question of questions) {
        expect(question.addends?.length).toBeGreaterThanOrEqual(2)
        expect(getQuestionAddends(question)).toEqual(question.addends)
      }
    }
  })
})
