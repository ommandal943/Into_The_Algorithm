import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, HelpCircle, ArrowRight, RefreshCw, CheckCircle, XCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

const QUIZ_QUESTIONS = [
  {
    id: 1,
    question: 'Why do we normalize or scale input features before training a Gradient Descent model?',
    options: [
      { text: 'It decreases the total dataset size in memory', isCorrect: false },
      { text: 'It creates circular/symmetric loss contours, enabling faster, steady convergence', isCorrect: true },
      { text: 'It prevents decision boundaries from using non-linear activations', isCorrect: false },
      { text: 'It automatically removes outliers from training data', isCorrect: false }
    ],
    explanation: 'Unscaled features lead to elongated elliptical loss contours, causing gradient descent to oscillate wildly along steep gradients. Feature scaling creates circular contours so gradients point directly toward the minimum!'
  },
  {
    id: 2,
    question: 'What is the primary cause of Exploding Gradients in Deep Recurrent Neural Networks?',
    options: [
      { text: 'Weight matrices having eigenvalues greater than 1, compounded over many time steps', isCorrect: true },
      { text: 'Using the ReLU activation function in the output layer', isCorrect: false },
      { text: 'Setting learning rate too close to zero', isCorrect: false },
      { text: 'Using L1 regularization instead of L2 regularization', isCorrect: false }
    ],
    explanation: 'In RNNs, backpropagating through time involves repeated matrix multiplication by weights W. If the dominant eigenvalue of W > 1, gradients grow exponentially, causing numerical overflow (exploding gradients).'
  },
  {
    id: 3,
    question: 'In K-Means clustering, what does the inertia (or Within-Cluster Sum of Squares) measure?',
    options: [
      { text: 'The distance between the two furthest centroids', isCorrect: false },
      { text: 'The sum of squared distances of data points to their assigned cluster centroid', isCorrect: true },
      { text: 'The ratio of overlap between neighboring clusters', isCorrect: false },
      { text: 'The silhouette coefficient of the dataset', isCorrect: false }
    ],
    explanation: 'Inertia calculates sum_{i} ||x_i - mu_{k(i)}||^2. Lower inertia means points are tightly grouped around their respective centroids.'
  }
]

export default function MLQuickQuizTeaser() {
  const [qIndex, setQIndex] = useState(0)
  const [selectedOpt, setSelectedOpt] = useState(null)
  const [score, setScore] = useState(0)
  const [answeredCount, setAnsweredCount] = useState(0)

  const curQ = QUIZ_QUESTIONS[qIndex]

  const handleSelect = (idx) => {
    if (selectedOpt !== null) return
    setSelectedOpt(idx)
    setAnsweredCount((prev) => prev + 1)
    if (curQ.options[idx].isCorrect) {
      setScore((prev) => prev + 100)
    }
  }

  const handleNext = () => {
    setSelectedOpt(null)
    setQIndex((prev) => (prev + 1) % QUIZ_QUESTIONS.length)
  }

  return (
    <section className="quiz-teaser-section">
      <div className="playground-header">
        <div className="playground-title-group">
          <div className="section-badge">
            <Trophy size={14} /> INSTANT ML BRAIN TEASER
          </div>
          <h2>Test Your <em>ML IQ</em> Right Now</h2>
          <p className="playground-desc">
            Take a quick sample question from our 100-level ML Interview Quest. Instant feedback with detailed theoretical explanations!
          </p>
        </div>

        <div className="playground-stats-bar glass">
          <div className="p-stat">
            <span className="p-stat-label">TOTAL XP EARNED</span>
            <span className="p-stat-value highlight-gold">+{score} XP</span>
          </div>
          <div className="p-stat">
            <span className="p-stat-label">COMPLETED</span>
            <span className="p-stat-value">{answeredCount} / {QUIZ_QUESTIONS.length}</span>
          </div>
        </div>
      </div>

      <div className="quiz-teaser-card glass">
        <div className="quiz-head-row">
          <span className="quiz-q-num">
            <HelpCircle size={16} /> Question #{qIndex + 1} of {QUIZ_QUESTIONS.length}
          </span>
          <button className="btn ghost-btn" onClick={handleNext} title="Try Next Question">
            <RefreshCw size={14} /> Skip Question
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={curQ.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="quiz-body"
          >
            <h3 className="quiz-question-text">{curQ.question}</h3>

            <div className="quiz-options-list">
              {curQ.options.map((opt, idx) => {
                let stateClass = ''
                if (selectedOpt !== null) {
                  if (opt.isCorrect) stateClass = 'correct-opt'
                  else if (selectedOpt === idx) stateClass = 'wrong-opt'
                  else stateClass = 'dimmed-opt'
                }

                return (
                  <button
                    key={idx}
                    className={`quiz-opt-btn ${stateClass}`}
                    onClick={() => handleSelect(idx)}
                    disabled={selectedOpt !== null}
                  >
                    <span className="opt-letter">{String.fromCharCode(65 + idx)}</span>
                    <span className="opt-text">{opt.text}</span>
                    {selectedOpt !== null && opt.isCorrect && (
                      <CheckCircle size={18} color="#34d399" className="opt-icon" />
                    )}
                    {selectedOpt === idx && !opt.isCorrect && (
                      <XCircle size={18} color="#f87171" className="opt-icon" />
                    )}
                  </button>
                )
              })}
            </div>

            {selectedOpt !== null && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="quiz-explanation-box"
              >
                <h4>
                  {curQ.options[selectedOpt].isCorrect ? '🎉 Correct Answer!' : '💡 Key Insight:'}
                </h4>
                <p>{curQ.explanation}</p>
                <div className="quiz-next-actions">
                  <button className="btn primary" onClick={handleNext}>
                    Next Question →
                  </button>
                  <Link to="/quest" className="btn quest-link-btn">
                    Launch Full 100-Level Quest <ArrowRight size={15} />
                  </Link>
                </div>
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}
