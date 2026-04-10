import { LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

/**
 * Tiny glowing "monogram" arc-reactor icon used in the header — smaller and
 * cheaper than the full <ArcReactor/> so it doesn't eat CPU on a sticky nav.
 */
function HeaderMark() {
  return (
    <div className="relative w-7 h-7">
      {/* outer spinning ring */}
      <div
        className="absolute inset-0 rounded-full border border-cyan-400/70"
        style={{ animation: 'radar-sweep 6s linear infinite', boxShadow: '0 0 6px rgba(34,211,238,0.6)' }}
      />
      {/* mid counter-rotating dashed ring */}
      <div
        className="absolute inset-[14%] rounded-full border border-dashed border-cyan-300/60"
        style={{ animation: 'radar-sweep 4s linear infinite reverse' }}
      />
      {/* core */}
      <div
        className="absolute inset-[34%] rounded-full"
        style={{
          background:
            'radial-gradient(circle, rgba(207,250,254,1) 0%, rgba(103,232,249,0.9) 40%, rgba(34,211,238,0.5) 100%)',
          boxShadow: '0 0 8px rgba(103,232,249,1), 0 0 14px rgba(34,211,238,0.7)',
        }}
      />
    </div>
  )
}

export default function GlobalHeader() {
  const { logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-jarvis-bg/95 backdrop-blur-sm border-b border-cyan-500/25 px-4 py-2.5 flex items-center justify-between shrink-0 relative">
      {/* faint scan line strip running along the header */}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

      {/* Branding */}
      <div className="flex items-center gap-2.5">
        <HeaderMark />
        <div>
          <p className="text-[11px] font-black tracking-[0.3em] text-cyan-100 uppercase font-display leading-none text-glow-cyan-soft">
            J.A.R.V.I.S.
          </p>
          <p className="text-[8px] text-cyan-400/80 tracking-[0.25em] uppercase leading-none mt-1 font-mono">
            Conflict Intel · Online
          </p>
        </div>
      </div>

      {/* Right side — user + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-[9px] text-cyan-500/80 font-mono hidden sm:block truncate max-w-[130px]">
            {user.email}
          </span>
        )}
        <button
          onClick={logout}
          title="Log out"
          className="text-cyan-400 hover:text-cyan-200 transition-colors p-1"
        >
          <LogOut size={15} />
        </button>
      </div>
    </header>
  )
}
