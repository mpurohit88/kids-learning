import { useCallback, useEffect, useRef, useState } from 'react'
import { SayItGameCard } from '../../components/pronunciation/SayItGameCard'
import { SayItGameShell } from '../../components/pronunciation/SayItGameShell'
import { dataService } from '../../data'
import { usePlayerSessionGate } from '../../hooks/usePlayerSessionGate'
import { useTranslation } from '../../hooks/useTranslation'
import { useAppStore } from '../../store/useAppStore'
import { playCelebrationSound, prepareAudio, stopAudio } from '../../utils/audio'
import { buildRoundResult } from '../../utils/gameHelpers'
import { speakWordNormal, speakWordSlow } from '../../utils/pronunciationSpeech'
import {
  isVoiceRecordingSupported,
  playRecordingBlob,
  VoiceRecorder,
} from '../../utils/voiceRecorder'
import type { PronunciationWord } from '../../types'

type EchoPhase = 'listen' | 'record' | 'compare' | 'self-mark'

export function EchoMascotGame() {
  const { t } = useTranslation()
  const { ready, profileId, subject } = usePlayerSessionGate()
  const saveGameResult = useAppStore((state) => state.saveGameResult)
  const profile = dataService.getProfileById(profileId)
  const recorderRef = useRef(new VoiceRecorder())
  const playTokenRef = useRef(0)

  const roundCount =
    profile && subject ? dataService.getRoundCount(profile.ageGroup, subject) : 5

  const [words, setWords] = useState<PronunciationWord[]>([])
  const [roundIndex, setRoundIndex] = useState(0)
  const [completedCount, setCompletedCount] = useState(0)
  const [phase, setPhase] = useState<EchoPhase>('listen')
  const [isPlayingModel, setIsPlayingModel] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState<Blob | null>(null)
  const [micError, setMicError] = useState<string | null>(null)
  const [mood, setMood] = useState<'idle' | 'happy' | 'encourage'>('idle')
  const [message, setMessage] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [result, setResult] = useState(buildRoundResult(0, roundCount))

  const currentWord = words[roundIndex] ?? null
  const micSupported = isVoiceRecordingSupported()

  const resetRoundUi = useCallback(
    (word: PronunciationWord | null) => {
      setPhase('listen')
      setRecording(null)
      setMicError(null)
      setIsRecording(false)
      setIsPlayingModel(false)
      setIsPlayingRecording(false)
      setMood('idle')
      setShowConfetti(false)
      setMessage(
        word
          ? t('games.sayIt.echo.prompt', { word: word.word })
          : t('games.sayIt.echo.promptFallback'),
      )
    },
    [t],
  )

  const startGame = useCallback(() => {
    recorderRef.current.cleanup()
    const pool = dataService.getPronunciationRound(roundCount)
    if (pool.length === 0) return
    setWords(pool)
    setRoundIndex(0)
    setCompletedCount(0)
    setIsComplete(false)
    resetRoundUi(pool[0])
  }, [roundCount, resetRoundUi])

  useEffect(() => {
    if (!ready || subject !== 'english') return
    startGame()
  }, [ready, subject, startGame])

  useEffect(() => {
    const recorder = recorderRef.current
    return () => {
      recorder.cleanup()
      stopAudio()
    }
  }, [])

  const playModel = async (pace: 'slow' | 'normal' | 'both' = 'both') => {
    if (!currentWord || isRecording) return
    void prepareAudio()
    const token = ++playTokenRef.current
    stopAudio()
    setIsPlayingModel(true)
    setMessage(t('games.sayIt.echo.listening'))
    try {
      if (pace === 'slow' || pace === 'both') {
        await speakWordSlow(currentWord.word)
        if (token !== playTokenRef.current) return
      }
      if (pace === 'normal' || pace === 'both') {
        await speakWordNormal(currentWord.word)
        if (token !== playTokenRef.current) return
      }
      setPhase((current) => (current === 'listen' ? 'record' : current))
      setMessage(t('games.sayIt.echo.yourTurn'))
    } finally {
      if (token === playTokenRef.current) {
        setIsPlayingModel(false)
      }
    }
  }

  const startRecording = async () => {
    if (!currentWord || isRecording) return
    if (!micSupported) {
      setMicError(t('games.sayIt.echo.micUnsupported'))
      return
    }

    playTokenRef.current += 1
    stopAudio()
    setIsPlayingModel(false)
    setIsPlayingRecording(false)
    void prepareAudio()
    setMicError(null)
    setRecording(null)

    try {
      setIsRecording(true)
      setPhase('record')
      setMessage(t('games.sayIt.echo.recording'))
      await recorderRef.current.start()
    } catch {
      setIsRecording(false)
      setMicError(t('games.sayIt.echo.micDenied'))
      setMessage(t('games.sayIt.echo.micDenied'))
      setPhase('self-mark')
    }
  }

  const stopRecording = async () => {
    if (!recorderRef.current.isRecording()) return
    try {
      const blob = await recorderRef.current.stop()
      setIsRecording(false)
      if (!blob) {
        setMicError(t('games.sayIt.echo.recordFailed'))
        setMessage(t('games.sayIt.echo.recordFailed'))
        return
      }
      setRecording(blob)
      setPhase('self-mark')
      setMessage(t('games.sayIt.echo.selfMark'))
    } catch {
      setIsRecording(false)
      setMicError(t('games.sayIt.echo.recordFailed'))
    }
  }

  const replayRecording = async () => {
    if (!recording || isPlayingRecording) return
    playTokenRef.current += 1
    stopAudio()
    setIsPlayingModel(false)
    setIsPlayingRecording(true)
    try {
      await playRecordingBlob(recording)
    } finally {
      setIsPlayingRecording(false)
    }
  }

  const finishWord = (gotIt: boolean) => {
    if (gotIt) {
      setMood('happy')
      setMessage(t('games.sayIt.echo.gotIt'))
      setShowConfetti(true)
      playCelebrationSound()
    } else {
      playTokenRef.current += 1
      stopAudio()
      setIsPlayingModel(false)
      setIsPlayingRecording(false)
      setMood('encourage')
      setMessage(t('games.sayIt.echo.tryAgainReady'))
      setPhase('listen')
      setRecording(null)
      return
    }

    window.setTimeout(() => {
      const nextCompleted = completedCount + 1
      setCompletedCount(nextCompleted)
      const nextIndex = roundIndex + 1
      if (nextIndex >= words.length) {
        const roundResult = buildRoundResult(nextCompleted, words.length)
        setResult(roundResult)
        setIsComplete(true)
        if (profileId && subject) {
          saveGameResult({
            profileId,
            subject,
            challengeId: 'echo-mascot',
            correct: nextCompleted,
            total: words.length,
            stars: roundResult.stars,
          })
        }
        return
      }
      setRoundIndex(nextIndex)
      resetRoundUi(words[nextIndex])
    }, 700)
  }

  if (!ready || subject !== 'english' || !currentWord) return null

  const controlsLocked = isPlayingModel || isPlayingRecording

  return (
    <SayItGameShell
      title={t('challenges.echo-mascot.title')}
      challengeId="echo-mascot"
      roundIndex={roundIndex}
      roundCount={words.length}
      mood={mood}
      message={message || t('games.sayIt.echo.promptFallback')}
      isComplete={isComplete}
      result={result}
      onPlayAgain={startGame}
      showConfetti={showConfetti}
    >
      <SayItGameCard>
        {currentWord.priority ? (
          <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-800">
            {t('games.sayIt.priorityBadge')}
          </span>
        ) : null}

        {currentWord.emoji ? (
          <span className="text-5xl" aria-hidden>
            {currentWord.emoji}
          </span>
        ) : null}

        <p className="text-4xl font-bold capitalize text-slate-800 md:text-5xl">
          {currentWord.word}
        </p>

        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={() => void playModel('both')}
            disabled={isPlayingModel || isRecording || isPlayingRecording}
            className="rounded-3xl bg-sky-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-400 active:scale-95 disabled:opacity-60"
          >
            {t('games.sayIt.echo.hearWord')}
          </button>

          {micSupported ? (
            !isRecording ? (
              <button
                type="button"
                onClick={() => void startRecording()}
                disabled={isPlayingRecording}
                className="rounded-3xl bg-rose-500 px-5 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-rose-400 active:scale-95 disabled:opacity-60"
              >
                🎤 {t('games.sayIt.echo.tapToSpeak')}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void stopRecording()}
                className="animate-pulse rounded-3xl bg-rose-600 px-5 py-5 text-2xl font-bold text-white shadow-lg active:scale-95"
              >
                ⏹ {t('games.sayIt.echo.stopRecording')}
              </button>
            )
          ) : (
            <p className="text-center text-base font-semibold text-slate-500">
              {t('games.sayIt.echo.micUnsupported')}
            </p>
          )}

          {recording ? (
            <button
              type="button"
              onClick={() => void replayRecording()}
              disabled={isPlayingRecording || isRecording}
              className="rounded-3xl bg-teal-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-teal-400 active:scale-95 disabled:opacity-60"
            >
              {t('games.sayIt.echo.hearCompare')}
            </button>
          ) : null}

          {phase === 'self-mark' || (!micSupported && phase !== 'listen') ? (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => finishWord(false)}
                disabled={controlsLocked || isRecording}
                className="rounded-3xl bg-slate-200 px-4 py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-300 active:scale-95 disabled:opacity-60"
              >
                {t('games.sayIt.echo.tryAgain')}
              </button>
              <button
                type="button"
                onClick={() => finishWord(true)}
                disabled={controlsLocked || isRecording}
                className="rounded-3xl bg-green-500 px-4 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-400 active:scale-95 disabled:opacity-60"
              >
                {t('games.sayIt.echo.gotItButton')}
              </button>
            </div>
          ) : null}
        </div>

        {micError ? (
          <p className="text-center text-base font-semibold text-rose-600">{micError}</p>
        ) : null}
      </SayItGameCard>
    </SayItGameShell>
  )
}
