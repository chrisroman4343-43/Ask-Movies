import { Radio } from 'lucide-react'
import { tickerAlerts } from '../data/tickerAlerts'

function AlertItem({ alert }) {
  return (
    <span className="inline-flex items-center gap-2 mx-10 text-xs text-red-100 whitespace-nowrap">
      <Radio size={10} className="text-red-500 shrink-0" />
      <span className="text-red-500 font-mono text-[10px] shrink-0">{alert.timestamp}</span>
      <span className="text-red-200">
        {alert.emoji} {alert.text}
      </span>
    </span>
  )
}

export default function LiveTicker() {
  return (
    <div className="bg-red-900/40 border-b border-red-800/50 py-2 overflow-hidden shrink-0">
      {/*
        Seamless marquee: render the alert list TWICE inside one flex row.
        The animation runs translateX(0) → translateX(-50%), which equals
        exactly one copy's width. At reset, the duplicate is pixel-perfect
        with where the original started — the loop is invisible.
      */}
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
