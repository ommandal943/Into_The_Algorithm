import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { BookOpen, Gamepad2, ArrowRight, Sparkles, Award, Terminal, Zap, ChevronDown, Compass, Trees } from 'lucide-react'

const HERO_PHRASES = [
  'Interactive 3D Sigmoidal Hyperplanes 🔮',
  'Random Forest Bagging & Gini Splits 🌲',
  'Gradient Descent Loss Landscapes 📉',
  '100-Level Gamified ML Quests 🎮'
]

export default function ModernHeroSection() {
  const [phraseIdx, setPhraseIdx] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setPhraseIdx((prev) => (prev + 1) % HERO_PHRASES.length)
    }, 3200)
    return () => clearInterval(timer)
  }, [])

  const scrollTo3D = () => {
    const el = document.querySelector('.logistic-3d-section') || document.querySelector('.threed-badge')
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <section className="modern-hero-container">
      {/* Subtle Background Radial Ambient Glow */}
      <div className="hero-ambient-glow" />

      {/* Top Holographic Glow Badge */}
      <motion.div
        className="hero-holo-badge"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="hero-beacon-dot" />
        <span className="hero-badge-title">INTERACTIVE ML PLATFORM</span>
        <span className="hero-badge-divider">•</span>
        <AnimatePresence mode="wait">
          <motion.span
            key={phraseIdx}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="hero-phrase-cycling"
          >
            {HERO_PHRASES[phraseIdx]}
          </motion.span>
        </AnimatePresence>
      </motion.div>

      {/* Clean Minimalist Headline */}
      <motion.h1
        className="modern-hero-headline"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
      >
        Master Machine Learning <br />
        <span className="hero-headline-sub">
          Into the <em className="hero-shimmer-text">Algorithm</em>
        </span>
      </motion.h1>

      {/* Minimal Subtitle */}
      <motion.p
        className="modern-hero-subtext"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
      >
        Interactive 3D visualizers, first-principles mathematics, and real-time algorithm labs.
      </motion.p>

      {/* Single-Line Formula Ticker Ribbon */}
      <motion.div
        className="hero-formula-ticker glass"
        data-tilt
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.7, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="ticker-badge-item">
          <Sparkles size={13} color="#67e8f9" />
          <span className="ticker-label-text">TENSORS</span>
        </div>
        <div className="ticker-pill">P(Y=1|X) = σ(WᵀX + b)</div>
        <div className="ticker-pill">J(θ) = -1/N ∑ LogLoss</div>
        <div className="ticker-pill">Gini = 1 - ∑ pᵢ²</div>
      </motion.div>

      {/* Action Buttons Group */}
      <motion.div
        className="modern-hero-cta-group"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <a href="/learn/main.html" className="modern-btn-primary" data-magnetic data-gsap="hover">
          <div className="btn-glow-beam" />
          <BookOpen size={18} />
          <span>Explore Algorithm Labs</span>
          <ArrowRight size={16} className="btn-arrow-icon" />
        </a>

        <Link to="/quest" className="modern-btn-secondary" data-magnetic data-gsap="hover">
          <Gamepad2 size={18} color="#a78bfa" />
          <span>Launch ML Quest</span>
          <span className="hero-level-badge">100 Levels</span>
        </Link>

        <button className="modern-btn-demo" onClick={scrollTo3D} title="Scroll directly to 3D visualizer" data-magnetic data-gsap="hover">
          <Zap size={15} color="#fbbf24" />
          <span>3D Visualizer Demo</span>
          <ChevronDown size={14} />
        </button>
      </motion.div>

      {/* Minimal Feature Specs Grid */}
      <motion.div
        className="modern-hero-cards-grid"
        data-gsap="stagger"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="hero-feature-card glass" data-tilt data-gsap="hover">
          <div className="hero-card-icon blue">
            <Compass size={20} />
          </div>
          <div className="hero-card-body">
            <h4>Surreal 3D Visualizer</h4>
            <p>Orbit 3D Sigmoidal Surfaces & decision hyperplanes with camera drag controls.</p>
          </div>
        </div>

        <div className="hero-feature-card glass" data-tilt data-gsap="hover">
          <div className="hero-card-icon purple">
            <Trees size={20} />
          </div>
          <div className="hero-card-body">
            <h4>Random Forest Lab</h4>
            <p>Customize tree counts, max depth, and Gini feature importance live.</p>
          </div>
        </div>

        <div className="hero-feature-card glass" data-tilt data-gsap="hover">
          <div className="hero-card-icon gold">
            <Award size={20} />
          </div>
          <div className="hero-card-body">
            <h4>Gamified ML Quest</h4>
            <p>100 campaign levels of quizzes, flashcards, Python coding, and badges.</p>
          </div>
        </div>

        <div className="hero-feature-card glass" data-tilt data-gsap="hover">
          <div className="hero-card-icon emerald">
            <Terminal size={20} />
          </div>
          <div className="hero-card-body">
            <h4>Math to Code</h4>
            <p>Interactive viewers mapping loss equations directly to PyTorch backprop.</p>
          </div>
        </div>
      </motion.div>
    </section>
  )
}
