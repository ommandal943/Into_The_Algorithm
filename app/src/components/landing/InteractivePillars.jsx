import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Gamepad2, ArrowRight, Code, Trophy, Flame, Play, Sparkles, Check } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function InteractivePillars() {
  const [activeVisualizer, setActiveVisualizer] = useState('linear')

  return (
    <section className="pillars-section">
      <div className="playground-header text-center">
        <div className="section-badge mx-auto">
          <Sparkles size={14} /> DUAL LEARNING POWERHOUSES
        </div>
        <h2>Choose Your <em>Learning Odyssey</em></h2>
        <p className="playground-desc max-w-2xl mx-auto">
          Whether you learn best through interactive visual simulations or gamified interview practice, Into the Algorithm equips you for mastery.
        </p>
      </div>

      <div className="pillars-grid">
        {/* Pillar 1: Visualizer Lab */}
        <motion.div
          className="pillar-card glass pillar-lab"
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <div className="pillar-top">
            <div className="pillar-icon lab">
              <BookOpen size={28} />
            </div>
            <span className="pillar-tag">VISUALIZE & PLAYGROUND</span>
          </div>

          <h2>Algorithm Lab</h2>
          <p className="pillar-desc">
            Deep-dive into fundamental Machine Learning algorithms through first-principles theory, mathematical breakdowns, and real-time canvas interactive controls.
          </p>

          {/* Interactive Mini Tabs for Visualizer links */}
          <div className="mini-tab-preview">
            <div className="mini-tab-buttons">
              <button
                className={`mini-tab-btn ${activeVisualizer === 'linear' ? 'active' : ''}`}
                onClick={() => setActiveVisualizer('linear')}
              >
                Linear Reg
              </button>
              <button
                className={`mini-tab-btn ${activeVisualizer === 'logistic' ? 'active' : ''}`}
                onClick={() => setActiveVisualizer('logistic')}
              >
                Logistic Reg
              </button>
              <button
                className={`mini-tab-btn ${activeVisualizer === 'kmeans' ? 'active' : ''}`}
                onClick={() => setActiveVisualizer('kmeans')}
              >
                K-Means
              </button>
            </div>

            <div className="mini-tab-content">
              {activeVisualizer === 'linear' && (
                <div className="tab-preview-item">
                  <div className="preview-graphic linear-graphic">
                    <svg viewBox="0 0 200 100" className="preview-svg">
                      <line x1="20" y1="80" x2="180" y2="20" stroke="#60a5fa" strokeWidth="3" />
                      <circle cx="30" cy="70" r="4" fill="#67e8f9" />
                      <circle cx="60" cy="65" r="4" fill="#67e8f9" />
                      <circle cx="90" cy="45" r="4" fill="#67e8f9" />
                      <circle cx="130" cy="35" r="4" fill="#67e8f9" />
                      <circle cx="160" cy="25" r="4" fill="#67e8f9" />
                    </svg>
                  </div>
                  <h4>Linear Regression Lab</h4>
                  <p>Interactive gradient descent line fitting, mean squared error loss surface, and point placement.</p>
                  <a href="/learn/index.html" className="btn mini-cta">
                    Open Linear Reg Lab <ArrowRight size={14} />
                  </a>
                </div>
              )}

              {activeVisualizer === 'logistic' && (
                <div className="tab-preview-item">
                  <div className="preview-graphic logistic-graphic">
                    <svg viewBox="0 0 200 100" className="preview-svg">
                      <path d="M 10 90 C 80 90, 120 10, 190 10" fill="none" stroke="#a78bfa" strokeWidth="3" />
                      <circle cx="30" cy="85" r="4" fill="#38bdf8" />
                      <circle cx="60" cy="82" r="4" fill="#38bdf8" />
                      <circle cx="140" cy="15" r="4" fill="#f472b6" />
                      <circle cx="170" cy="12" r="4" fill="#f472b6" />
                    </svg>
                  </div>
                  <h4>Logistic Regression Lab</h4>
                  <p>Sigmoid curve transformation, binary decision boundary heatmaps, and cross-entropy loss analysis.</p>
                  <a href="/learn/logistic-regression.html" className="btn mini-cta">
                    Open Logistic Lab <ArrowRight size={14} />
                  </a>
                </div>
              )}

              {activeVisualizer === 'kmeans' && (
                <div className="tab-preview-item">
                  <div className="preview-graphic kmeans-graphic">
                    <svg viewBox="0 0 200 100" className="preview-svg">
                      <circle cx="50" cy="40" r="18" fill="rgba(96,165,250,0.2)" stroke="#60a5fa" strokeDasharray="3 3" />
                      <circle cx="140" cy="60" r="22" fill="rgba(244,114,182,0.2)" stroke="#f472b6" strokeDasharray="3 3" />
                      <polygon points="50,40 45,45 55,45" fill="#60a5fa" />
                      <polygon points="140,60 135,65 145,65" fill="#f472b6" />
                    </svg>
                  </div>
                  <h4>K-Means Clustering Lab</h4>
                  <p>Iterative centroid optimization, cluster Voronoi partitions, and inertia elbow plot analysis.</p>
                  <a href="/learn/kmeans.html" className="btn mini-cta">
                    Open K-Means Lab <ArrowRight size={14} />
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="pillar-footer">
            <a href="/learn/main.html" className="btn primary pillar-cta">
              Explore All Algorithm Guides <ArrowRight size={16} />
            </a>
          </div>
        </motion.div>

        {/* Pillar 2: ML Quest */}
        <motion.div
          className="pillar-card glass pillar-quest"
          whileHover={{ y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <div className="pillar-top">
            <div className="pillar-icon quest">
              <Gamepad2 size={28} />
            </div>
            <span className="pillar-tag quest-tag">GAMIFIED INTERVIEW PREP</span>
          </div>

          <h2>ML Quest</h2>
          <p className="pillar-desc">
            A Candy Crush–style 100-level campaign designed to prepare you for Machine Learning & AI engineering interviews with real questions & live coding.
          </p>

          {/* Gamified Feature Badges */}
          <div className="quest-features-grid">
            <div className="q-feat-box">
              <div className="q-feat-icon">
                <Trophy size={18} color="#fbbf24" />
              </div>
              <div className="q-feat-text">
                <h5>100 Level Stages</h5>
                <p>From Linear models to Transformer architectures</p>
              </div>
            </div>

            <div className="q-feat-box">
              <div className="q-feat-icon">
                <Flame size={18} color="#67e8f9" />
              </div>
              <div className="q-feat-text">
                <h5>Daily Streaks & Coins</h5>
                <p>Earn XP, unlock badges, and maintain your streak</p>
              </div>
            </div>

            <div className="q-feat-box">
              <div className="q-feat-icon">
                <Code size={18} color="#a78bfa" />
              </div>
              <div className="q-feat-text">
                <h5>4 Interactive Modes</h5>
                <p>Quizzes, Flashcards, System Design, & Python Coding</p>
              </div>
            </div>

            <div className="q-feat-box">
              <div className="q-feat-icon">
                <Check size={18} color="#34d399" />
              </div>
              <div className="q-feat-text">
                <h5>Curated Questions</h5>
                <p>Inspired by top tech company ML interview loops</p>
              </div>
            </div>
          </div>

          <div className="pillar-footer mt-auto">
            <Link to="/quest" className="btn primary pillar-cta quest-cta">
              <Play size={16} fill="currentColor" /> Launch ML Quest Journey
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
