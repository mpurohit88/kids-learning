import type { SessionQuestion } from '../types'
import type { TranslateFn } from './translate'
import { getAdditionSpeechText, getQuestionAddends } from './additionProblems'
import { getQuestionComparison } from './comparisonProblems'

export function isHeavyAndLightQuestion(question: SessionQuestion): boolean {
  return (question.visualItems?.length ?? 0) >= 2
}

function isLighterPrompt(prompt: string): boolean {
  return prompt.toLowerCase().includes('lighter')
}

export function getChallengeQuizDisplayPrompt(
  question: SessionQuestion,
  t: TranslateFn,
): string {
  const comparison = getQuestionComparison(question)
  if (comparison?.mode === 'symbol') {
    return t('maths.compareNumbersPrompt', undefined, 'Which symbol is correct?')
  }
  if (comparison?.mode === 'complete') {
    return t('maths.completeComparisonPrompt', undefined, 'Which number makes this true?')
  }

  if (!isHeavyAndLightQuestion(question)) {
    return question.prompt
  }

  return isLighterPrompt(question.prompt)
    ? t('maths.whichIsLighter', undefined, 'Which is lighter?')
    : t('maths.whichIsHeavier', undefined, 'Which is heavier?')
}

export function getChallengeQuizSpeechText(
  question: SessionQuestion,
  t: TranslateFn,
): string {
  const comparison = getQuestionComparison(question)
  if (comparison?.mode === 'symbol' && comparison.right !== null) {
    return t(
      'maths.compareSpeech',
      { left: comparison.left, right: comparison.right },
      `Compare ${comparison.left} and ${comparison.right}. Greater than or less than?`,
    )
  }
  if (comparison?.mode === 'complete' && comparison.symbol) {
    return comparison.symbol === '>'
      ? t(
          'maths.completeSpeechGreater',
          { left: comparison.left },
          `Which number makes ${comparison.left} greater than blank?`,
        )
      : t(
          'maths.completeSpeechLess',
          { left: comparison.left },
          `Which number makes ${comparison.left} less than blank?`,
        )
  }

  if (isHeavyAndLightQuestion(question)) {
    const [first, second] = question.visualItems!
    const prompt = getChallengeQuizDisplayPrompt(question, t)
    const orWord = t('maths.or', undefined, 'or')
    return `${prompt} ${first.label} ${orWord} ${second.label}?`
  }

  const addends = getQuestionAddends(question)
  if (addends) {
    return getAdditionSpeechText(addends)
  }

  return question.promptHint ?? question.prompt
}

export { getQuestionAddends } from './additionProblems'
export { getQuestionComparison } from './comparisonProblems'
