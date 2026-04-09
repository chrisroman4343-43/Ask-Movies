import { Radio, Globe } from 'lucide-react'

export default function ChannelSelector({ channels, activeId, onSelect }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
      {channels.map(ch => {
        const isActive = ch.id === activeId
        return (
          <button
            key={ch.id}
            onClick={() => onSelect(ch.id)}
            className={`
              flex items-center gap-2 shrink-0 px-3 py-2 rounded-lg text-xs font-medium
              border transition-all
              ${isActive
                ? 'bg-red-900/50 border-red-700/60 text-red-200'
                : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300'
              }
            `}
          >
            {isActive ? (
              <Radio size={11} className="text-red-400 shrink-0" />
            ) : (
              <Globe size={11} className="text-zinc-600 shrink-0" />
            )}
            <span className="truncate max-w-[100px]">{ch.name}</span>
            <span className={`text-[9px] ${isActive ? 'text-red-400/70' : 'text-zinc-600'}`}>
              {ch.region}
            </span>
          </button>
        )
      })}
    </div>
  )
}
