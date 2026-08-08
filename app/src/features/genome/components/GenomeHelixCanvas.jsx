import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Dna, Sparkles, CheckCircle2, Lock, Zap } from 'lucide-react'
import '../styles/neuralGenome.css'

export function GenomeHelixCanvas({ genes = [], onSelectGene }) {
  const canvasRef = useRef(null)
  const [hoveredGene, setHoveredGene] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')

    let animId
    let rotationAngle = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (parent) {
        canvas.width = parent.clientWidth || 800
        canvas.height = 360
      }
    }
    resize()
    window.addEventListener('resize', resize)

    // Render loop for animated double helix
    const render = () => {
      const width = canvas.width
      const height = canvas.height
      ctx.clearRect(0, 0, width, height)

      rotationAngle += 0.015

      const numPoints = 28
      const strandRadius = 70
      const speedScale = 0.18
      const centerY = height / 2

      // Collect 3D node points for two intertwined strands
      const strandA = []
      const strandB = []

      for (let i = 0; i < numPoints; i++) {
        const t = i * speedScale + rotationAngle
        const x = (i / (numPoints - 1)) * (width - 120) + 60

        const yA = centerY + Math.sin(t) * strandRadius
        const zA = Math.cos(t) // -1 to 1 depth

        const yB = centerY + Math.sin(t + Math.PI) * strandRadius
        const zB = Math.cos(t + Math.PI)

        strandA.push({ x, y: yA, z: zA, idx: i })
        strandB.push({ x, y: yB, z: zB, idx: i })
      }

      // Draw base-pair connecting rungs
      for (let i = 0; i < numPoints; i++) {
        const pA = strandA[i]
        const pB = strandB[i]

        const depthAvg = (pA.z + pB.z) / 2
        const alpha = Math.max(0.15, (depthAvg + 1) / 2)

        ctx.beginPath()
        ctx.moveTo(pA.x, pA.y)
        ctx.lineTo(pB.x, pB.y)
        ctx.strokeStyle = `rgba(168, 85, 247, ${alpha * 0.45})`
        ctx.lineWidth = 2
        ctx.stroke()
      }

      // Draw Strand A Nodes
      strandA.forEach((p, idx) => {
        const geneObj = genes[idx % genes.length] || genes[0]
        const scale = 0.75 + (p.z + 1) * 0.25
        const radius = 6 * scale

        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = geneObj?.isCleared ? '#38bdf8' : '#334155'
        ctx.shadowColor = geneObj?.isCleared ? '#38bdf8' : 'transparent'
        ctx.shadowBlur = geneObj?.isCleared ? 12 : 0
        ctx.fill()
      })

      // Draw Strand B Nodes
      strandB.forEach((p, idx) => {
        const geneObj = genes[(idx + 4) % genes.length] || genes[0]
        const scale = 0.75 + (p.z + 1) * 0.25
        const radius = 6 * scale

        ctx.beginPath()
        ctx.arc(p.x, p.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = geneObj?.isCleared ? '#c084fc' : '#334155'
        ctx.shadowColor = geneObj?.isCleared ? '#c084fc' : 'transparent'
        ctx.shadowBlur = geneObj?.isCleared ? 12 : 0
        ctx.fill()
      })

      ctx.shadowBlur = 0
      animId = requestAnimationFrame(render)
    }

    render()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [genes])

  const handleMouseMove = (e) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }
  }

  return (
    <div className="genome-helix-viewport glass">
      <div className="helix-header-row">
        <div className="helix-title-meta">
          <span className="helix-tag-pill">
            <Dna size={14} className="icon-pulse text-cyan" /> 3D BIOLUMINESCENT HELIX MATRIX
          </span>
          <h3>Neural Genome Double Helix</h3>
        </div>
        <div className="helix-legend">
          <span className="legend-dot active" /> Active Gene
          <span className="legend-dot unlocked" /> Unlocked
          <span className="legend-dot locked" /> Mutating
        </div>
      </div>

      <div className="helix-canvas-container" onMouseMove={handleMouseMove}>
        <canvas ref={canvasRef} className="genome-canvas" />

        {/* Floating Gene Nodes Layer */}
        <div className="interactive-gene-nodes-overlay">
          {genes.map((gene, idx) => (
            <button
              key={gene.id}
              type="button"
              className={`gene-helix-chip ${gene.isCleared ? 'active' : gene.isUnlocked ? 'unlocked' : 'locked'}`}
              style={{ '--gene-color': gene.color }}
              onMouseEnter={() => setHoveredGene(gene)}
              onMouseLeave={() => setHoveredGene(null)}
              onClick={() => onSelectGene && onSelectGene(gene)}
            >
              <span className="gene-symbol">{gene.isCleared ? '✓' : gene.code.split('-')[1]}</span>
              <span className="gene-name-short">{gene.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
