import { useEffect, useMemo, useRef, useState } from 'react'
import { Mic, MicOff, Send, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { useIntel } from '../context/IntelContext'
import { jarvisRespond, welcomeLine } from '../lib/jarvisBrain'
import ArcReactor from './ArcReactor'
import DataStream from './hud/DataStream'
import BarMeter from './hud/BarMeter'
import Waveform from './hud/Waveform'

/**
 * JarvisPanel — conversational interface with the on-board AI.
 *
 * Features:
 *   - Chat transcript (user + JARVIS bubbles)
 *   - Voice output via Web Speech Synthesis (prefers British male: "Google UK
 *     English Male" → "Daniel" → any en-GB voice → any English voice)
 *   - Voice input via webkitSpeechRecognition (tap the mic to speak)
 *   - Mute toggle (persists for the session)
 *   - Live OSINT context from IntelContext — every response is synthesised
 *     against the current alert list via jarvisBrain.js
 *   - Animated telemetry widgets (arc reactor, waveform, bar meters, stream)
 *     with the arc reactor + waveform reacting in real time to TTS state
 */

// -- Voice selection ---------------------------------------------------------

function pickJarvisVoice(voices) {
  if (!voices || voices.length === 0) return null
  const byName = (re) => voices.find((v) => re.test(v.name))
  return (
    byName(/Google UK English Male/i) ||
    byName(/Daniel/i) ||
    byName(/Oliver/i) ||
    byName(/Arthur/i) ||
    voices.find((v) => /en[-_]GB/i.test(v.lang) && /male/i.test(v.name)) ||
    voices.find((v) => /en[-_]GB/i.test(v.lang)) ||
    voices.find((v) => /^en/i.test(v.lang)) ||
    voices[0]
  )
}

// -- Message bubble ----------------------------------------------------------

function Bubble({ role, text }) {
  const isJarvis = role === 'jarvis'
  return (
    <div className={`flex ${isJarvis ? 'justify-start' : 'justify-end'} animate-hud-boot`}>
      <div
        className={`
          max-w-[85%] px-3 py-2 rounded-md text-[12px] leading-snug font-hud
          ${isJarvis ? 'bubble-jarvis text-cyan-50' : 'bubble-user text-slate-100'}
        `}
      >
        {isJarvis && (
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1 h-1 rounded-full bg-cyan-300 shadow-[0_0_4px_#67e8f9]" />
            <span className="text-[8px] font-mono text-cyan-300/90 tracking-[0.2em] uppercase">
              J.A.R.V.I.S.
            </span>
          </div>
        )}
        {text}
      </div>
    </div>
  )
}

// -- Main panel --------------------------------------------------------------

export default function JarvisPanel() {
  const { alerts, connected } = useIntel()

  const [messages, setMessages]   = useState([])
  const [input, setInput]         = useState('')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking]   = useState(false)
  const [muted, setMuted]         = useState(false)
  const [thinking, setThinking]   = useState(false)
  const [booted, setBooted]       = useState(false)

  const scrollRef      = useRef(null)
  const recognitionRef = useRef(null)
  const voiceRef       = useRef(null)
  const bootedRef      = useRef(false)

  // ---- Voice synthesis setup ----
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    const load = () => {
      const voices = window.speechSynthesis.getVoices()
      voiceRef.current = pickJarvisVoice(voices)
    }
    load()
    window.speechSynthesis.addEventListener?.('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener?.('voiceschanged', load)
  }, [])

  // ---- Boot line the first time we have data (or after 600ms regardless) ----
  useEffect(() => {
    if (bootedRef.current) return
    const boot = () => {
      if (bootedRef.current) return
      bootedRef.current = true
      const line = welcomeLine(alerts)
      setMessages([{ id: crypto.randomUUID(), role: 'jarvis', text: line }])
      setBooted(true)
      // Delay speech slightly so voices have time to load
      setTimeout(() => speak(line), 250)
    }
    // If we already have alerts OR we've been idle for a moment, boot now.
    if (alerts.length > 0) {
      boot()
    } else {
      const t = setTimeout(boot, 700)
      return () => clearTimeout(t)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alerts.length])

  // ---- Auto-scroll transcript ----
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, thinking])

  // ---- Speech ----
  const speak = (text) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return
    if (muted) return
    try {
      window.speechSynthesis.cancel()
      const u = new SpeechSynthesisUtterance(text)
      if (voiceRef.current) u.voice = voiceRef.current
      u.lang  = voiceRef.current?.lang || 'en-GB'
      u.rate  = 0.96
      u.pitch = 0.85
      u.volume = 1
      u.onstart = () => setSpeaking(true)
      u.onend   = () => setSpeaking(false)
      u.onerror = () => setSpeaking(false)
      window.speechSynthesis.speak(u)
    } catch {
      setSpeaking(false)
    }
  }

  const stopSpeaking = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }

  // ---- Voice recognition (mic) ----
  const startListening = () => {
    if (typeof window === 'undefined') return
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      pushJarvis("My apologies, sir — this device does not support voice input. Please type your query.")
      return
    }
    // Stop any ongoing speech before listening (avoids feedback)
    stopSpeaking()
    try {
      const rec = new SR()
      rec.lang = 'en-US'
      rec.interimResults = false
      rec.maxAlternatives = 1
      rec.continuous = false
      rec.onstart = () => setListening(true)
      rec.onend   = () => setListening(false)
      rec.onerror = () => setListening(false)
      rec.onresult = (evt) => {
        const transcript = evt.results[0]?.[0]?.transcript?.trim()
        if (transcript) handleSubmit(transcript)
      }
      recognitionRef.current = rec
      rec.start()
    } catch {
      setListening(false)
    }
  }

  const stopListening = () => {
    try { recognitionRef.current?.stop() } catch { /* noop */ }
    setListening(false)
  }

  // ---- Chat flow ----
  const pushJarvis = (text) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'jarvis', text }])
    speak(text)
  }

  const handleSubmit = (rawText) => {
    const text = (rawText ?? input).trim()
    if (!text) return
    setInput('')
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'user', text }])
    setThinking(true)
    // Small delay gives the "thinking" state a chance to render; also feels alive
    setTimeout(() => {
      const reply = jarvisRespond(text, alerts)
      setThinking(false)
      pushJarvis(reply)
    }, 380)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m
      if (next) stopSpeaking()
      return next
    })
  }

  // ---- Live telemetry readouts (derived, so they feel "alive") ----
  const telemetry = useMemo(() => {
    const total    = alerts.length
    const breaking = alerts.filter((a) => a.isBreaking).length
    const now = new Date()
    return {
      total,
      breaking,
      utc: now.toUTCString().slice(17, 25),
      date: now.toISOString().slice(0, 10),
      integrity: connected ? '100%' : '0%',
    }
  }, [alerts, connected])

  // ---- Suggested quick queries ----
  const SUGGESTIONS = [
    'Sitrep',
    'Breaking alerts',
    'Ukraine',
    'Taiwan Strait',
    'Red Sea',
    'How many incidents?',
  ]

  return (
    <div className={`flex flex-col h-full bg-jarvis-bg text-cyan-50 ${speaking ? 'jarvis-speaking' : ''}`}>
      {/* =====================================================
          HEADER — status line + mute
          ===================================================== */}
      <div className="shrink-0 px-4 py-2.5 border-b border-cyan-500/25 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              connected ? 'bg-cyan-300 animate-pulse' : 'bg-zinc-600'
            }`}
            style={{ boxShadow: connected ? '0 0 6px #67e8f9' : 'none' }}
          />
          <p className="text-[11px] font-semibold text-cyan-200 tracking-widest uppercase font-display">
            J.A.R.V.I.S.
          </p>
          <span className="text-[9px] text-cyan-500/70 tracking-wide uppercase">
            {thinking ? '· Analysing' : speaking ? '· Speaking' : listening ? '· Listening' : '· Standby'}
          </span>
        </div>
        <button
          onClick={toggleMute}
          title={muted ? 'Unmute voice' : 'Mute voice'}
          className="text-cyan-400 hover:text-cyan-200 transition-colors p-1"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>

      {/* =====================================================
          TELEMETRY STRIP — arc reactor + live readouts
          ===================================================== */}
      <div className="shrink-0 px-3 pt-3 pb-2 border-b border-cyan-500/15 bg-gradient-to-b from-cyan-500/[0.03] to-transparent">
        <div className="flex items-center gap-3">
          {/* Arc reactor */}
          <div className="shrink-0">
            <ArcReactor active={speaking || thinking || listening} size={100} />
          </div>

          {/* Readouts column */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center justify-between text-[8px] font-mono text-cyan-300/90 tracking-widest uppercase">
              <span>STARK NET</span>
              <span className="text-cyan-200">{telemetry.utc} UTC</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400/70">
              <span>INCIDENTS</span>
              <span className="text-cyan-100 tabular-nums">{telemetry.total.toString().padStart(3, '0')}</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400/70">
              <span>BREAKING</span>
              <span className="text-amber-300 tabular-nums">{telemetry.breaking.toString().padStart(2, '0')}</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400/70">
              <span>LINK INTEGRITY</span>
              <span className="text-cyan-100">{telemetry.integrity}</span>
            </div>
            <div className="flex items-center justify-between text-[8px] font-mono text-cyan-400/70">
              <span>CHRONO</span>
              <span className="text-cyan-300 tabular-nums">{telemetry.date}</span>
            </div>
          </div>
        </div>

        {/* Waveform (reacts to speaking) + bar meter */}
        <div className="grid grid-cols-2 gap-2 mt-2">
          <Waveform active={speaking} height={36} label="VOICE I/O" />
          <BarMeter  label="CPU LOAD"  count={16} height={36} />
        </div>
      </div>

      {/* =====================================================
          TRANSCRIPT
          ===================================================== */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-2 relative"
      >
        {/* faint scan line overlay */}
        <div className="scan-line-overlay pointer-events-none" />

        {!booted && (
          <div className="flex items-center justify-center py-4 text-cyan-300/60 text-[10px] font-mono tracking-widest uppercase">
            <Loader2 size={12} className="animate-spin mr-2" />
            Initialising voice interface…
          </div>
        )}

        {messages.map((m) => (
          <Bubble key={m.id} role={m.role} text={m.text} />
        ))}

        {thinking && (
          <div className="flex justify-start">
            <div className="bubble-jarvis px-3 py-2 rounded-md text-cyan-200 text-[11px] font-mono tracking-wider flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-cyan-300 animate-pulse" />
              <span className="w-1 h-1 rounded-full bg-cyan-300 animate-pulse" style={{ animationDelay: '120ms' }} />
              <span className="w-1 h-1 rounded-full bg-cyan-300 animate-pulse" style={{ animationDelay: '240ms' }} />
              <span className="ml-1 text-cyan-300/80">processing</span>
            </div>
          </div>
        )}
      </div>

      {/* =====================================================
          SUGGESTED QUERIES
          ===================================================== */}
      <div className="shrink-0 px-3 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSubmit(s)}
            className="shrink-0 text-[9px] font-mono tracking-wider uppercase px-2 py-1 rounded border border-cyan-500/30 bg-cyan-500/5 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/60 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      {/* =====================================================
          DATA STREAM FOOTER (always-alive telemetry)
          ===================================================== */}
      <div className="shrink-0 px-3 pb-2">
        <DataStream label="NET TRAFFIC" value={`${(alerts.length * 1.7 + 12).toFixed(1)} kbps`} height={24} seed={3} />
      </div>

      {/* =====================================================
          INPUT BAR
          ===================================================== */}
      <div className="shrink-0 px-3 pb-3 pt-1 border-t border-cyan-500/20 bg-jarvis-panel/60">
        <div className="flex items-center gap-2">
          {/* Mic */}
          <button
            onClick={listening ? stopListening : startListening}
            title={listening ? 'Stop listening' : 'Speak to JARVIS'}
            className={`
              shrink-0 w-9 h-9 rounded-md flex items-center justify-center border transition-all
              ${listening
                ? 'bg-cyan-400/30 border-cyan-300 text-cyan-100 animate-glow-pulse'
                : 'bg-cyan-500/5 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 hover:border-cyan-400/70'}
            `}
          >
            {listening ? <MicOff size={15} /> : <Mic size={15} />}
          </button>

          {/* Text input */}
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={listening ? 'Listening…' : 'Speak, or type your query'}
            disabled={listening}
            className="
              flex-1 bg-jarvis-bg/80 border border-cyan-500/30 rounded-md px-3 py-2
              text-[12px] font-hud text-cyan-100 placeholder-cyan-500/50
              focus:border-cyan-400/80 focus:ring-1 focus:ring-cyan-400/40
              transition-colors
            "
          />

          {/* Send */}
          <button
            onClick={() => handleSubmit()}
            disabled={!input.trim()}
            title="Send"
            className="
              shrink-0 w-9 h-9 rounded-md flex items-center justify-center
              bg-cyan-500/20 border border-cyan-400/60 text-cyan-200
              hover:bg-cyan-400/30 hover:text-white
              disabled:opacity-40 disabled:hover:bg-cyan-500/20
              transition-colors
            "
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  )
}
