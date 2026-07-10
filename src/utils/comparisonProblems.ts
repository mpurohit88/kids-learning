import comparisonSeed from '../data/seed/subjects/comparison.json'
import { pickRandomItems, shuffleArray } from './arrayUtils'
import { pickUniqueByKey } from './uniqueSelection'
import type { ComparisonPayload, ComparisonSymbol, SessionQuestion } from '../types'

interface ComparePair {
  left: number
  right: number
}

interface CompleteStatement {
  left: number
  symbol: ComparisonSymbol
}

const seedPairs = comparisonSeed.comparePairs as ComparePair[]
const seedStatements = comparisonSeed.completeStatements as CompleteStatement[]
const compareConfig = comparisonSeed.generators['compare-numbers']
const completeConfig = comparisonSeed.generators['complete-comparison']

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pairKey(left: number, right: number): string {
  return `${left}:${right}`
}

function statementKey(left: number, symbol: ComparisonSymbol): string {
  return `${left}${symbol}`
}

function correctSymbol(left: number, right: number): ComparisonSymbol {
  return left > right ? '>' : '<'
}

function formatComparePrompt(left: number, right: number): string {
  return `${left} ○ ${right}`
}

function formatCompletePrompt(left: number, symbol: ComparisonSymbol): string {
  return `${left} ${symbol} ○`
}

function symbolOptions(): { id: string; text: string }[] {
  return shuffleArray([
    { id: '>', text: '>' },
    { id: '<', text: '<' },
  ])
}

function isValidCompleteAnswer(
  left: number,
  symbol: ComparisonSymbol,
  answer: number,
): boolean {
  return symbol === '>' ? left > answer : left < answer
}

function pickCompleteAnswer(left: number, symbol: ComparisonSymbol): number | null {
  const { answerMin, answerMax } = completeConfig

  for (let attempt = 0; attempt < 40; attempt += 1) {
    const candidate = randomInt(answerMin, answerMax)
    if (candidate !== left && isValidCompleteAnswer(left, symbol, candidate)) {
      return candidate
    }
  }

  // Deterministic fallbacks near the boundary.
  if (symbol === '>') {
    if (left - 1 >= answerMin) return left - 1
    return null
  }

  if (left + 1 <= answerMax) return left + 1
  return null
}

function buildCompleteOptions(
  left: number,
  symbol: ComparisonSymbol,
  correct: number,
  optionCount: number,
): { id: string; text: string }[] {
  const { answerMin, answerMax } = completeConfig
  const pool = new Set<number>()
  const needed = Math.max(optionCount - 1, 1)

  const tryAdd = (candidate: number) => {
    if (candidate < 1 || candidate === correct) return
    if (isValidCompleteAnswer(left, symbol, candidate)) return
    pool.add(candidate)
  }

  // `left` itself is never a valid fill-in for left ? ○
  tryAdd(left)

  for (let delta = 1; delta <= 80 && pool.size < needed; delta += 1) {
    tryAdd(left + delta)
    tryAdd(left - delta)
  }

  const minProbe = Math.min(answerMin, Math.max(1, left - 50))
  const maxProbe = Math.max(answerMax, left + 50)
  let guard = 0
  while (pool.size < needed && guard < 120) {
    guard += 1
    tryAdd(randomInt(minProbe, maxProbe))
  }

  const distractors = pickRandomItems([...pool], Math.min(needed, pool.size))
  return shuffleArray([correct, ...distractors]).map((value) => ({
    id: String(value),
    text: String(value),
  }))
}

function createCompareQuestion(pair: ComparePair, index: number): SessionQuestion {
  const symbol = correctSymbol(pair.left, pair.right)
  const comparison: ComparisonPayload = {
    mode: 'symbol',
    left: pair.left,
    right: pair.right,
    symbol: null,
  }

  return {
    id: `compare-${index}-${pair.left}-${pair.right}`,
    prompt: formatComparePrompt(pair.left, pair.right),
    promptHint: formatComparePrompt(pair.left, pair.right),
    comparison,
    emoji: '⚖️',
    options: symbolOptions(),
    correctOptionId: symbol,
    explanation: `${pair.left} ${symbol} ${pair.right}`,
  }
}

function createCompleteQuestion(
  statement: CompleteStatement,
  index: number,
  optionCount: number,
): SessionQuestion | null {
  const answer = pickCompleteAnswer(statement.left, statement.symbol)
  if (answer === null) return null

  const comparison: ComparisonPayload = {
    mode: 'complete',
    left: statement.left,
    right: null,
    symbol: statement.symbol,
  }

  return {
    id: `complete-${index}-${statement.left}-${statement.symbol}-${answer}`,
    prompt: formatCompletePrompt(statement.left, statement.symbol),
    promptHint: formatCompletePrompt(statement.left, statement.symbol),
    comparison,
    emoji: '🔢',
    options: buildCompleteOptions(statement.left, statement.symbol, answer, optionCount),
    correctOptionId: String(answer),
    explanation: `${statement.left} ${statement.symbol} ${answer}`,
  }
}

function buildRandomComparePairs(count: number, exclude: Set<string>): ComparePair[] {
  const { minNumber, maxNumber } = compareConfig
  const pairs: ComparePair[] = []

  for (let attempt = 0; attempt < count * 20 && pairs.length < count; attempt += 1) {
    const left = randomInt(minNumber, maxNumber)
    let right = randomInt(minNumber, maxNumber)
    if (left === right) {
      right = left >= maxNumber ? left - 1 : left + 1
    }
    const key = pairKey(left, right)
    if (exclude.has(key)) continue
    exclude.add(key)
    pairs.push({ left, right })
  }

  return pairs
}

function buildRandomStatements(
  count: number,
  exclude: Set<string>,
): CompleteStatement[] {
  const { minNumber, maxNumber } = completeConfig
  const statements: CompleteStatement[] = []
  const symbols: ComparisonSymbol[] = ['>', '<']

  for (let attempt = 0; attempt < count * 20 && statements.length < count; attempt += 1) {
    const left = randomInt(minNumber, maxNumber)
    const symbol = symbols[attempt % 2]
    // Skip statements with no valid 3-digit-range answer.
    if (symbol === '>' && left <= completeConfig.answerMin) continue
    if (symbol === '<' && left >= completeConfig.answerMax) continue

    const key = statementKey(left, symbol)
    if (exclude.has(key)) continue
    exclude.add(key)
    statements.push({ left, symbol })
  }

  return statements
}

export function getQuestionComparison(
  question: SessionQuestion,
): ComparisonPayload | null {
  return question.comparison ?? null
}

export function generateCompareNumbers(
  count: number,
  _optionCount = 2,
): SessionQuestion[] {
  const used = new Set<string>()
  const fromSeed = pickUniqueByKey(seedPairs, count, (pair) => pairKey(pair.left, pair.right))

  for (const pair of fromSeed) {
    used.add(pairKey(pair.left, pair.right))
  }

  const needed = count - fromSeed.length
  const generated = needed > 0 ? buildRandomComparePairs(needed, used) : []
  const pairs = [...fromSeed, ...generated].slice(0, count)

  return pairs.map((pair, index) => createCompareQuestion(pair, index))
}

export function generateCompleteComparison(
  count: number,
  optionCount: number,
): SessionQuestion[] {
  const used = new Set<string>()
  const fromSeed = pickUniqueByKey(
    seedStatements,
    count,
    (statement) => statementKey(statement.left, statement.symbol),
  )

  for (const statement of fromSeed) {
    used.add(statementKey(statement.left, statement.symbol))
  }

  const needed = count - fromSeed.length
  const generated = needed > 0 ? buildRandomStatements(needed, used) : []
  const statements = [...fromSeed, ...generated].slice(0, count)

  const questions: SessionQuestion[] = []
  for (let index = 0; index < statements.length; index += 1) {
    const question = createCompleteQuestion(statements[index], index, Math.max(optionCount, 2))
    if (question) questions.push(question)
  }

  // Top up if some statements could not produce a valid answer.
  let guard = 0
  while (questions.length < count && guard < count * 10) {
    guard += 1
    const [extra] = buildRandomStatements(1, used)
    if (!extra) break
    const question = createCompleteQuestion(extra, questions.length, Math.max(optionCount, 2))
    if (question) questions.push(question)
  }

  return questions
}
