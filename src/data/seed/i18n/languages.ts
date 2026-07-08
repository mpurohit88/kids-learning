import type { MotherTongueLanguage } from '../../../types'

export const MOTHER_TONGUE_LANGUAGES: MotherTongueLanguage[] = [
  {
    id: 'en',
    label: 'English',
    nativeLabel: 'English',
    emoji: '🌐',
    isDefault: true,
  },
  {
    id: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    emoji: '🇮🇳',
  },
  {
    id: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    emoji: '🌸',
  },
]

export const DEFAULT_UI_LOCALE = 'en'

export const UI_LOCALE_STORAGE_KEY = 'kids-language-learning-locale'
