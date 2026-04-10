import { Zap, Map, Cpu } from 'lucide-react'
import { newsChannels } from '../data/newsChannels'
import { useState } from 'react'
import { MapProvider, useMapContext } from '../context/MapContext'
import ErrorBoundary from './ErrorBoundary'
import VideoPlayer from './VideoPlayer'
import ChannelSelector from './ChannelSelector'
import IntelFeed from './IntelFeed'
import ConflictMap from './ConflictMap'
import JarvisPanel from './JarvisPanel'

const TABS = [
  { id: 'jarvis', label: 'J.A.R.V.I.S.', icon: Cpu },
  { id: 'feed',   label: 'Intel Feed',   icon: Zap },
  { id: 'map',    label: 'Tactical',     icon: Map },
]

function MainContentInner() {
  const [activeChannelId, setActiveChannelId] = useState(newsChannels[0]?.id)
  const { activeTab, setActiveTab } = useMapContext()
  const activeChannel = newsChannels.find(ch => ch.id === activeChannelId) || newsChannels[0]

  return (
    <main className="flex-1 overflow-hidden bg-jarvis-bg flex flex-col relative">
      {/* Live video player */}
      <div className="px-4 pt-3 pb-3 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-cyan-300 animate-pulse" style={{ boxShadow: '0 0 6px #67e8f9' }} />
            <p className="text-[10px] font-bold text-cyan-300 tracking-[0.25em] uppercase font-display">
              Live Broadcast
            </p>
          </div>
          <p className="text-[9px] text-cyan-500/70 font-mono tracking-widest uppercase">
            CH · {activeChannel.region || 'GLOBAL'}
          </p>
        </div>
        <ErrorBoundary label="Video Player">
          <VideoPlayer url={activeChannel.url} channelName={activeChannel.name} />
        </ErrorBoundary>
        <div className="mt-2.5">
          <ChannelSelector
            channels={newsChannels}
            activeId={activeChannelId}
            onSelect={setActiveChannelId}
          />
        </div>
      </div>

      {/* Tab bar */}
      <div className="shrink-0 flex border-y border-cyan-500/25 bg-cyan-500/[0.03]">
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[10px] font-bold
                uppercase tracking-[0.2em] transition-all relative font-display
                ${idx > 0 ? 'border-l border-cyan-500/20' : ''}
                ${isActive
                  ? 'text-cyan-100 bg-cyan-500/10 text-glow-cyan-soft'
                  : 'text-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-500/5'
                }
              `}
            >
              <tab.icon size={11} />
              {tab.label}
              {isActive && (
                <>
                  <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-cyan-300 rounded-t" style={{ boxShadow: '0 0 6px #67e8f9' }} />
                  <span className="absolute top-0 left-2 right-2 h-px bg-cyan-400/60" />
                </>
              )}
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'jarvis' && (
          <ErrorBoundary label="JARVIS">
            <JarvisPanel />
          </ErrorBoundary>
        )}
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
