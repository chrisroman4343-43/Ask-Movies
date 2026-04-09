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
    <div className="relative w-full aspect-video bg-black rounded-xl overflow-hidden border border-zinc-800">
      {/* Video element */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        muted={muted}
        playsInline
        autoPlay
      />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center gap-2">
          <Loader2 size={24} className="text-red-400 animate-spin" />
          <p className="text-xs text-zinc-400">Connecting to stream...</p>
        </div>
      )}

      {/* Error overlay */}
      {status === 'error' && (
        <div className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center gap-2 px-4">
          <AlertTriangle size={24} className="text-red-500" />
          <p className="text-xs text-red-300 text-center">{errorMsg || 'Stream unavailable'}</p>
          <p className="text-[10px] text-zinc-600">Some streams may be geo-restricted</p>
        </div>
      )}

      {/* Top-left: LIVE badge */}
      {status === 'playing' && (
        <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-sm px-2 py-0.5 rounded">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span className="text-[10px] font-bold text-white tracking-wide uppercase">Live</span>
        </div>
      )}

      {/* Bottom bar: channel name + mute toggle */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent px-3 pt-6 pb-2 flex items-end justify-between">
        <p className="text-xs font-medium text-zinc-200 truncate">{channelName}</p>
        <button
          onClick={toggleMute}
          className="text-zinc-400 hover:text-white transition-colors p-1"
          title={muted ? 'Unmute' : 'Mute'}
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  )
}
