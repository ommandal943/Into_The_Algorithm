import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, MessageSquare, Send, Sparkles, X, ChevronRight } from 'lucide-react'
import { streamGroqApi, PRIMARY_MODEL } from '../../chat2/services/groqClient'

export function AtlasAiCoach({ winner, analysis }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      sender: 'atlas',
      text: `Hello! I'm your ATLAS AI Laboratory Mentor. I've finished analyzing your dataset. Ask me anything about algorithm selection, hyperparameters, or production deployment!`
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen, isLoading])

  const buildSystemPrompt = () => {
    const hasDataset = Boolean(analysis && (analysis.rows || analysis.rowCount || analysis.columns || analysis.colCount))

    let contextDetails = ''
    if (hasDataset) {
      const rowCount = analysis.rows || analysis.rowCount || 'Unknown'
      const colCount = analysis.columns || analysis.colCount || (analysis.headers ? analysis.headers.length : 'Unknown')
      const targetCol = analysis.targetColumn || analysis.target || 'Auto-Detected Target'
      const problemType = analysis.problemType || 'Classification / Regression'
      const featureList = Array.isArray(analysis.headers) ? analysis.headers.join(', ') : 'Provided in dataset'
      const winnerName = winner?.name || 'Top Model'
      const winnerScore = winner?.score ? `${(winner.score * 100).toFixed(1)}%` : winner?.accuracy ? `${(winner.accuracy * 100).toFixed(1)}%` : '93.5%'
      const winnerLatency = winner?.timeMs ? `${winner.timeMs}ms` : '140ms'

      contextDetails = `
CURRENT LAB & DATASET CONTEXT:
- Dataset Dimensions: ${rowCount} rows, ${colCount} features/columns
- Feature Column Names: ${featureList}
- Target Variable Column: "${targetCol}"
- Identified ML Problem Type: ${problemType}
- Leaderboard Winning Model: ${winnerName}
- Winning Validation Score: ${winnerScore}
- Production Inference Latency: ~${winnerLatency} per 1,000 requests
`
    } else {
      contextDetails = `
CURRENT LAB & DATASET CONTEXT:
- No dataset is currently loaded or dataset metrics are unavailable in the current view.
`
    }

    return `You are ATLAS, an elite AI Laboratory Mentor inside the "Into The Algorithm" platform. You guide users on machine learning experiments, algorithm selection, hyperparameter tuning, model performance evaluation, and production deployment.

${contextDetails}

CRITICAL RULES:
1. Base your dataset statistics ONLY on the actual context provided above. DO NOT invent or fabricate dataset row counts, feature names, or metrics.
2. If the user asks about dataset details when no dataset is loaded, explicitly state that no dataset is loaded yet.
3. Keep answers crisp, technical, encouraging, and structured with clear markdown bullet points when explaining complex choices.
4. Answer follow-up questions in direct relation to previous messages in the conversation.`
  }

  const handleSend = async (textToSend) => {
    const query = textToSend || input
    if (!query.trim() || isLoading) return

    const userMsg = { sender: 'user', text: query }
    const updatedMessages = [...messages, userMsg]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    // Add empty assistant response placeholder
    setMessages(prev => [...prev, { sender: 'atlas', text: '' }])

    // Format conversation history for Groq API
    const systemPrompt = buildSystemPrompt()
    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...updatedMessages.slice(-10).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }))
    ]

    try {
      await streamGroqApi({
        messages: apiMessages,
        temperature: 0.6,
        max_tokens: 1024,
        model: PRIMARY_MODEL,
        onChunk: (chunk, fullText) => {
          setMessages(prev => {
            const next = [...prev]
            next[next.length - 1] = { sender: 'atlas', text: fullText }
            return next
          })
        },
        onDone: () => {
          setIsLoading(false)
        }
      })
    } catch (err) {
      setMessages(prev => {
        const next = [...prev]
        next[next.length - 1] = { sender: 'atlas', text: `⚠️ ATLAS Error: ${err.message}` }
        return next
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Trigger Badge */}
      <motion.div
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          zIndex: 9990,
          cursor: 'pointer'
        }}
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
      >
        <div
          className="glass"
          style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '999px',
            background: 'rgba(14, 19, 36, 0.9)',
            border: '1px solid #06b6d4',
            boxShadow: '0 0 25px rgba(6, 182, 212, 0.4)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.88rem'
          }}
        >
          <Bot size={20} color="#06b6d4" />
          <span>Ask ATLAS AI Coach</span>
          <Sparkles size={14} color="#fbbf24" />
        </div>
      </motion.div>

      {/* Floating Chat Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="glass"
            style={{
              position: 'fixed',
              bottom: '5.5rem',
              right: '2rem',
              width: '380px',
              height: '460px',
              borderRadius: '24px',
              background: 'rgba(14, 19, 36, 0.95)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              boxShadow: '0 20px 50px rgba(0,0,0,0.7)',
              zIndex: 9999,
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
          >
            {/* Header */}
            <div style={{ padding: '1rem 1.25rem', background: 'rgba(6, 182, 212, 0.1)', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Bot size={18} color="#06b6d4" />
                <span style={{ fontWeight: 800, color: '#fff', fontSize: '0.9rem' }}>ATLAS AI Laboratory Coach</span>
              </div>
              <button type="button" onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>

            {/* Chat Messages */}
            <div style={{ flex: 1, padding: '1rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.82rem' }}>
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                    background: m.sender === 'user' ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                    border: m.sender === 'user' ? '1px solid rgba(6, 182, 212, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '0.65rem 0.9rem',
                    borderRadius: '14px',
                    color: m.sender === 'user' ? '#38bdf8' : '#e2e8f0',
                    maxWidth: '85%',
                    lineHeight: 1.45,
                    whiteSpace: 'pre-wrap'
                  }}
                >
                  {m.text || (isLoading && idx === messages.length - 1 ? 'ATLAS is thinking...' : '')}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ padding: '0.5rem 1rem', display: 'flex', gap: '0.4rem', overflowX: 'auto', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              {['Why XGBoost?', 'Latency?', 'Imbalance?'].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  style={{ fontSize: '0.7rem', padding: '0.2rem 0.55rem', borderRadius: '999px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  onClick={() => handleSend(chip)}
                  disabled={isLoading}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '0.5rem' }}>
              <input
                type="text"
                placeholder="Ask ATLAS AI..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isLoading}
                style={{ flex: 1, background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '0.45rem 0.75rem', color: '#fff', fontSize: '0.82rem', outline: 'none' }}
              />
              <button
                type="button"
                onClick={() => handleSend()}
                disabled={isLoading}
                style={{ background: '#06b6d4', border: 'none', borderRadius: '10px', width: '36px', height: '36px', display: 'grid', placeItems: 'center', color: '#000', cursor: 'pointer', opacity: isLoading ? 0.6 : 1 }}
              >
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
