import { useMemo, useState } from 'react'
import { CODING } from '../data/content'
import { useGame } from '../context/GameContext'

function normalize(v) {
  if (Array.isArray(v)) return v.map(normalize)
  if (typeof v === 'number') return Math.round(v * 1e6) / 1e6
  return v
}

function deepEqual(a, b) {
  return JSON.stringify(normalize(a)) === JSON.stringify(normalize(b))
}

const NAMES = ['mse', 'mae', 'relu', 'sigmoid', 'bigrams', 'can_shift', 'precision_recall', 'softmax']

function runTests(code, tests) {
  const stubs = NAMES.map((n) => `function ${n}(){ throw new Error('Implement ${n}'); }`).join('\n')
  // eslint-disable-next-line no-new-func
  const scope = new Function(`${stubs}\n${code}\nreturn { ${NAMES.join(', ')} };`)()
  return tests.map((t) => {
    try {
      // eslint-disable-next-line no-new-func
      const got = new Function(...NAMES, `return (${t.call});`)(...NAMES.map((n) => scope[n]))
      return { ...t, got, ok: deepEqual(got, t.expected) }
    } catch (err) {
      return { ...t, got: String(err.message || err), ok: false }
    }
  })
}

export default function CodingMode({ levelId }) {
  const problems = CODING[levelId] || []
  const { completeCoding, cheer, playCorrectSound, playWrongSound, progress } = useGame()
  const [sel, setSel] = useState(0)
  const problem = problems[sel]
  const [code, setCode] = useState(problem?.starter || '')
  const [results, setResults] = useState(null)
  const [showSol, setShowSol] = useState(false)
  const solved = useMemo(() => new Set(progress.solvedCodingIds), [progress.solvedCodingIds])

  if (!problems.length) return <p className="empty">No coding challenges on this level.</p>

  const switchProblem = (idx) => {
    setSel(idx)
    setCode(problems[idx].starter)
    setResults(null)
    setShowSol(false)
  }

  const run = () => {
    try {
      const res = runTests(code, problem.tests)
      setResults(res)
      if (res.length && res.every((r) => r.ok)) {
        completeCoding(levelId, problem.id)
        if (playCorrectSound) playCorrectSound()
      } else {
        if (playWrongSound) playWrongSound()
      }
    } catch (e) {
      setResults([{ call: 'load', got: String(e.message || e), ok: false }])
      if (playWrongSound) playWrongSound()
    }
  }

  const useSolution = () => {
    setCode(problem.solution)
    setShowSol(true)
  }

  return (
    <div className="coding">
      <div className="coding-tabs">
        {problems.map((p, idx) => (
          <button
            key={p.id}
            type="button"
            className={`tab ${idx === sel ? 'active' : ''} ${solved.has(p.id) ? 'solved' : ''}`}
            onClick={() => switchProblem(idx)}
          >
            {solved.has(p.id) ? '✓ ' : ''}
            {p.title}
          </button>
        ))}
      </div>
      <h2>{problem.title}</h2>
      <p className="muted">{problem.prompt}</p>
      <p className="tips">Hint: {problem.hint}</p>
      <textarea
        className="code-editor"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        rows={12}
      />
      <div className="flash-actions">
        <button type="button" className="btn primary" onClick={run}>
          Run tests
        </button>
        <button type="button" className="btn" onClick={() => setShowSol((s) => !s)}>
          {showSol ? 'Hide' : 'Show'} solution
        </button>
        <button type="button" className="btn" onClick={useSolution}>
          Fill solution
        </button>
        <button type="button" className="btn" onClick={() => setCode(problem.starter)}>
          Reset
        </button>
      </div>
      {showSol && <pre className="solution-block">{problem.solution}</pre>}
      {results && (
        <ul className="test-results">
          {results.map((r, i) => (
            <li key={i} className={r.ok ? 'ok' : 'fail'}>
              {r.ok ? '✓' : '✗'} <code>{r.call}</code> → {JSON.stringify(r.got)}
              {!r.ok && r.expected !== undefined && <> (expected {JSON.stringify(r.expected)})</>}
            </li>
          ))}
        </ul>
      )}
      {results?.length > 0 && results.every((r) => r.ok) && (
        <div className="result-panel mini">
          <h3>Hurray! Coding challenge solved — you are an ML star!</h3>
        </div>
      )}
    </div>
  )
}
