import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Sparkles, Download } from 'lucide-react'
import { generateMlImage } from '../services/imageService'

export function ImageGenModuleComponent() {
  const [prompt, setPrompt] = useState('')
  const [style, setStyle] = useState('diagram')
  const [generatedImg, setGeneratedImg] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim() || isLoading) return
    setIsLoading(true)

    // Clean up previous blob URL to prevent memory leaks
    if (generatedImg?.url && generatedImg.url.startsWith('blob:')) {
      URL.revokeObjectURL(generatedImg.url)
    }

    try {
      const res = await generateMlImage(prompt, style)
      setGeneratedImg(res)
    } catch (err) {
      alert(`Image Generation Failed: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="chat2-card">
      <div className="chat2-explain-header">
        <div style={{ width: '48px', height: '48px', borderRadius: '16px', background: 'rgba(236, 72, 153, 0.15)', border: '1px solid rgba(236, 72, 153, 0.4)', display: 'grid', placeItems: 'center', color: '#ec4899', fontSize: '1.4rem' }}>
          <ImageIcon size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-display)' }}>
            ML Concept Visualizer
          </h2>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#94a3b8' }}>
            Generate diagrams and visual explanations of ML concepts using AI.
          </p>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '750px' }}>
        <textarea
          className="chat2-textarea"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '1rem' }}
          rows={3}
          placeholder="Describe what ML concept to visualize... e.g., 'A neural network with 3 layers showing forward propagation'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />

        {/* Style Selector Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 700 }}>Style:</span>
          <button type="button" className={`chat2-level-btn ${style === 'diagram' ? 'active' : ''}`} onClick={() => setStyle('diagram')}>
            📊 Diagram
          </button>
          <button type="button" className={`chat2-level-btn ${style === 'illustration' ? 'active' : ''}`} onClick={() => setStyle('illustration')}>
            🎨 Illustration
          </button>
          <button type="button" className={`chat2-level-btn ${style === '3d' ? 'active' : ''}`} onClick={() => setStyle('3d')}>
            🧊 3D Render
          </button>
          <button type="button" className={`chat2-level-btn ${style === 'sketch' ? 'active' : ''}`} onClick={() => setStyle('sketch')}>
            ✏️ Sketch
          </button>
        </div>

        <div>
          <motion.button
            type="button"
            className="fl-btn-primary"
            style={{ background: 'linear-gradient(135deg, #ec4899, #be185d)', border: 'none' }}
            onClick={handleGenerate}
            disabled={isLoading}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Sparkles size={16} /> {isLoading ? 'Generating Visual...' : 'Generate Diagram Image'}
          </motion.button>
        </div>
      </div>

      {/* Output */}
      {generatedImg && (
        <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', borderRadius: '20px', overflow: 'hidden', border: '1px solid rgba(236, 72, 153, 0.3)', boxShadow: '0 0 40px rgba(236, 72, 153, 0.2)' }}>
            <img
              src={generatedImg.url}
              alt={generatedImg.prompt}
              style={{ maxWidth: '100%', maxHeight: '420px', display: 'block', borderRadius: '20px' }}
            />
          </div>
          <a
            href={generatedImg.url}
            target="_blank"
            rel="noreferrer"
            className="fl-export-btn"
            style={{ textDecoration: 'none' }}
          >
            <Download size={14} /> Open Full Resolution Image
          </a>
        </div>
      )}
    </div>
  )
}
