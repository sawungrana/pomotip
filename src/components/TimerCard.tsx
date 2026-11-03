import { MODE_LABEL, type Timer } from '../hooks/useTimer'
import { fmtClock } from '../lib/time'
import type { Settings, Task } from '../types'
import { MODES, MODE_UI } from './modeUI'

const SIZE = 280
const R = 124
const C = 2 * Math.PI * R

interface Props {
  timer: Timer
  settings: Settings
  activeTask: Task | null
}

function Clock({ ms }: { ms: number }) {
  return (
    <div aria-live="off" className="text-6xl font-extrabold sm:text-7xl">
      {fmtClock(ms)
        .split('')
        .map((ch, i) =>
          ch === ':' ? (
            <span key={i} className="clock-sep">
              :
            </span>
          ) : (
            <span key={i} className="clock-digit">
              {ch}
            </span>
          ),
        )}
    </div>
  )
}

export default function TimerCard({ timer, settings, activeTask }: Props) {
  const ui = MODE_UI[timer.mode]
  const running = timer.status === 'running'
  const progress = timer.totalMs > 0 ? timer.remainingMs / timer.totalMs : 0
  const dots = Array.from({ length: settings.longBreakInterval }, (_, i) => i)
  const filled = timer.cycle % settings.longBreakInterval

  return (
    <section className={`brutal ${ui.soft} p-4 sm:p-8`}>
      {/* mode tabs */}
      <div className="rounded-xl! flex gap-1 border-2 border-ink bg-paper p-1 shadow-none!">
        {MODES.map((m) => (
          <button
            key={m}
            onClick={() => timer.setMode(m)}
            className={`tab ${timer.mode === m ? MODE_UI[m].tabActive : 'hover:bg-cream'}`}
          >
            <span className="sm:hidden">{MODE_UI[m].label.split(' ')[0]}</span>
            <span className="hidden sm:inline">{MODE_UI[m].label}</span>
          </button>
        ))}
      </div>

      {/* ring + clock */}
      <div className="relative mx-auto mt-6 w-[min(72vw,300px)] sm:mt-8">
        <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="h-auto w-full -rotate-90">
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            strokeWidth={14}
            className="stroke-ink/10"
          />
          <circle
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={R}
            fill="none"
            strokeWidth={14}
            strokeLinecap="round"
            strokeDasharray={C}
            strokeDashoffset={C * (1 - progress)}
            className={`${ui.ring} ${running ? 'anim-pulse-ring' : ''}`}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Clock ms={timer.remainingMs} />
          <div className="mt-1 text-xs font-bold tracking-widest text-ink/60 uppercase sm:text-sm">
            {MODE_LABEL[timer.mode]}
          </div>
          {timer.mode === 'focus' && (
            <div className="mt-2 flex gap-1.5">
              {dots.map((i) => (
                <span
                  key={i}
                  className={`size-2.5 rounded-full border-2 border-ink ${
                    i < filled ? 'anim-pop bg-coral' : 'bg-paper'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* active task */}
      <div className="mt-4 px-2 text-center text-sm font-semibold text-ink/70">
        {activeTask ? (
          <span>
            Working on <span className="font-bold text-ink">{activeTask.title}</span>
          </span>
        ) : (
          <span>No task selected — just focus</span>
        )}
      </div>

      {/* controls */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={running ? timer.pause : timer.start}
          className={`btn ${ui.solid} ${ui.btnText} px-10 py-3 text-lg`}
        >
          {running ? 'Pause' : timer.status === 'paused' ? 'Resume' : 'Start'}
        </button>
        <button onClick={timer.reset} className="btn bg-paper px-4 py-3 text-sm">
          Reset
        </button>
        <button onClick={timer.skip} className="btn bg-paper px-4 py-3 text-sm">
          Skip
        </button>
      </div>
    </section>
  )
}
