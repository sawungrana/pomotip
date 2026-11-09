import { useMemo, useState } from 'react'
import type { Session, Task } from '../types'
import {
  annualBuckets,
  dailyBuckets,
  monthlyBuckets,
  rangeTotals,
  tasksCompletedInRange,
  weeklyBuckets,
  type Metric,
} from '../lib/stats'
import { DAY, fmtMinutes, startOfDay, startOfMonth, startOfWeek, startOfYear } from '../lib/time'
import BarChart from './BarChart'

type Tab = 'daily' | 'weekly' | 'monthly' | 'annual'

const TABS: { id: Tab; label: string }[] = [
  { id: 'daily', label: 'Daily' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'monthly', label: 'Monthly' },
  { id: 'annual', label: 'Annual' },
]

/** What the bars count. The x-axis stays time buckets no matter which is picked. */
const METRICS: { id: Metric; label: string }[] = [
  { id: 'minutes', label: 'Minutes' },
  { id: 'sessions', label: 'Sessions' },
  { id: 'tasks', label: 'Tasks' },
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

export default function Reports({ sessions, tasks }: Props) {
  const [tab, setTab] = useState<Tab>('daily')
  const [metric, setMetric] = useState<Metric>('minutes')
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

      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-extrabold">Chart</span>
        <div
          role="group"
          aria-label="What the chart counts"
          className="flex gap-0.5 rounded-lg border-2 border-ink bg-paper p-0.5"
        >
          {METRICS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMetric(m.id)}
              aria-pressed={metric === m.id}
              className={`rounded-md px-2 py-1 text-xs font-bold transition-colors ${
                metric === m.id ? 'bg-ink text-paper' : 'cursor-pointer text-ink/60 hover:bg-cream'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-ink/15 bg-paper p-2 sm:p-3">
        <div key={`${metric}-${tab}`} className="anim-fade">
          <BarChart bars={bars} metric={metric} />
        </div>
      </div>

      {totals.count === 0 && (
        <p className="mt-3 text-center text-sm font-semibold text-ink/50">
          No focus sessions in this view yet — finish a pomodoro to see data here.
        </p>
      )}
    </section>
  )
}
