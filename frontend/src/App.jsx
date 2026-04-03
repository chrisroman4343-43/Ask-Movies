import { useState, useCallback } from 'react'
import Sidebar from './components/Sidebar'
import ChatWindow from './components/ChatWindow'
import './App.css'

export const MODES = [
  {
    id: 'research',
    label: 'Business Research',
    icon: '🔍',
    description: 'Find profitable opportunities',
    placeholder: 'Find me profitable business opportunities I can start this month...',
    starters: [
      'Find me the top 5 most profitable online business opportunities right now',
      'What service businesses can I start with under $500?',
      'Find underserved niches with high demand and low competition',
      'What are people successfully selling on Gumroad or Etsy right now?',
    ]
  },
  {
    id: 'business_plan',
    label: 'Business Plan',
    icon: '📊',
    description: 'Create detailed business plans',
    placeholder: 'Describe your business idea for a comprehensive plan...',
    starters: [
      'Create a business plan for a freelance web development agency',
      'Write a business plan for a digital marketing consulting business',
      'Build a plan for an AI automation agency targeting small businesses',
      'Create a plan for a niche newsletter monetized with ads and sponsorships',
    ]
  },
  {
    id: 'outreach',
    label: 'Customer Outreach',
    icon: '📧',
    description: 'Find & contact customers',
    placeholder: 'Describe your business and target customers...',
    starters: [
      'Write cold email templates for selling SEO services to local businesses',
      'Create a LinkedIn outreach strategy for B2B SaaS sales',
      'Write DM templates for selling social media management to restaurants',
      'Build a lead generation plan for freelance copywriting services',
    ]
  },
  {
    id: 'setup',
    label: 'Online Setup',
    icon: '🌐',
    description: 'Build your online presence',
    placeholder: 'Describe your business and I\'ll guide you through setup...',
    starters: [
      'Give me the complete tech stack setup for a freelance agency',
      'What\'s the cheapest way to set up a professional online business presence?',
      'How do I set up payments and invoicing for a service business?',
      'What legal structure should I use and how do I register my business?',
    ]
  },
  {
    id: 'general',
    label: 'General Agent',
    icon: '🤖',
    description: 'Any business question',
    placeholder: 'Ask me anything about starting or growing your business...',
    starters: [
      'How do I validate a business idea before investing time and money?',
      'What are the most common mistakes first-time entrepreneurs make?',
      'How do I price my services to be competitive but profitable?',
      'What\'s the fastest way to get my first paying customer?',
    ]
  },
]

const INITIAL_STATE = Object.fromEntries(MODES.map(m => [m.id, []]))

export default function App() {
  const [currentMode, setCurrentMode] = useState('research')
  const [messagesByMode, setMessagesByMode] = useState(INITIAL_STATE)
  const [isStreaming, setIsStreaming] = useState(false)

  const messages = messagesByMode[currentMode] || []
  const modeConfig = MODES.find(m => m.id === currentMode)

  const clearChat = useCallback(() => {
    setMessagesByMode(prev => ({ ...prev, [currentMode]: [] }))
  }, [currentMode])

  const sendMessage = useCallback(async (userInput) => {
    if (!userInput.trim() || isStreaming) return

    const modeSnapshot = currentMode
    const prevMessages = messagesByMode[modeSnapshot] || []

    // Build API messages from conversation history
    const apiMessages = [
      ...prevMessages
        .filter(m => (m.role === 'user' || m.role === 'assistant') && m.content)
        .map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userInput }
    ]

    const userMsgId = `u${Date.now()}`
    const assistantMsgId = `a${Date.now() + 1}`

    // Add user + empty assistant message
    setMessagesByMode(prev => ({
      ...prev,
      [modeSnapshot]: [
        ...(prev[modeSnapshot] || []),
        { role: 'user', content: userInput, id: userMsgId },
        { role: 'assistant', content: '', thinking: '', isSearching: false, searchCount: 0, id: assistantMsgId }
      ]
    }))

    setIsStreaming(true)

    const updateLastMsg = (updater) => {
      setMessagesByMode(prev => {
        const msgs = [...(prev[modeSnapshot] || [])]
        const lastIdx = msgs.length - 1
        if (lastIdx < 0 || msgs[lastIdx].role !== 'assistant') return prev
        msgs[lastIdx] = updater(msgs[lastIdx])
        return { ...prev, [modeSnapshot]: msgs }
      })
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, mode: modeSnapshot })
      })

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          try {
            const data = JSON.parse(line.slice(6))

            if (data.type === 'text') {
              updateLastMsg(msg => ({ ...msg, content: msg.content + data.content }))
            } else if (data.type === 'thinking') {
              updateLastMsg(msg => ({ ...msg, thinking: (msg.thinking || '') + data.content }))
            } else if (data.type === 'tool_start') {
              updateLastMsg(msg => ({
                ...msg,
                isSearching: true,
                searchTool: data.tool,
                searchCount: (msg.searchCount || 0) + 1
              }))
            } else if (data.type === 'tool_end') {
              updateLastMsg(msg => ({ ...msg, isSearching: false }))
            } else if (data.type === 'error') {
              updateLastMsg(msg => ({
                ...msg,
                content: msg.content || `Error: ${data.content}`,
                isSearching: false,
                isError: true
              }))
            }
          } catch {
            // Skip malformed lines
          }
        }
      }
    } catch (err) {
      updateLastMsg(msg => ({
        ...msg,
        content: msg.content || `Failed to connect. Make sure the backend is running and ANTHROPIC_API_KEY is set.\n\nError: ${err.message}`,
        isSearching: false,
        isError: true
      }))
    } finally {
      setIsStreaming(false)
    }
  }, [messagesByMode, currentMode, isStreaming])

  return (
    <div className="app">
      <Sidebar
        modes={MODES}
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        isStreaming={isStreaming}
      />
      <ChatWindow
        messages={messages}
        onSend={sendMessage}
        onClear={clearChat}
        isStreaming={isStreaming}
        modeConfig={modeConfig}
      />
    </div>
  )
}
