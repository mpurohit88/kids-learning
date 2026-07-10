const MAX_RECORD_MS = 3000

export function isVoiceRecordingSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  )
}

function pickMimeType(): string | undefined {
  const candidates = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg',
  ]
  return candidates.find((type) => MediaRecorder.isTypeSupported(type))
}

/**
 * In-memory mic recorder for pronunciation self-compare.
 * Recordings are never persisted — discard after playback.
 */
export class VoiceRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private stream: MediaStream | null = null
  private chunks: BlobPart[] = []
  private stopTimer: number | null = null

  async start(): Promise<void> {
    this.cleanup()

    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const mimeType = pickMimeType()
    this.mediaRecorder = mimeType
      ? new MediaRecorder(this.stream, { mimeType })
      : new MediaRecorder(this.stream)

    this.chunks = []
    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data)
    }

    this.mediaRecorder.start()
    this.stopTimer = window.setTimeout(() => {
      void this.stop()
    }, MAX_RECORD_MS)
  }

  async stop(): Promise<Blob | null> {
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }

    const recorder = this.mediaRecorder
    if (!recorder || recorder.state === 'inactive') {
      this.releaseStream()
      return null
    }

    const blob = await new Promise<Blob | null>((resolve) => {
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm'
        resolve(this.chunks.length > 0 ? new Blob(this.chunks, { type }) : null)
      }
      try {
        recorder.stop()
      } catch {
        resolve(null)
      }
    })

    this.releaseStream()
    this.mediaRecorder = null
    return blob
  }

  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  cleanup(): void {
    if (this.stopTimer !== null) {
      window.clearTimeout(this.stopTimer)
      this.stopTimer = null
    }
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop()
      } catch {
        // ignore
      }
    }
    this.mediaRecorder = null
    this.chunks = []
    this.releaseStream()
  }

  private releaseStream(): void {
    this.stream?.getTracks().forEach((track) => track.stop())
    this.stream = null
  }
}

export function playRecordingBlob(blob: Blob): Promise<void> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    const finish = () => {
      URL.revokeObjectURL(url)
      resolve()
    }
    audio.onended = finish
    audio.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Could not play recording'))
    }
    void audio.play().catch((error) => {
      URL.revokeObjectURL(url)
      reject(error)
    })
  })
}
