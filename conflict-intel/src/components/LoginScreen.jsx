import { useState } from 'react'
import { Shield, Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function LoginScreen() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    const { error: err } = await login(email, password)
    setLoading(false)
    if (err) setError(err)
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Brand mark */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800/50 flex items-center justify-center mb-4">
            <Shield className="text-red-400" size={26} />
          </div>
          <h1 className="text-xl font-bold tracking-widest text-zinc-100 uppercase">
            Conflict Intel
          </h1>
          <p className="text-xs text-red-400 tracking-[0.25em] uppercase mt-1">
            Classified Feed
          </p>
        </div>

        {/* Login card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <p className="text-sm text-zinc-400 mb-6 text-center">
            Authorised personnel only
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@conflictintel.io"
                  required
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 tracking-wide uppercase">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" size={15} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-zinc-950 border border-zinc-700 rounded-lg pl-9 pr-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600/50 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error banner */}
            {error && (
              <div className="bg-red-950/60 border border-red-800/60 rounded-lg px-4 py-2.5 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Login button — NO Sign Up button (whitelist-only) */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full bg-red-700 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-semibold rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-zinc-700 mt-6">
          Access is restricted to invited analysts only.
        </p>
      </div>
    </div>
  )
}
