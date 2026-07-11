import type { ReactNode } from 'react'

interface SayItGameCardProps {
  children: ReactNode
  onPointerDown?: () => void
}

export function SayItGameCard({ children, onPointerDown }: SayItGameCardProps) {
  return (
    <div
      className="flex w-full max-w-xl flex-col items-center gap-3 rounded-[2rem] border-4 border-white bg-white px-4 py-5 shadow-xl md:gap-4 md:px-6 md:py-6"
      onPointerDown={onPointerDown}
    >
      {children}
    </div>
  )
}
