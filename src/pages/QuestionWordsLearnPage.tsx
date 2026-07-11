import { useNavigate, useParams } from 'react-router-dom'
import { CircleHelp, Volume2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { AppShell } from '../components/layout/AppShell'
import { WhExampleDetailOverlay } from '../components/questionWords/WhExampleDetailOverlay'
import { ACTIVITIES_LEARN_TAB } from '../config/activityRoutes'
import { dataService } from '../data'
import { usePlayerSessionGate } from '../hooks/usePlayerSessionGate'
import { useTranslation } from '../hooks/useTranslation'
import { prepareAudio, speakText } from '../utils/audio'
import {
  cancelQuestionWordSpeech,
  getQuestionWordMotherTonguePrompt,
  shouldShowMotherTonguePrompt,
  speakQuestionExample,
  speakQuestionSlowWordByWord,
  type QuestionWordHighlightIndex,
} from '../utils/questionWordSpeech'
import type { WhCheckpointId } from '../types'
import type { WhExampleOverlayMode } from '../components/questionWords/WhExampleDetailOverlay'

const WORD_IDS: WhCheckpointId[] = ['what', 'who', 'where', 'when', 'why', 'how']

function isWhCheckpointId(value: string | undefined): value is WhCheckpointId {
  return WORD_IDS.includes(value as WhCheckpointId)
}

export function QuestionWordsHubPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const profile = dataService.getProfileById(profileId)
  const words = dataService.getQuestionWordsForLearn()

  if (!ready || subject !== 'english' || profile?.ageGroup !== 'class2') return null

  return (
    <AppShell
      title={t('learn.questionWords.title')}
      showBack
      backTo={ACTIVITIES_LEARN_TAB}
    >
      <div className="flex flex-1 flex-col gap-6">
        <p className="text-center text-xl text-slate-600">
          {t('learn.questionWords.hubIntro')}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {words.map((word) => (
            <button
              key={word.id}
              type="button"
              onClick={() => {
                void prepareAudio()
                navigate(`/learn/question-words/${word.id}`)
              }}
              className="flex min-h-40 flex-col items-center justify-center rounded-[2rem] border-4 border-white p-4 text-white shadow-lg transition hover:-translate-y-1 hover:shadow-xl active:scale-95"
              style={{ backgroundColor: word.color ?? '#42a5f5' }}
            >
              <span className="text-5xl" aria-hidden>
                {word.emoji}
              </span>
              <span className="mt-3 text-2xl font-bold">{word.word}</span>
              <span className="mt-2 text-center text-sm font-semibold text-white/90">
                {t(`learn.questionWords.words.${word.id}.hint`)}
              </span>
            </button>
          ))}
        </div>
      </div>
    </AppShell>
  )
}

export function QuestionWordLearnPage() {
  const { t, locale } = useTranslation()
  const { wordId } = useParams<{ wordId: string }>()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const profile = dataService.getProfileById(profileId)
  const [activeExampleIndex, setActiveExampleIndex] = useState<number | null>(null)
  const [overlayMode, setOverlayMode] = useState<WhExampleOverlayMode>('normal')
  const [highlightedWordIndex, setHighlightedWordIndex] =
    useState<QuestionWordHighlightIndex | null>(null)

  const word = isWhCheckpointId(wordId)
    ? dataService.getQuestionWordById(wordId)
    : undefined

  useEffect(() => () => cancelQuestionWordSpeech(), [])

  if (!ready || subject !== 'english' || profile?.ageGroup !== 'class2' || !word) return null

  const examples = [...word.examples].sort((a, b) => a.order - b.order)
  const color = word.color ?? '#42a5f5'

  const startExplainPlayback = (prompt: string) => {
    void prepareAudio()
    void speakQuestionSlowWordByWord(prompt, (index) => {
      setHighlightedWordIndex(index === -1 ? null : index)
    })
  }

  const closeOverlay = () => {
    cancelQuestionWordSpeech()
    setActiveExampleIndex(null)
    setOverlayMode('normal')
    setHighlightedWordIndex(null)
  }

  const openExample = (index: number, mode: WhExampleOverlayMode) => {
    const example = examples[index]
    if (!example) return
    void prepareAudio()
    if (mode === 'explain') {
      startExplainPlayback(example.prompt)
    } else {
      setHighlightedWordIndex(null)
      void speakQuestionExample(example.id, example.prompt, locale)
    }
    setOverlayMode(mode)
    setActiveExampleIndex(index)
  }

  const navigateExample = (index: number) => {
    const example = examples[index]
    if (!example) return
    setActiveExampleIndex(index)
    if (overlayMode === 'explain') {
      startExplainPlayback(example.prompt)
      return
    }
    void prepareAudio()
    void speakQuestionExample(example.id, example.prompt, locale)
  }

  const speakIntro = () => {
    const meaning = t(`learn.questionWords.words.${word.id}.meaning`)
    const whenToUse = t(`learn.questionWords.words.${word.id}.whenToUse`)
    void speakText(`${word.word}. ${meaning} ${whenToUse}`, 'en-US')
  }

  return (
    <AppShell
      title={t('learn.questionWords.wordTitle', { word: word.word })}
      showBack
      backTo={ACTIVITIES_LEARN_TAB}
    >
      <div className="flex flex-1 flex-col gap-5">
        <div
          className="flex flex-col items-center gap-3 rounded-[2rem] border-4 border-white px-5 py-6 text-white shadow-xl"
          style={{ backgroundColor: color }}
        >
          <span className="text-6xl" aria-hidden>
            {word.emoji}
          </span>
          <p className="text-4xl font-bold">{word.word}</p>
          <p className="text-center text-lg font-semibold text-white/95">
            {t(`learn.questionWords.words.${word.id}.meaning`)}
          </p>
          <p className="text-center text-base font-medium text-white/85">
            {t(`learn.questionWords.words.${word.id}.whenToUse`)}
          </p>
          <button
            type="button"
            onClick={() => {
              void prepareAudio()
              speakIntro()
            }}
            className="mt-1 flex items-center gap-2 rounded-2xl border-2 border-white/50 bg-white/25 px-5 py-3 text-lg font-bold transition hover:bg-white/40 active:scale-95"
          >
            <Volume2 size={20} />
            {t('learn.questionWords.hearIntro')}
          </button>
        </div>

        <div>
          <p className="mb-3 text-center text-lg font-bold text-slate-600">
            {t('learn.questionWords.examplesListTitle', { count: examples.length })}
          </p>
          <div className="flex flex-col gap-3">
            {examples.map((example, index) => (
              <div
                key={example.id}
                className="flex items-center gap-2 rounded-2xl border-4 border-white bg-white px-3 py-3 shadow-md md:gap-3 md:px-4 md:py-4"
              >
                <button
                  type="button"
                  onClick={() => openExample(index, 'normal')}
                  className="flex min-w-0 flex-1 items-center gap-3 text-left transition active:scale-[0.99] md:gap-4"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-lg font-bold text-slate-600">
                    {example.order}
                  </span>
                  <span className="text-3xl" aria-hidden>
                    {example.emoji}
                  </span>
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-lg font-bold text-slate-800 md:text-xl">
                      {example.prompt}
                    </span>
                    {shouldShowMotherTonguePrompt(locale) &&
                    getQuestionWordMotherTonguePrompt(example.id, locale) ? (
                      <span className="text-sm font-semibold text-slate-500 md:text-base">
                        {getQuestionWordMotherTonguePrompt(example.id, locale)}
                      </span>
                    ) : null}
                  </div>
                </button>

                <button
                  type="button"
                  aria-label={t('learn.questionWords.playQuestionAria')}
                  title={t('learn.questionWords.playQuestion')}
                  onClick={() => {
                    void prepareAudio()
                    void speakQuestionExample(example.id, example.prompt, locale)
                  }}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-sky-200 bg-sky-50 text-sky-600 transition hover:bg-sky-100 active:scale-95 md:h-12 md:w-12"
                >
                  <Volume2 size={22} strokeWidth={2.5} />
                </button>

                <button
                  type="button"
                  aria-label={t('learn.questionWords.explainQuestionAria')}
                  title={t('learn.questionWords.explainQuestion')}
                  onClick={() => openExample(index, 'explain')}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 transition hover:bg-amber-100 active:scale-95 md:h-12 md:w-12"
                >
                  <CircleHelp size={22} strokeWidth={2.5} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {activeExampleIndex !== null ? (
        <WhExampleDetailOverlay
          word={word}
          examples={examples}
          activeIndex={activeExampleIndex}
          mode={overlayMode}
          highlightedWordIndex={highlightedWordIndex}
          onClose={closeOverlay}
          onNavigate={navigateExample}
          onReplayExplain={() => {
            const example = examples[activeExampleIndex]
            if (example) startExplainPlayback(example.prompt)
          }}
        />
      ) : null}
    </AppShell>
  )
}
