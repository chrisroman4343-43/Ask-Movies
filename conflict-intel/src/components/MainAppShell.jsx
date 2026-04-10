import GlobalHeader from './GlobalHeader'
import LiveTicker from './LiveTicker'
import MainContent from './MainContent'

export default function MainAppShell() {
  return (
    // Outer wrapper centers the app on desktop; bg-zinc-900 fills the gutter
    <div className="min-h-screen bg-zinc-900 flex justify-center">
      {/* Mobile-first constrained viewport */}
      <div className="w-full max-w-sm h-screen overflow-hidden flex flex-col bg-zinc-950 shadow-2xl">
        <GlobalHeader />
        <LiveTicker />
        <MainContent />
      </div>
    </div>
  )
}
