import './Sidebar.css'

export default function Sidebar({ modes, currentMode, onModeChange, isStreaming }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon">💼</span>
          <div className="logo-text">
            <span className="logo-title">AI Business Agent</span>
            <span className="logo-sub">Powered by Claude Opus</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <p className="nav-label">Agent Mode</p>
        {modes.map(mode => (
          <button
            key={mode.id}
            className={`mode-btn ${currentMode === mode.id ? 'active' : ''}`}
            onClick={() => !isStreaming && onModeChange(mode.id)}
            disabled={isStreaming && currentMode !== mode.id}
            title={isStreaming ? 'Wait for current response to finish' : ''}
          >
            <span className="mode-icon">{mode.icon}</span>
            <div className="mode-text">
              <span className="mode-label">{mode.label}</span>
              <span className="mode-desc">{mode.description}</span>
            </div>
            {currentMode === mode.id && <span className="mode-active-dot" />}
          </button>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="footer-badge">
          <span className="footer-dot" />
          <span>Claude Opus 4.6</span>
        </div>
        <p className="footer-hint">Set ANTHROPIC_API_KEY to use</p>
      </div>
    </aside>
  )
}
