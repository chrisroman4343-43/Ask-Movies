import { Radio } from 'lucide-react'
import { tickerAlerts } from '../data/tickerAlerts'

function AlertItem({ alert }) {
  return (
    <span className="inline-flex items-center gap-2 mx-10 text-xs whitespace-nowrap">
      <Radio size={10} className="text-cyan-300 shrink-0" />
      <span className="text-cyan-300 font-mono text-[10px] shrink-0 tracking-wider">
        {alert.timestamp}
      </span>
      <span className="text-cyan-100/90 font-hud">
        {alert.emoji} {alert.text}
      </span>
    </span>
  )
}

export default function LiveTicker() {
  return (
    <div className="relative bg-cyan-500/5 border-y border-cyan-500/25 py-1.5 overflow-hidden shrink-0 select-none">
      {/* Edge fades so text dissolves into the bezel rather than clipping hard */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-jarvis-bg to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-jarvis-bg to-transparent z-10" />

      <div className="flex marquee-track animate-marquee whitespace-nowrap">
        {tickerAlerts.map(alert => (
          <AlertItem key={`a-${alert.id}`} alert={alert} />
        ))}
        {tickerAlerts.map(alert => (
          <AlertItem key={`b-${alert.id}`} alert={alert} />
        ))}
      </div>
    </div>
  )
}
