interface Props {
  onOpenSettings: () => void
}

export default function Header({ onOpenSettings }: Props) {
  return (
    <header className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 pt-6 pb-2">
      <div className="flex items-center gap-2.5">
        <div className="flex size-10 items-center justify-center rounded-xl border-2 border-ink bg-coral shadow-brutal-sm">
          <svg width="22" height="22" viewBox="0 0 64 64" fill="none">
            <circle
              cx="32"
              cy="36"
              r="17"
              fill="var(--color-paper)"
              stroke="var(--color-ink)"
              strokeWidth="4"
            />
            <path
              d="M32 36 V27 M32 36 L39 40"
              stroke="var(--color-ink)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            <rect
              x="27"
              y="8"
              width="10"
              height="7"
              rx="2"
              fill="var(--color-paper)"
              stroke="var(--color-ink)"
              strokeWidth="3"
            />
          </svg>
        </div>
        <span className="text-2xl font-extrabold tracking-tight">pomotip</span>
      </div>
      <button onClick={onOpenSettings} className="icon-btn" aria-label="Open settings">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 15.5A3.5 3.5 0 1 0 12 8.5a3.5 3.5 0 0 0 0 7Z"
            stroke="var(--color-ink)"
            strokeWidth="2.2"
          />
          <path
            d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.03 1.56V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 8.98 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.03H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 8.98a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H9a1.7 1.7 0 0 0 1.03-1.56V3a2 2 0 1 1 4 0v.09c0 .68.4 1.3 1.03 1.56a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V9c.26.63.88 1.03 1.56 1.03H21a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.51 1Z"
            stroke="var(--color-ink)"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </button>
    </header>
  )
}
