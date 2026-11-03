export const DAY = 86_400_000

export function fmtClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export function fmtMinutes(min: number): string {
  if (min < 1) return '0m'
  const h = Math.floor(min / 60)
  const m = Math.round(min % 60)
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

export function startOfDay(t: number): number {
  const d = new Date(t)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfWeek(t: number): number {
  const d = new Date(startOfDay(t))
  const day = (d.getDay() + 6) % 7 // Monday = 0
  d.setDate(d.getDate() - day)
  return d.getTime()
}

export function startOfMonth(t: number): number {
  const d = new Date(t)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

export function startOfYear(t: number): number {
  const d = new Date(t)
  d.setMonth(0, 1)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}
