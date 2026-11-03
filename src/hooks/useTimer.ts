import { useEffect, useRef, useState } from 'react'
import type { Mode, Settings } from '../types'
import { modeMinutes } from '../types'
import { load, save } from '../lib/storage'
import { playChime, requestNotifyPermission, sendNotification } from '../lib/notify'

type Status = 'idle' | 'running' | 'paused'

interface TimerState {
  mode: Mode
  status: Status
  endsAt: number | null
  remainingMs: number
  cycle: number
}

const MODE_LABEL: Record<Mode, string> = {
  focus: 'Focus',
  short: 'Short break',
  long: 'Long break',
}

function initialState(settings: Settings): TimerState {
  return {
    mode: 'focus',
    status: 'idle',
    endsAt: null,
    remainingMs: modeMinutes(settings, 'focus') * 60_000,
    cycle: 0,
  }
}

export function useTimer(settings: Settings, onFocusComplete: () => void) {
  const cbRef = useRef(onFocusComplete)
  cbRef.current = onFocusComplete

  const [state, setState] = useState<TimerState>(() =>
    load('timer', initialState(settings)),
  )
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    save('timer', state)
  }, [state])

  // keep idle remaining in sync when durations change in settings
  useEffect(() => {
    setState((s) =>
      s.status === 'idle'
        ? { ...s, remainingMs: modeMinutes(settings, s.mode) * 60_000 }
        : s,
    )
  }, [settings.focusMin, settings.shortMin, settings.longMin]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (state.status !== 'running') return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(id)
  }, [state.status])

  const totalMs = modeMinutes(settings, state.mode) * 60_000
  const remainingMs =
    state.status === 'running' ? Math.max(0, (state.endsAt ?? 0) - now) : state.remainingMs

  const advance = (logSession: boolean) => {
    const finished = state.mode
    if (logSession && finished === 'focus') cbRef.current()

    const cycle = finished === 'focus' ? state.cycle + 1 : state.cycle
    const nextMode: Mode =
      finished === 'focus'
        ? cycle % settings.longBreakInterval === 0
          ? 'long'
          : 'short'
        : 'focus'
    const nextMs = modeMinutes(settings, nextMode) * 60_000
    const autoStart = finished === 'focus' ? settings.autoStartBreaks : settings.autoStartFocus

    setState({
      mode: nextMode,
      status: autoStart ? 'running' : 'idle',
      endsAt: autoStart ? Date.now() + nextMs : null,
      remainingMs: nextMs,
      cycle,
    })

    if (logSession) {
      if (settings.sound) playChime()
      if (settings.notifications) {
        sendNotification(
          finished === 'focus' ? 'Focus session complete' : 'Break is over',
          finished === 'focus'
            ? `Nice work — time for a ${nextMode === 'long' ? 'long' : 'short'} break.`
            : 'Ready for the next focus session?',
        )
      }
    }
  }

  useEffect(() => {
    if (state.status === 'running' && remainingMs <= 0) advance(true)
  }, [state.status, remainingMs]) // eslint-disable-line react-hooks/exhaustive-deps

  const start = () => {
    void requestNotifyPermission()
    setState((s) => ({
      ...s,
      status: 'running',
      endsAt: Date.now() + s.remainingMs,
    }))
  }

  const pause = () => {
    setState((s) =>
      s.status === 'running'
        ? {
            ...s,
            status: 'paused',
            endsAt: null,
            remainingMs: Math.max(0, (s.endsAt ?? 0) - Date.now()),
          }
        : s,
    )
  }

  const reset = () => {
    setState((s) => ({
      ...s,
      status: 'idle',
      endsAt: null,
      remainingMs: modeMinutes(settings, s.mode) * 60_000,
    }))
  }

  const skip = () => advance(false)

  const setMode = (mode: Mode) => {
    setState((s) => ({
      ...s,
      mode,
      status: 'idle',
      endsAt: null,
      remainingMs: modeMinutes(settings, mode) * 60_000,
    }))
  }

  return {
    mode: state.mode,
    status: state.status,
    cycle: state.cycle,
    remainingMs,
    totalMs,
    start,
    pause,
    reset,
    skip,
    setMode,
  }
}

export type Timer = ReturnType<typeof useTimer>
export { MODE_LABEL }
