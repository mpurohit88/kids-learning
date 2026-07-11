import { motion } from 'framer-motion'
import type { WhCheckpointId } from '../../types'
import type { CyclistPhase } from './WordRaceCyclist'
import { WordRaceCyclist } from './WordRaceCyclist'

const CHECKPOINT_LABELS: WhCheckpointId[] = ['what', 'who', 'where', 'when', 'why', 'how']

const CHECKPOINT_EMOJI: Record<WhCheckpointId, string> = {
  what: '❓',
  who: '🧑',
  where: '📍',
  when: '🕐',
  why: '💭',
  how: '✨',
}

const CHECKPOINT_COUNT = CHECKPOINT_LABELS.length

function checkpointLeftPercent(index: number): string {
  if (CHECKPOINT_COUNT <= 1) return '0%'
  const clamped = Math.max(0, Math.min(index, CHECKPOINT_COUNT - 1))
  return `${(clamped / (CHECKPOINT_COUNT - 1)) * 100}%`
}

interface WordRaceTrackProps {
  bikeDisplayIndex: number
  rideTargetIndex: number | null
  completedCheckpoints: number
  currentCheckpointIndex: number
  cyclistPhase: CyclistPhase
  getWordLabel: (id: WhCheckpointId) => string
}

export function WordRaceTrack({
  bikeDisplayIndex,
  rideTargetIndex,
  completedCheckpoints,
  currentCheckpointIndex,
  cyclistPhase,
  getWordLabel,
}: WordRaceTrackProps) {
  const rideFrom = bikeDisplayIndex
  const rideTo = rideTargetIndex ?? bikeDisplayIndex
  const isRiding = cyclistPhase === 'riding' && rideTargetIndex !== null

  return (
    <div className="w-full max-w-xl overflow-x-auto px-1">
      <div className="relative min-w-[320px] rounded-[1.5rem] border-4 border-white bg-gradient-to-b from-sky-200 to-emerald-200 px-3 py-4 shadow-lg md:min-w-0">
        <div className="relative h-20 md:h-24">
          <div className="absolute inset-x-2 top-[58%] h-3 -translate-y-1/2 rounded-full bg-slate-500/80 shadow-inner md:h-4" />
          <div className="absolute inset-x-2 top-[58%] flex -translate-y-1/2 justify-between px-1">
            {CHECKPOINT_LABELS.map((id, index) => {
              const isDone = index < completedCheckpoints
              const isCurrent = index === currentCheckpointIndex
              return (
                <div
                  key={id}
                  className={`flex h-10 w-10 flex-col items-center justify-center rounded-xl border-2 text-[10px] font-bold md:h-12 md:w-12 md:text-xs ${
                    isDone
                      ? 'border-amber-400 bg-amber-300 text-amber-900 shadow-md'
                      : isCurrent
                        ? 'border-white bg-white text-slate-700 shadow-md ring-2 ring-sky-400'
                        : 'border-white/70 bg-white/60 text-slate-500'
                  }`}
                  title={getWordLabel(id)}
                >
                  <span aria-hidden className="text-sm md:text-base">
                    {isDone ? '⭐' : CHECKPOINT_EMOJI[id]}
                  </span>
                </div>
              )
            })}
          </div>

          <motion.div
            className="absolute top-[38%] z-10 -translate-x-1/2 -translate-y-1/2"
            initial={false}
            animate={{
              left: isRiding
                ? checkpointLeftPercent(rideTo)
                : checkpointLeftPercent(rideFrom),
            }}
            transition={
              isRiding
                ? { duration: 1.5, ease: [0.25, 0.85, 0.35, 1] }
                : { duration: 0.15 }
            }
          >
            <WordRaceCyclist phase={cyclistPhase} />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
