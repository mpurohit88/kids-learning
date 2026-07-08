import { pickRandomItems, shuffleArray } from './arrayUtils'
import {
  additionOperandsKey,
  additionPairKey,
  buildAdditionPairPool,
  maybeSwapOperands,
  pickUniqueByKey,
  pickUniqueOperands,
} from './uniqueSelection'
import type { SessionQuestion } from '../types'

export function formatAdditionPrompt(addends: number[]): string {
  return `${addends.join(' + ')} = ?`
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function buildNumericOptions(correct: number, optionCount: number, max: number) {
  const pool = new Set<number>()

  for (const delta of [-33, -22, -11, -10, -3, -2, -1, 1, 2, 3, 10, 11, 22, 33]) {
    const value = correct + delta
    if (value > 0 && value <= max && value !== correct) {
      pool.add(value)
    }
  }

  while (pool.size < optionCount - 1) {
    const value = randomInt(1, max)
    if (value !== correct) {
      pool.add(value)
    }
  }

  const distractors = pickRandomItems([...pool], optionCount - 1)
  return shuffleArray([correct, ...distractors]).map((value) => ({
    id: String(value),
    text: String(value),
  }))
}

function createAdditionQuestion(
  addends: number[],
  index: number,
  idPrefix: string,
  optionCount: number,
  optionMax: number,
): SessionQuestion {
  const answer = addends.reduce((sum, value) => sum + value, 0)

  return {
    id: `${idPrefix}-${index}-${addends.join('-')}`,
    prompt: formatAdditionPrompt(addends),
    addends,
    emoji: '➕',
    options: buildNumericOptions(answer, optionCount, optionMax),
    correctOptionId: String(answer),
    explanation: `${addends.join(' + ')} = ${answer}`,
  }
}

function buildPairQuestions(
  poolMinOperand: number,
  maxSum: number,
  count: number,
  optionCount: number,
  optionMax: number,
  idPrefix: string,
): SessionQuestion[] {
  const pool = buildAdditionPairPool(poolMinOperand, maxSum)
  const pairs = pickUniqueByKey(pool, count, ({ a, b }) => additionPairKey(a, b))

  return pairs.map(({ a, b }, index) => {
    const { a: left, b: right } = maybeSwapOperands(a, b)
    return createAdditionQuestion([left, right], index, idPrefix, optionCount, optionMax)
  })
}

function randomTwoDigit(): number {
  return randomInt(10, 99)
}

function randomThreeDigitNoCarry(): number {
  const hundreds = randomInt(1, 9)
  const tens = randomInt(0, 9)
  const ones = randomInt(0, 9)
  return hundreds * 100 + tens * 10 + ones
}

function randomNoCarryThreeDigitPair(): number[] {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const left = randomThreeDigitNoCarry()
    const leftH = Math.floor(left / 100)
    const leftT = Math.floor(left / 10) % 10
    const leftO = left % 10
    const rightH = randomInt(0, 9 - leftH)
    const rightT = randomInt(0, 9 - leftT)
    const rightO = randomInt(0, 9 - leftO)
    const right = rightH * 100 + rightT * 10 + rightO

    if (right >= 100) {
      return [left, right]
    }
  }

  return [736, 213]
}

function randomNoCarryThreeDigitAndTwoDigit(): number[] {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    const left = randomThreeDigitNoCarry()
    const leftT = Math.floor(left / 10) % 10
    const leftO = left % 10
    const rightT = randomInt(0, 9 - leftT)
    const rightO = randomInt(0, 9 - leftO)
    const right = rightT * 10 + rightO

    if (right >= 10) {
      return [left, right]
    }
  }

  return [315, 53]
}

function buildOperandQuestions(
  count: number,
  optionCount: number,
  optionMax: number,
  idPrefix: string,
  generate: () => number[],
): SessionQuestion[] {
  const operandSets = pickUniqueOperands(count, generate)

  return operandSets.map((addends, index) =>
    createAdditionQuestion(addends, index, idPrefix, optionCount, optionMax),
  )
}

export function generateAdditionWithin10(count: number, optionCount: number): SessionQuestion[] {
  return buildPairQuestions(0, 10, count, optionCount, 10, 'add10')
}

export function generateAdditionTwoDigit(count: number, optionCount: number): SessionQuestion[] {
  return buildPairQuestions(10, 100, count, optionCount, 100, 'add2d')
}

export function generateAdditionThreeDigit(count: number, optionCount: number): SessionQuestion[] {
  return buildOperandQuestions(count, optionCount, 999, 'add3d3d', randomNoCarryThreeDigitPair)
}

export function generateAdditionThreeDigitTwoDigit(
  count: number,
  optionCount: number,
): SessionQuestion[] {
  return buildOperandQuestions(
    count,
    optionCount,
    999,
    'add3d2d',
    randomNoCarryThreeDigitAndTwoDigit,
  )
}

export function generateAdditionThreeTwoDigitNumbers(
  count: number,
  optionCount: number,
): SessionQuestion[] {
  return buildOperandQuestions(count, optionCount, 999, 'add3x2d', () => [
    randomTwoDigit(),
    randomTwoDigit(),
    randomTwoDigit(),
  ])
}

export function getQuestionAddends(question: SessionQuestion): number[] | null {
  if (question.addends && question.addends.length >= 2) {
    return question.addends
  }

  const match = question.prompt.match(/^([\d\s+]+) = \?$/)
  if (!match) return null

  const addends = match[1]
    .split('+')
    .map((value) => Number(value.trim()))
    .filter((value) => !Number.isNaN(value))

  return addends.length >= 2 ? addends : null
}

export function getAdditionSpeechText(addends: number[]): string {
  if (addends.length === 2) {
    return `${addends[0]} plus ${addends[1]} equals what?`
  }

  const leading = addends.slice(0, -1).join(', ')
  return `${leading}, and ${addends[addends.length - 1]} equal what?`
}

export { additionOperandsKey }
