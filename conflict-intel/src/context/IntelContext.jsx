import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'

/**
 * IntelContext — shared, top-level store of OSINT alerts and connection state.
 * The socket connection lives here (not in any single view) so it persists
 * across tab switches and so JARVIS and the Intel Feed see the same data.
 */

const IntelContext = createContext(null)
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

export function IntelProvider({ children }) {
  const [alerts, setAlerts] = useState([])
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const socket = io(BACKEND_URL, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })

    socket.on('connect', () => setConnected(true))
    socket.on('intelAlert', (alert) => setAlerts((prev) => [alert, ...prev]))
    socket.on('disconnect', () => setConnected(false))

    return () => socket.disconnect()
  }, [])

  return (
    <IntelContext.Provider value={{ alerts, connected }}>
      {children}
    </IntelContext.Provider>
  )
}

export function useIntel() {
  const ctx = useContext(IntelContext)
  if (!ctx) throw new Error('useIntel must be used within <IntelProvider>')
  return ctx
}
