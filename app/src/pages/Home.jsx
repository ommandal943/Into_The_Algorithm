import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Sparkles, BookOpen, Sigma, ArrowRight, ShieldCheck, Cpu, Layers, Target, CheckCircle2, Compass, Trees, TrendingDown, Gamepad2, Code } from 'lucide-react'

import ModernHeroSection from '../components/landing/ModernHeroSection'
import HomeVideoBackground from '../components/landing/HomeVideoBackground'
import InteractiveRandomForestPlayground from '../components/landing/InteractiveRandomForestPlayground'
import InteractiveLogistic3DPlayground from '../components/landing/InteractiveLogistic3DPlayground'
import GradientDescentSimulator from '../components/landing/GradientDescentSimulator'
import { useGSAPAnimations } from '../hooks/useGSAPAnimations'

export default function Home() {
  const containerRef = useRef(null)

  // Initialize GSAP scroll triggers and staggers
  useGSAPAnimations(containerRef)

  return (
    <div className="landing-hub-container" ref={containerRef}>
      {/* 🎥 Fullscreen High-Definition AI Platform Video Background */}
      <HomeVideoBackground />

      {/* Modern Ultra-Professional Hero Section */}
      <ModernHeroSection />

      <div className="section-divider" />

      {/* Feature Section 1: Live Random Forest Customization & Ensemble Visualizer */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <InteractiveRandomForestPlayground />
      </motion.div>

      <div className="section-divider" />

      {/* Feature Section 2: Surreal 3D Logistic Regression Hyperplane Surface */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <InteractiveLogistic3DPlayground />
      </motion.div>

      <div className="section-divider" />

      {/* Feature Section 3: Gradient Descent Loss Landscape Simulator */}
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <GradientDescentSimulator />
      </motion.div>

      <div className="section-divider" />

      {/* Structured Mathematical Prerequisites Section */}
      <motion.section
        className="prereq-section-container"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
      >
        <div className="prereq-header">
          <div className="section-badge mx-auto">
            <Sigma size={15} color="#60a5fa" /> FOUNDATIONAL MATHEMATICS
          </div>
          <h2>
            Master the <em className="hero-shimmer-text">Core Prerequisites</em>
          </h2>
          <p>
            Before Machine Learning models can generalize on complex data, they rely on 4 fundamental pillars of mathematical theory. Build intuition step-by-step.
          </p>
        </div>

        {/* 4 Prerequisites Cards Grid */}
        <div className="prereq-grid" data-gsap="stagger">
          {/* Card 1: Linear Algebra */}
          <div className="prereq-card blue" data-tilt data-gsap="hover">
            <div>
              <div className="prereq-num">01</div>
              <h3>Linear Algebra</h3>
              <p>Vectors, matrices, dot products (WᵀX), projections, and Eigendecomposition for PCA dimension reduction.</p>
            </div>
            <div className="prereq-note-box">
              <strong>Key Note:</strong> Matrix operations drive 100% of neural layer activations and GPU parallelism.
            </div>
          </div>

          {/* Card 2: Multivariable Calculus */}
          <div className="prereq-card cyan" data-tilt data-gsap="hover">
            <div>
              <div className="prereq-num">02</div>
              <h3>Calculus &amp; Gradients</h3>
              <p>Partial derivatives, Jacobian matrices, chain rule for backprop, and gradient vector calculations.</p>
            </div>
            <div className="prereq-note-box">
              <strong>Key Note:</strong> The gradient vector ∇J(θ) points in the direction of steepest loss increase.
            </div>
          </div>

          {/* Card 3: Probability & Stats */}
          <div className="prereq-card gold" data-tilt data-gsap="hover">
            <div>
              <div className="prereq-num">03</div>
              <h3>Probability &amp; Stats</h3>
              <p>Bayes' theorem, Gaussian distributions, cross-entropy loss, and Maximum Likelihood Estimation (MLE).</p>
            </div>
            <div className="prereq-note-box">
              <strong>Key Note:</strong> Binary Cross-Entropy loss is derived directly from Bernoulli maximum likelihood!
            </div>
          </div>

          {/* Card 4: Optimization */}
          <div className="prereq-card emerald" data-tilt data-gsap="hover">
            <div>
              <div className="prereq-num">04</div>
              <h3>Optimization Theory</h3>
              <p>Gradient descent updates, momentum acceleration (β=0.9), Adam optimizers, and loss landscapes.</p>
            </div>
            <div className="prereq-note-box">
              <strong>Key Note:</strong> Momentum accumulates velocity vectors to navigate saddle points and noisy gradients.
            </div>
          </div>
        </div>

        {/* Math Guide CTA Banner */}
        <div className="prereq-cta-banner" data-tilt>
          <div className="banner-info">
            <div className="banner-icon">
              <BookOpen size={20} />
            </div>
            <div>
              <h4>Want a complete mathematical cheat sheet?</h4>
              <p>Explore formulas, KaTeX equation proofs, and interactive field notes.</p>
            </div>
          </div>
          <a href="/learn/ml_prerequisites.html" className="modern-btn-primary" data-magnetic>
            <span>Read Math Prerequisites Guide</span>
            <ArrowRight size={16} />
          </a>
        </div>
      </motion.section>

      <div className="section-divider" />

      {/* NEW: Platform Mission, What It Does & What It Provides Section */}
      <motion.section
        className="platform-mission-section"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7 }}
      >
        <div className="mission-header">
          <div className="section-badge mx-auto">
            <Target size={15} color="#a78bfa" /> MISSION &amp; PLATFORM VISION
          </div>
          <h2>
            What Into the Algorithm <em className="hero-shimmer-text">Does &amp; Provides</em>
          </h2>
          <p>
            Our core mission is simple: replace black-box abstractions with live, interactive first-principles visualizers that build permanent mathematical intuition.
          </p>
        </div>

        {/* 3 Core Pillars: What It Does, What It Provides, Our Core Aim */}
        <div className="mission-grid" data-gsap="stagger">
          {/* Pillar 1: What It Does */}
          <div className="mission-card blue" data-tilt data-gsap="hover">
            <div>
              <div className="mission-icon-box">
                <Cpu size={26} />
              </div>
              <h3>What It Does</h3>
              <p>
                Renders complex AI algorithms as interactive 2D and 3D simulations. Users can manipulate parameters live to observe immediate matrix transformations and backpropagation gradients.
              </p>
            </div>
            <ul className="mission-feature-list">
              <li><CheckCircle2 size={15} /> Real-Time 3D Projection Canvas</li>
              <li><CheckCircle2 size={15} /> Bagging Forest Variance Reduction</li>
              <li><CheckCircle2 size={15} /> Live Contour Loss Trajectory Tracing</li>
            </ul>
          </div>

          {/* Pillar 2: What It Provides */}
          <div className="mission-card violet" data-tilt data-gsap="hover">
            <div>
              <div className="mission-icon-box">
                <Layers size={26} />
              </div>
              <h3>What It Provides</h3>
              <p>
                A complete end-to-end interactive suite including 3D Sigmoidal hyperplanes, Random Forest Impurity analyzers, a 100-level gamified Quest, and pure PyTorch code inspectors.
              </p>
            </div>
            <ul className="mission-feature-list">
              <li><CheckCircle2 size={15} /> 100-Level Gamified Interview Campaign</li>
              <li><CheckCircle2 size={15} /> Math Prerequisites &amp; Formula Notes</li>
              <li><CheckCircle2 size={15} /> Pure PyTorch Tensor Backprop Viewer</li>
            </ul>
          </div>

          {/* Pillar 3: Our Core Aim */}
          <div className="mission-card emerald" data-tilt data-gsap="hover">
            <div>
              <div className="mission-icon-box">
                <Target size={26} />
              </div>
              <h3>Our Core Aim</h3>
              <p>
                To bridge the gap between textbook math formulas and production PyTorch engineering. We empower students, AI researchers, and engineers to ace ML interviews and build real AI systems.
              </p>
            </div>
            <ul className="mission-feature-list">
              <li><CheckCircle2 size={15} /> First-Principles Deep Intuition</li>
              <li><CheckCircle2 size={15} /> Production PyTorch Alignment</li>
              <li><CheckCircle2 size={15} /> 100% Free &amp; Open Source Platform</li>
            </ul>
          </div>
        </div>

        {/* Visual Arsenal Showcase Grid */}
        <div className="arsenal-header">
          <h4>YOUR INTERACTIVE ALGORITHM ARSENAL</h4>
        </div>
        <div className="arsenal-grid" data-gsap="stagger">
          <div className="arsenal-card" data-tilt data-gsap="hover">
            <Compass size={22} className="arsenal-card-icon" />
            <span>3D Hyperplanes</span>
          </div>
          <div className="arsenal-card" data-tilt data-gsap="hover">
            <Trees size={22} className="arsenal-card-icon" />
            <span>Random Forests</span>
          </div>
          <div className="arsenal-card" data-tilt data-gsap="hover">
            <TrendingDown size={22} className="arsenal-card-icon" />
            <span>Loss Bowls</span>
          </div>
          <div className="arsenal-card" data-tilt data-gsap="hover">
            <Gamepad2 size={22} className="arsenal-card-icon" />
            <span>ML Quest</span>
          </div>
          <div className="arsenal-card" data-tilt data-gsap="hover">
            <Code size={22} className="arsenal-card-icon" />
            <span>Tensor Viewer</span>
          </div>
          <div className="arsenal-card" data-tilt data-gsap="hover">
            <BookOpen size={22} className="arsenal-card-icon" />
            <span>Math Notes</span>
          </div>
        </div>
      </motion.section>

      {/* Ultra-Luxury Platform Ending Banner */}
      <motion.div
        className="platform-ending-container"
        data-tilt
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="ending-badge">
          <ShieldCheck size={15} /> 100% Interactive &amp; Open Source
        </div>
        <h3 className="ending-title">
          Empowering the Next Generation of AI Engineers
        </h3>
        <p className="ending-subtext">
          Into the Algorithm bridges the gap between abstract mathematical formulas and practical machine learning engineering. Built for students, researchers, and engineers seeking deep first-principles mastery.
        </p>

        {/* Feature Spec Badges */}
        <div className="ending-specs-ribbon">
          <span className="ending-spec-pill">⚡ 100% In-Browser Execution</span>
          <span className="ending-spec-pill">🔮 3D Hyperplane &amp; Surface Mesh Engine</span>
          <span className="ending-spec-pill">🌲 Bagging Forest Impurity Analyzer</span>
          <span className="ending-spec-pill">🎮 100-Level Gamified Interview Quest</span>
        </div>

        {/* CTA Group */}
        <div className="ending-cta-group">
          <Link to="/quest" className="modern-btn-primary" data-magnetic>
            <span>Start ML Quest</span>
            <ArrowRight size={16} />
          </Link>
          <a href="/learn/main.html" className="modern-btn-secondary" data-magnetic>
            <span>Explore All Labs</span>
          </a>
        </div>
      </motion.div>

      {/* Quick Jump Ribbon Footer */}
      <motion.div
        className="hub-quick minimal-glass-bar"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <Sparkles size={16} color="#67e8f9" />
        <span>Direct Access:</span>
        <a href="/learn/index.html">Linear Regression Lab</a>
        <a href="/learn/logistic-regression.html">Logistic Regression Lab</a>
        <a href="/learn/kmeans.html">K-Means Clustering Lab</a>
        <a href="/learn/ml_prerequisites.html">Math Prerequisites</a>
        <Link to="/quest">ML Interview Quest</Link>
      </motion.div>
    </div>
  )
}
