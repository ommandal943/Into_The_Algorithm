import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Bot, Send, Mic, MicOff, Network, GitBranch, Eye, TrendingUp, Mountain, Cpu, Sparkles, Trash2 } from 'lucide-react'
import { streamChat, clearChatHistory } from '../services/chatService'
import { MarkdownRenderer } from './MarkdownRenderer'

const QUICK_PROMPTS = [
  { icon: Network, title: 'Backpropagation', prompt: 'Explain backpropagation in neural networks with mathematical intuition.' },
  { icon: GitBranch, title: 'Supervised vs Unsupervised', prompt: 'What is the difference between supervised and unsupervised learning?' },
  { icon: Eye, title: 'Attention Mechanism', prompt: 'Explain the attention mechanism in transformers step by step.' },
  { icon: TrendingUp, title: 'Overfitting Mitigation', prompt: 'What is overfitting and how do we prevent it in production models?' },
  { icon: Mountain, title: 'Gradient Descent', prompt: 'Explain gradient descent with a visual landscape analogy.' },
  { icon: Cpu, title: 'GANs & Diffusion', prompt: 'What are Generative Adversarial Networks (GANs) and how do they work?' }
]

export function ChatModuleComponent() {
  const location = useLocation()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const [isVoiceActive, setIsVoiceActive] = useState(false)
  const messagesEndRef = useRef(null)
  const recognitionRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isStreaming])

  const handleSend = async (customPrompt) => {
    const text = customPrompt || input
    if (!text.trim() || isStreaming) return

    const newMsgs = [...messages, { role: 'user', content: text }]
    setMessages(newMsgs)
    setInput('')
    setIsStreaming(true)

    // Add placeholder bot message
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      await streamChat(
        text,
        (chunk, fullText) => {
          setMessages(prev => {
            const updated = [...prev]
            updated[updated.length - 1] = { role: 'assistant', content: fullText }
            return updated
          })
        },
        () => {
          setIsStreaming(false)
        }
      )
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = { role: 'assistant', content: `⚠️ Error: ${err.message}` }
        return updated
      })
    } finally {
      setIsStreaming(false)
    }
  }

  const handleClear = () => {
    clearChatHistory()
    setMessages([])
  }

  const stopVoice = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch {
        try {
          recognitionRef.current.abort()
        } catch {
          /* ignore */
        }
      }
      recognitionRef.current = null
    }
    setIsVoiceActive(false)
  }

  const toggleVoice = () => {
    if (isVoiceActive || recognitionRef.current) {
      stopVoice()
      return
    }

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.')
      return
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.lang = 'en-US'
      recognition.interimResults = true
      recognition.continuous = false
      recognitionRef.current = recognition

      recognition.onstart = () => {
        setIsVoiceActive(true)
      }

      recognition.onresult = (e) => {
        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const transcript = e.results[i][0].transcript
          if (e.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        const textToSet = finalTranscript || interimTranscript
        if (textToSet) {
          setInput(textToSet)
        }
      }

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err.error)
        if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
          alert('Microphone access denied. Please allow microphone permissions in your browser settings.')
        }
        stopVoice()
      }

      recognition.onend = () => {
        stopVoice()
      }

      recognition.start()
    } catch (err) {
      console.error('Failed to start speech recognition:', err)
      stopVoice()
    }
  }

  useEffect(() => {
    if (location.state?.startVoice) {
      const timer = setTimeout(() => {
        toggleVoice()
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [location.state])

  // Clean up speech recognition on component unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          /* ignore */
        }
        recognitionRef.current = null
      }
    }
  }, [])

  return (
    <div className="chat2-card">
      {messages.length === 0 ? (
        /* Welcome Hero Screen */
        <div className="chat2-welcome-hero">
          <div className="chat2-brain-avatar">
            <Bot size={38} />
          </div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', margin: '0 0 0.5rem', fontFamily: 'var(--font-display)' }}>
            Ask Me Anything About <span className="cc-gradient-name">Machine Learning</span>
          </h1>
          <p style={{ fontSize: '0.9rem', color: '#94a3b8', margin: 0 }}>
            Powered by Groq · llama-3.3-70b-versatile · Stream-enabled
          </p>

          <div className="chat2-prompts-grid">
            {QUICK_PROMPTS.map((qp) => {
              const Icon = qp.icon
              return (
                <button
                  key={qp.title}
                  type="button"
                  className="chat2-prompt-card"
                  onClick={() => handleSend(qp.prompt)}
                >
                  <Icon size={18} color="#a855f7" />
                  <span>{qp.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        /* Active Messages List */
        <div className="chat2-messages-list">
          {messages.map((m, idx) => (
            <div key={idx} className={`chat2-msg ${m.role === 'user' ? 'chat2-msg-user' : 'chat2-msg-bot'}`}>
              {m.role === 'assistant' && (
                <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)', display: 'grid', placeItems: 'center', color: '#a78bfa', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              <div className="chat2-msg-bubble">
                {m.role === 'assistant' ? (
                  <>
                    <MarkdownRenderer
                      content={m.content || ''}
                    />
                    {/* Blinking cursor while this is the last message and still streaming */}
                    {isStreaming && idx === messages.length - 1 && (
                      <span className="nm-typing-cursor" />
                    )}
                    {!m.content && !isStreaming && (
                      <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>
                        NeuralMind is thinking…
                      </span>
                    )}
                  </>
                ) : (
                  <div style={{ whiteSpace: 'pre-wrap' }}>{m.content}</div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Input Toolbar & Area */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
        {messages.length > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
            <button type="button" className="fl-export-btn" onClick={handleClear} style={{ fontSize: '0.75rem', padding: '0.3rem 0.75rem' }}>
              <Trash2 size={13} /> Clear Chat
            </button>
          </div>
        )}

        <div className="chat2-input-wrap">
          <button
            type="button"
            className="fl-export-btn"
            onClick={toggleVoice}
            style={{ padding: '0.5rem', borderRadius: '12px', background: isVoiceActive ? 'rgba(239, 68, 68, 0.2)' : undefined }}
            title="Voice Input"
          >
            {isVoiceActive ? <MicOff size={16} color="#ef4444" /> : <Mic size={16} color="#38bdf8" />}
          </button>

          <textarea
            className="chat2-textarea"
            placeholder="Ask anything about ML... (Press Enter to send)"
            value={input}
            rows={1}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSend()
              }
            }}
          />

          <motion.button
            type="button"
            className="fl-btn-primary"
            style={{ padding: '0.55rem 1rem', borderRadius: '14px' }}
            onClick={() => handleSend()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send size={16} />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
