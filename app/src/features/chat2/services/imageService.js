/**
 * NeuralMind CHAT2 — ML Concept Visualizer & Diagram Service
 * Features 4 genuinely distinct visual style modes (Diagram, Illustration, 3D Render, Sketch)
 * with style-specific Groq AI prompt engineering, fallback vector synthesis, and pre-fetched Blob URLs.
 */

import { callGroqApi, isGroqKeyConfigured } from './groqClient'

const STYLE_CONFIGS = {
  diagram: {
    systemPrompt: 'You are an elite ML technical architect. Describe a structured, technical architecture diagram for the given concept. Focus on: labelled boxes, input/output data flow, modular components, arrows, and technical hierarchy. Keep under 25 words. Output ONLY the raw prompt string.',
    descriptor: 'technical architectural flowchart diagram, structured nodes, clear data flow arrows, labelled components, vector infographic layout, dark blueprint theme',
    negative: 'no abstract artwork, no 3d rendering, no whiteboard sketches, no decorative painting'
  },
  illustration: {
    systemPrompt: 'You are a creative tech illustrator. Describe a visual storytelling illustration and conceptual visual metaphor explaining the given ML concept. Focus on: central AI core, data streams, glowing energy patterns, visual metaphors, and artistic digital composition. Avoid mentioning rectangular flowchart boxes or node diagrams. Keep under 25 words. Output ONLY the raw prompt string.',
    descriptor: 'vibrant conceptual educational illustration, futuristic glowing cyber artwork, digital art illustration, visual metaphor, rich visual storytelling, cinematic composition',
    negative: 'no flat flowchart, no rectangular text boxes, no simple 2d diagram, no whiteboard sketch'
  },
  '3d': {
    systemPrompt: 'You are a 3D scientific visualization director. Describe a 3D spatial render for the given ML concept. Focus on: floating 3D spheres, volumetric neural nodes, isometric perspective, spatial depth, metallic/glass materials, and glowing light trails. Avoid flat 2D layout terms. Keep under 25 words. Output ONLY the raw prompt string.',
    descriptor: 'high-end 3D isometric scientific visualization, volumetric lighting, spatial depth and perspective, 3D floating neural structures, octane render, photorealistic materials, cinema4d style',
    negative: 'no 2D flat diagram, no flowchart boxes, no flat text list, no hand drawn sketch'
  },
  sketch: {
    systemPrompt: 'You are an ML educator drawing on a whiteboard. Describe a hand-drawn sketch explaining the given ML concept. Focus on: hand-drawn lines, chalk annotations, rough circles and arrows, conceptual doodle layout, and educational whiteboard notes. Keep under 25 words. Output ONLY the raw prompt string.',
    descriptor: 'hand-drawn educational whiteboard sketch, chalk on dark slate blackboard, handwritten annotations, rough pencil/ink strokes, doodle diagrammatic thinking',
    negative: 'no polished digital graphics, no perfect geometric cards, no 3d render, no glossy vector graphics'
  }
}

export async function generateMlImage(userPrompt, style = 'diagram') {
  const seed = Math.floor(Math.random() * 1000000)
  const config = STYLE_CONFIGS[style] || STYLE_CONFIGS.diagram

  // 1. Expand concept using style-specific Groq AI prompt instructions
  let expandedConcept = userPrompt
  if (isGroqKeyConfigured()) {
    try {
      const aiResponse = await callGroqApi({
        messages: [
          { role: 'system', content: config.systemPrompt },
          { role: 'user', content: `ML Concept: "${userPrompt}". Style format: "${style}".` }
        ],
        temperature: 0.6,
        max_tokens: 80
      })
      if (aiResponse && aiResponse.trim()) {
        expandedConcept = aiResponse.trim().replace(/^["']|["']$/g, '')
      }
    } catch {
      expandedConcept = `Machine Learning concept visualization of ${userPrompt}`
    }
  }

  const finalPrompt = `${expandedConcept}, ${config.descriptor}, dark background, high resolution 8k`
  const encodedPrompt = encodeURIComponent(finalPrompt)

  // 2. Multi-Endpoint Provider Chain with 429 Retry Backoff & 85s Timeout
  const imageUrlsToTry = [
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=896&height=512&seed=${seed}&nologo=true&model=flux`,
    `https://image.pollinations.ai/prompt/${encodedPrompt}?width=896&height=512&seed=${seed}&nologo=true`,
    `https://image.pollinations.ai/prompt/${encodeURIComponent(userPrompt + ' ' + config.descriptor)}?width=800&height=500&seed=${seed}&nologo=true`
  ]

  let imageBlob = null
  let lastError = null

  for (const url of imageUrlsToTry) {
    if (imageBlob) break

    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 85000)

        const res = await fetch(url, { signal: controller.signal })
        clearTimeout(timeoutId)

        if (res.ok) {
          const contentType = res.headers.get('content-type') || ''
          if (contentType.includes('image') || res.status === 200) {
            const blob = await res.blob()
            if (blob.size > 1000) {
              imageBlob = blob
              break
            }
          }
        }

        if (res.status === 429 || res.status === 503) {
          await new Promise(r => setTimeout(r, 1500 * attempt))
          continue
        } else {
          break
        }
      } catch (err) {
        lastError = err
        if (attempt < 3 && err.name !== 'AbortError') {
          await new Promise(r => setTimeout(r, 1000))
        }
      }
    }
  }

  // 3. Fallback: Synthesize 4 Genuinely Distinct SVG Visual Layouts if provider rate-limits
  if (!imageBlob) {
    try {
      imageBlob = createSvgDiagramBlob(userPrompt, style, expandedConcept)
    } catch {
      throw new Error(lastError ? `Network error generating image: ${lastError.message}` : 'Failed to retrieve generated image. Please check your network connection and try again.')
    }
  }

  // 4. Create local Object URL for verified 100% instant rendering
  const objectUrl = URL.createObjectURL(imageBlob)

  return {
    url: objectUrl,
    prompt: userPrompt,
    expandedPrompt: finalPrompt,
    style,
    seed
  }
}

/**
 * Synthesizes FOUR genuinely distinct visual SVG compositions depending on selected style.
 */
function createSvgDiagramBlob(concept, style, expandedPrompt) {
  const title = concept.toUpperCase()
  let svgContent = ''

  if (style === 'illustration') {
    // STYLE 2: ILLUSTRATION — Futuristic AI Visual Metaphor with Central Core & Orbital Nodes
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <radialGradient id="illuBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1e1b4b"/>
      <stop offset="60%" stop-color="#0f0728"/>
      <stop offset="100%" stop-color="#050212"/>
    </radialGradient>
    <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f43f5e"/>
      <stop offset="50%" stop-color="#ec4899"/>
      <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="12" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="900" height="560" fill="url(#illuBg)"/>
  
  <!-- Orbital Rings -->
  <ellipse cx="450" cy="280" rx="280" ry="140" fill="none" stroke="#8b5cf6" stroke-width="1.5" stroke-dasharray="8 6" opacity="0.6"/>
  <ellipse cx="450" cy="280" rx="180" ry="220" fill="none" stroke="#ec4899" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.5"/>

  <!-- Curved Bezier Energy Paths -->
  <path d="M 180 180 Q 320 280 450 280 T 720 380" stroke="#a855f7" stroke-width="3" fill="none" opacity="0.8" filter="url(#glow)"/>
  <path d="M 180 380 Q 320 280 450 280 T 720 180" stroke="#38bdf8" stroke-width="3" fill="none" opacity="0.8" filter="url(#glow)"/>

  <!-- Central Glowing AI Core -->
  <circle cx="450" cy="280" r="110" fill="url(#coreGlow)" filter="url(#glow)"/>
  <circle cx="450" cy="280" r="65" fill="#0f172a" stroke="#f43f5e" stroke-width="3"/>
  <text x="450" y="275" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="20" font-weight="bold">${title}</text>
  <text x="450" y="298" text-anchor="middle" fill="#f43f5e" font-family="sans-serif" font-size="12" font-weight="bold">AI NEURAL CORE</text>

  <!-- Floating Orbital Badges -->
  <g transform="translate(140, 140)">
    <circle cx="40" cy="40" r="38" fill="#1e1b4b" stroke="#ec4899" stroke-width="2"/>
    <text x="40" y="44" text-anchor="middle" fill="#f3e8ff" font-family="sans-serif" font-size="11" font-weight="bold">TOKEN INGEST</text>
  </g>
  <g transform="translate(680, 140)">
    <circle cx="40" cy="40" r="38" fill="#1e1b4b" stroke="#38bdf8" stroke-width="2"/>
    <text x="40" y="44" text-anchor="middle" fill="#e0f2fe" font-family="sans-serif" font-size="11" font-weight="bold">ATTENTION</text>
  </g>
  <g transform="translate(140, 340)">
    <circle cx="40" cy="40" r="38" fill="#1e1b4b" stroke="#a855f7" stroke-width="2"/>
    <text x="40" y="44" text-anchor="middle" fill="#f3e8ff" font-family="sans-serif" font-size="11" font-weight="bold">EMBEDDING</text>
  </g>
  <g transform="translate(680, 340)">
    <circle cx="40" cy="40" r="38" fill="#1e1b4b" stroke="#f43f5e" stroke-width="2"/>
    <text x="40" y="44" text-anchor="middle" fill="#ffe4e6" font-family="sans-serif" font-size="11" font-weight="bold">GENERATION</text>
  </g>

  <!-- Title & Description -->
  <text x="450" y="52" text-anchor="middle" fill="#ec4899" font-family="sans-serif" font-size="22" font-weight="bold" filter="url(#glow)">${title} — CONCEPTUAL ILLUSTRATION</text>
  <text x="450" y="520" text-anchor="middle" fill="#a78bfa" font-family="sans-serif" font-size="12">${expandedPrompt.substring(0, 95)}...</text>
</svg>`
  } else if (style === '3d') {
    // STYLE 3: 3D RENDER — Isometric 3D Floor Grid with Floating 3D Cubes & Volumetric Light
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <linearGradient id="bg3d" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#031322"/>
      <stop offset="100%" stop-color="#020912"/>
    </linearGradient>
    <linearGradient id="topFace" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <linearGradient id="leftFace" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0284c7"/>
      <stop offset="100%" stop-color="#075985"/>
    </linearGradient>
    <linearGradient id="rightFace" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#0c4a6e"/>
    </linearGradient>
    <filter id="glow3d">
      <feGaussianBlur stdDeviation="10" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="900" height="560" fill="url(#bg3d)"/>

  <!-- Isometric Ground Grid -->
  <g transform="translate(450, 420) scale(1, 0.5) rotate(45)" opacity="0.25" stroke="#38bdf8" stroke-width="1.5" fill="none">
    <path d="M -300 -300 L 300 -300 L 300 300 L -300 300 Z M -200 -300 L -200 300 M -100 -300 L -100 300 M 0 -300 L 0 300 M 100 -300 L 100 300 M 200 -300 L 200 300 M -300 -200 L 300 -200 M -300 -100 L 300 -100 M -300 0 L 300 0 M -300 100 L 300 100 M -300 200 L 300 200"/>
  </g>

  <!-- Volumetric Beams -->
  <polygon points="450,80 200,420 700,420" fill="#38bdf8" opacity="0.06"/>
  <polygon points="450,80 320,420 580,420" fill="#0ea5e9" opacity="0.08"/>

  <!-- 3D Cube 1: Input (Left) -->
  <g transform="translate(180, 240)">
    <polygon points="0,-40 60,-70 120,-40 60,-10" fill="url(#topFace)"/>
    <polygon points="0,-40 60,-10 60,60 0,30" fill="url(#leftFace)"/>
    <polygon points="60,-10 120,-40 120,30 60,60" fill="url(#rightFace)"/>
    <text x="60" y="-85" text-anchor="middle" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-weight="bold">INPUT TENSORS</text>
  </g>

  <!-- 3D Cube 2: Center Core (Main) -->
  <g transform="translate(390, 180)">
    <polygon points="0,-50 75,-85 150,-50 75,-15" fill="url(#topFace)" filter="url(#glow3d)"/>
    <polygon points="0,-50 75,-15 75,75 0,40" fill="url(#leftFace)"/>
    <polygon points="75,-15 150,-50 150,40 75,75" fill="url(#rightFace)"/>
    <text x="75" y="15" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="16" font-weight="bold">${title}</text>
    <text x="75" y="-100" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="14" font-weight="bold" filter="url(#glow3d)">3D SPATIAL CORE</text>
  </g>

  <!-- 3D Cube 3: Output (Right) -->
  <g transform="translate(620, 240)">
    <polygon points="0,-40 60,-70 120,-40 60,-10" fill="url(#topFace)"/>
    <polygon points="0,-40 60,-10 60,60 0,30" fill="url(#leftFace)"/>
    <polygon points="60,-10 120,-40 120,30 60,60" fill="url(#rightFace)"/>
    <text x="60" y="-85" text-anchor="middle" fill="#7dd3fc" font-family="sans-serif" font-size="12" font-weight="bold">3D OUTPUT VECTOR</text>
  </g>

  <!-- Spatial Connector Rays -->
  <line x1="300" y1="210" x2="390" y2="165" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" filter="url(#glow3d)"/>
  <line x1="540" y1="165" x2="620" y2="210" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4 4" filter="url(#glow3d)"/>

  <!-- Title & Description -->
  <text x="450" y="48" text-anchor="middle" fill="#38bdf8" font-family="sans-serif" font-size="22" font-weight="bold" filter="url(#glow3d)">${title} — 3D SCIENTIFIC RENDER</text>
  <text x="450" y="520" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="12">${expandedPrompt.substring(0, 95)}...</text>
</svg>`
  } else if (style === 'sketch') {
    // STYLE 4: SKETCH — Blackboard Hand-Drawn Chalk Sketch with Wobbly Lines & Chalk Notes
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <filter id="chalkDust">
      <feTurbulence type="fractalNoise" baseFrequency="0.08" numOctaves="2" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.07 0"/>
      <feComposite in="SourceGraphic" in2="noise" operator="over"/>
    </filter>
  </defs>

  <!-- Blackboard Slate -->
  <rect width="900" height="560" fill="#18181b"/>
  <rect width="880" height="540" x="10" y="10" fill="none" stroke="#27272a" stroke-width="4" rx="8"/>
  <rect width="900" height="560" fill="#ffffff" filter="url(#chalkDust)"/>

  <!-- Header Chalk Text -->
  <text x="450" y="55" text-anchor="middle" fill="#fbbf24" font-family="monospace, sans-serif" font-size="22" font-weight="bold">
    [SKETCH] ${title} — WHITEBOARD EXPLANATION
  </text>
  <path d="M 220 68 Q 450 74 680 68" stroke="#fbbf24" stroke-width="2.5" fill="none" stroke-dasharray="300 4"/>

  <!-- Hand-Drawn Wobbly Node 1: Input -->
  <g transform="translate(100, 200)">
    <path d="M 10 10 Q 80 5 150 12 Q 155 60 148 110 Q 80 115 8 108 Q 3 55 10 10 Z" fill="none" stroke="#fef3c7" stroke-width="2.5"/>
    <text x="78" y="45" text-anchor="middle" fill="#fbbf24" font-family="monospace, sans-serif" font-size="13" font-weight="bold">input_data()</text>
    <text x="78" y="75" text-anchor="middle" fill="#fef3c7" font-family="monospace, sans-serif" font-size="11">tokens = [x1, x2]</text>
  </g>

  <!-- Arrow 1 -->
  <path d="M 260 255 Q 310 240 350 255" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
  <path d="M 340 245 L 355 255 L 342 265" stroke="#fbbf24" stroke-width="2.5" fill="none"/>

  <!-- Hand-Drawn Wobbly Node 2: Core Model -->
  <g transform="translate(360, 170)">
    <path d="M 12 12 Q 95 3 188 10 Q 193 75 185 145 Q 95 152 8 143 Q 2 75 12 12 Z" fill="none" stroke="#fbbf24" stroke-width="3"/>
    <text x="98" y="45" text-anchor="middle" fill="#ffffff" font-family="monospace, sans-serif" font-size="16" font-weight="bold">${title} MODEL</text>
    <text x="98" y="80" text-anchor="middle" fill="#fef3c7" font-family="monospace, sans-serif" font-size="12">* Attention Weights</text>
    <text x="98" y="105" text-anchor="middle" fill="#fef3c7" font-family="monospace, sans-serif" font-size="12">* FeedForward Pass</text>
  </g>

  <!-- Arrow 2 -->
  <path d="M 555 255 Q 600 270 640 255" stroke="#fbbf24" stroke-width="2.5" fill="none"/>
  <path d="M 628 245 L 643 255 L 630 265" stroke="#fbbf24" stroke-width="2.5" fill="none"/>

  <!-- Hand-Drawn Wobbly Node 3: Output -->
  <g transform="translate(650, 200)">
    <path d="M 10 10 Q 80 15 150 8 Q 155 60 148 110 Q 80 105 8 108 Q 13 55 10 10 Z" fill="none" stroke="#fef3c7" stroke-width="2.5"/>
    <text x="78" y="45" text-anchor="middle" fill="#fbbf24" font-family="monospace, sans-serif" font-size="13" font-weight="bold">output_pred</text>
    <text x="78" y="75" text-anchor="middle" fill="#fef3c7" font-family="monospace, sans-serif" font-size="11">softmax(logits)</text>
  </g>

  <!-- Chalk Annotations -->
  <text x="450" y="380" text-anchor="middle" fill="#fbbf24" font-family="monospace, sans-serif" font-size="13">// Note: Hand-drawn Socratic whiteboard derivation</text>
  <text x="450" y="515" text-anchor="middle" fill="#d4d4d8" font-family="monospace, sans-serif" font-size="11">${expandedPrompt.substring(0, 95)}...</text>
</svg>`
  } else {
    // STYLE 1: DIAGRAM — Structured Technical Flowchart Blueprint Architecture
    svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="560" viewBox="0 0 900 560">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="100%" stop-color="#020617"/>
    </linearGradient>
    <linearGradient id="nodeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>

  <rect width="900" height="560" fill="url(#bgGrad)"/>
  <rect width="900" height="560" fill="none" stroke="#38bdf8" stroke-width="1" opacity="0.2"/>

  <!-- Header -->
  <text x="450" y="50" text-anchor="middle" fill="#06b6d4" font-family="sans-serif" font-size="24" font-weight="bold" filter="url(#glow)">
    ${title} — TECHNICAL DIAGRAM ARCHITECTURE
  </text>
  <text x="450" y="78" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="13">
    Style: DIAGRAM | Structured Modular Information Flowchart
  </text>

  <!-- Connection Lines -->
  <path d="M 180 280 L 360 190 M 180 280 L 360 370 M 360 190 L 540 280 M 360 370 L 540 280 M 540 280 L 720 280" 
        stroke="#06b6d4" stroke-width="3" stroke-dasharray="6 4" opacity="0.8"/>

  <!-- Node 1: Input -->
  <g transform="translate(100, 220)">
    <rect width="160" height="120" rx="16" fill="url(#nodeGrad)" stroke="#38bdf8" stroke-width="2"/>
    <text x="80" y="45" text-anchor="middle" fill="#06b6d4" font-family="sans-serif" font-size="14" font-weight="bold">INPUT LAYER</text>
    <text x="80" y="75" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12">Raw Feature Data</text>
    <text x="80" y="95" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="11">Tokens / Embeddings</text>
  </g>

  <!-- Node 2: Processing Core 1 -->
  <g transform="translate(300, 130)">
    <rect width="180" height="120" rx="16" fill="url(#nodeGrad)" stroke="#06b6d4" stroke-width="2.5" filter="url(#glow)"/>
    <text x="90" y="45" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">TRANSFORMER CORE</text>
    <text x="90" y="75" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12">Multi-Head Attention</text>
    <text x="90" y="95" text-anchor="middle" fill="#06b6d4" font-family="sans-serif" font-size="11">Forward Pass</text>
  </g>

  <!-- Node 3: Processing Core 2 -->
  <g transform="translate(300, 310)">
    <rect width="180" height="120" rx="16" fill="url(#nodeGrad)" stroke="#38bdf8" stroke-width="2"/>
    <text x="90" y="45" text-anchor="middle" fill="#06b6d4" font-family="sans-serif" font-size="14" font-weight="bold">FEED-FORWARD</text>
    <text x="90" y="75" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12">Non-Linear Activation</text>
    <text x="90" y="95" text-anchor="middle" fill="#64748b" font-family="sans-serif" font-size="11">GELU / LayerNorm</text>
  </g>

  <!-- Node 4: Output Layer -->
  <g transform="translate(500, 220)">
    <rect width="160" height="120" rx="16" fill="url(#nodeGrad)" stroke="#06b6d4" stroke-width="2.5" filter="url(#glow)"/>
    <text x="80" y="45" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="14" font-weight="bold">OUTPUT LAYER</text>
    <text x="80" y="75" text-anchor="middle" fill="#e2e8f0" font-family="sans-serif" font-size="12">Softmax / Logits</text>
    <text x="80" y="95" text-anchor="middle" fill="#06b6d4" font-family="sans-serif" font-size="11">Prediction Vector</text>
  </g>

  <!-- Footer Banner -->
  <rect x="100" y="480" width="700" height="40" rx="10" fill="rgba(15, 23, 42, 0.8)" stroke="rgba(255,255,255,0.1)"/>
  <text x="450" y="505" text-anchor="middle" fill="#94a3b8" font-family="sans-serif" font-size="11">
    ${expandedPrompt.substring(0, 95)}...
  </text>
</svg>`
  }

  return new Blob([svgContent], { type: 'image/svg+xml' })
}
