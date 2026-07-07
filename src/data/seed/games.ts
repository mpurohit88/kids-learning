import type { ActivityType, GradeLevel } from '../../types'

export interface GameMetadata {
  id: ActivityType
  title: string
  description: string
  emoji: string
  color: string
  route: string
  gradeLevels: GradeLevel[]
  badge?: string
}

export const GAME_CATALOG: GameMetadata[] = [
  {
    id: 'letter-recognition',
    title: 'Find the Letter',
    emoji: '🔤',
    color: '#66bb6a',
    route: '/games/letter-recognition',
    description: 'Listen and tap the matching letter',
    gradeLevels: ['lkg', 'class1', 'class2'],
  },
  {
    id: 'picture-word-match',
    title: 'Picture Match',
    emoji: '🖼️',
    color: '#42a5f5',
    route: '/games/picture-word-match',
    description: 'Match the picture to the right word',
    gradeLevels: ['lkg', 'class1', 'class2'],
  },
  {
    id: 'letter-tracing',
    title: 'Trace the Letter',
    emoji: '✏️',
    color: '#ab47bc',
    route: '/games/letter-tracing',
    description: 'Draw the letter shape on screen',
    gradeLevels: ['lkg', 'class1', 'class2'],
  },
  {
    id: 'exam-practice',
    title: 'Exam Practice',
    emoji: '📝',
    color: '#ef5350',
    route: '/games/exam-practice',
    description: 'Class 2 exam-style letter questions',
    gradeLevels: ['class2'],
    badge: 'Class 2',
  },
]
