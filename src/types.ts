export type Mode = 'focus' | 'short' | 'long'

export interface Session {
  id: string
  taskId: string | null
  type: 'focus' | 'short' | 'long'
  duration: number
  completedAt: number
}

export interface Task {
  id: string
  title: string
  done: boolean
  estimatedPomos: number
  completedPomos: number
  createdAt: number
  completedAt: number | null
}

export interface Settings {
  focusMin: number
  shortMin: number
  longMin: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartFocus: boolean
  sound: boolean
  notifications: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  focusMin: 25,
  shortMin: 5,
  longMin: 15,
  longBreakInterval: 4,
  autoStartBreaks: true,
  autoStartFocus: false,
  sound: true,
  notifications: true,
}

export function modeMinutes(s: Settings, m: Mode): number {
  if (m === 'focus') return s.focusMin
  if (m === 'short') return s.shortMin
  return s.longMin
}
