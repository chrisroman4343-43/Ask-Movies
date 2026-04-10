import { AlertTriangle, Zap, Map } from 'lucide-react'
import { newsChannels } from '../data/newsChannels'
import { useState } from 'react'
import { MapProvider, useMapContext } from '../context/MapContext'
import ErrorBoundary from './ErrorBoundary'
import VideoPlayer from './VideoPlayer'
import ChannelSelector from './ChannelSelector'
import IntelFeed from './IntelFeed'
import ConflictMap from './ConflictMap'

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
        <p className="text-[10px] text-zinc-700 tracking-wide uppercase">Coming Soon</p>
      </div>
    </div>
  )
}

const TABS = [
  { id: 'feed', label: 'Intel Feed', icon: Zap },
  { id: 'map', label: 'Tactical Map', icon: Map },
]

function MainContentInner() {
  const [activeChannelId, setActiveChannelId] = useState(newsChannels[0]?.id)
  const { activeTab, setActiveTab } = useMapContext()
  const activeChannel = newsChannels.find(ch => ch.id === activeChannelId) || newsChannels[0]

  return (
    <main className="flex-1 overflow-hidden bg-zinc-950 flex flex-col">
      {/* Live video player */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <div className="flex items-center gap-2 mb-2.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          <p className="text-[10px] font-semibold text-red-400 tracking-widest uppercase">
            Live Broadcast
          </p>
        </div>
        <ErrorBoundary label="Video Player">
          <VideoPlayer url={activeChannel.url} channelName={activeChannel.name} />
        </ErrorBoundary>
        <div className="mt-3">
          <ChannelSelector
            channels={newsChannels}
            activeId={activeChannelId}
            onSelect={setActiveChannelId}
          />
        </div>
      </div>

      {/* Sticky tab bar */}
      <div className="shrink-0 flex border-b border-zinc-800 bg-zinc-950">
        {TABS.map(tab => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-3 text-[11px] font-semibold
                uppercase tracking-widest transition-all relative
                ${isActive ? 'text-white' : 'text-zinc-600 hover:text-zinc-400'}
              `}
            >
              <tab.icon size={11} />
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-white rounded-t" />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'feed' && (
          <ErrorBoundary label="Intel Feed">
            <IntelFeed />
          </ErrorBoundary>
        )}
        {activeTab === 'map' && (
          <ErrorBoundary label="Tactical Map">
            <ConflictMap />
          </ErrorBoundary>
        )}
      </div>

      {/* Threat Assessment placeholder — only on feed tab */}
      {activeTab === 'feed' && (
        <div className="px-4 py-3 border-t border-zinc-800/60 shrink-0">
          <PlaceholderCard
            icon={AlertTriangle}
            title="Threat Assessments"
            description="Analyst-curated threat level indicators per region, updated hourly."
            badge="Soon"
          />
        </div>
      )}
    </main>
  )
}

export default function MainContent() {
  return (
    <MapProvider>
      <MainContentInner />
    </MapProvider>
  )
}
