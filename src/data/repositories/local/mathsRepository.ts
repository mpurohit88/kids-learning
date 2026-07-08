import mathsQuestionBanks from '../../seed/subjects/mathsQuestionBanks.json'
import type { AgeGroup, MathsContent, MathsQuestionBankEntry, SessionQuestion } from '../../../types'
import { shuffleArray } from '../../../utils/arrayUtils'

const mathsContent = mathsQuestionBanks as MathsContent

export class LocalMathsRepository {
  getQuestionBank(bankId: string, grade: AgeGroup): MathsQuestionBankEntry[] {
    const bank = mathsContent.questionBanks[bankId] ?? []
    return bank.filter((question) => question.gradeLevels.includes(grade))
  }

  getSessionQuestions(bankId: string, grade: AgeGroup, count?: number): SessionQuestion[] {
    const bank = this.getQuestionBank(bankId, grade)
    const pool = count ? shuffleArray(bank).slice(0, Math.min(count, bank.length)) : shuffleArray(bank)

    return pool.map((entry) => ({
      id: entry.id,
      prompt: entry.prompt,
      promptHint: entry.promptHint,
      emoji: entry.emoji,
      visualItems: entry.visualItems,
      options: shuffleArray(entry.options),
      correctOptionId: entry.correctOptionId,
      explanation: entry.explanation,
    }))
  }
}
