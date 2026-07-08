import { pickRandomItems, shuffleArray } from '../../utils/arrayUtils'
import {
  generateAdditionThreeDigit,
  generateAdditionThreeDigitTwoDigit,
  generateAdditionThreeTwoDigitNumbers,
  generateAdditionTwoDigit,
  generateAdditionWithin10,
} from '../../utils/additionProblems'
import type { SessionQuestion } from '../../types'

const COUNTING_EMOJIS = ['🍎', '⭐', '🌸', '🐶', '🎈', '🍌', '🦋', '🍊']

const NUMBER_WORDS: Record<number, string> = {
  1: 'One',
  2: 'Two',
  3: 'Three',
  4: 'Four',
  5: 'Five',
  6: 'Six',
  7: 'Seven',
  8: 'Eight',
  9: 'Nine',
  10: 'Ten',
  11: 'Eleven',
  12: 'Twelve',
  13: 'Thirteen',
  14: 'Fourteen',
  15: 'Fifteen',
  16: 'Sixteen',
  17: 'Seventeen',
  18: 'Eighteen',
  19: 'Nineteen',
  20: 'Twenty',
}

function buildNumericOptions(correct: number, optionCount: number, max = 20) {
  const pool = Array.from({ length: max }, (_, index) => index + 1).filter(
    (value) => value !== correct,
  )
  const distractors = pickRandomItems(pool, optionCount - 1)
  return shuffleArray([correct, ...distractors]).map((value) => ({
    id: String(value),
    text: String(value),
  }))
}

function buildWordOptions(correct: number, optionCount: number) {
  const correctWord = NUMBER_WORDS[correct] ?? String(correct)
  const pool = Object.entries(NUMBER_WORDS)
    .filter(([value]) => Number(value) !== correct)
    .map(([value, label]) => ({ id: value, text: label }))
  const distractors = pickRandomItems(pool, optionCount - 1)
  return shuffleArray([
    { id: String(correct), text: correctWord },
    ...distractors,
  ])
}

export function generateMathsQuestions(
  generatorId: string,
  count: number,
  optionCount: number,
): SessionQuestion[] {
  switch (generatorId) {
    case 'addition-within-10':
      return generateAdditionWithin10(count, optionCount)
    case 'addition-within-100':
    case 'addition-two-digit':
      return generateAdditionTwoDigit(count, optionCount)
    case 'addition-three-digit':
      return generateAdditionThreeDigit(count, optionCount)
    case 'addition-three-digit-two-digit':
      return generateAdditionThreeDigitTwoDigit(count, optionCount)
    case 'addition-three-two-digit-numbers':
      return generateAdditionThreeTwoDigitNumbers(count, optionCount)
    case 'counting-objects':
      return generateCountingObjects(count, optionCount)
    case 'number-recognition':
      return generateNumberRecognition(count, optionCount)
    default:
      return []
  }
}

function generateCountingObjects(count: number, optionCount: number): SessionQuestion[] {
  const questions: SessionQuestion[] = []

  for (let index = 0; index < count; index += 1) {
    const objectCount = Math.floor(Math.random() * 10) + 1
    const emoji = COUNTING_EMOJIS[index % COUNTING_EMOJIS.length]
    const display = Array.from({ length: objectCount }, () => emoji).join(' ')

    questions.push({
      id: `count-${index}-${objectCount}`,
      prompt: 'How many objects do you see?',
      emoji: display,
      options: buildNumericOptions(objectCount, optionCount, 10),
      correctOptionId: String(objectCount),
      explanation: `There are ${objectCount} objects.`,
    })
  }

  return questions
}

function generateNumberRecognition(count: number, optionCount: number): SessionQuestion[] {
  const questions: SessionQuestion[] = []

  for (let index = 0; index < count; index += 1) {
    const number = Math.floor(Math.random() * 20) + 1
    questions.push({
      id: `num-${index}-${number}`,
      prompt: `Which word matches the number ${number}?`,
      emoji: String(number),
      options: buildWordOptions(number, optionCount),
      correctOptionId: String(number),
      explanation: `${number} is ${NUMBER_WORDS[number] ?? number}.`,
    })
  }

  return questions
}
