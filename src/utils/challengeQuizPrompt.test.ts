import { describe, expect, it } from 'vitest'
import { generateMathsQuestions } from '../engine/generators/maths'
import { generateSession } from '../engine/questionEngine'
import { LocalChallengeRepository } from '../data/repositories/local/challengeRepository'
import { LocalContentRepository } from '../data/repositories/local/contentRepository'
import { LocalGameSettingsRepository } from '../data/repositories/local/gameSettingsRepository'
import { LocalMathsRepository } from '../data/repositories/local/mathsRepository'
import type { SessionQuestion } from '../types'
import type { TranslateFn } from './translate'
import {
  getAdditionSpeechText,
  getQuestionAddends,
} from './additionProblems'
import {
  getChallengeQuizDisplayPrompt,
  getChallengeQuizSpeechText,
  isHeavyAndLightQuestion,
} from './challengeQuizPrompt'

const mockT: TranslateFn = (key, _params, fallback) => {
  const translations: Record<string, string> = {
    'maths.whichIsHeavier': 'Which is heavier?',
    'maths.whichIsLighter': 'Which is lighter?',
    'maths.or': 'or',
  }

  return translations[key] ?? fallback ?? key
}

const heavyAndLightQuestion: SessionQuestion = {
  id: 'hl-beach-ball-heavy',
  prompt: 'Which is heavier?',
  promptHint: 'Which is heavier? The beach ball or the balloon?',
  visualItems: [
    { label: 'Beach ball', emoji: '🏐' },
    { label: 'Balloon', emoji: '🎈' },
  ],
  options: [
    { id: 'beach-ball', text: 'Beach ball', emoji: '🏐' },
    { id: 'balloon', text: 'Balloon', emoji: '🎈' },
  ],
  correctOptionId: 'beach-ball',
}

const additionQuestion: SessionQuestion = {
  id: 'add-0-3-4',
  prompt: '3 + 4 = ?',
  emoji: '➕',
  options: [
    { id: '7', text: '7' },
    { id: '3', text: '3' },
    { id: '10', text: '10' },
    { id: '6', text: '6' },
  ],
  correctOptionId: '7',
  explanation: '3 + 4 = 7',
}

describe('challengeQuizPrompt', () => {
  it('detects heavy-and-light questions by visual items', () => {
    expect(isHeavyAndLightQuestion(heavyAndLightQuestion)).toBe(true)
    expect(isHeavyAndLightQuestion(additionQuestion)).toBe(false)
  })

  it('keeps the original prompt for generator maths questions', () => {
    expect(getChallengeQuizDisplayPrompt(additionQuestion, mockT)).toBe('3 + 4 = ?')
  })

  it('does not show heavy-and-light wording on addition questions', () => {
    const displayPrompt = getChallengeQuizDisplayPrompt(additionQuestion, mockT)
    expect(displayPrompt).not.toMatch(/which is heavier/i)
    expect(displayPrompt).not.toMatch(/which is lighter/i)
  })

  it('localizes heavy-and-light heavier prompts', () => {
    expect(getChallengeQuizDisplayPrompt(heavyAndLightQuestion, mockT)).toBe('Which is heavier?')
  })

  it('localizes heavy-and-light lighter prompts', () => {
    const lighterQuestion: SessionQuestion = {
      ...heavyAndLightQuestion,
      prompt: 'Which is lighter?',
      correctOptionId: 'balloon',
    }

    expect(getChallengeQuizDisplayPrompt(lighterQuestion, mockT)).toBe('Which is lighter?')
  })

  it('speaks the equation for addition questions', () => {
    expect(getChallengeQuizSpeechText(additionQuestion, mockT)).toBe('3 plus 4 equals what?')
  })

  it('parses addition prompts for vertical layout', () => {
    expect(getQuestionAddends({ ...additionQuestion, addends: undefined })).toEqual([3, 4])
    expect(getQuestionAddends({ ...additionQuestion, prompt: '38 + 79 + 12 = ?' })).toEqual([
      38, 79, 12,
    ])
    expect(getQuestionAddends(heavyAndLightQuestion)).toBeNull()
  })

  it('builds natural speech for vertical addition', () => {
    expect(getAdditionSpeechText([18, 20])).toBe('18 plus 20 equals what?')
    expect(getAdditionSpeechText([38, 79, 12])).toBe('38, 79, and 12 equal what?')
  })

  it('speaks a comparison sentence for heavy-and-light questions', () => {
    expect(getChallengeQuizSpeechText(heavyAndLightQuestion, mockT)).toBe(
      'Which is heavier? Beach ball or Balloon?',
    )
  })
})

describe('generated maths questions stay aligned with quiz display', () => {
  const generators = [
    'addition-within-10',
    'addition-within-100',
    'addition-three-digit',
    'addition-three-digit-two-digit',
    'addition-three-two-digit-numbers',
    'counting-objects',
    'number-recognition',
  ] as const

  for (const generatorId of generators) {
    it(`${generatorId} keeps prompt and numeric/word options consistent`, () => {
      const questions = generateMathsQuestions(generatorId, 8, 4)

      expect(questions.length).toBeGreaterThan(0)

      for (const question of questions) {
        expect(isHeavyAndLightQuestion(question)).toBe(false)
        expect(getChallengeQuizDisplayPrompt(question, mockT)).toBe(question.prompt)

        for (const option of question.options) {
          expect(option.text).not.toMatch(/which is heavier/i)
        }
      }
    })
  }

  it('addition-within-10 uses equation prompts with numeric answers', () => {
    const questions = generateMathsQuestions('addition-within-10', 20, 4)

    for (const question of questions) {
      expect(question.prompt).toMatch(/^\d+ \+ \d+ = \?$/)
      expect(getChallengeQuizDisplayPrompt(question, mockT)).toBe(question.prompt)

      const correctOption = question.options.find(
        (option) => option.id === question.correctOptionId,
      )
      expect(correctOption).toBeDefined()
      expect(correctOption!.text).toMatch(/^\d+$/)

      for (const option of question.options) {
        expect(option.text).toMatch(/^\d+$/)
      }
    }
  })
})

describe('questionEngine class 2 addition session', () => {
  const deps = {
    content: new LocalContentRepository(),
    gameSettings: new LocalGameSettingsRepository(),
    challenges: new LocalChallengeRepository(),
    maths: new LocalMathsRepository(),
  }

  it('shows only the addition hub on the class 2 maths menu', () => {
    const menu = deps.challenges.getChallenges('maths', 'class2')
    const additionPractices = deps.challenges.getGroupedChallenges('maths', 'addition', 'class2')

    expect(menu.map((challenge) => challenge.id)).toEqual(['addition'])
    expect(additionPractices.map((challenge) => challenge.id)).toEqual([
      'addition-within-10',
      'addition-within-100',
      'addition-three-digit',
      'addition-three-digit-two-digit',
      'addition-three-two-digit-numbers',
    ])
  })

  it('returns addition prompts that match their numeric options', () => {
    const questions = generateSession(
      {
        subject: 'maths',
        challengeId: 'addition-within-10',
        grade: 'class2',
        count: 10,
      },
      deps,
    )

    expect(questions).toHaveLength(10)

    for (const question of questions) {
      expect(question.prompt).toMatch(/^\d+ \+ \d+ = \?$/)
      expect(getChallengeQuizDisplayPrompt(question, mockT)).toBe(question.prompt)
      expect(getChallengeQuizDisplayPrompt(question, mockT)).not.toMatch(/which is heavier/i)

      const correct = question.options.find((option) => option.id === question.correctOptionId)
      expect(correct?.text).toMatch(/^\d+$/)
    }
  })

  it('returns heavy-and-light bank prompts separately from generator prompts', () => {
    const questions = generateSession(
      {
        subject: 'maths',
        challengeId: 'heavy-and-light',
        grade: 'lkg',
        count: 4,
      },
      deps,
    )

    expect(questions.length).toBeGreaterThan(0)

    for (const question of questions) {
      expect(isHeavyAndLightQuestion(question)).toBe(true)
      expect(getChallengeQuizDisplayPrompt(question, mockT)).toMatch(/which is (heavier|lighter)/i)
    }
  })
})
