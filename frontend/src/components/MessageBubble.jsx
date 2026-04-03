import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import './MessageBubble.css'

export default function MessageBubble({ message }) {
  const [showThinking, setShowThinking] = useState(false)
  const isUser = message.role === 'user'

  return (
    <div className={`message-row ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-avatar">
        {isUser ? '👤' : '🤖'}
      </div>

      <div className="message-body">
        {/* Tool/search status */}
        {!isUser && message.isSearching && (
          <div className="search-status">
            <span className="search-pulse" />
            <span>
              {message.searchTool === 'web_fetch' ? 'Fetching page...' : 'Searching the web...'}
            </span>
          </div>
        )}

        {/* Search complete badge */}
        {!isUser && !message.isSearching && message.searchCount > 0 && message.content && (
          <div className="search-badge">
            <span>🔍</span>
            <span>Used {message.searchCount} web search{message.searchCount !== 1 ? 'es' : ''}</span>
          </div>
        )}

        {/* Thinking toggle */}
        {!isUser && message.thinking && (
          <div className="thinking-section">
            <button
              className="thinking-toggle"
              onClick={() => setShowThinking(v => !v)}
            >
              <span className="thinking-icon">💭</span>
              <span>{showThinking ? 'Hide reasoning' : 'Show reasoning'}</span>
              <span className="thinking-chevron">{showThinking ? '▲' : '▼'}</span>
            </button>
            {showThinking && (
              <div className="thinking-content">
                <pre>{message.thinking}</pre>
              </div>
            )}
          </div>
        )}

        {/* Message content */}
        <div className={`message-content ${isUser ? 'user-content' : 'assistant-content'} ${message.isError ? 'error-content' : ''}`}>
          {isUser ? (
            <p>{message.content}</p>
          ) : message.content ? (
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                // Style code blocks
                code({ node, inline, className, children, ...props }) {
                  return inline ? (
                    <code className="inline-code" {...props}>{children}</code>
                  ) : (
                    <pre className="code-block">
                      <code {...props}>{children}</code>
                    </pre>
                  )
                },
                // Open links in new tab
                a({ href, children }) {
                  return <a href={href} target="_blank" rel="noopener noreferrer">{children}</a>
                }
              }}
            >
              {message.content}
            </ReactMarkdown>
          ) : (
            !message.isSearching && (
              <span className="typing-cursor">▋</span>
            )
          )}
        </div>
      </div>
    </div>
  )
}
