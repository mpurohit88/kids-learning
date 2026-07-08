import { useCallback, useEffect, useRef } from 'react'
import { Eraser } from 'lucide-react'

interface MathNotesPadProps {
  questionKey: string
  label: string
  clearLabel: string
  className?: string
}

export function MathNotesPad({
  questionKey,
  label,
  clearLabel,
  className = '',
}: MathNotesPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isDrawingRef = useRef(false)

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    context.clearRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#fffbeb'
    context.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  useEffect(() => {
    clearCanvas()
  }, [questionKey, clearCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0 || rect.height === 0) return
      canvas.width = rect.width
      canvas.height = rect.height
      clearCanvas()
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)
    return () => window.removeEventListener('resize', resizeCanvas)
  }, [clearCanvas, questionKey])

  const getPoint = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    }
  }

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    isDrawingRef.current = true
    canvas.setPointerCapture(event.pointerId)

    const point = getPoint(event)
    context.strokeStyle = '#1e40af'
    context.lineWidth = 3
    context.lineCap = 'round'
    context.lineJoin = 'round'
    context.beginPath()
    context.moveTo(point.x, point.y)
  }

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    const point = getPoint(event)
    context.lineTo(point.x, point.y)
    context.stroke()
  }

  const stopDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current) return
    isDrawingRef.current = false
    canvasRef.current?.releasePointerCapture(event.pointerId)
  }

  return (
    <div
      className={`flex min-h-56 w-full flex-col rounded-[2rem] border-4 border-white bg-amber-50 shadow-xl md:min-h-full md:w-56 lg:w-64 ${className}`}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-800">{label}</p>
        <button
          type="button"
          aria-label={clearLabel}
          onClick={clearCanvas}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-600 shadow transition hover:bg-amber-100"
        >
          <Eraser size={18} strokeWidth={2.5} />
        </button>
      </div>

      <canvas
        ref={canvasRef}
        aria-label={label}
        className="math-notes-cursor mx-3 mb-3 min-h-44 flex-1 touch-none rounded-2xl border-2 border-amber-200 bg-white"
        onPointerDown={startDrawing}
        onPointerMove={draw}
        onPointerUp={stopDrawing}
        onPointerLeave={stopDrawing}
      />
    </div>
  )
}
