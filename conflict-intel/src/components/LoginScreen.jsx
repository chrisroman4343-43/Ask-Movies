import { useState } from 'react'
import { Loader2, Lock, Mail } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import ArcReactor from './ArcReactor'
import DataStream from './hud/DataStream'
import BarMeter from './hud/BarMeter'

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
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      {/* ambient scan line */}
      <div className="scan-line-overlay absolute inset-0 pointer-events-none" />

      <div className="w-full max-w-sm relative z-10 animate-hud-boot">

        {/* Brand mark — arc reactor */}
        <div className="flex flex-col items-center mb-6">
          <ArcReactor size={112} />
          <h1 className="text-2xl font-black tracking-[0.3em] text-cyan-100 uppercase font-display text-glow-cyan mt-4 animate-snap-in">
            J.A.R.V.I.S.
          </h1>
          <p className="text-[10px] text-cyan-400 tracking-[0.4em] uppercase mt-1.5 font-mono">
            Stark Industries · Conflict Intel
          </p>
        </div>

        {/* Telemetry strip */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <BarMeter  label="CORE" count={12} height={28} />
          <DataStream label="UPLINK" value="ENCRYPTED" height={28} seed={7} />
        </div>

        {/* Login card */}
        <div className="hud-panel rounded-md p-5 hud-frame-4 relative">
          <div className="flex items-center justify-between mb-4">
            <p className="text-[10px] text-cyan-300/80 font-mono tracking-widest uppercase">
              ◢ Authentication
            </p>
            <p className="text-[10px] text-cyan-500/60 font-mono tracking-widest uppercase">
              SEC · LVL 5
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Email */}
            <div>
              <label className="block text-[9px] font-mono text-cyan-400/80 mb-1 tracking-widest uppercase">
                User ID
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/70" size={14} />
                <input
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="analyst@conflictintel.io"
                  required
                  disabled={loading}
                  className="w-full bg-jarvis-bg/80 border border-cyan-500/30 rounded-md pl-9 pr-3 py-2.5 text-[13px] font-hud text-cyan-100 placeholder-cyan-600/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[9px] font-mono text-cyan-400/80 mb-1 tracking-widest uppercase">
                Access Key
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500/70" size={14} />
                <input
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full bg-jarvis-bg/80 border border-cyan-500/30 rounded-md pl-9 pr-3 py-2.5 text-[13px] font-hud text-cyan-100 placeholder-cyan-600/60 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 transition-colors disabled:opacity-50"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-amber-500/10 border border-amber-400/50 rounded-md px-3 py-2 text-[11px] text-amber-200 font-mono">
                ⚠ {error}
              </div>
            )}

            {/* Login button */}
            <button
              type="submit"
              disabled={loading || !email || !password}
              className="w-full mt-2 bg-cyan-500/20 hover:bg-cyan-400/30 border border-cyan-400/70 hover:border-cyan-300 disabled:bg-slate-800/60 disabled:border-slate-700 disabled:text-slate-600 text-cyan-100 hover:text-white font-display font-bold tracking-[0.25em] uppercase rounded-md py-2.5 text-[12px] transition-all flex items-center justify-center gap-2 glow-cyan"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Authenticating…
                </>
              ) : (
                'Engage'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[9px] text-cyan-600/70 mt-5 font-mono tracking-widest uppercase">
          ◣ Authorised personnel only ◢
        </p>
      </div>
    </div>
  )
}
