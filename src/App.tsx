import { useCallback, useEffect, useMemo, useState } from 'react'
import Header from './components/Header'
import BottomNav, { VIEWS, type View } from './components/BottomNav'
import TimerCard from './components/TimerCard'
import TaskList from './components/TaskList'
import Reports from './components/Reports'
import SettingsModal from './components/SettingsModal'
import { useLocalStorage } from './hooks/useLocalStorage'
import { useTimer } from './hooks/useTimer'
import { MODE_UI } from './components/modeUI'
import { uid } from './lib/storage'
import { DEFAULT_SETTINGS, type Session, type Settings, type Task } from './types'
import { fmtClock } from './lib/time'

export default function App() {
  const [settings, setSettings] = useLocalStorage<Settings>('settings', DEFAULT_SETTINGS)
  const [tasks, setTasks] = useLocalStorage<Task[]>('tasks', [])
  const [sessions, setSessions] = useLocalStorage<Session[]>('sessions', [])
  const [activeTaskId, setActiveTaskId] = useLocalStorage<string | null>('activeTask', null)
  const [showSettings, setShowSettings] = useState(false)
  const [view, setView] = useState<View>('timer')

  const handleFocusComplete = useCallback(() => {
    setSessions((prev) => [
      ...prev,
      {
        id: uid(),
        taskId: activeTaskId,
        type: 'focus',
        duration: settings.focusMin,
        completedAt: Date.now(),
      },
    ])
    if (activeTaskId) {
      setTasks((prev) =>
        prev.map((t) =>
          t.id === activeTaskId && !t.done ? { ...t, completedPomos: t.completedPomos + 1 } : t,
        ),
      )
    }
  }, [activeTaskId, settings.focusMin, setSessions, setTasks])

  const timer = useTimer(settings, handleFocusComplete)

  // live countdown in the tab title
  useEffect(() => {
    document.title =
      timer.status === 'running'
        ? `${fmtClock(timer.remainingMs)} · ${MODE_UI[timer.mode].label} — pomotip`
        : 'pomotip'
  }, [timer.status, timer.remainingMs, timer.mode])

  const activeTask = useMemo(
    () => tasks.find((t) => t.id === activeTaskId && !t.done) ?? null,
    [tasks, activeTaskId],
  )

  const addTask = (title: string) =>
    setTasks((prev) => [
      ...prev,
      {
        id: uid(),
        title,
        done: false,
        estimatedPomos: 1,
        completedPomos: 0,
        createdAt: Date.now(),
        completedAt: null,
      },
    ])

  const toggleTask = (id: string) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, done: !t.done, completedAt: !t.done ? Date.now() : null } : t,
      ),
    )

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id))
    if (id === activeTaskId) setActiveTaskId(null)
  }

  const estimateTask = (id: string, delta: number) =>
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, estimatedPomos: Math.max(1, Math.min(20, t.estimatedPomos + delta)) }
          : t,
      ),
    )

  return (
    <div className="min-h-screen font-sans">
      <Header onOpenSettings={() => setShowSettings(true)} />

      {/* inline view switcher (desktop) */}
      <div className="mx-auto hidden w-full max-w-3xl px-4 sm:block">
        <div className="mx-auto flex w-full max-w-sm gap-1 rounded-xl border-2 border-ink bg-paper p-1">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => setView(v.id)}
              className={`tab ${view === v.id ? v.tabActive : 'hover:bg-cream'}`}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto w-full max-w-3xl space-y-6 px-4 pt-4 pb-28 sm:pb-16">
        <div key={view} className="anim-rise">
          {view === 'timer' && (
            <TimerCard timer={timer} settings={settings} activeTask={activeTask} />
          )}
          {view === 'tasks' && (
            <TaskList
              tasks={tasks}
              activeTaskId={activeTaskId}
              onAdd={addTask}
              onToggle={toggleTask}
              onDelete={deleteTask}
              onSetActive={setActiveTaskId}
              onEstimate={estimateTask}
            />
          )}
          {view === 'reports' && <Reports sessions={sessions} tasks={tasks} />}
        </div>

        <footer className="pt-2 text-center text-xs font-semibold text-ink/40">
          pomotip · local-first, no login — your data never leaves this browser
        </footer>
      </main>

      <BottomNav view={view} onChange={setView} />

      {showSettings && (
        <SettingsModal
          settings={settings}
          onChange={setSettings}
          onClose={() => setShowSettings(false)}
          onImportAll={(data) => {
            setSettings(data.settings)
            setTasks(data.tasks as Task[])
            setSessions(data.sessions as Session[])
          }}
        />
      )}
    </div>
  )
}
