import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, X, Volume2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { WhCheckpoint, WhExample } from '../../types'
import { useTranslation } from '../../hooks/useTranslation'
import { prepareAudio } from '../../utils/audio'
import {
  getQuestionWordMotherTonguePrompt,
  shouldShowMotherTonguePrompt,
  speakQuestionExample,
  splitQuestionPromptWords,
  type QuestionWordHighlightIndex,
} from '../../utils/questionWordSpeech'

export type WhExampleOverlayMode = 'normal' | 'explain'

interface WhExampleDetailOverlayProps {
  word: WhCheckpoint
  examples: WhExample[]
  activeIndex: number
  mode: WhExampleOverlayMode
  highlightedWordIndex: QuestionWordHighlightIndex | null
  onClose: () => void
  onNavigate: (index: number) => void
  onReplayExplain: () => void
}

function QuestionPromptWords({
  prompt,
  highlightedWordIndex,
}: {
  prompt: string
  highlightedWordIndex: QuestionWordHighlightIndex | null
}) {
  const words = splitQuestionPromptWords(prompt)
  const highlightSentence = highlightedWordIndex === -2

  return (
    <motion.div
      animate={{
        scale: highlightSentence ? 1.08 : 1,
      }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={`text-center leading-snug ${
        highlightSentence
          ? 'rounded-[1.75rem] bg-white/40 px-5 py-3 shadow-lg'
          : ''
      }`}
    >
      <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2">
        {words.map((word, index) => {
          const isActive = !highlightSentence && highlightedWordIndex === index
          return (
            <motion.span
              key={`${word}-${index}`}
              animate={{
                scale: isActive ? 1.28 : 1,
              }}
              transition={{ type: 'spring', stiffness: 420, damping: 24 }}
              className={`inline-block rounded-xl px-2 py-0.5 text-2xl font-bold text-white md:text-3xl ${
                isActive ? 'bg-white/40 shadow-lg' : 'bg-transparent'
              }`}
            >
              {word}
            </motion.span>
          )
        })}
      </p>
    </motion.div>
  )
}

export function WhExampleDetailOverlay({
  word,
  examples,
  activeIndex,
  mode,
  highlightedWordIndex,
  onClose,
  onNavigate,
  onReplayExplain,
}: WhExampleDetailOverlayProps) {
  const { t, locale } = useTranslation()
  const example = examples[activeIndex]
  const hasPrev = activeIndex > 0
  const hasNext = activeIndex < examples.length - 1
  const color = word.color ?? '#42a5f5'
  const motherTonguePrompt =
    example && shouldShowMotherTonguePrompt(locale)
      ? getQuestionWordMotherTonguePrompt(example.id, locale)
      : undefined

  const goToIndex = useCallback(
    (nextIndex: number) => {
      onNavigate(nextIndex)
    },
    [onNavigate],
  )

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' && hasPrev) goToIndex(activeIndex - 1)
      if (e.key === 'ArrowRight' && hasNext) goToIndex(activeIndex + 1)
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [activeIndex, goToIndex, hasPrev, hasNext, onClose])

  if (!example) return null

  const playExample = () => {
    void prepareAudio()
    if (mode === 'explain') {
      onReplayExplain()
      return
    }
    void speakQuestionExample(example.id, example.prompt, locale)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="relative w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.goBack')}
          className="absolute -top-3 -right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-slate-700 text-white shadow-lg transition hover:bg-slate-600"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          <motion.div
            key={example.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col items-center gap-4 rounded-[2rem] border-4 border-white px-6 py-8 shadow-2xl"
            style={{ backgroundColor: color }}
          >
            <p className="text-sm font-bold uppercase tracking-wide text-white/80">
              {t('learn.questionWords.exampleProgress', {
                current: example.order,
                total: examples.length,
              })}
            </p>

            <span className="text-7xl drop-shadow-lg" aria-hidden>
              {example.emoji}
            </span>

            {mode === 'explain' ? (
              <QuestionPromptWords
                prompt={example.prompt}
                highlightedWordIndex={highlightedWordIndex}
              />
            ) : (
              <p className="text-center text-2xl font-bold leading-snug text-white md:text-3xl">
                {example.prompt}
              </p>
            )}

            {motherTonguePrompt ? (
              <p className="text-center text-lg font-semibold leading-snug text-white/90 md:text-xl">
                {motherTonguePrompt}
              </p>
            ) : null}

            <p className="rounded-full bg-white/25 px-4 py-2 text-center text-sm font-semibold text-white md:text-base">
              {t(`learn.questionWords.contexts.${example.id}`)}
            </p>

            <button
              type="button"
              onClick={playExample}
              aria-label={
                mode === 'explain'
                  ? t('learn.questionWords.hearQuestionWordByWordAria')
                  : shouldShowMotherTonguePrompt(locale)
                    ? t('learn.questionWords.hearQuestionBoth')
                    : t('learn.questionWords.hearQuestion')
              }
              className="flex items-center gap-2 rounded-2xl border-2 border-white/50 bg-white/25 px-5 py-3 text-lg font-bold text-white transition hover:bg-white/40 active:scale-95"
            >
              <Volume2 size={22} />
              {mode === 'explain'
                ? t('learn.questionWords.hearQuestionWordByWord')
                : shouldShowMotherTonguePrompt(locale)
                  ? t('learn.questionWords.hearQuestionBoth')
                  : t('learn.questionWords.hearQuestion')}
            </button>
          </motion.div>
        </AnimatePresence>

        <div className="mt-4 flex items-center justify-between gap-3">
          <button
            type="button"
            disabled={!hasPrev}
            onClick={() => goToIndex(activeIndex - 1)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-white text-slate-700 shadow transition hover:bg-slate-50 disabled:opacity-40"
            aria-label={t('common.back')}
          >
            <ChevronLeft size={24} />
          </button>
          <span className="text-base font-bold text-white drop-shadow">
            {word.word}
          </span>
          <button
            type="button"
            disabled={!hasNext}
            onClick={() => goToIndex(activeIndex + 1)}
            className="flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-white bg-white text-slate-700 shadow transition hover:bg-slate-50 disabled:opacity-40"
            aria-label={t('learn.questionWords.nextExample')}
          >
            <ChevronRight size={24} />
          </button>
        </div>
      </motion.div>
    </div>
  )
}
