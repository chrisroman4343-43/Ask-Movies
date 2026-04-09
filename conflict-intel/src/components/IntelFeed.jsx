import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Zap, ExternalLink, MapPin, Loader2 } from 'lucide-react'
import { useMapContext } from '../context/MapContext'

function SkeletonCard() {
  return (
    <div className="bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 animate-pulse">
      <div className="flex items-center gap-2 mb-2">
        <div className="h-2 w-16 bg-zinc-800 rounded" />
        <div className="ml-auto h-2 w-20 bg-zinc-800 rounded" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 w-full bg-zinc-800 rounded" />
        <div className="h-3 w-3/4 bg-zinc-800 rounded" />
      </div>
    </div>
  )
}

export default function IntelFeed() {
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)
  const [initialLoad, setInitialLoad] = useState(true)
  const { focusOnLocation } = useMapContext()

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => setConnected(true))

    socket.on('intelAlert', (alert) => {
      setAlerts((prev) => [alert, ...prev])
      setInitialLoad(false)
    })

    socket.on('disconnect', () => setConnected(false))

    return () => socket.disconnect()
  }, [])

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
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 px-4 py-2.5 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-yellow-500" />
          <p className="text-[11px] font-semibold text-zinc-200 tracking-widest uppercase">OSINT Feed</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`} />
          <p className="text-[9px] text-zinc-600 uppercase tracking-wide">
            {connected ? 'Live' : 'Reconnecting'}
          </p>
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
        {/* Loading skeletons on first boot */}
        {initialLoad && alerts.length === 0 ? (
          <div className="space-y-1.5 px-3">
            {connected ? (
              <>
                <div className="flex items-center justify-center gap-2 py-3">
                  <Loader2 size={12} className="text-zinc-600 animate-spin" />
                  <p className="text-[10px] text-zinc-600">Loading intelligence feed...</p>
                </div>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : (
              <div className="flex items-center justify-center h-full py-8">
                <div className="text-center">
                  <Loader2 size={16} className="text-zinc-700 animate-spin mx-auto mb-2" />
                  <p className="text-[11px] text-zinc-600">Connecting to server...</p>
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
                  className="group bg-zinc-900/50 border border-zinc-800/80 rounded-lg p-3 hover:border-zinc-700 hover:bg-zinc-900 transition-all"
                >
                  {/* Source + badges + timestamp row */}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-[9px] font-medium text-zinc-500 uppercase tracking-wide">
                      {alert.source}
                    </span>
                    {alert.isBreaking && (
                      <span className="text-[9px] font-bold bg-red-900/60 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded">
                        BREAKING
                      </span>
                    )}
                    <span className="ml-auto text-[9px] text-zinc-700 tabular-nums shrink-0">
                      {formatDate(alert.timestamp)} {formatTime(alert.timestamp)}
                    </span>
                  </div>

                  {/* Headline — clamped to 2 lines */}
                  {alert.link ? (
                    <a
                      href={alert.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group/link flex items-start gap-1.5"
                    >
                      <p className="text-[12px] font-medium text-zinc-300 leading-snug group-hover/link:text-white transition-colors flex-1 line-clamp-2">
                        {alert.headline}
                      </p>
                      <ExternalLink
                        size={10}
                        className="text-zinc-700 group-hover/link:text-zinc-400 transition-colors mt-0.5 shrink-0"
                      />
                    </a>
                  ) : (
                    <p className="text-[12px] font-medium text-zinc-300 leading-snug line-clamp-2">
                      {alert.headline}
                    </p>
                  )}

                  {/* View on Map button — thumb-friendly touch target */}
                  {hasCoords && (
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        focusOnLocation(alert.lat, alert.lng, alert.headline)
                      }}
                      className="mt-2 flex items-center gap-1.5 text-[9px] font-medium text-zinc-600 hover:text-blue-400 active:text-blue-300 transition-colors uppercase tracking-wide py-1.5 -mx-1 px-1 rounded"
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
