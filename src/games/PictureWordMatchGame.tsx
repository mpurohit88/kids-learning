import { useCallback, useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { AnswerOptionButton } from '../components/game/AnswerOptionButton'
import { QuizGameShell } from '../components/game/QuizGameShell'
import { dataService } from '../data'
import { useGameSession } from '../hooks/useGameSession'
import { useTranslation } from '../hooks/useTranslation'
import { useAppStore } from '../store/useAppStore'
import { playAudio } from '../utils/audioPlayer'
import { pickDistractors, shuffleArray } from '../utils/arrayUtils'
import type { VocabularyWord } from '../types'
import { isLanguageSubject } from '../types'

export function PictureWordMatchGame() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)

  const profile = dataService.getProfileById(profileId)
  const content =
    subject && isLanguageSubject(subject)
      ? dataService.getLanguageContent(subject)
      : null
  const ageGroup = profile?.ageGroup
  const vocabulary = useMemo(() => {
    if (!subject || !ageGroup || !isLanguageSubject(subject)) return []
    return dataService.getVocabularyForProfile(subject, ageGroup)
  }, [subject, ageGroup])

  const roundCount = profile && subject ? dataService.getRoundCount(profile.ageGroup, subject) : 5
  const optionCount = profile && subject ? dataService.getOptionCount(profile.ageGroup, subject) : 3

  const [roundWords, setRoundWords] = useState<VocabularyWord[]>([])
  const [targetWord, setTargetWord] = useState<VocabularyWord | null>(null)
  const [options, setOptions] = useState<VocabularyWord[]>([])

  const session = useGameSession({
    roundCount,
    challengeId: 'picture-word-match',
  })

  const { resetSession, resetRoundUi, recordAnswer, handlePlayAgain } = session

  useEffect(() => {
    if (!profileId || !subject) {
      navigate('/', { replace: true })
    }
  }, [profileId, subject, navigate])

  const setupRound = useCallback(
    (index: number, wordsPool: VocabularyWord[]) => {
      const target = wordsPool[index % wordsPool.length]
      const distractors = pickDistractors(wordsPool, target, optionCount)
      const nextOptions = shuffleArray([target, ...distractors])

      setTargetWord(target)
      setOptions(nextOptions)
      resetRoundUi(t('games.pictureMatch.prompt', undefined, 'What word matches the picture?'))

      void playAudio(
        target.audioPath,
        target.word,
        content?.speechLang,
        target.transliteration,
      )
    },
    [content?.speechLang, optionCount, resetRoundUi, t],
  )

  const startGame = useCallback(() => {
    if (vocabulary.length === 0) return
    const shuffled = shuffleArray(vocabulary).slice(0, roundCount)
    const pool = shuffled.length > 0 ? shuffled : vocabulary
    setRoundWords(pool)
    resetSession()
    setupRound(0, pool)
  }, [vocabulary, roundCount, resetSession, setupRound])

  useEffect(() => {
    startGame()
  }, [startGame])

  const handleSelect = (wordId: string) => {
    if (!targetWord) return

    recordAnswer({
      selectedId: wordId,
      correctId: targetWord.id,
      correctMessage: 'Wonderful! You got it!',
      wrongMessage: 'Nice try! It was ' + targetWord.word,
      onAdvance: (nextIndex) => setupRound(nextIndex, roundWords),
    })
  }

  const replayAudio = () => {
    if (targetWord) {
      void playAudio(
        targetWord.audioPath,
        targetWord.word,
        content?.speechLang,
        targetWord.transliteration,
      )
    }
  }

  if (!profile || !content || !targetWord) return null

  return (
    <QuizGameShell
      title={t('games.pictureMatch.title', undefined, 'Picture Match')}
      roundIndex={session.roundIndex}
      roundCount={roundCount}
      correctCount={session.correctCount}
      wrongCount={session.wrongCount}
      isComplete={session.isComplete}
      challengeSession={session.challengeSession}
      feedbackType={session.feedbackType}
      showConfetti={session.showConfetti}
      mood={session.mood}
      message={session.message}
      result={session.result}
      onPlayAgain={() => handlePlayAgain(startGame)}
      onHearAgain={session.isLocked ? undefined : replayAudio}
      hearAgainLabel={t('common.hearWord', undefined, 'Hear Word')}
    >
      <motion.div
        key={targetWord.id}
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="flex h-48 w-48 flex-col items-center justify-center rounded-[2rem] border-4 border-white bg-white shadow-xl md:h-56 md:w-56"
      >
        <img
          src={targetWord.imagePath}
          alt=""
          className="h-28 w-28 object-contain"
          onError={(event) => {
            event.currentTarget.style.display = 'none'
          }}
        />
        <span className="text-7xl md:text-8xl">{targetWord.emoji}</span>
      </motion.div>

      <div
        className={`grid w-full max-w-3xl gap-4 ${
          optionCount === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-2'
        }`}
      >
        {options.map((word) => (
          <AnswerOptionButton
            key={word.id}
            id={word.id}
            correctId={targetWord.id}
            selectedId={session.selectedId}
            isLocked={session.isLocked}
            onClick={handleSelect}
            className="min-h-24 rounded-3xl border-4 border-white px-4 py-4 text-3xl font-bold shadow-lg transition md:min-h-28 md:text-4xl"
          >
            {word.word}
          </AnswerOptionButton>
        ))}
      </div>
    </QuizGameShell>
  )
}
