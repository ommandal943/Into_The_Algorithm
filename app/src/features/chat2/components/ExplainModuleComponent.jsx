import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GraduationCap, Sparkles, Flame, Atom } from 'lucide-react'
import { explainConcept } from '../services/explainerService'
import { MarkdownRenderer } from './MarkdownRenderer'

export function ExplainModuleComponent() {
  const [topic, setTopic] = useState('')
  const [level, setLevel] = useState('beginner')
  const [explanation, setExplanation] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleExplain = async () => {
    if (!topic.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await explainConcept(topic, level)
      setExplanation(res)
    } catch (err) {
      setError(`Error generating explanation: ${err.message}`)
    }
    setIsLoading(false)
  }

  return (
    <div className="chat2-card">
      <div className="chat2-explain-header">
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', display: 'grid', placeItems: 'center', color: '#10b981', fontSize: '1.4rem' }}>
          <GraduationCap size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Easy Explanation Engine
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Get ML concepts explained at your exact level — from beginner to expert.
          </p>
        </div>
      </div>

      {/* Level Selector */}
      <div style={{ display: 'flex', gap: '0.65rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`chat2-level-btn ${level === 'beginner' ? 'active' : ''}`}
          onClick={() => setLevel('beginner')}
        >
          🌱 Beginner
        </button>
        <button
          type="button"
          className={`chat2-level-btn ${level === 'intermediate' ? 'active' : ''}`}
          onClick={() => setLevel('intermediate')}
        >
          🔥 Intermediate
        </button>
        <button
          type="button"
          className={`chat2-level-btn ${level === 'expert' ? 'active' : ''}`}
          onClick={() => setLevel('expert')}
        >
          ⚛️ Expert
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '750px' }}>
        <textarea
          className="chat2-textarea"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1rem' }}
          rows={3}
          placeholder="What ML concept do you want explained? e.g., 'Convolutional Neural Networks'"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        <div>
          <motion.button
            type="button"
            className="fl-btn-primary"
            style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none' }}
            onClick={handleExplain}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={16} /> {isLoading ? 'Generating Explanation...' : 'Explain It!'}
          </motion.button>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div style={{ marginTop: '1.25rem', padding: '0.75rem 1rem', borderRadius: '14px', background: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#fca5a5', fontSize: '0.84rem', fontWeight: 600 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Output */}
      {explanation && (
        <div className="chat2-output-box">
          <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#34d399', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Level: {level.toUpperCase()}
          </div>
          <MarkdownRenderer content={explanation} />
        </div>
      )}
    </div>
  )
}
