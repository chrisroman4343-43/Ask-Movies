import { useRef, useEffect, useState } from 'react'
import Hls from 'hls.js'
import { AlertTriangle, Loader2, Volume2, VolumeX } from 'lucide-react'

export default function VideoPlayer({ url, channelName }) {
  const videoRef = useRef(null)
  const hlsRef = useRef(null)
  const [status, setStatus] = useState('loading') // loading | playing | error
  const [errorMsg, setErrorMsg] = useState(null)
  const [muted, setMuted] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    if (!video || !url) return

    // Reset state on channel switch
    setStatus('loading')
    setErrorMsg(null)

    // Clean up previous instance
    if (hlsRef.current) {
      hlsRef.current.destroy()
      hlsRef.current = null
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        maxBufferLength: 10,
        maxMaxBufferLength: 20,
      })
      hlsRef.current = hls

      hls.loadSource(url)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        video.play().then(() => setStatus('playing')).catch(() => {
          // Autoplay blocked — still show video frame, just muted
          video.muted = true
          video.play().then(() => setStatus('playing')).catch(() => setStatus('error'))
        })
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setErrorMsg('Network error — stream may be offline')
              setStatus('error')
              // Try to recover once
              hls.startLoad()
              break
            case Hls.ErrorTypes.MEDIA_ERROR:
              hls.recoverMediaError()
              break
            default:
              setErrorMsg('Stream unavailable')
              setStatus('error')
              hls.destroy()
              break
          }
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Native HLS support (Safari)
      video.src = url
      video.addEventListener('loadedmetadata', () => {
        video.play().then(() => setStatus('playing')).catch(() => setStatus('error'))
      })
    } else {
      setErrorMsg('HLS not supported in this browser')
      setStatus('error')
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy()
        hlsRef.current = null
      }
    }
  }, [url])

  const toggleMute = () => {
    const video = videoRef.current
    if (!video) return
    video.muted = !video.muted
    setMuted(video.muted)
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-md overflow-hidden border border-cyan-500/40 hud-frame-4" style={{ boxShadow: '0 0 24px rgba(34,211,238,0.18), inset 0 0 18px rgba(34,211,238,0.06)' }}>
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={muted}
        playsInline
        autoPlay
      />

      {/* Corner cross-hairs (targeting) */}
      <div className="pointer-events-none absolute top-2 left-2 w-3 h-3 border-t border-l border-cyan-300/80" />
      <div className="pointer-events-none absolute top-2 right-2 w-3 h-3 border-t border-r border-cyan-300/80" />
      <div className="pointer-events-none absolute bottom-2 left-2 w-3 h-3 border-b border-l border-cyan-300/80" />
      <div className="pointer-events-none absolute bottom-2 right-2 w-3 h-3 border-b border-r border-cyan-300/80" />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-jarvis-bg/85 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="text-cyan-300 animate-spin" />
          <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Connecting to stream…</p>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-jarvis-bg/90 flex flex-col items-center justify-center gap-2 px-4">
          <AlertTriangle size={24} className="text-amber-400" />
          <p className="text-[11px] text-amber-200 text-center font-mono">{errorMsg || 'Stream unavailable'}</p>
          <p className="text-[9px] text-cyan-600/70 font-mono tracking-wider uppercase">Some streams may be geo-restricted</p>
        </div>
      )}

      {/* Top-left: LIVE badge */}
      {status === 'playing' && (
        <div className="absolute top-2.5 left-6 flex items-center gap-1.5 bg-cyan-500/20 backdrop-blur-sm border border-cyan-300/70 px-2 py-0.5 rounded-sm" style={{ boxShadow: '0 0 10px rgba(34,211,238,0.6)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-200 animate-pulse" />
          <span className="text-[10px] font-black text-cyan-50 tracking-[0.2em] uppercase font-display">LIVE</span>
        </div>
      )}

      {/* Bottom bar: channel name + mute toggle */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pt-6 pb-2 flex items-end justify-between">
        <p className="text-[11px] font-semibold text-cyan-100 truncate font-hud tracking-wide">{channelName}</p>
        <button
          onClick={toggleMute}
          className="text-cyan-300 hover:text-white transition-colors p-1"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  )
}
