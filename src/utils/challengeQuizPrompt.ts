import type { SessionQuestion } from '../types'
import type { TranslateFn } from './translate'
import { getAdditionSpeechText, getQuestionAddends } from './additionProblems'

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
