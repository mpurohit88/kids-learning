import { useEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { ACCESSIBLE_EXAM_CURSOR_CLASS } from '../../utils/accessibleCursor'

type CursorMode = 'default' | 'pointer' | 'pencil'

interface AccessibleExamCursorProps {
  children: ReactNode
  className?: string
}

function hasFinePointer(): boolean {
  return window.matchMedia('(any-pointer: fine)').matches || window.matchMedia('(pointer: fine)').matches
}

function resolveCursorMode(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return 'default'
  if (target.closest('.math-notes-cursor')) return 'pencil'
  if (target.closest('button, a, [role="button"], label, summary, input[type="button"], input[type="submit"], select')) {
    return 'pointer'
  }
  return 'default'
}

export function AccessibleExamCursor({ children, className = '' }: AccessibleExamCursorProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: -100, y: -100 })
  const [mode, setMode] = useState<CursorMode>('default')
  const [isActive, setIsActive] = useState(false)

  useEffect(() => {
    const active = hasFinePointer()
    setIsActive(active)
    if (!active) return

    const handleMouseMove = (event: MouseEvent) => {
      setPosition({ x: event.clientX, y: event.clientY })
      setMode(resolveCursorMode(event.target))
    }

    const handleMouseLeave = () => {
      setPosition({ x: -100, y: -100 })
    }

    document.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.documentElement.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.documentElement.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [])

  useEffect(() => {
    if (!isActive) return

    document.body.classList.add(ACCESSIBLE_EXAM_CURSOR_CLASS)
    return () => {
      document.body.classList.remove(ACCESSIBLE_EXAM_CURSOR_CLASS)
    }
  }, [isActive])

  const follower = isActive ? (
    <div
      aria-hidden
      className={`accessible-exam-cursor-follower accessible-exam-cursor-follower--${mode}`}
      style={{ left: position.x, top: position.y }}
    />
  ) : null

  return (
    <div ref={rootRef} className={`${ACCESSIBLE_EXAM_CURSOR_CLASS} ${className}`.trim()}>
      {follower && typeof document !== 'undefined' ? createPortal(follower, document.body) : null}
      {children}
    </div>
  )
}
