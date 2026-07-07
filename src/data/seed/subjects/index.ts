import type { SubjectDefinition } from '../../../types'

export const SUBJECT_CATALOG: SubjectDefinition[] = [
  {
    id: 'hindi',
    title: 'Hindi',
    nativeName: 'हिन्दी',
    emoji: '🇮🇳',
    color: '#ff7043',
    description: 'Letters, words, and reading',
  },
  {
    id: 'kannada',
    title: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    emoji: '🌸',
    color: '#5c6bc0',
    description: 'Letters, words, and reading',
  },
  {
    id: 'english',
    title: 'English',
    nativeName: 'English',
    emoji: '📘',
    color: '#26a69a',
    description: 'Words and reading practice',
  },
  {
    id: 'maths',
    title: 'Maths',
    nativeName: 'Maths',
    emoji: '🔢',
    color: '#ffa726',
    description: 'Numbers, counting, and addition',
  },
]

export function getSubjectDefinition(subject: SubjectDefinition['id']) {
  return SUBJECT_CATALOG.find((entry) => entry.id === subject)
}
