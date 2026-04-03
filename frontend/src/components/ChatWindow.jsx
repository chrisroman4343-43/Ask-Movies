import { useState, useRef, useEffect } from 'react'
import MessageBubble from './MessageBubble'
import './ChatWindow.css'

export default function ChatWindow({ messages, onSend, onClear, isStreaming, modeConfig }) {
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 160) + 'px'
  }, [input])

  const handleSubmit = (e) => {
    e?.preventDefault()
    const trimmed = input.trim()
    if (trimmed && !isStreaming) {
      onSend(trimmed)
      setInput('')
      if (textareaRef.current) textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleStarter = (text) => {
    if (!isStreaming) onSend(text)
  }

  const isEmpty = messages.length === 0

  return (
    <div className="chat-window">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <span className="chat-header-icon">{modeConfig?.icon}</span>
          <div>
            <h2 className="chat-header-title">{modeConfig?.label}</h2>
            <p className="chat-header-desc">{modeConfig?.description}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <button className="clear-btn" onClick={onClear} disabled={isStreaming} title="Clear chat">
            ✕ Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="messages-area">
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">{modeConfig?.icon}</div>
            <h3 className="empty-title">{modeConfig?.label}</h3>
            <p className="empty-sub">I'll search the web and give you specific, actionable answers.</p>
            {modeConfig?.starters && (
              <div className="starters">
                <p className="starters-label">Try asking:</p>
                <div className="starters-grid">
                  {modeConfig.starters.map((s, i) => (
                    <button key={i} className="starter-btn" onClick={() => handleStarter(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          messages.map(msg => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={bottomRef} style={{ height: 1 }} />
      </div>

      {/* Input */}
      <div className="input-area">
        <form className="input-form" onSubmit={handleSubmit}>
          <div className="input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={modeConfig?.placeholder || 'Ask anything...'}
              disabled={isStreaming}
              rows={1}
            />
            <button
              type="submit"
              className={`send-btn ${isStreaming ? 'loading' : ''}`}
              disabled={!input.trim() || isStreaming}
            >
              {isStreaming ? (
                <span className="send-spinner" />
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              )}
            </button>
          </div>
          <p className="input-hint">Enter to send · Shift+Enter for new line · The agent will search the web for current data</p>
        </form>
      </div>
    </div>
  )
}
