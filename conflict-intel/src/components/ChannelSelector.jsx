import { Radio, Globe } from 'lucide-react'

export default function ChannelSelector({ channels, activeId, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {channels.map(ch => {
        const isActive = ch.id === activeId
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={`
              flex items-center gap-2 shrink-0 px-3 py-2 rounded-md text-[11px] font-hud font-medium
              border transition-all min-h-[36px]
              ${isActive
                ? 'bg-cyan-500/15 border-cyan-400/70 text-cyan-100 glow-cyan'
                : 'bg-cyan-500/[0.03] border-cyan-500/25 text-cyan-400/80 hover:border-cyan-400/50 hover:text-cyan-200'
              }
            `}
          >
            {isActive ? (
              <Radio size={11} className="text-cyan-200 shrink-0" style={{ filter: 'drop-shadow(0 0 2px #67e8f9)' }} />
            ) : (
              <Globe size={11} className="text-cyan-500/80 shrink-0" />
            )}
            <span className="truncate max-w-[100px]">{ch.name}</span>
            <span className={`text-[9px] font-mono ${isActive ? 'text-cyan-200/80' : 'text-cyan-500/60'}`}>
              {ch.region}
            </span>
          </button>
        )
      })}
    </div>
  )
}
