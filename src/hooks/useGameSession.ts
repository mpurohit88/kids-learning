import { useCallback, useRef, useState } from 'react'
import type { AnswerFeedbackType } from '../components/AnswerFeedbackOverlay'
import type { MascotMood } from '../components/Mascot'
import { useAppStore } from '../store/useAppStore'
import type { GameRoundResult } from '../types'
import { buildRoundResult } from '../utils/scoring'
import { playCelebrationSound, playEncouragementSound } from '../utils/audioPlayer'

interface UseGameSessionOptions {
  roundCount: number
  challengeId: string
  advanceDelay?: number
}

interface RecordAnswerParams {
  selectedId: string
  correctId: string
  correctMessage: string
  wrongMessage: string
  onAdvance: (nextIndex: number) => void
  onComplete?: (finalCorrect: number) => void
}

export function useGameSession({
  roundCount,
  challengeId,
  advanceDelay = 1500,
}: UseGameSessionOptions) {
  const profileId = useAppStore((state) => state.profileId)
  const subject = useAppStore((state) => state.subject)
  const saveGameResult = useAppStore((state) => state.saveGameResult)

  const [roundIndex, setRoundIndex] = useState(0)
  const [correctCount, setCorrectCount] = useState(0)
  const [wrongCount, setWrongCount] = useState(0)
  const [mood, setMood] = useState<MascotMood>('idle')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isLocked, setIsLocked] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [challengeSession, setChallengeSession] = useState(0)
  const [result, setResult] = useState<GameRoundResult>(buildRoundResult(0, roundCount))

  const roundIndexRef = useRef(roundIndex)
  const correctCountRef = useRef(correctCount)
  roundIndexRef.current = roundIndex
  correctCountRef.current = correctCount

  const resetSession = useCallback(() => {
    setRoundIndex(0)
    setCorrectCount(0)
    setWrongCount(0)
    setIsComplete(false)
    setResult(buildRoundResult(0, roundCount))
  }, [roundCount])

  const resetRoundUi = useCallback((prompt: string) => {
    setSelectedId(null)
    setIsLocked(false)
    setMood('idle')
    setMessage(prompt)
    setShowConfetti(false)
    setFeedbackType(null)
  }, [])

  const recordAnswer = useCallback(
    ({
      selectedId: choiceId,
      correctId,
      correctMessage,
      wrongMessage,
      onAdvance,
      onComplete,
    }: RecordAnswerParams) => {
      if (isLocked) return

      setSelectedId(choiceId)
      setIsLocked(true)

      const isCorrect = choiceId === correctId

      if (isCorrect) {
        setCorrectCount((count) => count + 1)
        setMood('happy')
        setMessage(correctMessage)
        setShowConfetti(true)
        setFeedbackType('success')
        playCelebrationSound()
      } else {
        setWrongCount((count) => count + 1)
        setMood('sad')
        setMessage(wrongMessage)
        setFeedbackType('wrong')
        playEncouragementSound()
      }

      window.setTimeout(() => {
        const nextIndex = roundIndexRef.current + 1
        const finalCorrect = correctCountRef.current + (isCorrect ? 1 : 0)

        if (nextIndex >= roundCount) {
          const roundResult = buildRoundResult(finalCorrect, roundCount)
          setResult(roundResult)
          setIsComplete(true)
          if (profileId && subject) {
            saveGameResult({
              profileId,
              subject,
              challengeId,
              correct: finalCorrect,
              total: roundCount,
              stars: roundResult.stars,
            })
          }
          onComplete?.(finalCorrect)
          return
        }

        setRoundIndex(nextIndex)
        onAdvance(nextIndex)
      }, advanceDelay)
    },
    [challengeId, saveGameResult, advanceDelay, isLocked, subject, profileId, roundCount],
  )

  const handlePlayAgain = useCallback((restartFn: () => void) => {
    setChallengeSession((session) => session + 1)
    restartFn()
  }, [])

  return {
    roundIndex,
    correctCount,
    wrongCount,
    mood,
    message,
    showConfetti,
    feedbackType,
    selectedId,
    isLocked,
    isComplete,
    challengeSession,
    result,
    resetSession,
    resetRoundUi,
    recordAnswer,
    handlePlayAgain,
    setRoundIndex,
  }
}
