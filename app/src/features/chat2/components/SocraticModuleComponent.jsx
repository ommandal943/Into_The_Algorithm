import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lightbulb, Play, Send, RefreshCw, Sparkles } from 'lucide-react'
import { startSocraticDialogue, submitSocraticAnswer, resetSocratic } from '../services/socraticService'
import { MarkdownRenderer } from './MarkdownRenderer'

export function SocraticModuleComponent() {
  const [topic, setTopic] = useState('')
  const [dialogue, setDialogue] = useState([])
  const [answerInput, setAnswerInput] = useState('')
  const [isStarted, setIsStarted] = useState(false)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleStart = async () => {
    if (!topic.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const firstQ = await startSocraticDialogue(topic)
      setDialogue([{ role: 'socratic', text: firstQ }])
      setIsStarted(true)
    } catch (err) {
      setError(`Error starting Socratic dialogue: ${err.message}`)
    }
    setIsLoading(false)
  }

  const handleSubmitAnswer = async () => {
    if (!answerInput.trim() || isLoading) return
    const userText = answerInput
    setAnswerInput('')
    setDialogue(prev => [...prev, { role: 'user', text: userText }])
    setIsLoading(true)
    setError(null)

    try {
      const res = await submitSocraticAnswer(userText)
      setDialogue(prev => [...prev, { role: 'socratic', text: res.text, isSynthesis: res.isSynthesis }])
    } catch (err) {
      setError(`Error submitting answer: ${err.message}`)
    }
    setIsLoading(false)
  }

  const handleReset = () => {
    resetSocratic()
    setDialogue([])
    setIsStarted(false)
    setTopic('')
  }

  return (
    <div className="chat2-card">
      <div className="chat2-socratic-header">
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.4)', display: 'grid', placeItems: 'center', color: '#f59e0b', fontSize: '1.4rem' }}>
          <Lightbulb size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Socratic Engine
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Don't get answers — get understanding. The AI guides you with questions.
          </p>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ marginBottom: '1.25rem', padding: '0.75rem 1rem', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.84rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {!isStarted ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '700px' }}>
          <textarea
            className="chat2-textarea"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1rem' }}
            rows={3}
            placeholder="Enter an ML concept you want to deeply understand... e.g., 'How does a transformer attention mechanism work?'"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <div>
            <motion.button
              type="button"
              className="fl-btn-primary"
              style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none' }}
              onClick={handleStart}
              disabled={isLoading}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Play size={16} /> {isLoading ? 'Initializing Engine...' : 'Start Socratic Dialogue'}
            </motion.button>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <span style={{ fontSize: '0.82rem', color: '#f59e0b', fontWeight: 700 }}>
              Topic: "{topic}"
            </span>
            <button type="button" className="fl-export-btn" onClick={handleReset} style={{ fontSize: '0.75rem' }}>
              <RefreshCw size={13} /> Reset Dialogue
            </button>
          </div>

          <div className="chat2-messages-list" style={{ flex: 1 }}>
            {dialogue.map((item, idx) => (
              <div key={idx} className={`chat2-msg ${item.role === 'user' ? 'chat2-msg-user' : 'chat2-msg-bot'}`}>
                <div className="chat2-msg-bubble" style={{ background: item.role === 'socratic' ? 'rgba(245, 158, 11, 0.08)' : undefined, borderColor: item.role === 'socratic' ? 'rgba(245, 158, 11, 0.3)' : undefined }}>
                  {item.role === 'socratic' ? (
                    <MarkdownRenderer content={item.text} />
                  ) : (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{item.text}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="chat2-input-wrap">
            <input
              type="text"
              className="chat2-textarea"
              placeholder="Type your response to the tutor..."
              value={answerInput}
              onChange={(e) => setAnswerInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmitAnswer()}
            />
            <motion.button
              type="button"
              className="fl-btn-primary"
              style={{ background: '#f59e0b', color: '#000' }}
              onClick={handleSubmitAnswer}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Send size={16} />
            </motion.button>
          </div>
        </div>
      )}
    </div>
  )
}
