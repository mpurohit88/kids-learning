import type { ReactNode } from 'react'

interface GameSideLayoutProps {
  sidePanel: ReactNode
  children: ReactNode
}

export function GameSideLayout({ sidePanel, children }: GameSideLayoutProps) {
  return (
    <div className="flex w-full flex-1 gap-3 md:gap-5">
      <aside className="w-[88px] shrink-0 md:w-32">{sidePanel}</aside>
      <div className="flex min-w-0 flex-1 flex-col items-center gap-3 md:gap-4">
        {children}
      </div>
    </div>
  )
}
