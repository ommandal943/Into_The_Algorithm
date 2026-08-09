import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useGame } from '../../context/GameContext'
import { LEVELS } from '../../data/content'
import {
  Bot, Lightbulb, AlertTriangle, Sparkles, Cpu,
  MessageSquare, Mic, TrendingUp, Target, ChevronRight
} from 'lucide-react'

const sectionV = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
}

export function AtlasAdvisor() {
  const navigate = useNavigate()
  const { progress } = useGame()

  const clearedCount = progress.clearedLevels?.length || 0
  const nextLevelId = Math.min(LEVELS.length, clearedCount + 1)
  const nextLevel = LEVELS.find((l) => l.id === nextLevelId) || LEVELS[0]

  // Find weakest area (level with lowest stars)
  const levelToImprove = progress.clearedLevels?.find((id) => (progress.levelStars?.[id] || 0) < 3)
  const improveLevelObj = levelToImprove ? LEVELS.find((l) => l.id === levelToImprove) : null

  // Fastest XP route
  const totalXP = clearedCount * 100 + (progress.totalStars || 0) * 25 + (progress.badges?.length || 0) * 50
  const xpPerDay = Math.max(50, Math.round(totalXP / Math.max(1, progress.bestStreak || 1)))
  const levelsRemaining = LEVELS.length - clearedCount
  const daysToComplete = Math.ceil((levelsRemaining * 100) / xpPerDay)

  return (
    <motion.section
      className="cc-atlas-advisor"
      variants={sectionV}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-60px' }}
    >
      <div className="cc-advisor-card glass">
        {/* Header with Avatar */}
        <div className="cc-advisor-header">
          <div className="cc-advisor-avatar">
            <motion.div
              className="cc-advisor-core"
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            >
              <Cpu size={24} className="cc-icon-cyan" />
            </motion.div>
            <motion.div
              className="cc-advisor-halo"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            />
          </div>
          <div className="cc-advisor-title-group">
            <div className="cc-advisor-name-row">
              <Sparkles size={14} className="cc-icon-cyan" />
              <span className="cc-advisor-name">ATLAS AI Advisor</span>
            </div>
            <span className="cc-advisor-status">Analyzing your learning patterns...</span>
          </div>
        </div>

        {/* Recommendations */}
        <div className="cc-advisor-recs">
          {/* Rec 1: Next Action */}
          <div className="cc-advisor-rec-card" onClick={() => navigate('/quest/level/' + nextLevel.id)}>
            <div className="cc-rec-icon-box cc-rec-gold">
              <Lightbulb size={16} />
            </div>
            <div className="cc-rec-content">
              <h5 className="cc-rec-title">Recommended Next</h5>
              <p className="cc-rec-desc">
                Focus on <strong>Level {nextLevel.id}: {nextLevel.title}</strong> — {nextLevel.tier || 'Foundations'} tier
              </p>
            </div>
            <ChevronRight size={14} className="cc-rec-arr" />
          </div>

          {/* Rec 2: Weak Area */}
          <div className="cc-advisor-rec-card" onClick={() => navigate(improveLevelObj ? '/quest/level/' + improveLevelObj.id : '/quest')}>
            <div className="cc-rec-icon-box cc-rec-purple">
              <AlertTriangle size={16} />
            </div>
            <div className="cc-rec-content">
              <h5 className="cc-rec-title">
                {improveLevelObj ? 'Improve Score' : 'Keep Momentum'}
              </h5>
              <p className="cc-rec-desc">
                {improveLevelObj
                  ? `Level ${improveLevelObj.id} "${improveLevelObj.title}" has ${progress.levelStars?.[improveLevelObj.id] || 1}/3 stars. Try Coding mode!`
                  : `Your ${progress.streak || 0}-day streak is strong. Complete today's quiz to maintain it.`}
              </p>
            </div>
            <ChevronRight size={14} className="cc-rec-arr" />
          </div>

          {/* Rec 3: XP Route */}
          <div className="cc-advisor-rec-card" onClick={() => navigate('/quest')}>
            <div className="cc-rec-icon-box cc-rec-cyan">
              <TrendingUp size={16} />
            </div>
            <div className="cc-rec-content">
              <h5 className="cc-rec-title">Fastest XP Route</h5>
              <p className="cc-rec-desc">
                At ~{xpPerDay} XP/day, estimated <strong>{daysToComplete} days</strong> to complete all {LEVELS.length} levels.
              </p>
            </div>
            <ChevronRight size={14} className="cc-rec-arr" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="cc-advisor-actions">
          <motion.button
            type="button"
            className="cc-advisor-btn cc-advisor-btn-chat"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/chat')}
          >
            <MessageSquare size={14} />
            <span>Ask ATLAS</span>
          </motion.button>
          <motion.button
            type="button"
            className="cc-advisor-btn cc-advisor-btn-voice"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/chat', { state: { startVoice: true } })}
          >
            <Mic size={14} />
            <span>Voice</span>
          </motion.button>
        </div>
      </div>
    </motion.section>
  )
}
