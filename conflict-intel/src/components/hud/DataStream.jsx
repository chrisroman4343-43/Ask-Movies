import { useMemo } from 'react'

/**
 * DataStream — a scrolling line-graph ticker.
 * Pure SVG; the track contains TWO identical graph strips rendered side-by-side
 * and animated right-to-left via the `data-stream` keyframe.
 *
 * Props:
 *   label    — small label shown top-left
 *   value    — small value readout shown top-right (e.g. "42.1 GB/s")
 *   color    — stroke color (default cyan)
 *   height   — pixel height
 *   points   — number of points per strip (default 60)
 */
export default function DataStream({
  label = 'TELEMETRY',
  value = '',
  color = '#22d3ee',
  height = 48,
  points = 60,
  seed = 1,
}) {
  // Deterministic pseudo-noise so SSR/HMR doesn't reshuffle on every render,
  // but each instance gets its own shape via the `seed` prop.
  const path = useMemo(() => {
    let s = seed * 9301 + 49297
    const rand = () => {
      s = (s * 9301 + 49297) % 233280
      return s / 233280
    }
    const xs = Array.from({ length: points })
    const mid = height * 0.5
    const amp = height * 0.35
    let prev = mid
    const pts = xs.map((_, i) => {
      const target = mid + (rand() - 0.5) * amp * 2
      prev = prev * 0.55 + target * 0.45
      // occasional spikes
      if (rand() > 0.94) prev += (rand() - 0.5) * amp * 1.2
      const x = (i / (points - 1)) * 100
      const y = Math.max(2, Math.min(height - 2, prev))
      return `${x},${y}`
    })
    return 'M ' + pts.join(' L ')
  }, [height, points, seed])

  return (
    <div className="relative w-full overflow-hidden" style={{ height: height + 18 }}>
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[8px] font-mono text-cyan-300/80 tracking-widest uppercase">
          {label}
        </span>
        {value && (
          <span className="text-[8px] font-mono text-cyan-200/90 tabular-nums">
            {value}
          </span>
        )}
      </div>
      <div
        className="relative w-full overflow-hidden border border-cyan-400/15 bg-cyan-500/[0.02]"
        style={{ height }}
      >
        {/* faint horizontal gridlines */}
        <svg
          className="absolute inset-0 w-full h-full"
          viewBox={`0 0 100 ${height}`}
          preserveAspectRatio="none"
        >
          {[0.25, 0.5, 0.75].map((r) => (
            <line
              key={r}
              x1="0" x2="100"
              y1={height * r} y2={height * r}
              stroke="rgba(34,211,238,0.08)"
              strokeWidth="0.3"
              strokeDasharray="1 2"
            />
          ))}
        </svg>

        {/* scrolling track with two identical strips */}
        <div className="absolute inset-0 data-stream-track">
          {[0, 1].map((k) => (
            <svg
              key={k}
              className="h-full shrink-0"
              style={{ width: '50%' }}
              viewBox={`0 0 100 ${height}`}
              preserveAspectRatio="none"
            >
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth="0.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: `drop-shadow(0 0 1.5px ${color})` }}
              />
              {/* area fill under the line */}
              <path
                d={`${path} L 100,${height} L 0,${height} Z`}
                fill={color}
                fillOpacity="0.08"
              />
            </svg>
          ))}
        </div>
      </div>
    </div>
  )
}
