import { useState } from 'react'
import { Volume2 } from 'lucide-react'
import type { Language, Letter } from '../../types'
import { playLetterSound } from '../../utils/audio'
import { getKannadaSoundHints } from '../../utils/kannadaLetterHints'
import { LetterDetailOverlay } from './LetterDetailOverlay'

interface LetterCardGridProps {
  letters: Letter[]
  subject: Language
  speechLang: string
}

const CARD_COLORS = [
  '#ef5350', '#ff7043', '#ffa726', '#f9a825',
  '#26c6da', '#42a5f5', '#66bb6a', '#7e57c2',
  '#ec407a', '#00acc1', '#43a047', '#5e35b1',
  '#f4511e', '#039be5', '#00897b', '#d81b60',
]

interface LetterCardProps {
  letter: Letter
  index: number
  subject: Language
  speechLang: string
  onTap: () => void
}

function LetterCard({ letter, index, subject, speechLang, onTap }: LetterCardProps) {
  const color = CARD_COLORS[index % CARD_COLORS.length]
  const isEnglish = subject === 'english'
  const hasBothCases = isEnglish && letter.lowerCase && letter.lowerCase !== letter.character

  // Sound name label: "KA", "AA", "a" etc.
  const soundLabel = isEnglish
    ? letter.name.toUpperCase()
    : subject === 'kannada'
      ? getKannadaSoundHints(letter.name).english?.toUpperCase() ?? letter.name.toUpperCase()
      : letter.name.toUpperCase()

  return (
    <div
      className="flex flex-col rounded-[1.25rem] border-4 border-white shadow-md"
      style={{ backgroundColor: color }}
    >
      {/* Tappable top area → opens detail */}
      <button
        type="button"
        onClick={onTap}
        className="flex flex-1 flex-col items-center justify-center gap-1 px-3 pt-4 pb-2 transition active:scale-95"
      >
        {/* Letter character(s) */}
        {hasBothCases ? (
          <div className="flex items-baseline gap-1 leading-none">
            <span className="text-3xl font-bold text-white drop-shadow sm:text-4xl">
              {letter.character}
            </span>
            <span className="text-xl font-bold text-white/75">
              {letter.lowerCase}
            </span>
          </div>
        ) : (
          <span className="text-3xl font-bold text-white drop-shadow sm:text-4xl">
            {letter.character}
          </span>
        )}

        {/* Sound name on its own line */}
        <span className="rounded-full bg-white/25 px-2 py-0.5 text-xs font-bold uppercase tracking-wide text-white">
          {soundLabel}
        </span>

        {/* Example emoji */}
        {letter.example ? (
          <span className="mt-1 text-2xl leading-none">{letter.example.emoji}</span>
        ) : null}

        {/* Example word */}
        {letter.example ? (
          <span className="mt-0.5 max-w-full truncate text-center text-xs font-semibold text-white/90">
            {letter.example.word}
          </span>
        ) : null}
      </button>

      {/* Sound button – always visible at bottom of card */}
      <div className="flex justify-center pb-3">
        <button
          type="button"
          aria-label={`Play ${letter.name}`}
          onClick={(e) => {
            e.stopPropagation()
            playLetterSound(letter, subject, { mode: 'phrase', speechLang })
          }}
          className="flex h-9 w-9 items-center justify-center rounded-xl border-2 border-white/40 bg-white/25 text-white transition hover:bg-white/45 active:scale-90"
        >
          <Volume2 size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 rounded bg-white/60" />
      <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-bold uppercase tracking-wider text-slate-600 shadow">
        {children}
      </span>
      <div className="h-px flex-1 rounded bg-white/60" />
    </div>
  )
}

export function LetterCardGrid({ letters, subject, speechLang }: LetterCardGridProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const vowels = letters.filter((l) => l.type === 'vowel')
  const consonants = letters.filter((l) => l.type === 'consonant')
  const isEnglish = subject === 'english'

  const vowelLabel = isEnglish ? 'Vowels' : subject === 'hindi' ? 'स्वर (Vowels)' : 'ಸ್ವರ (Vowels)'
  const consonantLabel = isEnglish
    ? 'Consonants'
    : subject === 'hindi'
      ? 'व्यंजन (Consonants)'
      : 'ವ್ಯಂಜನ (Consonants)'

  const renderGrid = (group: Letter[]) => (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
      {group.map((letter) => {
        const globalIndex = letters.indexOf(letter)
        return (
          <LetterCard
            key={letter.id}
            letter={letter}
            index={globalIndex}
            subject={subject}
            speechLang={speechLang}
            onTap={() => setActiveIndex(globalIndex)}
          />
        )
      })}
    </div>
  )

  return (
    <>
      <div className="flex flex-col gap-5">
        {vowels.length > 0 ? (
          <div className="flex flex-col gap-3">
            <SectionLabel>{vowelLabel}</SectionLabel>
            {renderGrid(vowels)}
          </div>
        ) : null}

        {consonants.length > 0 ? (
          <div className="flex flex-col gap-3">
            <SectionLabel>{consonantLabel}</SectionLabel>
            {renderGrid(consonants)}
          </div>
        ) : null}
      </div>

      {activeIndex !== null ? (
        <LetterDetailOverlay
          letters={letters}
          activeIndex={activeIndex}
          subject={subject}
          speechLang={speechLang}
          onClose={() => setActiveIndex(null)}
          onNavigate={setActiveIndex}
        />
      ) : null}
    </>
  )
}
