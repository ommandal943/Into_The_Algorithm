import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { QUIZZES, LEVELS } from '../data/content'
import { useGame } from '../context/GameContext'
import { ArrowRight, RotateCcw, LogOut, CheckCircle2, Sparkles } from 'lucide-react'

export default function QuizMode({ levelId }) {
  const questions = useMemo(() => QUIZZES[levelId] || [], [levelId])
  const { completeQuiz, playCompletionSound, playCorrectSound, playWrongSound } = useGame()
  const navigate = useNavigate()

  const [idx, setIdx] = useState(0)
  const [picked, setPicked] = useState(null)
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const [result, setResult] = useState(null)
  const [finalScore, setFinalScore] = useState(0)

  if (!questions.length) {
    return <p className="empty">No quiz for this level yet.</p>
  }

  const q = questions[idx]

  const choose = (i) => {
    if (picked !== null) return
    setPicked(i)
    if (i === q.answer) {
      if (playCorrectSound) playCorrectSound()
    } else {
      if (playWrongSound) playWrongSound()
    }
  }

  const next = () => {
    const newScore = score + (picked === q.answer ? 1 : 0)
    if (idx + 1 >= questions.length) {
      const res = completeQuiz(levelId, newScore, questions.length)
      setFinalScore(newScore)
      setResult(res)
      setFinished(true)
      if (res.passed) {
        if (playCompletionSound) playCompletionSound()
      }
    } else {
      setScore(newScore)
      setIdx((i) => i + 1)
      setPicked(null)
    }
  }

  const handleRetry = () => {
    setIdx(0)
    setPicked(null)
    setScore(0)
    setFinished(false)
    setResult(null)
    setFinalScore(0)
  }

  const hasNextLevel = levelId < LEVELS.length

  if (finished && result) {
    return (
      <motion.div className="result-panel glass" initial={{ scale: 0.94, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="result-burst">{result.perfect ? '🌟' : result.passed ? '🎉' : '💪'}</div>
        <h2>
          {result.perfect
            ? 'Perfect! You are an ML Star!'
            : result.passed
              ? 'Hurray! Level Unlocked Ahead!'
              : 'Keep Practicing!'}
        </h2>
        <p className="score-text">
          Score: <strong style={{ color: '#f4edff' }}>{finalScore}</strong> / {questions.length}
        </p>
        <p className="muted">
          {result.passed
            ? 'This level is cleared. Continue to the next level or head back to the roadmap.'
            : 'You need at least 50% score to clear this level and unlock the next one.'}
        </p>

        {/* Action buttons upon level completion */}
        <div className="quiz-result-actions">
          {result.passed && hasNextLevel && (
            <button
              type="button"
              className="saas-btn-showcase"
              onClick={() => navigate(`/quest/level/${levelId + 1}`)}
            >
              <span>Next Level ({levelId + 1})</span>
              <ArrowRight size={16} />
            </button>
          )}

          <button type="button" className="saas-btn-secondary" onClick={handleRetry}>
            <RotateCcw size={15} />
            <span>Retry Quiz</span>
          </button>

          <button type="button" className="saas-btn-secondary" onClick={() => navigate('/quest')}>
            <LogOut size={15} />
            <span>Exit to Roadmap</span>
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="quiz">
      <div className="progress-rail">
        <div style={{ width: `${((idx + (picked !== null ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>
      <p className="q-count">
        Question {idx + 1} / {questions.length} · Current score {score}
      </p>
      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ x: 24, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -24, opacity: 0 }}
          className="q-card"
        >
          <h2>{q.q}</h2>
          <div className="options">
            {q.options.map((opt, i) => {
              let cls = 'option'
              if (picked !== null) {
                if (i === q.answer) cls += ' correct'
                else if (i === picked) cls += ' wrong'
              }
              return (
                <button key={i} type="button" className={cls} onClick={() => choose(i)} disabled={picked !== null}>
                  {opt}
                </button>
              )
            })}
          </div>
          {picked !== null && (
            <div className="explain">
              <p>{q.explain}</p>
              <button type="button" className="btn primary" onClick={next}>
                {idx + 1 >= questions.length ? 'See results' : 'Next question'}
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
