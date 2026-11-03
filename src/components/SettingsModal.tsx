import { useEffect, useRef } from 'react'
import type { Settings } from '../types'
import { DEFAULT_SETTINGS } from '../types'

interface BackupData {
  version: number
  exportedAt: string
  settings?: Partial<Settings>
  tasks?: unknown
  sessions?: unknown
}

interface Props {
  settings: Settings
  onChange: (s: Settings) => void
  onClose: () => void
  onImportAll: (data: { settings: Settings; tasks: unknown; sessions: unknown }) => void
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="flex w-full cursor-pointer items-center justify-between gap-4 py-2 text-left"
    >
      <span className="text-sm font-bold">{label}</span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full border-2 border-ink transition-colors ${
          checked ? 'bg-mint' : 'bg-cream'
        }`}
      >
        <span
          className={`absolute top-0 left-0 size-4 rounded-full border-2 border-ink bg-paper transition-transform ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </span>
    </button>
  )
}

function NumberField({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 py-2">
      <span className="text-sm font-bold">{label}</span>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const n = Number(e.target.value)
          if (!Number.isNaN(n)) onChange(Math.min(max, Math.max(min, Math.round(n))))
        }}
        className="w-20 rounded-lg border-2 border-ink bg-paper px-2 py-1.5 text-center font-bold focus:bg-sun-soft focus:outline-none"
      />
    </label>
  )
}

export default function SettingsModal({ settings, onChange, onClose, onImportAll }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    onChange({ ...settings, [key]: value })

  const exportData = () => {
    const data: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      settings,
      tasks: JSON.parse(localStorage.getItem('pomotip:tasks') ?? '[]'),
      sessions: JSON.parse(localStorage.getItem('pomotip:sessions') ?? '[]'),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pomotip-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importData = (file: File) => {
    file
      .text()
      .then((text) => {
        const data = JSON.parse(text) as BackupData
        if (!Array.isArray(data.sessions) || !Array.isArray(data.tasks)) {
          alert('This file does not look like a pomotip backup.')
          return
        }
        onImportAll({
          settings: { ...DEFAULT_SETTINGS, ...(data.settings ?? {}) },
          tasks: data.tasks,
          sessions: data.sessions,
        })
        onClose()
      })
      .catch(() => alert('Could not read that file.'))
  }

  const clearAll = () => {
    if (!confirm('Delete ALL pomotip data (tasks, sessions, settings) from this browser? This cannot be undone.')) return
    for (const key of Object.keys(localStorage)) {
      if (key.startsWith('pomotip:')) localStorage.removeItem(key)
    }
    location.reload()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="anim-fade absolute inset-0 bg-ink/40" onClick={onClose} />
      <div className="brutal anim-pop shadow-brutal-lg! relative max-h-[85vh] w-full max-w-md overflow-y-auto p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-extrabold">Settings</h2>
          <button onClick={onClose} className="icon-btn" aria-label="Close settings">
            ✕
          </button>
        </div>

        <h3 className="mt-2 mb-1 text-xs font-extrabold tracking-widest text-ink/50 uppercase">
          Durations (minutes)
        </h3>
        <NumberField label="Focus" value={settings.focusMin} min={1} max={120} onChange={(v) => set('focusMin', v)} />
        <NumberField label="Short break" value={settings.shortMin} min={1} max={60} onChange={(v) => set('shortMin', v)} />
        <NumberField label="Long break" value={settings.longMin} min={1} max={60} onChange={(v) => set('longMin', v)} />
        <NumberField
          label="Long break every"
          value={settings.longBreakInterval}
          min={2}
          max={8}
          onChange={(v) => set('longBreakInterval', v)}
        />

        <h3 className="mt-4 mb-1 text-xs font-extrabold tracking-widest text-ink/50 uppercase">
          Behavior
        </h3>
        <Toggle
          label="Auto-start breaks"
          checked={settings.autoStartBreaks}
          onChange={(v) => set('autoStartBreaks', v)}
        />
        <Toggle
          label="Auto-start focus sessions"
          checked={settings.autoStartFocus}
          onChange={(v) => set('autoStartFocus', v)}
        />
        <Toggle label="Sound" checked={settings.sound} onChange={(v) => set('sound', v)} />
        <Toggle
          label="Desktop notifications"
          checked={settings.notifications}
          onChange={(v) => set('notifications', v)}
        />

        <h3 className="mt-4 mb-2 text-xs font-extrabold tracking-widest text-ink/50 uppercase">
          Data (stored in this browser)
        </h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={exportData} className="btn bg-sun px-4 py-2 text-sm">
            Export backup
          </button>
          <button onClick={() => fileRef.current?.click()} className="btn bg-paper px-4 py-2 text-sm">
            Import backup
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (f) importData(f)
              e.target.value = ''
            }}
          />
          <button
            onClick={clearAll}
            className="btn ml-auto bg-coral px-4 py-2 text-sm text-paper"
          >
            Clear all
          </button>
        </div>
      </div>
    </div>
  )
}
