import { useCallback, useEffect, useRef, useState } from 'react'
import { AnswerFeedbackOverlay } from '../../components/AnswerFeedbackOverlay'
import { SayItGameCard } from '../../components/pronunciation/SayItGameCard'
import { FillBlankSignChallenge } from '../../components/wordRace/FillBlankSignChallenge'
import type { CyclistPhase } from '../../components/wordRace/WordRaceCyclist'
import { WordRaceShell } from '../../components/wordRace/WordRaceShell'
import { dataService } from '../../data'
import { useAnswerFeedback } from '../../hooks/useAnswerFeedback'
import { usePlayerSessionGate } from '../../hooks/usePlayerSessionGate'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { playEncouragementSound } from '../../utils/audio'
import { buildRoundResult } from '../../utils/gameHelpers'
import type { WhCheckpointId, WordRaceRound } from '../../types'

const CHECKPOINT_COUNT = 6
const PEDAL_MS = 900
const RIDE_MS = 1500

export function WordRaceGame() {
  const { t } = useTranslation()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const saveGameResult = useAppStore((state) => state.saveGameResult)
  const advanceTimerRef = useRef<number | null>(null)

  const [rounds, setRounds] = useState<WordRaceRound[]>([])
  const [checkpointIndex, setCheckpointIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [bikeDisplayIndex, setBikeDisplayIndex] = useState(0)
  const [rideTargetIndex, setRideTargetIndex] = useState<number | null>(null)
  const [cyclistPhase, setCyclistPhase] = useState<CyclistPhase>('idle')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [wobbleId, setWobbleId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, CHECKPOINT_COUNT))

  const {
    mood,
    message,
    showConfetti,
    feedbackType,
    applyAnswerFeedback,
    resetFeedback,
    setMood,
    setMessage,
    setFeedbackType,
    setShowConfetti,
  } = useAnswerFeedback()

  const currentRound = rounds[checkpointIndex]

  const getWordLabel = useCallback(
    (id: WhCheckpointId) => t(`games.wordRace.checkpoints.${id}`, undefined, id),
    [t],
  )

  const getPromptForRound = useCallback(
    (_round: WordRaceRound) => t('games.wordRace.prompt.fillBlank'),
    [t],
  )

  const clearAdvanceTimer = useCallback(() => {
    if (advanceTimerRef.current !== null) {
      window.clearTimeout(advanceTimerRef.current)
      advanceTimerRef.current = null
    }
  }, [])

  const startGame = useCallback(() => {
    clearAdvanceTimer()
    const session = dataService.getWordRaceSession()
    if (session.length === 0) return
    setRounds(session)
    setCheckpointIndex(0)
    setCompletedCount(0)
    setBikeDisplayIndex(0)
    setRideTargetIndex(null)
    setCyclistPhase('idle')
    setSelectedId(null)
    setWobbleId(null)
    setIsLocked(false)
    setIsComplete(false)
    resetFeedback(getPromptForRound(session[0]))
  }, [clearAdvanceTimer, getPromptForRound, resetFeedback])

  useEffect(() => {
    if (!ready || subject !== 'english') return
    startGame()
  }, [ready, subject, startGame])

  useEffect(() => () => clearAdvanceTimer(), [clearAdvanceTimer])

  const advanceCheckpoint = useCallback(
    (nextCompleted: number) => {
      const nextIndex = checkpointIndex + 1
      if (nextIndex >= rounds.length) {
        const roundResult = buildRoundResult(nextCompleted, CHECKPOINT_COUNT)
        setResult(roundResult)
        setIsComplete(true)
        if (profileId && subject) {
          saveGameResult({
            profileId,
            subject,
            challengeId: 'word-race',
            correct: nextCompleted,
            total: CHECKPOINT_COUNT,
            stars: roundResult.stars,
          })
        }
        return
      }

      setCheckpointIndex(nextIndex)
      setBikeDisplayIndex(nextIndex)
      setRideTargetIndex(null)
      setCyclistPhase('idle')
      setSelectedId(null)
      setWobbleId(null)
      setIsLocked(false)
      resetFeedback(getPromptForRound(rounds[nextIndex]))
    },
    [
      checkpointIndex,
      getPromptForRound,
      profileId,
      resetFeedback,
      rounds,
      saveGameResult,
      subject,
    ],
  )

  const handleCorrect = useCallback(() => {
    setIsLocked(true)
    applyAnswerFeedback({
      isCorrect: true,
      correctMessage: t('games.wordRace.boost'),
      wrongMessage: '',
    })

    const nextDisplayIndex = checkpointIndex + 1
    setCyclistPhase('pedaling')

    advanceTimerRef.current = window.setTimeout(() => {
      setCyclistPhase('riding')
      setRideTargetIndex(nextDisplayIndex)

      advanceTimerRef.current = window.setTimeout(() => {
        setShowConfetti(false)
        setFeedbackType(null)
        const nextCompleted = completedCount + 1
        setCompletedCount(nextCompleted)
        advanceCheckpoint(nextCompleted)
      }, RIDE_MS)
    }, PEDAL_MS)
  }, [
    advanceCheckpoint,
    applyAnswerFeedback,
    checkpointIndex,
    completedCount,
    setFeedbackType,
    setShowConfetti,
    t,
  ])

  const handleWrong = useCallback(
    (pickedId: string) => {
      setCyclistPhase('wobble')
      setWobbleId(pickedId)
      setMood('encourage')
      setMessage(t('games.wordRace.wobble'))
      setFeedbackType('wrong')
      playEncouragementSound()

      window.setTimeout(() => {
        setCyclistPhase('idle')
        setWobbleId(null)
        setSelectedId(null)
        setFeedbackType(null)
        if (currentRound) {
          resetFeedback(getPromptForRound(currentRound))
        }
      }, 650)
    },
    [currentRound, getPromptForRound, resetFeedback, setFeedbackType, setMessage, setMood, t],
  )

  const handleChoiceSelect = (optionId: WhCheckpointId) => {
    if (!currentRound?.example || isLocked) return

    const answerId = currentRound.example.answerId ?? currentRound.checkpointId
    setSelectedId(optionId)

    if (optionId === answerId) {
      handleCorrect()
      return
    }

    handleWrong(optionId)
  }

  if (!ready || subject !== 'english' || !currentRound?.example) return null

  return (
    <WordRaceShell
      checkpointIndex={checkpointIndex}
      checkpointCount={CHECKPOINT_COUNT}
      completedCheckpoints={completedCount}
      bikeDisplayIndex={bikeDisplayIndex}
      rideTargetIndex={rideTargetIndex}
      cyclistPhase={cyclistPhase}
      mood={mood}
      message={message}
      isComplete={isComplete}
      result={result}
      onPlayAgain={startGame}
      showConfetti={showConfetti}
      overlay={<AnswerFeedbackOverlay type={feedbackType} />}
    >
      <SayItGameCard>
        <FillBlankSignChallenge
          example={currentRound.example}
          options={currentRound.options}
          selectedId={selectedId}
          wobbleId={wobbleId}
          isLocked={isLocked}
          getWordLabel={getWordLabel}
          onSelect={handleChoiceSelect}
        />
      </SayItGameCard>
    </WordRaceShell>
  )
}
