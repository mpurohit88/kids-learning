import type { Language, Letter, VocabularyWord } from '../../types'
import { pickDistractors, shuffleArray } from '../../utils/arrayUtils'
import { dataService } from '../../data'
import { getFirstGrapheme } from '../../utils/textUtils'
import type { ExamQuestion, FirstLetterQuestion, LetterTypeQuestion } from './types'

function getLetterTypeLabels(language: Language) {
  if (language === 'kannada') {
    return { vowel: 'ಸ್ವರ (Vowel)', consonant: 'ವ್ಯಂಜನ (Consonant)' }
  }
  return { vowel: 'स्वर (Vowel)', consonant: 'व्यंजन (Consonant)' }
}

export function buildExamQuestions(
  language: Language,
  letters: Letter[],
  vocabulary: VocabularyWord[],
  roundCount: number,
): ExamQuestion[] {
  const letterByChar = new Map(letters.map((letter) => [letter.character, letter]))
  const examWords = vocabulary.filter((word) => {
    const first = getFirstGrapheme(word.word)
    return letterByChar.has(first)
  })

  const firstLetterPool: FirstLetterQuestion[] = examWords.map((word) => {
    const firstChar = getFirstGrapheme(word.word)
    const answer = letterByChar.get(firstChar)!
    const optionCount = dataService.getOptionCount('class2')
    const distractors = pickDistractors(letters, answer, optionCount)
    return {
      type: 'first-letter',
      word,
      options: shuffleArray([answer, ...distractors]),
      answerId: answer.id,
    }
  })

  const typeLabels = getLetterTypeLabels(language)
  const letterTypePool: LetterTypeQuestion[] = letters.map((letter) => ({
    type: 'letter-type',
    letter,
    options: shuffleArray([
      { id: 'vowel', label: typeLabels.vowel, value: 'vowel' as const },
      { id: 'consonant', label: typeLabels.consonant, value: 'consonant' as const },
    ]),
    answerId: letter.type,
  }))

  const mixed = shuffleArray([
    ...firstLetterPool.slice(0, Math.ceil(roundCount * 0.6)),
    ...letterTypePool.slice(0, Math.ceil(roundCount * 0.4)),
  ])

  return mixed.slice(0, roundCount)
}
