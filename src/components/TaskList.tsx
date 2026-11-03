import { useEffect, useRef, useState } from 'react'
import type { Task } from '../types'

interface Props {
  tasks: Task[]
  activeTaskId: string | null
  onAdd: (title: string) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onSetActive: (id: string | null) => void
  onEstimate: (id: string, delta: number) => void
}

function PomoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" className="inline-block">
      <path
        d="M8 4 C 8 2.5, 7 1.5, 5.5 1.5 M8 4 C 8 2.5, 9 1.5, 10.5 1.5"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      <circle
        cx="8"
        cy="9.5"
        r="5.5"
        fill="var(--color-coral)"
        stroke="var(--color-ink)"
        strokeWidth="1.5"
      />
    </svg>
  )
}

function MenuItem({
  children,
  onClick,
  disabled,
  className = '',
}: {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button disabled={disabled} onClick={onClick} className={`menu-item ${className}`}>
      {children}
    </button>
  )
}

export default function TaskList(props: Props) {
  const { tasks, activeTaskId, onAdd, onToggle, onDelete, onSetActive, onEstimate } = props
  const [title, setTitle] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuId) return
    const onDown = (e: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuId(null)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuId(null)
    }
    document.addEventListener('pointerdown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [menuId])

  const submit = () => {
    const t = title.trim()
    if (!t) return
    onAdd(t)
    setTitle('')
  }

  const sorted = [...tasks].sort(
    (a, b) => Number(a.done) - Number(b.done) || a.createdAt - b.createdAt,
  )
  const remaining = tasks.filter((t) => !t.done).length

  return (
    <section className="brutal p-4 sm:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h2 className="text-xl font-extrabold">Today's Tasks</h2>
        <span className="text-sm font-semibold text-ink/60">{remaining} remaining</span>
      </div>

      <div className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="What will you work on?"
          className="min-w-0 flex-1 rounded-xl border-2 border-ink bg-paper px-3 py-2.5 font-semibold placeholder:text-ink/40 focus:bg-sun-soft focus:outline-none"
        />
        <button onClick={submit} className="btn bg-sun px-4 py-2.5 text-sm">
          Add
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {sorted.length === 0 && (
          <li className="rounded-xl border-2 border-dashed border-ink/25 px-3 py-6 text-center text-sm font-semibold text-ink/50">
            No tasks yet — add one above
          </li>
        )}
        {sorted.map((task, i) => {
          const active = task.id === activeTaskId && !task.done
          return (
            <li
              key={task.id}
              className={`anim-rise flex items-center gap-3 rounded-xl border-2 border-ink p-3 ${
                active ? 'bg-sun-soft' : 'bg-paper'
              }`}
              style={{ animationDelay: `${Math.min(i, 8) * 35}ms` }}
            >
              <button
                onClick={() => onToggle(task.id)}
                aria-label={task.done ? 'Mark as not done' : 'Mark as done'}
                className={`flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-ink transition-colors ${
                  task.done ? 'bg-mint' : 'bg-paper hover:bg-mint-soft'
                }`}
              >
                {task.done && (
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3 8.5 L6.5 12 L13 4.5"
                      className="check-anim"
                      stroke="var(--color-ink)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>

              <button
                onClick={() => onSetActive(active ? null : task.id)}
                className="min-w-0 flex-1 cursor-pointer py-1 text-left"
                title="Set as active task"
              >
                <span
                  className={`block truncate font-bold ${task.done ? 'text-ink/40 line-through' : ''}`}
                >
                  {task.title}
                </span>
                {active && <span className="text-xs font-bold text-coral">● focusing on this</span>}
              </button>

              <span className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums">
                <PomoIcon />
                {task.completedPomos}/{task.estimatedPomos}
              </span>

              <div
                className="relative shrink-0"
                ref={menuId === task.id ? menuRef : undefined}
              >
                <button
                  onClick={() => setMenuId((m) => (m === task.id ? null : task.id))}
                  className="icon-btn size-8!"
                  aria-label="Task menu"
                  aria-expanded={menuId === task.id}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-ink)">
                    <circle cx="8" cy="3" r="1.6" />
                    <circle cx="8" cy="8" r="1.6" />
                    <circle cx="8" cy="13" r="1.6" />
                  </svg>
                </button>

                {menuId === task.id && (
                  <div className="anim-pop rounded-xl! absolute top-full right-0 z-30 mt-1 w-44 border-2 border-ink bg-paper p-1 shadow-brutal-sm!">
                    <MenuItem
                      onClick={() => {
                        onSetActive(active ? null : task.id)
                        setMenuId(null)
                      }}
                    >
                      {active ? 'Unset active' : 'Set as active'}
                    </MenuItem>
                    <MenuItem
                      disabled={task.estimatedPomos <= 1}
                      onClick={() => onEstimate(task.id, -1)}
                    >
                      Estimate − 1
                    </MenuItem>
                    <MenuItem
                      disabled={task.estimatedPomos >= 20}
                      onClick={() => onEstimate(task.id, 1)}
                    >
                      Estimate + 1
                    </MenuItem>
                    <div className="mx-1 my-1 border-t-2 border-ink/10" />
                    <MenuItem
                      className="text-coral"
                      onClick={() => {
                        onDelete(task.id)
                        setMenuId(null)
                      }}
                    >
                      Delete
                    </MenuItem>
                  </div>
                )}
              </div>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
