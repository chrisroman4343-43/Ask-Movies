import { useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import { Zap } from 'lucide-react'

export default function IntelFeed() {
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io('http://localhost:3001', {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => {
      console.log('Connected to Intel Feed server')
      setConnected(true)
    })

    socket.on('intelAlert', (alert) => {
      console.log('New alert:', alert)
      setAlerts((prev) => [alert, ...prev])
    })

    socket.on('disconnect', () => {
      console.log('Disconnected from Intel Feed server')
      setConnected(false)
    })

    return () => {
      socket.disconnect()
    }
  }, [])

  const formatTime = (isoString) => {
    const date = new Date(isoString)
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center gap-2 mb-2">
          <Zap size={14} className="text-yellow-500" />
          <p className="text-xs font-semibold text-zinc-200">OSINT FEED</p>
        </div>
        <p className="text-[10px] text-zinc-600">
          {connected ? 'Live • Connected' : 'Offline • Reconnecting...'}
        </p>
      </div>

      {/* Alerts list */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {alerts.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-zinc-600 text-center">
              {connected
                ? 'Awaiting intelligence feed...'
                : 'Connecting to server...'}
            </p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-zinc-900/60 border border-zinc-800 rounded-lg p-3 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-[11px] font-medium text-zinc-300 leading-tight flex-1">
                  {alert.headline}
                </p>
                {alert.isBreaking && (
                  <span className="text-[9px] font-bold bg-red-900/60 text-red-300 border border-red-800/50 px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
                    BREAKING
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between">
                <p className="text-[9px] text-zinc-500">{alert.source}</p>
                <p className="text-[9px] text-zinc-600">{formatTime(alert.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
