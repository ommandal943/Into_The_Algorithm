import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Download, Copy, Check, Sparkles } from 'lucide-react'
import { generateNotes, downloadNotesPdf } from '../services/notesService'
import { MarkdownRenderer } from './MarkdownRenderer'

export function NotesModuleComponent() {
  const [topic, setTopic] = useState('')
  const [options, setOptions] = useState({ math: true, code: true, quiz: false })
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleGenerate = async () => {
    if (!topic.trim() || isLoading) return
    setIsLoading(true)
    setError(null)
    try {
      const res = await generateNotes(topic, options)
      setNotes(res)
    } catch (err) {
      setError(`Error generating study notes: ${err.message}`)
    }
    setIsLoading(false)
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(notes)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="chat2-card">
      <div className="chat2-notes-header">
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.15)', border: '1px solid rgba(6, 182, 212, 0.4)', display: 'grid', placeItems: 'center', color: '#06b6d4', fontSize: '1.4rem' }}>
          <FileText size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            Notes Generator
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Generate structured, downloadable ML study notes from any topic.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '750px' }}>
        <textarea
          className="chat2-textarea"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1rem' }}
          rows={3}
          placeholder="What topic should I generate study notes for? e.g., 'Recurrent Neural Networks and LSTMs'"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />

        {/* Checkbox Options */}
        <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.85rem', color: '#94a3b8' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.math}
              onChange={(e) => setOptions({ ...options, math: e.target.checked })}
              style={{ accentColor: '#06b6d4' }}
            />
            <span>Include Formulas</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.code}
              onChange={(e) => setOptions({ ...options, code: e.target.checked })}
              style={{ accentColor: '#06b6d4' }}
            />
            <span>Include Code</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={options.quiz}
              onChange={(e) => setOptions({ ...options, quiz: e.target.checked })}
              style={{ accentColor: '#06b6d4' }}
            />
            <span>Include Quiz</span>
          </label>
        </div>

        <div>
          <motion.button
            type="button"
            className="fl-btn-primary"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0284c7)', border: 'none' }}
            onClick={handleGenerate}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={16} /> {isLoading ? 'Generating Notes...' : 'Generate Notes'}
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
      {notes && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#06b6d4' }}>
              Study Notes: {topic}
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="fl-export-btn" onClick={() => downloadNotesPdf(topic, notes)}>
                <Download size={14} /> Print PDF
              </button>
              <button type="button" className="fl-export-btn" onClick={handleCopy}>
                {copied ? <Check size={14} color="#34d399" /> : <Copy size={14} />} {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="chat2-output-box" style={{ whiteSpace: 'normal' }}>
            <MarkdownRenderer content={notes} />
          </div>
        </div>
      )}
    </div>
  )
}
