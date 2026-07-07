export function getRequiredCorrect(totalQuestions: number, passThreshold: number) {
  return Math.ceil(totalQuestions * passThreshold)
}

export function getMaxWrongAllowed(totalQuestions: number, passThreshold: number) {
  return Math.max(totalQuestions - getRequiredCorrect(totalQuestions, passThreshold), 1)
}
