import type { Bucket } from '../lib/stats'
import { fmtMinutes } from '../lib/time'

export default function BarChart({ bars }: { bars: Bucket[] }) {
  const max = Math.max(...bars.map((b) => b.value), 1)
  const slot = 52
  const padL = 8
  const padB = 26
  const padT = 22
  const W = padL + bars.length * slot + 8
  const H = 175
  const chartH = H - padB - padT
  const baseline = H - padB

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label="Focus time chart">
      <line
        x1={0}
        y1={baseline}
        x2={W}
        y2={baseline}
        stroke="var(--color-ink)"
        strokeWidth={2}
      />
      {bars.map((b, i) => {
        const h = b.value > 0 ? Math.max(8, (b.value / max) * chartH) : 0
        const barW = 30
        const x = padL + i * slot + (slot - barW) / 2
        const y = baseline - h
        return (
          <g key={i}>
            {b.value > 0 && (
              <>
                <rect
                  x={x}
                  y={y}
                  width={barW}
                  height={h}
                  rx={6}
                  className="bar-anim"
                  style={{ animationDelay: `${i * 40}ms` }}
                  fill="var(--color-coral)"
                  stroke="var(--color-ink)"
                  strokeWidth={2}
                />
                <text
                  x={x + barW / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={700}
                  fill="var(--color-ink)"
                  className="anim-fade"
                  style={{ animationDelay: `${i * 40 + 150}ms` }}
                >
                  {fmtMinutes(b.value)}
                </text>
              </>
            )}
            <text
              x={padL + i * slot + slot / 2}
              y={H - 8}
              textAnchor="middle"
              fontSize={10}
              fontWeight={600}
              fill="var(--color-ink)"
              opacity={0.65}
            >
              {b.label}
            </text>
            <rect x={padL + i * slot} y={0} width={slot} height={H} fill="transparent">
              <title>{`${b.label} — ${fmtMinutes(b.value)} · ${b.sessions} session${b.sessions === 1 ? '' : 's'}`}</title>
            </rect>
          </g>
        )
      })}
    </svg>
  )
}
