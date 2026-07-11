interface LearnSectionLabelProps {
  children: string
}

export function LearnSectionLabel({ children }: LearnSectionLabelProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 rounded bg-white/60" />
      <span className="rounded-full bg-white/80 px-4 py-1 text-sm font-bold uppercase tracking-wider text-slate-600 shadow">
        {children}
      </span>
      <div className="h-px flex-1 rounded bg-white/60" />
    </div>
  )
}
