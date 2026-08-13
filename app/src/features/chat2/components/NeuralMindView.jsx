import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Bot, Lightbulb, GraduationCap, FileText, Sparkles } from 'lucide-react'
import { ChatModuleComponent } from './ChatModuleComponent'
import { SocraticModuleComponent } from './SocraticModuleComponent'
import { ExplainModuleComponent } from './ExplainModuleComponent'
import { NotesModuleComponent } from './NotesModuleComponent'
import '../styles/chat2.css'

export default function NeuralMindView() {
  const [activeModule, setActiveModule] = useState('chat')

  return (
    <div className="chat2-view">
      <div className="chat2-container">
        {/* Header Navigation Bar */}
        <div className="chat2-header">
          <div className="chat2-brand">
            <div className="chat2-brand-icon">
              <Bot size={24} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Neural<span style={{ color: '#a78bfa' }}>Mind</span> AI
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                Multimodal Agentic ML Assistant
              </div>
            </div>
          </div>

          <div className="chat2-nav-tabs">
            <button
              type="button"
              className={`chat2-tab-btn ${activeModule === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveModule('chat')}
            >
              <Bot size={15} />
              <span>Chat</span>
            </button>

            <button
              type="button"
              className={`chat2-tab-btn ${activeModule === 'socratic' ? 'active' : ''}`}
              onClick={() => setActiveModule('socratic')}
            >
              <Lightbulb size={15} />
              <span>Socratic</span>
            </button>

            <button
              type="button"
              className={`chat2-tab-btn ${activeModule === 'explain' ? 'active' : ''}`}
              onClick={() => setActiveModule('explain')}
            >
              <GraduationCap size={15} />
              <span>Explain</span>
            </button>

            <button
              type="button"
              className={`chat2-tab-btn ${activeModule === 'notes' ? 'active' : ''}`}
              onClick={() => setActiveModule('notes')}
            >
              <FileText size={15} />
              <span>Notes</span>
            </button>
          </div>
        </div>

        {/* Module Content Viewport */}
        <motion.div
          key={activeModule}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {activeModule === 'chat' && <ChatModuleComponent />}
          {activeModule === 'socratic' && <SocraticModuleComponent />}
          {activeModule === 'explain' && <ExplainModuleComponent />}
          {activeModule === 'notes' && <NotesModuleComponent />}
        </motion.div>
      </div>
    </div>
  )
}
