import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { PieChart, Zap, Check } from 'lucide-react'

export function InteractiveRadarSection({ evaluatedModels }) {
  const defaultAlgoName = evaluatedModels?.[0]?.name || ''
  const [selectedAlgoName, setSelectedAlgoName] = useState(defaultAlgoName)

  if (!evaluatedModels || !evaluatedModels.length) return null

  const topModels = evaluatedModels.slice(0, 4)
  const activeModel = evaluatedModels.find(m => m.name === selectedAlgoName) || topModels[0]
  const radarData = activeModel.radar || { accuracy: 94, interpretability: 75, speed: 85, memory: 80, scalability: 90, robustness: 95 }

  // Custom SVG Animated Radar Chart math
  const metrics = [
    { key: 'accuracy', label: 'Accuracy' },
    { key: 'interpretability', label: 'Interpretability' },
    { key: 'speed', label: 'Inference Speed' },
    { key: 'memory', label: 'Memory Efficiency' },
    { key: 'scalability', label: 'Scalability' },
    { key: 'robustness', label: 'Robustness' }
  ]

  const size = 300
  const center = size / 2
  const maxR = 110

  function getCoordinates(index, total, valPct) {
    const angle = (Math.PI * 2 * index) / total - Math.PI / 2
    const r = (valPct / 100) * maxR
    const x = center + r * Math.cos(angle)
    const y = center + r * Math.sin(angle)
    return { x, y }
  }

  const polygonPoints = metrics.map((m, i) => {
    const val = radarData[m.key] || 80
    const pt = getCoordinates(i, metrics.length, val)
    return `${pt.x},${pt.y}`
  }).join(' ')

  return (
    <motion.section
      className="ml-radar-section glass"
      style={{ padding: '2rem', borderRadius: '24px' }}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
    >
      <div className="ml-section-header">
        <PieChart size={18} className="cc-icon-purple" />
        <h2 className="ml-section-title">Interactive Multi-Dimensional Radar Comparison</h2>
        <span className="ml-badge">6-Axis Capability Analysis</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'center' }}>
        {/* Left Radar SVG Viewport */}
        <div style={{ display: 'flex', justifyContent: 'center', position: 'relative' }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {/* Grid Rings */}
            {[0.2, 0.4, 0.6, 0.8, 1.0].map((level, lIdx) => (
              <polygon
                key={lIdx}
                points={metrics.map((_, i) => {
                  const pt = getCoordinates(i, metrics.length, level * 100)
                  return `${pt.x},${pt.y}`
                }).join(' ')}
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1.5"
                strokeDasharray={lIdx === 4 ? 'none' : '4 4'}
              />
            ))}

            {/* Radar Spokes */}
            {metrics.map((m, i) => {
              const pt = getCoordinates(i, metrics.length, 100)
              const labelPt = getCoordinates(i, metrics.length, 118)
              return (
                <g key={m.key}>
                  <line x1={center} y1={center} x2={pt.x} y2={pt.y} stroke="rgba(255, 255, 255, 0.1)" strokeWidth="1" />
                  <text
                    x={labelPt.x}
                    y={labelPt.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#94a3b8"
                    fontSize="10"
                    fontWeight="700"
                  >
                    {m.label}
                  </text>
                </g>
              )
            })}

            {/* Filled Polygon */}
            <motion.polygon
              points={polygonPoints}
              fill="rgba(6, 182, 212, 0.25)"
              stroke="#06b6d4"
              strokeWidth="2.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{ transformOrigin: `${center}px ${center}px` }}
            />

            {/* Polygon Nodes */}
            {metrics.map((m, i) => {
              const val = radarData[m.key] || 80
              const pt = getCoordinates(i, metrics.length, val)
              return (
                <circle key={m.key} cx={pt.x} cy={pt.y} r="4" fill="#38bdf8" stroke="#000" strokeWidth="2" />
              )
            })}
          </svg>
        </div>

        {/* Right Model Switcher */}
        <div>
          <span style={{ fontSize: '0.78rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'block' }}>
            Select Algorithm Radar Profile:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {topModels.map(m => {
              const isSelected = m.name === activeModel.name
              return (
                <button
                  key={m.name}
                  type="button"
                  className="fl-sample-chip"
                  style={{
                    borderColor: isSelected ? '#06b6d4' : 'rgba(255,255,255,0.06)',
                    background: isSelected ? 'rgba(6, 182, 212, 0.1)' : 'rgba(255,255,255,0.02)'
                  }}
                  onClick={() => setSelectedAlgoName(m.name)}
                >
                  <div>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isSelected ? '#38bdf8' : '#fff' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                      {m.type} · Score: {m.overallScore}%
                    </div>
                  </div>
                  {isSelected && <Check size={16} color="#06b6d4" />}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
