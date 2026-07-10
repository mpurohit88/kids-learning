import { describe, expect, it } from 'vitest'
import { generateMathsQuestions } from '../engine/generators/maths'
import {
  generateCompareNumbers,
  generateCompleteComparison,
  getQuestionComparison,
} from './comparisonProblems'

describe('comparison practice generators', () => {
  it('generates compare-numbers questions with > or < answers', () => {
    const questions = generateCompareNumbers(10, 2)
    const keys = new Set<string>()

    expect(questions).toHaveLength(10)

    for (const question of questions) {
      const comparison = getQuestionComparison(question)
      expect(comparison?.mode).toBe('symbol')
      expect(comparison?.left).toBeTypeOf('number')
      expect(comparison?.right).toBeTypeOf('number')
      expect(comparison?.left).not.toBe(comparison?.right)
      expect(question.options.map((option) => option.id).sort()).toEqual(['<', '>'])
      expect(['<', '>']).toContain(question.correctOptionId)

      const expected =
        comparison!.left > comparison!.right! ? '>' : '<'
      expect(question.correctOptionId).toBe(expected)
      keys.add(`${comparison!.left}:${comparison!.right}`)
    }

    expect(keys.size).toBe(10)
  })

  it('generates complete-comparison questions with valid numeric answers', () => {
    const questions = generateCompleteComparison(10, 4)
    expect(questions.length).toBe(10)

    for (const question of questions) {
      const comparison = getQuestionComparison(question)
      expect(comparison?.mode).toBe('complete')
      expect(comparison?.symbol === '>' || comparison?.symbol === '<').toBe(true)

      const answer = Number(question.correctOptionId)
      expect(Number.isNaN(answer)).toBe(false)

      if (comparison!.symbol === '>') {
        expect(comparison!.left).toBeGreaterThan(answer)
      } else {
        expect(comparison!.left).toBeLessThan(answer)
      }

      for (const option of question.options) {
        if (option.id === question.correctOptionId) continue
        const distractor = Number(option.id)
        if (comparison!.symbol === '>') {
          expect(comparison!.left > distractor).toBe(false)
        } else {
          expect(comparison!.left < distractor).toBe(false)
        }
      }
    }
  })

  it('wires compare generators through maths engine', () => {
    const compare = generateMathsQuestions('compare-numbers', 5, 2)
    const complete = generateMathsQuestions('complete-comparison', 5, 4)

    expect(compare).toHaveLength(5)
    expect(complete).toHaveLength(5)
    expect(compare.every((question) => question.comparison?.mode === 'symbol')).toBe(true)
    expect(complete.every((question) => question.comparison?.mode === 'complete')).toBe(true)
  })

  it('uses worksheet seed pairs when available', () => {
    const questions = generateCompareNumbers(15, 2)
    const fromKnownWorksheet = questions.filter(
      (question) =>
        (question.comparison?.left === 456 && question.comparison.right === 430) ||
        (question.comparison?.left === 896 && question.comparison.right === 893) ||
        (question.comparison?.left === 127 && question.comparison.right === 534),
    )
    expect(fromKnownWorksheet.length).toBeGreaterThanOrEqual(3)
  })
})
