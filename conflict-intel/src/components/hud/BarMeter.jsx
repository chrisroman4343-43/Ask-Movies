import { useMemo } from 'react'

/**
 * BarMeter — frantically flickering vertical bars (CPU/GPU/RAM simulacrum).
 *
 * Props:
 *   label  — tiny label
 *   count  — number of bars
 *   height — px height
 */
export default function BarMeter({
  label = 'CPU LOAD',
  count = 18,
  height = 44,
}) {
  const bars = useMemo(() => {
    return Array.from({ length: count }).map((_, i) => ({
      key: i,
      // Random starting scale + staggered negative delay so every bar is out-of-phase
      h: 0.25 + Math.random() * 0.75,
      delay: -(Math.random() * 0.9).toFixed(3),
      dur: (0.55 + Math.random() * 0.6).toFixed(3),
    }))
  }, [count])

  return (
    <div className="relative w-full" style={{ height: height + 18 }}>
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[8px] font-mono text-cyan-300/80 tracking-widest uppercase">
          {label}
        </span>
        <span className="text-[8px] font-mono text-cyan-200/70">▲ nominal</span>
      </div>
      <div
        className="relative w-full border border-cyan-400/15 bg-cyan-500/[0.02] flex items-end gap-[2px] px-[2px] pb-[2px]"
        style={{ height }}
      >
        {bars.map((b) => (
          <div
            key={b.key}
            className="flex-1 origin-bottom bg-gradient-to-t from-cyan-500/80 via-cyan-300/90 to-cyan-100/90"
            style={{
              height: `${b.h * 100}%`,
              animation: `bar-flicker ${b.dur}s ease-in-out ${b.delay}s infinite`,
              boxShadow: '0 0 4px rgba(34,211,238,0.6)',
            }}
          />
        ))}
      </div>
    </div>
  )
}
