import { useMemo, useState } from 'react'
import type { Session, Task } from '../types'
import {
  annualBuckets,
  dailyBuckets,
  monthlyBuckets,
  rangeTotals,
  taskFocusInRange,
  tasksCompletedInRange,
  weeklyBuckets,
  type TaskStat,
} from '../lib/stats'
import { DAY, fmtMinutes, startOfDay, startOfMonth, startOfWeek, startOfYear } from '../lib/time'
import BarChart from './BarChart'

type Tab = 'daily' | 'weekly' | 'monthly' | 'annual'
type GroupBy = 'time' | 'task'

const TABS: { id: Tab; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual' },
]

const GROUPS: { id: GroupBy; label: string }[] = [
  { id: 'time', label: 'By time' },
  { id: 'task', label: 'By task' },
]

interface Props {
  sessions: Session[]
  tasks: Task[]
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="brutal p-3 sm:p-4">
      <div className="text-xl font-extrabold tabular-nums sm:text-2xl">{value}</div>
      <div className="mt-0.5 text-[11px] font-bold tracking-wide text-ink/60 uppercase sm:text-xs">
        {label}
      </div>
    </div>
  )
}

/** Same chart, grouped by task instead of by day/week/month/year. */
function TaskBars({ rows, maxMinutes }: { rows: TaskStat[]; maxMinutes: number }) {
  return (
    <ul className="space-y-3 py-1">
      {rows.map((r) => (
        <li key={r.key}>
          <div className="flex items-baseline justify-between gap-3">
            <span
              title={r.title}
              className={`line-clamp-2 min-w-0 text-sm font-bold break-words ${
                r.key === '__none__' ? 'text-ink/50' : ''
              }`}
            >
              {r.title}
            </span>
            <span className="shrink-0 text-xs font-bold text-ink/70 tabular-nums">
              {fmtMinutes(r.minutes)}
            </span>
          </div>
          <div
            className="mt-1 h-4 overflow-hidden rounded-md border-2 border-ink bg-cream"
            title={`${r.sessions} session${r.sessions === 1 ? '' : 's'} · ${fmtMinutes(r.minutes)}`}
          >
            <div
              className="h-full bg-coral"
              style={{ width: `${Math.max(4, (r.minutes / maxMinutes) * 100)}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}

export default function Reports({ sessions, tasks }: Props) {
  const [tab, setTab] = useState<Tab>('daily')
  const [groupBy, setGroupBy] = useState<GroupBy>('time')
  const now = Date.now()

  const { bars, range } = useMemo(() => {
    switch (tab) {
      case 'daily':
        return {
          bars: dailyBuckets(sessions, now),
          range: [startOfDay(now), startOfDay(now) + DAY] as const,
        }
      case 'weekly':
        return {
          bars: weeklyBuckets(sessions, now),
          range: [startOfWeek(now), startOfWeek(now) + 7 * DAY] as const,
        }
      case 'monthly': {
        const start = startOfMonth(now)
        const end = new Date(start).setMonth(new Date(start).getMonth() + 1)
        return { bars: monthlyBuckets(sessions, now), range: [start, end] as const }
      }
      case 'annual': {
        const start = startOfYear(now)
        const end = startOfYear(now + 366 * DAY)
        return { bars: annualBuckets(sessions, now), range: [start, end] as const }
      }
    }
  }, [tab, sessions, now])

  const totals = rangeTotals(sessions, range[0], range[1])
  const done = tasksCompletedInRange(tasks, range[0], range[1])
  const byTask = taskFocusInRange(sessions, tasks, range[0], range[1])
  const maxTaskMinutes = Math.max(...byTask.map((r) => r.minutes), 1)

  return (
    <section className="brutal p-4 sm:p-6">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold">Reports</h2>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-1 rounded-xl border-2 border-ink bg-paper p-1 shadow-none! sm:flex sm:gap-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`tab ${tab === t.id ? 'bg-sun text-ink' : 'hover:bg-cream'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mb-4 grid grid-cols-3 gap-2 sm:gap-3">
        <Stat value={fmtMinutes(totals.minutes)} label="Focus time" />
        <Stat value={String(totals.count)} label="Sessions" />
        <Stat value={String(done)} label="Tasks done" />
      </div>

      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="text-sm font-extrabold">Chart</span>
        <div
          role="group"
          aria-label="Group chart by"
          className="flex gap-0.5 rounded-lg border-2 border-ink bg-paper p-0.5"
        >
          {GROUPS.map((g) => (
            <button
              key={g.id}
              onClick={() => setGroupBy(g.id)}
              aria-pressed={groupBy === g.id}
              className={`rounded-md px-2.5 py-1 text-xs font-bold transition-colors ${
                groupBy === g.id ? 'bg-ink text-paper' : 'cursor-pointer text-ink/60 hover:bg-cream'
              }`}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-ink/15 bg-paper p-2 sm:p-3">
        <div key={`${groupBy}-${tab}`} className="anim-fade">
          {groupBy === 'time' ? (
            <BarChart bars={bars} />
          ) : byTask.length > 0 ? (
            <TaskBars rows={byTask} maxMinutes={maxTaskMinutes} />
          ) : (
            <p className="py-8 text-center text-sm font-semibold text-ink/50">
              No focus sessions in this range yet.
            </p>
          )}
        </div>
      </div>

      {groupBy === 'time' && totals.count === 0 && (
        <p className="mt-3 text-center text-sm font-semibold text-ink/50">
          No focus sessions in this view yet — finish a pomodoro to see data here.
        </p>
      )}
    </section>
  )
}
