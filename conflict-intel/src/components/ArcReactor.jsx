/**
 * Arc Reactor — the Stark-style HUD centerpiece.
 *
 * Concentric rings that rotate INDEPENDENTLY at different speeds and directions:
 *   - ring-outer  → clockwise, slowest
 *   - ring-mid    → counter-clockwise, medium
 *   - ring-inner  → clockwise, fastest
 * When `active` is true (JARVIS speaking/thinking) everything whirs faster.
 * When the parent has `.jarvis-speaking`, CSS overrides in index.css kick each
 * ring into an even tighter tempo and animate the glowing core in audio sync.
 *
 * Pure SVG/CSS, no assets.
 */
export default function ArcReactor({ active = false, size = 128 }) {
  const outerSpeed = active ? '3.2s'  : '9s'
  const midSpeed   = active ? '2.4s'  : '6s'
  const innerSpeed = active ? '1.6s'  : '4.5s'

  return (
    <div
      className="relative animate-hud-boot"
      style={{ width: size, height: size }}
    >
      {/* Ambient halo */}
      <div
        className="absolute inset-0 rounded-full arc-halo"
        style={{
          boxShadow:
            '0 0 40px rgba(34,211,238,0.35), 0 0 90px rgba(34,211,238,0.2), 0 0 140px rgba(34,211,238,0.08)',
        }}
      />

      {/* =============================================================
          OUTER RING — slow clockwise with long/short tick marks
          ============================================================= */}
      <div
        className="arc-ring-outer absolute inset-0"
        style={{ animation: `radar-sweep ${outerSpeed} linear infinite` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Fine dashed ring */}
          <circle
            cx="50" cy="50" r="47"
            fill="none"
            stroke="rgba(34,211,238,0.35)"
            strokeWidth="0.5"
            strokeDasharray="1 2"
          />
          {/* Degree ticks */}
          {Array.from({ length: 36 }).map((_, i) => {
            const angle = (i * 360) / 36
            const long = i % 9 === 0
            return (
              <line
                key={i}
                x1="50" y1={long ? 2.5 : 5}
                x2="50" y2={long ? 11 : 7.5}
                stroke={long ? '#67e8f9' : 'rgba(34,211,238,0.7)'}
                strokeWidth={long ? 1.3 : 0.6}
                transform={`rotate(${angle} 50 50)`}
              />
            )
          })}
          {/* Four cardinal degree numerals */}
          {[
            { v: '000', a: 0   },
            { v: '090', a: 90  },
            { v: '180', a: 180 },
            { v: '270', a: 270 },
          ].map(({ v, a }) => (
            <text
              key={v}
              x="50" y="16"
              textAnchor="middle"
              fontSize="3.6"
              fontFamily="Share Tech Mono, monospace"
              fill="rgba(103,232,249,0.9)"
              transform={`rotate(${a} 50 50)`}
            >
              {v}
            </text>
          ))}
        </svg>
      </div>

      {/* =============================================================
          MID RING — medium counter-clockwise dashed w/ cardinal pips
          ============================================================= */}
      <div
        className="arc-ring-mid absolute inset-[10%]"
        style={{ animation: `radar-sweep ${midSpeed} linear infinite reverse` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle
            cx="50" cy="50" r="44"
            fill="none"
            stroke="rgba(103,232,249,0.55)"
            strokeWidth="0.9"
            strokeDasharray="5 3"
          />
          {/* Big cardinal pips */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * 360) / 8
            return (
              <g key={i} transform={`rotate(${angle} 50 50)`}>
                <circle cx="50" cy="7" r="1.3" fill="#67e8f9" />
                <line
                  x1="50" y1="10"
                  x2="50" y2="14"
                  stroke="rgba(103,232,249,0.8)"
                  strokeWidth="0.7"
                />
              </g>
            )
          })}
        </svg>
      </div>

      {/* =============================================================
          INNER RING — fast clockwise arc segments
          ============================================================= */}
      <div
        className="arc-ring-inner absolute inset-[22%]"
        style={{ animation: `radar-sweep ${innerSpeed} linear infinite` }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Three open arc segments forming a broken ring */}
          {[0, 120, 240].map((rot) => (
            <path
              key={rot}
              d="M 50 10 A 40 40 0 0 1 84.64 30"
              fill="none"
              stroke="#22d3ee"
              strokeWidth="1.6"
              strokeLinecap="round"
              transform={`rotate(${rot} 50 50)`}
              style={{ filter: 'drop-shadow(0 0 3px rgba(103,232,249,1))' }}
            />
          ))}
        </svg>
      </div>

      {/* Solid thin ring boundary */}
      <div
        className="absolute inset-[32%] rounded-full border border-cyan-300/60"
        style={{
          boxShadow:
            'inset 0 0 14px rgba(34,211,238,0.5), 0 0 14px rgba(34,211,238,0.4)',
        }}
      />

      {/* =============================================================
          GLOWING CORE — pulses naturally; faster when speaking
          ============================================================= */}
      <div
        className="arc-core absolute inset-[40%] rounded-full animate-core-pulse"
        style={{
          background:
            'radial-gradient(circle, rgba(207,250,254,0.98) 0%, rgba(103,232,249,0.9) 35%, rgba(34,211,238,0.55) 80%, rgba(34,211,238,0) 100%)',
          boxShadow:
            '0 0 24px rgba(103,232,249,1), 0 0 50px rgba(34,211,238,0.75), 0 0 90px rgba(34,211,238,0.45)',
        }}
      />

      {/* Stark reactor triangle overlay */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,32 68,62 32,62"
          fill="none"
          stroke="rgba(207,250,254,0.95)"
          strokeWidth="1.1"
          strokeLinejoin="round"
          style={{ filter: 'drop-shadow(0 0 3px rgba(103,232,249,1))' }}
        />
      </svg>

      {/* Active-state expanding ring ping */}
      {active && (
        <div
          className="absolute inset-[32%] rounded-full border border-cyan-300/60 animate-ring-expand pointer-events-none"
        />
      )}
    </div>
  )
}
