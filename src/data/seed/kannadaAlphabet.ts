import type { Letter } from '../../types'

const BOTH: Letter['difficulty'] = ['lkg', 'class2']
const CLASS2: Letter['difficulty'] = ['class2']

/** Full Kannada aksharamala — 13 swaras, 2 yogavahas, 34 vyanjanas. */
export const KANNADA_ALPHABET: Letter[] = [
  // Swaras (vowels)
  { id: 'k-a', character: 'ಅ', name: 'a', type: 'vowel', audioPath: '/assets/audio/kannada/a.mp3', difficulty: BOTH },
  { id: 'k-aa', character: 'ಆ', name: 'aa', type: 'vowel', audioPath: '/assets/audio/kannada/aa.mp3', difficulty: BOTH },
  { id: 'k-i', character: 'ಇ', name: 'i', type: 'vowel', audioPath: '/assets/audio/kannada/i.mp3', difficulty: BOTH },
  { id: 'k-ii', character: 'ಈ', name: 'ee', type: 'vowel', audioPath: '/assets/audio/kannada/ee.mp3', difficulty: CLASS2 },
  { id: 'k-u', character: 'ಉ', name: 'u', type: 'vowel', audioPath: '/assets/audio/kannada/u.mp3', difficulty: BOTH },
  { id: 'k-uu', character: 'ಊ', name: 'oo', type: 'vowel', audioPath: '/assets/audio/kannada/oo.mp3', difficulty: CLASS2 },
  { id: 'k-ri', character: 'ಋ', name: 'ri', type: 'vowel', audioPath: '/assets/audio/kannada/ri.mp3', difficulty: CLASS2 },
  { id: 'k-e', character: 'ಎ', name: 'e', type: 'vowel', audioPath: '/assets/audio/kannada/e.mp3', difficulty: CLASS2 },
  { id: 'k-ae', character: 'ಏ', name: 'ae', type: 'vowel', audioPath: '/assets/audio/kannada/ae.mp3', difficulty: CLASS2 },
  { id: 'k-ai', character: 'ಐ', name: 'ai', type: 'vowel', audioPath: '/assets/audio/kannada/ai.mp3', difficulty: CLASS2 },
  { id: 'k-o', character: 'ಒ', name: 'o', type: 'vowel', audioPath: '/assets/audio/kannada/o.mp3', difficulty: CLASS2 },
  { id: 'k-oh', character: 'ಓ', name: 'oh', type: 'vowel', audioPath: '/assets/audio/kannada/oh.mp3', difficulty: CLASS2 },
  { id: 'k-au', character: 'ಔ', name: 'au', type: 'vowel', audioPath: '/assets/audio/kannada/au.mp3', difficulty: CLASS2 },
  { id: 'k-am', character: 'ಅಂ', name: 'am', type: 'vowel', audioPath: '/assets/audio/kannada/am.mp3', difficulty: CLASS2 },
  { id: 'k-ah', character: 'ಅಃ', name: 'ah', type: 'vowel', audioPath: '/assets/audio/kannada/ah.mp3', difficulty: CLASS2 },

  // Vyanjanas (consonants) — ka varga
  { id: 'k-ka', character: 'ಕ', name: 'ka', type: 'consonant', audioPath: '/assets/audio/kannada/ka.mp3', difficulty: BOTH },
  { id: 'k-kha', character: 'ಖ', name: 'kha', type: 'consonant', audioPath: '/assets/audio/kannada/kha.mp3', difficulty: CLASS2 },
  { id: 'k-ga', character: 'ಗ', name: 'ga', type: 'consonant', audioPath: '/assets/audio/kannada/ga.mp3', difficulty: BOTH },
  { id: 'k-gha', character: 'ಘ', name: 'gha', type: 'consonant', audioPath: '/assets/audio/kannada/gha.mp3', difficulty: CLASS2 },
  { id: 'k-nga', character: 'ಙ', name: 'nga', type: 'consonant', audioPath: '/assets/audio/kannada/nga.mp3', difficulty: CLASS2 },

  // cha varga
  { id: 'k-cha', character: 'ಚ', name: 'cha', type: 'consonant', audioPath: '/assets/audio/kannada/cha.mp3', difficulty: BOTH },
  { id: 'k-chha', character: 'ಛ', name: 'chha', type: 'consonant', audioPath: '/assets/audio/kannada/chha.mp3', difficulty: CLASS2 },
  { id: 'k-ja', character: 'ಜ', name: 'ja', type: 'consonant', audioPath: '/assets/audio/kannada/ja.mp3', difficulty: CLASS2 },
  { id: 'k-jha', character: 'ಝ', name: 'jha', type: 'consonant', audioPath: '/assets/audio/kannada/jha.mp3', difficulty: CLASS2 },
  { id: 'k-nya', character: 'ಞ', name: 'nya', type: 'consonant', audioPath: '/assets/audio/kannada/nya.mp3', difficulty: CLASS2 },

  // retroflex varga
  { id: 'k-ta-retro', character: 'ಟ', name: 'ta-retro', type: 'consonant', audioPath: '/assets/audio/kannada/ta-retro.mp3', difficulty: CLASS2 },
  { id: 'k-tha-retro', character: 'ಠ', name: 'tha-retro', type: 'consonant', audioPath: '/assets/audio/kannada/tha-retro.mp3', difficulty: CLASS2 },
  { id: 'k-da-retro', character: 'ಡ', name: 'da-retro', type: 'consonant', audioPath: '/assets/audio/kannada/da-retro.mp3', difficulty: CLASS2 },
  { id: 'k-dha-retro', character: 'ಢ', name: 'dha-retro', type: 'consonant', audioPath: '/assets/audio/kannada/dha-retro.mp3', difficulty: CLASS2 },
  { id: 'k-na-retro', character: 'ಣ', name: 'na-retro', type: 'consonant', audioPath: '/assets/audio/kannada/na-retro.mp3', difficulty: CLASS2 },

  // dental varga
  { id: 'k-ta', character: 'ತ', name: 'ta', type: 'consonant', audioPath: '/assets/audio/kannada/ta.mp3', difficulty: BOTH },
  { id: 'k-tha', character: 'ಥ', name: 'tha', type: 'consonant', audioPath: '/assets/audio/kannada/tha.mp3', difficulty: CLASS2 },
  { id: 'k-da', character: 'ದ', name: 'da', type: 'consonant', audioPath: '/assets/audio/kannada/da.mp3', difficulty: CLASS2 },
  { id: 'k-dha', character: 'ಧ', name: 'dha', type: 'consonant', audioPath: '/assets/audio/kannada/dha.mp3', difficulty: CLASS2 },
  { id: 'k-na', character: 'ನ', name: 'na', type: 'consonant', audioPath: '/assets/audio/kannada/na.mp3', difficulty: BOTH },

  // pa varga
  { id: 'k-pa', character: 'ಪ', name: 'pa', type: 'consonant', audioPath: '/assets/audio/kannada/pa.mp3', difficulty: CLASS2 },
  { id: 'k-pha', character: 'ಫ', name: 'pha', type: 'consonant', audioPath: '/assets/audio/kannada/pha.mp3', difficulty: CLASS2 },
  { id: 'k-ba', character: 'ಬ', name: 'ba', type: 'consonant', audioPath: '/assets/audio/kannada/ba.mp3', difficulty: CLASS2 },
  { id: 'k-bha', character: 'ಭ', name: 'bha', type: 'consonant', audioPath: '/assets/audio/kannada/bha.mp3', difficulty: CLASS2 },
  { id: 'k-ma', character: 'ಮ', name: 'ma', type: 'consonant', audioPath: '/assets/audio/kannada/ma.mp3', difficulty: BOTH },

  // semi-vowels and sibilants
  { id: 'k-ya', character: 'ಯ', name: 'ya', type: 'consonant', audioPath: '/assets/audio/kannada/ya.mp3', difficulty: CLASS2 },
  { id: 'k-ra', character: 'ರ', name: 'ra', type: 'consonant', audioPath: '/assets/audio/kannada/ra.mp3', difficulty: CLASS2 },
  { id: 'k-la', character: 'ಲ', name: 'la', type: 'consonant', audioPath: '/assets/audio/kannada/la.mp3', difficulty: CLASS2 },
  { id: 'k-va', character: 'ವ', name: 'va', type: 'consonant', audioPath: '/assets/audio/kannada/va.mp3', difficulty: CLASS2 },
  { id: 'k-sha', character: 'ಶ', name: 'sha', type: 'consonant', audioPath: '/assets/audio/kannada/sha.mp3', difficulty: CLASS2 },
  { id: 'k-sha2', character: 'ಷ', name: 'sha2', type: 'consonant', audioPath: '/assets/audio/kannada/sha2.mp3', difficulty: CLASS2 },
  { id: 'k-sa', character: 'ಸ', name: 'sa', type: 'consonant', audioPath: '/assets/audio/kannada/sa.mp3', difficulty: CLASS2 },
  { id: 'k-ha', character: 'ಹ', name: 'ha', type: 'consonant', audioPath: '/assets/audio/kannada/ha.mp3', difficulty: CLASS2 },
  { id: 'k-lla', character: 'ಳ', name: 'lla', type: 'consonant', audioPath: '/assets/audio/kannada/lla.mp3', difficulty: CLASS2 },
]
