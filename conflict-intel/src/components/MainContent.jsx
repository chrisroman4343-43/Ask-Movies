import { MapPin, Activity, AlertTriangle, Tv } from 'lucide-react'

function PlaceholderCard({ icon: Icon, title, description, badge }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
            <Icon size={15} className="text-zinc-400" />
          </div>
          <p className="text-sm font-semibold text-zinc-200">{title}</p>
        </div>
        {badge && (
          <span className="text-[10px] font-medium bg-red-900/50 text-red-400 border border-red-800/50 px-2 py-0.5 rounded-full">
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-zinc-600 leading-relaxed">{description}</p>
      <div className="mt-3 h-[72px] bg-zinc-950/60 rounded-lg border border-zinc-800/60 flex items-center justify-center">
        <p className="text-[10px] text-zinc-700 tracking-wide uppercase">Module coming in Phase 2</p>
      </div>
    </div>
  )
}

export default function MainContent() {
  return (
    <main className="flex-1 overflow-y-auto bg-zinc-950">
      {/* Hero placeholder */}
      <div className="bg-zinc-950 border-b border-zinc-800/60 px-4 pt-5 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <p className="text-[10px] font-semibold text-red-400 tracking-widest uppercase">Live</p>
        </div>
        <h2 className="text-base font-bold text-zinc-100 mb-1">Main Content Area</h2>
        <p className="text-xs text-zinc-500">Video · Intel · Map goes here</p>
        <div className="mt-3 h-40 bg-zinc-900 rounded-xl border border-zinc-800 flex flex-col items-center justify-center gap-2">
          <Tv size={28} className="text-zinc-700" />
          <p className="text-xs text-zinc-700">Live broadcast feed — Phase 2</p>
        </div>
      </div>

      {/* Module placeholders */}
      <div className="px-4 py-4 space-y-3">
        <p className="text-[10px] font-semibold text-zinc-600 tracking-widest uppercase">
          Intel Modules
        </p>
        <PlaceholderCard
          icon={MapPin}
          title="Conflict Map"
          description="Real-time geolocated incident overlay with theatre-by-theatre breakdown."
          badge="Soon"
        />
        <PlaceholderCard
          icon={Activity}
          title="OSINT Feed"
          description="Aggregated raw OSINT sources — Telegram channels, X/Twitter lists, scanner audio."
          badge="Soon"
        />
        <PlaceholderCard
          icon={AlertTriangle}
          title="Threat Assessments"
          description="Analyst-curated threat level indicators per region, updated hourly."
          badge="Soon"
        />
      </div>
    </main>
  )
}
