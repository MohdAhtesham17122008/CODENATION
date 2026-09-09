import { useCallback, useEffect, useState } from 'react'
import { Bot, MessageSquare, Radio, Sparkles, X } from 'lucide-react'
import ChatWindow from './ChatWindow'
import { useData } from '../../store/DataContext'
import { buildAIContext } from '../../lib/ai/contextBuilder'

const STORAGE_KEY = 'polar.ai_chat_history'

function loadSavedChat() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveChat(history) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history))
  } catch {
    // Storage unavailable, ignore
  }
}

export default function AIChatbot({ goTo }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(loadSavedChat)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastQuery, setLastQuery] = useState('')
  const [unreadCount, setUnreadCount] = useState(0)

  // Real-time project data from DataContext
  const data = useData()
  const { focusOnMap } = data

  // Save chat to session storage on update
  useEffect(() => {
    saveChat(messages)
  }, [messages])

  // Clear unread count when opened
  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0)
    }
  }, [isOpen])

  // Keyboard shortcut: ESC to close chat panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  /**
   * Sends user query to the secure backend /api/chat
   */
  const handleSendMessage = useCallback(
    async (text) => {
      const trimmed = text.trim()
      if (!trimmed || isLoading) return

      setError(null)
      setLastQuery(trimmed)

      const userMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: trimmed,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, userMessage])
      setIsLoading(true)

      try {
        // Build query-relevant context from live application state
        const context = buildAIContext(trimmed, data)

        // Pass recent messages for conversation continuity
        const historyForApi = messages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: historyForApi,
            context,
          }),
        })

        const result = await response.json().catch(() => null)

        if (!response.ok || !result || result.error) {
          const errMsg =
            result?.error ||
            `AI service error (HTTP ${response.status}). Please check network or API keys.`
          setError(errMsg)
          setIsLoading(false)
          return
        }

        const assistantMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: result.reply || 'No operational intelligence generated for this query.',
          actions: result.actions || [],
          timestamp: new Date().toISOString(),
        }

        setMessages((prev) => [...prev, assistantMessage])

        if (!isOpen) {
          setUnreadCount((c) => c + 1)
        }
      } catch (err) {
        setError(
          'Network failure communicating with AI Assistant endpoint. Verify server connection.'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [data, isLoading, isOpen, messages]
  )

  /**
   * Focuses on a map marker and switches to MapView
   */
  const handleFocusOnMap = useCallback(
    (action) => {
      if (!action || !action.id) return

      // Call DataContext helper to trigger MapView centering and selection
      if (focusOnMap) {
        focusOnMap({ kind: action.kind || 'person', id: action.id })
      }

      // Navigate to MapView
      if (goTo) {
        goTo('map')
      }

      // On smaller screens, minimize panel so user sees the focused map
      if (window.innerWidth < 768) {
        setIsOpen(false)
      }
    },
    [focusOnMap, goTo]
  )

  const handleClearChat = useCallback(() => {
    setMessages([])
    setError(null)
    sessionStorage.removeItem(STORAGE_KEY)
  }, [])

  const handleRetry = useCallback(() => {
    if (lastQuery) {
      handleSendMessage(lastQuery)
    }
  }, [handleSendMessage, lastQuery])

  return (
    <>
      {/* Floating Action Button (bottom-right) */}
      <div className="fixed bottom-5 right-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          title={isOpen ? 'Close AI Assistant' : 'Open Polar AI Assistant'}
          aria-label="Toggle Polar AI Assistant"
          className={`relative group flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-200 shadow-xl ${
            isOpen
              ? 'bg-[var(--navy-850)] border-[var(--ice)] text-[var(--ice)] shadow-[0_0_20px_rgba(111,214,214,0.35)]'
              : 'bg-[var(--navy-900)] hover:bg-[var(--navy-850)] border-[var(--ice-dim)] text-[var(--ice)] hover:border-[var(--ice)] shadow-[0_0_15px_rgba(111,214,214,0.25)] hover:shadow-[0_0_25px_rgba(111,214,214,0.45)]'
          }`}
        >
          {isOpen ? (
            <X size={20} className="transition-transform duration-200 rotate-0 group-hover:rotate-90" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot size={22} className="transition-transform duration-200 group-hover:scale-110" />
              {/* Pulsing online indicator beacon */}
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--green)] opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--green)]" />
              </span>
            </div>
          )}

          {/* Unread badge if messages arrive while minimized */}
          {!isOpen && unreadCount > 0 && (
            <span className="absolute -top-1.5 -left-1.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--orange)] text-[var(--navy-950)] text-[10px] font-mono font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Chat Window Panel */}
      {isOpen && (
        <div className="fixed inset-x-2 bottom-20 top-16 sm:inset-auto sm:bottom-20 sm:right-5 z-50 sm:w-[430px] sm:max-w-[calc(100vw-2.5rem)] sm:h-[620px] sm:max-h-[calc(100vh-6.5rem)] animate-in fade-in zoom-in-95 duration-150">
          <ChatWindow
            messages={messages}
            isLoading={isLoading}
            error={error}
            onSend={handleSendMessage}
            onClear={handleClearChat}
            onClose={() => setIsOpen(false)}
            onFocusMap={handleFocusOnMap}
            onRetry={handleRetry}
            onDismissError={() => setError(null)}
          />
        </div>
      )}
    </>
  )
}
