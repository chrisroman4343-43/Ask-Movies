import { useEffect, useRef } from 'react'

/**
 * Waveform — an audio-reactive oscillator line.
 *
 * When `active` is true (JARVIS is speaking) the wave has large, dancing
 * amplitude. When idle it's a gentle low-amplitude breathing line.
 *
 * Implementation: a <canvas> driven by requestAnimationFrame. No Web Audio
 * analyser (speechSynthesis provides no stream to tap), so we instead animate
 * a synthesised sum of sines with amplitude/speed driven by `active`.
 */
export default function Waveform({
  active = false,
  height = 40,
  label = 'VOICE I/O',
  color = '#22d3ee',
}) {
  const canvasRef = useRef(null)
  const activeRef = useRef(active)
  const rafRef    = useRef(0)

  // Keep the latest `active` value visible inside the rAF closure
  useEffect(() => { activeRef.current = active }, [active])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    // Resize for HiDPI crispness
    const dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1))
    const resize = () => {
      const { width } = canvas.getBoundingClientRect()
      canvas.width  = Math.floor(width  * dpr)
      canvas.height = Math.floor(height * dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    // Smoothed amplitude — lerped toward the target so transitions are gentle
    let amp = 0.06
    const render = (t) => {
      const W = canvas.width
      const H = canvas.height

      const target = activeRef.current ? 0.55 : 0.08
      amp += (target - amp) * 0.08

      const speed = activeRef.current ? 0.012 : 0.004

      ctx.clearRect(0, 0, W, H)

      // Grid
      ctx.strokeStyle = 'rgba(34,211,238,0.08)'
      ctx.lineWidth = 1 * dpr
      ctx.setLineDash([1 * dpr, 3 * dpr])
      ctx.beginPath()
      ctx.moveTo(0, H / 2)
      ctx.lineTo(W, H / 2)
      ctx.stroke()
      ctx.setLineDash([])

      // Wave — sum of 3 sines
      ctx.beginPath()
      ctx.lineWidth = 1.4 * dpr
      ctx.strokeStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 6 * dpr

      const steps = 120
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * W
        const phase = (i / steps) * Math.PI * 4
        const y =
          H / 2 +
          Math.sin(phase + t * speed)             * (H * 0.32 * amp) +
          Math.sin(phase * 2.3 + t * speed * 1.7) * (H * 0.18 * amp) +
          Math.sin(phase * 4.1 + t * speed * 2.4) * (H * 0.10 * amp * (activeRef.current ? 1.6 : 0.4))
        if (i === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
      }
      ctx.stroke()
      ctx.shadowBlur = 0

      rafRef.current = requestAnimationFrame(render)
    }
    rafRef.current = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [color, height])

  return (
    <div className="relative w-full" style={{ height: height + 18 }}>
      <div className="flex items-center justify-between mb-1 px-1">
        <span className="text-[8px] font-mono text-cyan-300/80 tracking-widest uppercase">
          {label}
        </span>
        <span className={`text-[8px] font-mono tabular-nums ${active ? 'text-cyan-200' : 'text-cyan-300/50'}`}>
          {active ? 'TX' : 'STANDBY'}
        </span>
      </div>
      <div
        className="relative w-full border border-cyan-400/15 bg-cyan-500/[0.02] overflow-hidden"
        style={{ height }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full block"
          style={{ height, width: '100%' }}
        />
      </div>
    </div>
  )
}
