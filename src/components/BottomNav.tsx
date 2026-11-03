export type View = 'timer' | 'tasks' | 'reports'

export const VIEWS: { id: View; label: string; tabActive: string; soft: string }[] = [
  { id: 'timer', label: 'Timer', tabActive: 'bg-coral text-paper', soft: 'bg-coral-soft' },
  { id: 'tasks', label: 'Tasks', tabActive: 'bg-sun text-ink', soft: 'bg-sun-soft' },
  { id: 'reports', label: 'Reports', tabActive: 'bg-peri text-paper', soft: 'bg-peri-soft' },
]

export function ViewIcon({ view, active }: { view: View; active: boolean }) {
  const stroke = active ? 'var(--color-ink)' : 'var(--color-ink)'
  const opacity = active ? 1 : 0.75
  if (view === 'timer') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ opacity }}>
        <circle cx="12" cy="13" r="8" stroke={stroke} strokeWidth="2" />
        <path
          d="M12 13V9M12 13l3 2M10 2h4"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    )
  }
  if (view === 'tasks') {
    return (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ opacity }}>
        <path
          d="M4 6.5 5.5 8 8 5M4 12.5 5.5 14 8 11M4 18.5 5.5 20 8 17M11.5 6.5H20M11.5 12.5H20M11.5 18.5H20"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ opacity }}>
      <path
        d="M4 20h16M6 20v-6M12 20V9M18 20V4"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

interface Props {
  view: View
  onChange: (v: View) => void
}

export default function BottomNav({ view, onChange }: Props) {
  return (
    <nav
      className="nav-safe fixed inset-x-0 bottom-0 z-40 border-t-2 border-ink bg-paper sm:hidden"
      aria-label="Views"
    >
      <div className="flex">
        {VIEWS.map((v) => {
          const active = view === v.id
          return (
            <button
              key={v.id}
              onClick={() => onChange(v.id)}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-12 flex-1 cursor-pointer flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-extrabold uppercase tracking-wide transition-colors ${
                active ? `${v.soft} text-ink` : 'text-ink/55'
              }`}
            >
              <ViewIcon view={v.id} active={active} />
              {v.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
