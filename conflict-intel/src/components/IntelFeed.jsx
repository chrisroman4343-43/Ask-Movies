import { Zap, ExternalLink, MapPin, Loader2 } from 'lucide-react'
import { useMapContext } from '../context/MapContext'
import { useIntel } from '../context/IntelContext'

function SkeletonCard() {
  return (
    <div className="bg-cyan-500/[0.03] border border-cyan-500/20 rounded-md p-3 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-16 bg-cyan-500/20 rounded" />
        <div className="ml-auto h-2 w-20 bg-cyan-500/20 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-cyan-500/20 rounded" />
        <div className="h-3 w-3/4 bg-cyan-500/20 rounded" />
      </div>
    </div>
  )
}

export default function IntelFeed() {
  const { alerts, connected } = useIntel()
  const { focusOnLocation } = useMapContext()
  const initialLoad = alerts.length === 0

  const formatTime = (rawTimestamp) => {
    try {
      const date = new Date(rawTimestamp)
      if (isNaN(date)) return '—'
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZoneName: 'short',
      })
    } catch {
      return '—'
    }
  }

  const formatDate = (rawTimestamp) => {
    try {
      const date = new Date(rawTimestamp)
      if (isNaN(date)) return ''
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    } catch {
      return ''
    }
  }

  return (
    <div className="flex flex-col h-full bg-jarvis-bg">
      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-cyan-500/25 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-cyan-300" style={{ filter: 'drop-shadow(0 0 3px #67e8f9)' }} />
          <p className="text-[11px] font-bold text-cyan-200 tracking-[0.25em] uppercase font-display">OSINT Feed</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-cyan-300 animate-pulse' : 'bg-zinc-600'}`}
            style={{ boxShadow: connected ? '0 0 6px #67e8f9' : 'none' }}
          />
          <p className="text-[9px] text-cyan-500/70 font-mono uppercase tracking-widest">
            {connected ? 'Live' : 'Reconnecting'}
          </p>
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2 relative">
        <div className="scan-line-overlay pointer-events-none" />
        {initialLoad ? (
          <div className="space-y-1.5 px-3">
            {connected ? (
              <>
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader2 size={12} className="text-cyan-400 animate-spin" />
                  <p className="text-[10px] text-cyan-500 font-mono tracking-widest uppercase">Loading intelligence feed…</p>
                </div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-8">
                <div className="text-center">
                  <Loader2 size={16} className="text-cyan-500 animate-spin mx-auto mb-2" />
                  <p className="text-[11px] text-cyan-500/70 font-mono tracking-wider uppercase">Connecting to server…</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-1.5 px-3">
            {alerts.map((alert) => {
              const hasCoords = alert.lat != null && alert.lng != null
              return (
                <div
                  key={alert.id}
                  className="group bg-cyan-500/[0.03] border border-cyan-500/25 rounded-md p-3 hover:border-cyan-400/60 hover:bg-cyan-500/[0.07] transition-all animate-snap-in"
                >
                  {/* Source + badges + timestamp row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-mono text-cyan-400/80 uppercase tracking-widest">
                      {alert.source}
                    </span>
                    {alert.isBreaking && (
                      <span className="text-[9px] font-bold bg-amber-500/20 text-amber-200 border border-amber-400/60 px-1.5 py-0.5 rounded tracking-wider">
                        BREAKING
                      </span>
                    )}
                    <span className="ml-auto text-[9px] text-cyan-600/70 font-mono tabular-nums shrink-0">
                      {formatDate(alert.timestamp)} {formatTime(alert.timestamp)}
                    </span>
                  </div>

                  {/* Headline */}
                  {alert.link ? (
                    <a
                      href={alert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-start gap-1.5"
                    >
                      <p className="text-[12px] font-medium text-cyan-100 leading-snug group-hover/link:text-white transition-colors flex-1 line-clamp-2 font-hud">
                        {alert.headline}
                      </p>
                      <ExternalLink
                        size={10}
                        className="text-cyan-500/60 group-hover/link:text-cyan-200 transition-colors mt-0.5 shrink-0"
                      />
                    </a>
                  ) : (
                    <p className="text-[12px] font-medium text-cyan-100 leading-snug line-clamp-2 font-hud">
                      {alert.headline}
                    </p>
                  )}

                  {/* View on Map button */}
                  {hasCoords && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        focusOnLocation(alert.lat, alert.lng, alert.headline)
                      }}
                      className="mt-2 flex items-center gap-1.5 text-[9px] font-mono text-cyan-400/80 hover:text-cyan-200 active:text-white transition-colors uppercase tracking-widest py-1 -mx-1 px-1 rounded"
                    >
                      <MapPin size={9} />
                      View on Map
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
