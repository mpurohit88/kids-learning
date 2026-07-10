import { Volume2 } from 'lucide-react'
import type { Language, Letter } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'
import { playLetterSound } from '../../utils/audio'
import { getKannadaSoundHints } from '../../utils/kannadaLetterHints'
import type { TranslateFn } from '../../utils/translate'

interface LetterReferenceTableProps {
  subject: Extract<Language, 'hindi' | 'english' | 'kannada'>
  letters: Letter[]
  speechLang: string
}

function ExampleCell({ example }: { example: Letter['example'] }) {
  if (!example) {
    return <span className="text-slate-400">—</span>
  }

  return (
    <div className="flex items-center gap-2">
      {example.imagePath ? (
        <img
          src={example.imagePath}
          alt=""
          className="h-8 w-8 shrink-0 rounded-lg bg-slate-50 object-contain p-0.5"
        />
      ) : (
        <span className="text-2xl">{example.emoji}</span>
      )}
      <div className="text-left">
        <p className="font-semibold text-slate-800">{example.word}</p>
        <p className="text-sm text-slate-500">{example.transliteration}</p>
      </div>
    </div>
  )
}

function SoundCell({
  letter,
  subject,
}: {
  letter: Letter
  subject: LetterReferenceTableProps['subject']
}) {
  if (subject === 'kannada') {
    const { hindi, english } = getKannadaSoundHints(letter.name)
    return (
      <div className="flex flex-col gap-0.5">
        {hindi ? (
          <span className="text-lg font-semibold text-slate-600">{hindi}</span>
        ) : null}
        <span className="text-sm font-bold uppercase text-blue-700">{english}</span>
      </div>
    )
  }

  return (
    <span className="text-lg font-semibold uppercase text-blue-700">{letter.name}</span>
  )
}

function LetterAudioButton({
  letter,
  subject,
  speechLang,
  t,
}: {
  letter: Letter
  subject: LetterReferenceTableProps['subject']
  speechLang: string
  t: TranslateFn
}) {
  const handlePlay = () => {
    playLetterSound(letter, subject, { mode: 'character', speechLang })
  }

  return (
    <button
      type="button"
      aria-label={t('common.hearLetter', { name: letter.name })}
      onClick={handlePlay}
      className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-orange-200 bg-orange-400 text-white shadow transition hover:bg-orange-300"
    >
      <Volume2 size={22} strokeWidth={2.5} />
    </button>
  )
}

function getTypeLabel(subject: Language, type: Letter['type'], t: TranslateFn) {
  if (subject === 'hindi') {
    return type === 'vowel' ? t('lettersTable.swar') : t('lettersTable.vyanjan')
  }
  if (subject === 'kannada') {
    return type === 'vowel' ? t('lettersTable.swara') : t('lettersTable.vyanjana')
  }
  return type === 'vowel' ? t('lettersTable.vowel') : t('lettersTable.consonant')
}

export function LetterReferenceTable({
  subject,
  letters,
  speechLang,
}: LetterReferenceTableProps) {
  const { t } = useTranslation()
  const isEnglish = subject === 'english'

  return (
    <div className="w-full overflow-hidden rounded-[1.5rem] border-4 border-white bg-white/90 shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 text-sm uppercase tracking-wide text-slate-600">
              {isEnglish ? (
                <>
                  <th className="px-4 py-3 font-bold">{t('lettersTable.capital')}</th>
                  <th className="px-4 py-3 font-bold">{t('lettersTable.small')}</th>
                </>
              ) : (
                <th className="px-4 py-3 font-bold">{t('lettersTable.letter')}</th>
              )}
              <th className="px-4 py-3 font-bold">{t('lettersTable.sound')}</th>
              <th className="px-4 py-3 font-bold">{t('lettersTable.example')}</th>
              <th className="px-4 py-3 font-bold">{t('lettersTable.type')}</th>
              <th className="px-4 py-3 font-bold">{t('lettersTable.listen')}</th>
            </tr>
          </thead>
          <tbody>
            {letters.map((letter, index) => (
              <tr
                key={letter.id}
                className={index % 2 === 0 ? 'bg-white' : 'bg-slate-50/80'}
              >
                {isEnglish ? (
                  <>
                    <td className="px-4 py-3 text-3xl font-bold text-slate-800">
                      {letter.character}
                    </td>
                    <td className="px-4 py-3 text-3xl font-bold text-slate-700">
                      {letter.lowerCase ?? letter.character.toLowerCase()}
                    </td>
                  </>
                ) : (
                  <td className="px-4 py-3 text-4xl font-bold text-slate-800">
                    {letter.character}
                  </td>
                )}
                <td className="px-4 py-3">
                  <SoundCell letter={letter} subject={subject} />
                </td>
                <td className="px-4 py-3">
                  <ExampleCell example={letter.example} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-bold ${
                      letter.type === 'vowel'
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {getTypeLabel(subject, letter.type, t)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <LetterAudioButton
                    letter={letter}
                    subject={subject}
                    speechLang={speechLang}
                    t={t}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
