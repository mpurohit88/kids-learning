import { useCallback, useState } from 'react'
import type { AnswerFeedbackType } from '../components/AnswerFeedbackOverlay'
import type { MascotMood } from '../components/Mascot'
import { playCelebrationSound, playEncouragementSound } from '../utils/audio'

interface ApplyAnswerFeedbackParams {
  isCorrect: boolean
  correctMessage: string
  wrongMessage: string
}

export function useAnswerFeedback() {
  const [mood, setMood] = useState<MascotMood>('idle')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [feedbackType, setFeedbackType] = useState<AnswerFeedbackType>(null)

  const resetFeedback = useCallback((prompt: string) => {
    setMood('idle')
    setMessage(prompt)
    setShowConfetti(false)
    setFeedbackType(null)
  }, [])

  const applyAnswerFeedback = useCallback(
    ({ isCorrect, correctMessage, wrongMessage }: ApplyAnswerFeedbackParams) => {
      if (isCorrect) {
        setMood('happy')
        setMessage(correctMessage)
        setShowConfetti(true)
        setFeedbackType('success')
        playCelebrationSound()
        return
      }

      setMood('sad')
      setMessage(wrongMessage)
      setShowConfetti(false)
      setFeedbackType('wrong')
      playEncouragementSound()
    },
    [],
  )

  return {
    mood,
    message,
    showConfetti,
    feedbackType,
    resetFeedback,
    applyAnswerFeedback,
    setMood,
    setMessage,
    setShowConfetti,
    setFeedbackType,
  }
}
