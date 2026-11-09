import { useEffect, useLayoutEffect, useRef, useState } from 'react'
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

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
    >
      <path
        d="M4 6 L8 10 L12 6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Two-line clamped title. A small chevron appears only when the text actually
 * overflows, so long names stay readable without making every row taller.
 */
function TaskTitle({
  task,
  active,
  expanded,
  onToggleExpand,
  onSetActive,
}: {
  task: Task
  active: boolean
  expanded: boolean
  onToggleExpand: () => void
  onSetActive: () => void
}) {
  const ref = useRef<HTMLSpanElement>(null)
  const [truncated, setTruncated] = useState(false)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const check = () => setTruncated(el.scrollHeight > el.clientHeight + 1)
    check()
    const ro = new ResizeObserver(check)
    ro.observe(el)
    window.addEventListener('resize', check)
    void document.fonts?.ready.then(check).catch(() => {})
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', check)
    }
  }, [task.title, expanded])

  const showToggle = truncated || expanded

  const titleBlock = (
    <>
      <span
        ref={ref}
        className={`break-words font-bold ${expanded ? 'block' : 'line-clamp-2'} ${
          task.done ? 'text-ink/40 line-through' : ''
        }`}
      >
        {task.title}
      </span>
      {active && (
        <span className="mt-0.5 block text-xs font-bold text-coral">● focusing on this</span>
      )}
    </>
  )

  return (
    <div className="flex min-w-0 flex-1 items-start gap-1">
      {task.done ? (
        <span className="min-w-0 flex-1 py-1">{titleBlock}</span>
      ) : (
        <button
          onClick={onSetActive}
          className="min-w-0 flex-1 cursor-pointer py-1 text-left"
          title={active ? 'Tap to stop focusing' : 'Set as active task'}
        >
          {titleBlock}
        </button>
      )}

      {showToggle && (
        <button
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-label={expanded ? 'Collapse task name' : 'Show full task name'}
          className="mt-0.5 flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-md border-2 border-ink/20 bg-paper text-ink/50 transition-colors hover:bg-cream"
        >
          <ChevronIcon open={expanded} />
        </button>
      )}
    </div>
  )
}

interface RowProps {
  task: Task
  active: boolean
  menuOpen: boolean
  menuRef: React.RefObject<HTMLDivElement | null>
  animDelay: string
  expanded: boolean
  onToggle: () => void
  onSetActive: () => void
  onToggleMenu: () => void
  onToggleExpand: () => void
  onEstimate: (delta: number) => void
  onDelete: () => void
}

function TaskRow({
  task,
  active,
  menuOpen,
  menuRef,
  animDelay,
  expanded,
  onToggle,
  onSetActive,
  onToggleMenu,
  onToggleExpand,
  onEstimate,
  onDelete,
}: RowProps) {
  return (
    <li
      className={`anim-rise relative flex items-center gap-3 rounded-xl border-2 border-ink p-3 ${
        active ? 'bg-sun-soft' : 'bg-paper'
      } ${menuOpen ? 'z-30' : ''}`}
      style={{ animationDelay: animDelay }}
    >
      <button
        onClick={onToggle}
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

      <TaskTitle
        task={task}
        active={active}
        expanded={expanded}
        onToggleExpand={onToggleExpand}
        onSetActive={onSetActive}
      />

      <span className="flex shrink-0 items-center gap-1 text-sm font-bold tabular-nums">
        <PomoIcon />
        {task.completedPomos}/{task.estimatedPomos}
      </span>

      <div className="relative shrink-0" ref={menuOpen ? menuRef : undefined}>
        <button
          onClick={onToggleMenu}
          className="icon-btn size-8!"
          aria-label="Task menu"
          aria-expanded={menuOpen}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="var(--color-ink)">
            <circle cx="8" cy="3" r="1.6" />
            <circle cx="8" cy="8" r="1.6" />
            <circle cx="8" cy="13" r="1.6" />
          </svg>
        </button>

        {menuOpen && (
          <div className="anim-pop rounded-xl! absolute top-full right-0 z-30 mt-1 w-44 border-2 border-ink bg-paper p-1 shadow-brutal-sm!">
            {!task.done && (
              <MenuItem onClick={onSetActive}>
                {active ? 'Unset active' : 'Set as active'}
              </MenuItem>
            )}
            <MenuItem disabled={task.estimatedPomos <= 1} onClick={() => onEstimate(-1)}>
              Estimate − 1
            </MenuItem>
            <MenuItem disabled={task.estimatedPomos >= 20} onClick={() => onEstimate(1)}>
              Estimate + 1
            </MenuItem>
            <div className="mx-1 my-1 border-t-2 border-ink/10" />
            <MenuItem className="text-coral" onClick={onDelete}>
              Delete
            </MenuItem>
          </div>
        )}
      </div>
    </li>
  )
}

export default function TaskList(props: Props) {
  const { tasks, activeTaskId, onAdd, onToggle, onDelete, onSetActive, onEstimate } = props
  const [title, setTitle] = useState('')
  const [menuId, setMenuId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [doneOpen, setDoneOpen] = useState(false)
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

  const pending = [...tasks]
    .filter((t) => !t.done)
    .sort((a, b) => a.createdAt - b.createdAt)
  const doneTasks = [...tasks]
    .filter((t) => t.done)
    .sort((a, b) => (b.completedAt ?? 0) - (a.completedAt ?? 0))
  const remaining = pending.length

  const renderTask = (task: Task, i: number, step: number) => (
    <TaskRow
      key={task.id}
      task={task}
      active={task.id === activeTaskId && !task.done}
      menuOpen={menuId === task.id}
      menuRef={menuRef}
      animDelay={`${Math.min(i, 8) * step}ms`}
      expanded={expandedId === task.id}
      onToggle={() => onToggle(task.id)}
      onSetActive={() => onSetActive(task.id === activeTaskId ? null : task.id)}
      onToggleMenu={() => setMenuId((m) => (m === task.id ? null : task.id))}
      onToggleExpand={() => setExpandedId((id) => (id === task.id ? null : task.id))}
      onEstimate={(delta) => onEstimate(task.id, delta)}
      onDelete={() => {
        onDelete(task.id)
        setMenuId(null)
      }}
    />
  )

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
        {tasks.length === 0 && (
          <li className="rounded-xl border-2 border-dashed border-ink/25 px-3 py-6 text-center text-sm font-semibold text-ink/50">
            No tasks yet — add one above
          </li>
        )}

        {pending.map((task, i) => renderTask(task, i, 35))}

        {pending.length === 0 && doneTasks.length > 0 && (
          <li className="rounded-xl border-2 border-dashed border-ink/25 px-3 py-5 text-center text-sm font-semibold text-ink/50">
            All done — nothing left for today.
          </li>
        )}

        {doneTasks.length > 0 && (
          <li>
            <button
              type="button"
              onClick={() => setDoneOpen((v) => !v)}
              aria-expanded={doneOpen}
              className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-dashed border-ink/25 bg-paper px-3 py-2.5 text-sm font-bold text-ink/60 transition-colors hover:bg-cream"
            >
              <span className="inline-flex items-center gap-2">
                <ChevronIcon open={doneOpen} />
                Done
              </span>
              <span className="tabular-nums">{doneTasks.length}</span>
            </button>
          </li>
        )}

        {doneOpen && doneTasks.map((task, i) => renderTask(task, i, 25))}
      </ul>
    </section>
  )
}
