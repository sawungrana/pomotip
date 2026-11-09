import type { Session, Task } from '../types'
import { DAY, startOfDay, startOfMonth, startOfWeek, startOfYear } from './time'

/** What the bar height represents in Reports. */
export type Metric = 'minutes' | 'sessions' | 'tasks'

export interface Bucket {
  label: string
  minutes: number
  sessions: number
  tasks: number
}

function focusIn(sessions: Session[], from: number, to: number): Session[] {
  return sessions.filter((s) => s.type === 'focus' && s.completedAt >= from && s.completedAt < to)
}

function sumMinutes(list: Session[]): number {
  return list.reduce((acc, s) => acc + s.duration, 0)
}

function distinctTasks(list: Session[]): number {
  const ids = new Set<string>()
  for (const s of list) if (s.taskId) ids.add(s.taskId)
  return ids.size
}

export function metricValue(b: Bucket, metric: Metric): number {
  return metric === 'minutes' ? b.minutes : metric === 'sessions' ? b.sessions : b.tasks
}

export function dailyBuckets(sessions: Session[], now: number): Bucket[] {
  const out: Bucket[] = []
  for (let i = 6; i >= 0; i--) {
    const start = startOfDay(now - i * DAY)
    const list = focusIn(sessions, start, start + DAY)
    out.push({
      label:
        i === 0
          ? 'Today'
          : new Date(start).toLocaleDateString(undefined, { weekday: 'short' }),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasks: distinctTasks(list),
    })
  }
  return out
}

export function weeklyBuckets(sessions: Session[], now: number): Bucket[] {
  const out: Bucket[] = []
  for (let i = 7; i >= 0; i--) {
    const start = startOfWeek(now - i * 7 * DAY)
    const list = focusIn(sessions, start, start + 7 * DAY)
    out.push({
      label: new Date(start).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasks: distinctTasks(list),
    })
  }
  return out
}

export function monthlyBuckets(sessions: Session[], now: number): Bucket[] {
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
      tasks: distinctTasks(list),
    })
  }
  return out
}

export function annualBuckets(sessions: Session[], now: number): Bucket[] {
  const out: Bucket[] = []
  for (let i = 4; i >= 0; i--) {
    const start = startOfYear(now - i * 365 * DAY)
    const end = startOfYear(now - i * 365 * DAY + 366 * DAY)
    const list = focusIn(sessions, start, end)
    out.push({
      label: String(new Date(start).getFullYear()),
      minutes: sumMinutes(list),
      sessions: list.length,
      tasks: distinctTasks(list),
    })
  }
  return out
}

export function rangeTotals(sessions: Session[], from: number, to: number) {
  const list = focusIn(sessions, from, to)
  return { minutes: sumMinutes(list), count: list.length }
}

export function tasksCompletedInRange(tasks: Task[], from: number, to: number): number {
  return tasks.filter(
    (t) => t.done && t.completedAt !== null && t.completedAt >= from && t.completedAt < to,
  ).length
}
