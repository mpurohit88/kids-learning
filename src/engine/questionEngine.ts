import { pickDistractors, pickRandomItems, shuffleArray } from '../utils/arrayUtils'
import type {
  AgeGroup,
  GenerateSessionInput,
  Language,
  SessionQuestion,
  Subject,
} from '../types'
import type {
  ChallengeRepository,
  ContentRepository,
  GameSettingsRepository,
  MathsRepository,
} from '../data/repositories/types'
import { generateMathsQuestions } from './generators/maths'

export interface QuestionEngineDependencies {
  content: ContentRepository
  gameSettings: GameSettingsRepository
  challenges: ChallengeRepository
  maths: MathsRepository
}

export function generateSession(
  input: GenerateSessionInput,
  deps: QuestionEngineDependencies,
): SessionQuestion[] {
  const challenge = deps.challenges.getChallenge(input.subject, input.challengeId)
  if (!challenge) return []

  const count =
    input.count ??
    deps.gameSettings.getRoundCount(input.grade, input.subject)

  if (challenge.source === 'generator' && challenge.generatorId) {
    const optionCount = deps.gameSettings.getOptionCount(input.grade, input.subject)
    return generateMathsQuestions(challenge.generatorId, count, optionCount)
  }

  if (challenge.source === 'bank' && input.subject === 'maths' && challenge.bankId) {
    return deps.maths.getSessionQuestions(
      challenge.bankId,
      input.grade,
      count,
    )
  }

  if (challenge.source === 'bank' && challenge.bankType) {
    return generateLanguageBankQuestions(
      input.subject,
      challenge.bankType,
      input.grade,
      count,
      deps,
    )
  }

  return []
}

function generateLanguageBankQuestions(
  subject: Subject,
  bankType: NonNullable<import('../types').ChallengeDefinition['bankType']>,
  grade: AgeGroup,
  count: number,
  deps: QuestionEngineDependencies,
): SessionQuestion[] {
  if (subject === 'maths' || subject === 'english') {
    return []
  }

  const language = subject as Language
  const optionCount = deps.gameSettings.getOptionCount(grade, subject)

  if (bankType === 'letter-recognition') {
    const letters = deps.content.getLettersForLetterGames(language, grade)
    const pool = pickRandomItems(letters, Math.min(count, letters.length))
    return pool.map((target, index) => {
      const distractors = pickDistractors(letters, target, optionCount)
      const options = shuffleArray([target, ...distractors]).map((letter) => ({
        id: letter.id,
        text: letter.character,
      }))
      return {
        id: `letter-${target.id}-${index}`,
        prompt: '',
        promptHint: target.name,
        audioPath: target.audioPath,
        options,
        correctOptionId: target.id,
        explanation: `The answer is ${target.character}`,
      }
    })
  }

  if (bankType === 'picture-word-match') {
    const words = deps.content.getVocabularyForProfile(language, grade)
    const pool = pickRandomItems(words, Math.min(count, words.length))
    return pool.map((target, index) => {
      const distractors = pickDistractors(words, target, optionCount)
      const options = shuffleArray([target, ...distractors]).map((word) => ({
        id: word.id,
        text: word.word,
      }))
      return {
        id: `word-${target.id}-${index}`,
        prompt: 'Which word matches the picture?',
        promptHint: target.transliteration,
        audioPath: target.audioPath,
        emoji: target.emoji,
        imagePath: target.imagePath,
        options,
        correctOptionId: target.id,
        explanation: `The answer is ${target.word}`,
      }
    })
  }

  return []
}
