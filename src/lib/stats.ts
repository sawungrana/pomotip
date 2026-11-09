import type { Session, Task } from '../types'
import { DAY, startOfDay, startOfMonth, startOfWeek, startOfYear } from './time'

/** What the bar height represents in Reports. */
export type Metric = 'minutes' | 'sessions' | 'tasks'

export interface Bucket {
  label: string
  minutes: number
  sessions: number
  /** tasks the user ticked off in this bucket, session or not */
  tasksDone: number
}

function focusIn(sessions: Session[], from: number, to: number): Session[] {
  return sessions.filter((s) => s.type === 'focus' && s.completedAt >= from && s.completedAt < to)
}

function sumMinutes(list: Session[]): number {
  return list.reduce((acc, s) => acc + s.duration, 0)
}

export function completedTasksIn(tasks: Task[], from: number, to: number): number {
  let n = 0
  for (const t of tasks) {
    if (t.done && t.completedAt !== null && t.completedAt >= from && t.completedAt < to) n++
  }
  return n
}

export function metricValue(b: Bucket, metric: Metric): number {
  return metric === 'minutes' ? b.minutes : metric === 'sessions' ? b.sessions : b.tasksDone
}

export function dailyBuckets(sessions: Session[], tasks: Task[], now: number): Bucket[] {
  const out: Bucket[] = []
  for (let i = 6; i >= 0; i--) {
    const start = startOfDay(now - i * DAY)
    const end = start + DAY
    const list = focusIn(sessions, start, end)
    out.push({
      label: i === 0 ? 'Today' : new Date(start).toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasksDone: completedTasksIn(tasks, start, end),
    })
  }
  return out
}

export function weeklyBuckets(sessions: Session[], tasks: Task[], now: number): Bucket[] {
  const out: Bucket[] = []
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(now - i * 7 * DAY)
    const end = start + 7 * DAY
    const list = focusIn(sessions, start, end)
    out.push({
      label: new Date(start).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasksDone: completedTasksIn(tasks, start, end),
    })
  }
  return out
}

export function monthlyBuckets(sessions: Session[], tasks: Task[], now: number): Bucket[] {
  const out: Bucket[] = []
  const base = startOfMonth(now)
  for (let i = 11; i >= 0; i--) {
    const d = new Date(base)
    d.setMonth(d.getMonth() - i)
    const start = d.getTime()
    const end = new Date(d).setMonth(d.getMonth() + 1)
    const list = focusIn(sessions, start, end)
    out.push({
      label: new Date(start).toLocaleDateString(undefined, { month: 'short' }),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasksDone: completedTasksIn(tasks, start, end),
    })
  }
  return out
}

export function annualBuckets(sessions: Session[], tasks: Task[], now: number): Bucket[] {
  const out: Bucket[] = []
  for (let i = 4; i >= 0; i--) {
    const start = startOfYear(now - i * 365 * DAY)
    const end = startOfYear(now - i * 365 * DAY + 366 * DAY)
    const list = focusIn(sessions, start, end)
    out.push({
      label: String(new Date(start).getFullYear()),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasksDone: completedTasksIn(tasks, start, end),
    })
  }
  return out
}

export function rangeTotals(sessions: Session[], from: number, to: number) {
  const list = focusIn(sessions, from, to)
  return { minutes: sumMinutes(list), count: list.length }
}

export function tasksCompletedInRange(tasks: Task[], from: number, to: number): number {
  return completedTasksIn(tasks, from, to)
}
