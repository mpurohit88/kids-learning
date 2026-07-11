import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from '../../hooks/useTranslation'
import { prepareAudio, speakText, stopAudio } from '../../utils/audio'
import {
  isVoiceRecordingSupported,
  playRecordingBlob,
  VoiceRecorder,
} from '../../utils/voiceRecorder'
import type { WhCheckpoint, WhExample } from '../../types'

interface EchoCheckpointChallengeProps {
  checkpoint: WhCheckpoint
  example?: WhExample
  onComplete: () => void
  onTryAgain: () => void
}

type EchoPhase = 'listen' | 'record' | 'self-mark'

export function EchoCheckpointChallenge({
  checkpoint,
  example,
  onComplete,
  onTryAgain,
}: EchoCheckpointChallengeProps) {
  const { t } = useTranslation()
  const recorderRef = useRef(new VoiceRecorder())
  const playTokenRef = useRef(0)

  const spokenPhrase = example?.spokenPhrase ?? checkpoint.word

  const [phase, setPhase] = useState<EchoPhase>('listen')
  const [isPlayingModel, setIsPlayingModel] = useState(false)
  const [isPlayingRecording, setIsPlayingRecording] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [recording, setRecording] = useState<Blob | null>(null)
  const [micError, setMicError] = useState<string | null>(null)

  const micSupported = isVoiceRecordingSupported()

  const resetEcho = useCallback(() => {
    setPhase('listen')
    setRecording(null)
    setMicError(null)
    setIsRecording(false)
    setIsPlayingModel(false)
    setIsPlayingRecording(false)
  }, [])

  useEffect(() => {
    resetEcho()
  }, [checkpoint.id, example?.id, resetEcho])

  useEffect(() => {
    const recorder = recorderRef.current
    return () => {
      recorder.cleanup()
      stopAudio()
    }
  }, [])

  const playModel = async () => {
    if (isRecording) return
    void prepareAudio()
    const token = ++playTokenRef.current
    stopAudio()
    setIsPlayingModel(true)
    try {
      await speakText(spokenPhrase, 'en-US')
      if (token !== playTokenRef.current) return
      setPhase((current) => (current === 'listen' ? 'record' : current))
    } finally {
      if (token === playTokenRef.current) {
        setIsPlayingModel(false)
      }
    }
  }

  const startRecording = async () => {
    if (isRecording) return
    if (!micSupported) {
      setMicError(t('games.wordRace.micUnsupported'))
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
      await recorderRef.current.start()
    } catch {
      setIsRecording(false)
      setMicError(t('games.wordRace.micDenied'))
      setPhase('self-mark')
    }
  }

  const stopRecording = async () => {
    if (!recorderRef.current.isRecording()) return
    try {
      const blob = await recorderRef.current.stop()
      setIsRecording(false)
      if (!blob) {
        setMicError(t('games.wordRace.recordFailed'))
        return
      }
      setRecording(blob)
      setPhase('self-mark')
    } catch {
      setIsRecording(false)
      setMicError(t('games.wordRace.recordFailed'))
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

  const handleTryAgain = () => {
    playTokenRef.current += 1
    stopAudio()
    resetEcho()
    onTryAgain()
  }

  const controlsLocked = isPlayingModel || isPlayingRecording

  return (
    <div className="flex w-full flex-col items-center gap-3">
      <span className="text-5xl" aria-hidden>
        {checkpoint.emoji}
      </span>
      <p className="text-4xl font-bold text-slate-800 md:text-5xl">{checkpoint.word}</p>
      {example ? (
        <p className="text-center text-lg font-semibold text-slate-500 md:text-xl">
          {example.prompt}
        </p>
      ) : null}

      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={() => void playModel()}
          disabled={isPlayingModel || isRecording || isPlayingRecording}
          className="rounded-3xl bg-sky-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-sky-400 active:scale-95 disabled:opacity-60"
        >
          {t('games.wordRace.hearWord')}
        </button>

        {micSupported ? (
          !isRecording ? (
            <button
              type="button"
              onClick={() => void startRecording()}
              disabled={isPlayingRecording}
              className="rounded-3xl bg-rose-500 px-5 py-5 text-2xl font-bold text-white shadow-lg transition hover:bg-rose-400 active:scale-95 disabled:opacity-60"
            >
              🎤 {t('games.wordRace.tapToSpeak')}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => void stopRecording()}
              className="animate-pulse rounded-3xl bg-rose-600 px-5 py-5 text-2xl font-bold text-white shadow-lg active:scale-95"
            >
              ⏹ {t('games.wordRace.stopRecording')}
            </button>
          )
        ) : (
          <p className="text-center text-base font-semibold text-slate-500">
            {t('games.wordRace.micUnsupported')}
          </p>
        )}

        {recording ? (
          <button
            type="button"
            onClick={() => void replayRecording()}
            disabled={isPlayingRecording || isRecording}
            className="rounded-3xl bg-teal-500 px-5 py-4 text-xl font-bold text-white shadow-lg transition hover:bg-teal-400 active:scale-95 disabled:opacity-60"
          >
            {t('games.wordRace.hearAgain')}
          </button>
        ) : null}

        {phase === 'self-mark' || (!micSupported && phase !== 'listen') ? (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleTryAgain}
              disabled={controlsLocked || isRecording}
              className="rounded-3xl bg-slate-200 px-4 py-4 text-lg font-bold text-slate-700 transition hover:bg-slate-300 active:scale-95 disabled:opacity-60"
            >
              {t('games.wordRace.tryAgain')}
            </button>
            <button
              type="button"
              onClick={onComplete}
              disabled={controlsLocked || isRecording}
              className="rounded-3xl bg-green-500 px-4 py-4 text-lg font-bold text-white shadow-lg transition hover:bg-green-400 active:scale-95 disabled:opacity-60"
            >
              {t('games.wordRace.gotIt')}
            </button>
          </div>
        ) : null}
      </div>

      {micError ? (
        <p className="text-center text-base font-semibold text-rose-600">{micError}</p>
      ) : null}
    </div>
  )
}
