import { createContext, useContext, useState } from 'react'

/**
 * Auth context shape:
 *   isLoggedIn : boolean
 *   user       : { email: string } | null
 *   login      : (email, password) => Promise<{ error: string | null }>
 *   logout     : () => void
 *
 * To swap in Clerk: replace the AuthProvider body; useAuth() shape is unchanged.
 * To swap in Supabase: replace the AuthProvider body with supabase.auth calls; same shape.
 */

const AuthContext = createContext(null)

// Mock whitelist — in production this check is server-side / Clerk org membership
const MOCK_WHITELIST = ['analyst@conflictintel.io', 'demo@conflictintel.io']

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)

  const login = async (email, password) => {
    // Simulate network latency
    await new Promise(r => setTimeout(r, 900))

    const normalised = email.trim().toLowerCase()

    if (!MOCK_WHITELIST.includes(normalised)) {
      return { error: 'Access denied. This platform is invite-only.' }
    }
    if (password.length < 4) {
      return { error: 'Invalid credentials.' }
    }

    setUser({ email: normalised })
    return { error: null }
  }

  const logout = () => setUser(null)

  return (
    <AuthContext.Provider value={{ isLoggedIn: user !== null, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
