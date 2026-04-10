import { Shield, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export default function GlobalHeader() {
  const { logout, user } = useAuth()

  return (
    <header className="sticky top-0 z-50 bg-zinc-950/95 backdrop-blur-sm border-b border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0">
      {/* Branding */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-red-950/70 border border-red-800/50 flex items-center justify-center">
          <Shield className="text-red-400" size={14} />
        </div>
        <div>
          <p className="text-xs font-bold tracking-widest text-zinc-100 uppercase leading-none">
            Conflict Intel
          </p>
          <p className="text-[9px] text-red-400 tracking-[0.2em] uppercase leading-none mt-0.5">
            Classified Feed
          </p>
        </div>
      </div>

      {/* Right side — user + logout */}
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-[10px] text-zinc-600 hidden sm:block truncate max-w-[120px]">
            {user.email}
          </span>
        )}
        <button
          onClick={logout}
          title="Log out"
          className="text-zinc-600 hover:text-zinc-300 transition-colors p-1"
        >
          <LogOut size={16} />
        </button>
      </div>
    </header>
  )
}
