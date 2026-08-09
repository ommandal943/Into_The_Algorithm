import React, { useRef, useEffect, useState } from 'react'

export function NeuralCore3D() {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId
    let isMounted = true

    // High-DPI canvas setup
    const size = 36
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr

    // 3D Engine State
    let time = 0
    let rotX = 0.2
    let rotY = 0.4
    let targetRotX = 0.2
    let targetRotY = 0.4

    // Mouse tracking for parallax tilt
    const handleMouseMove = (e) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const offX = (e.clientX - centerX) / (rect.width * 1.5)
      const offY = (e.clientY - centerY) / (rect.height * 1.5)

      targetRotY = 0.4 + offX * 0.8
      targetRotX = 0.2 - offY * 0.8
    }

    const handleMouseEnter = () => setIsHovered(true)
    const handleMouseLeave = () => {
      setIsHovered(false)
      targetRotX = 0.2
      targetRotY = 0.4
    }

    const parentElem = containerRef.current?.closest('.brand') || containerRef.current
    if (parentElem) {
      parentElem.addEventListener('mousemove', handleMouseMove)
      parentElem.addEventListener('mouseenter', handleMouseEnter)
      parentElem.addEventListener('mouseleave', handleMouseLeave)
    }

    // 3D Octahedron Vertices
    const coreRadius = 15
    const baseVertices = [
      { x: 0, y: -coreRadius, z: 0 },
      { x: coreRadius, y: 0, z: 0 },
      { x: 0, y: 0, z: coreRadius },
      { x: -coreRadius, y: 0, z: 0 },
      { x: 0, y: 0, z: -coreRadius },
      { x: 0, y: coreRadius, z: 0 }
    ]

    const edges = [
      [0, 1], [0, 2], [0, 3], [0, 4],
      [5, 1], [5, 2], [5, 3], [5, 4],
      [1, 2], [2, 3], [3, 4], [4, 1]
    ]

    // 8 Satellite Neural Nodes
    const satelliteNodes = Array.from({ length: 8 }, (_, i) => ({
      orbitRadius: 22 + (i % 3) * 3,
      baseAngle: (i * Math.PI) / 4,
      speed: 0.8 + (i % 2) * 0.4,
      yOffset: ((i % 4) - 1.5) * 6,
      color: i % 2 === 0 ? '#38bdf8' : i % 3 === 0 ? '#ec4899' : '#a78bfa'
    }))

    // 12 Drifting Micro Data Particles
    const particles = Array.from({ length: 12 }, () => ({
      x: (Math.random() - 0.5) * 45,
      y: (Math.random() - 0.5) * 45,
      z: (Math.random() - 0.5) * 45,
      speedY: -0.15 - Math.random() * 0.25,
      size: 0.8 + Math.random() * 1.2,
      alpha: 0.3 + Math.random() * 0.6
    }))

    // 3D Transformation Math
    const rotatePoint = (p, rx, ry, rz = 0) => {
      // Y rotation
      let cosY = Math.cos(ry), sinY = Math.sin(ry)
      let x1 = p.x * cosY + p.z * sinY
      let z1 = -p.x * sinY + p.z * cosY

      // X rotation
      let cosX = Math.cos(rx), sinX = Math.sin(rx)
      let y2 = p.y * cosX - z1 * sinX
      let z2 = p.y * sinX + z1 * cosX

      // Z rotation
      let cosZ = Math.cos(rz), sinZ = Math.sin(rz)
      let x3 = x1 * cosZ - y2 * sinZ
      let y3 = x1 * sinZ + y2 * cosZ

      return { x: x3, y: y3, z: z2 }
    }

    const project = (p) => {
      const fov = 130
      const distance = 160
      const scale = fov / (distance + p.z)
      return {
        x: size / 2 + p.x * scale,
        y: size / 2 + p.y * scale,
        scale,
        z: p.z
      }
    }

    // Main Render Loop
    const render = () => {
      if (!isMounted) return
      time += isHovered ? 0.035 : 0.018

      // Smooth parallax spring interpolation
      rotX += (targetRotX - rotX) * 0.08
      rotY += (targetRotY + time * 0.4 - rotY) * 0.08

      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()
      ctx.scale(dpr, dpr)

      const depthQueue = []

      // 1. Transform Core Vertices
      const transformedVertices = baseVertices.map(v => {
        const p = rotatePoint(v, rotX, rotY)
        return { p3d: p, proj: project(p) }
      })

      // Core Edges to Depth Queue
      edges.forEach(([i, j]) => {
        const v1 = transformedVertices[i]
        const v2 = transformedVertices[j]
        const avgZ = (v1.p3d.z + v2.p3d.z) / 2
        depthQueue.push({
          z: avgZ,
          type: 'edge',
          p1: v1.proj,
          p2: v2.proj,
          color: isHovered ? '#38bdf8' : '#06b6d4'
        })
      })

      // Core Nucleus Glow
      const coreProj = project(rotatePoint({ x: 0, y: 0, z: 0 }, rotX, rotY))
      depthQueue.push({
        z: coreProj.z,
        type: 'coreNucleus',
        proj: coreProj
      })

      // 2. Dual Counter-Rotating Orbital Data Rings
      const ring1Points = []
      const ring2Points = []
      const ringSegments = 20

      for (let k = 0; k < ringSegments; k++) {
        const a1 = (k / ringSegments) * Math.PI * 2 + time * 0.8
        const r1Raw = { x: Math.cos(a1) * 22, y: Math.sin(a1) * 6, z: Math.sin(a1) * 14 }
        const r1Rot = rotatePoint(r1Raw, rotX + 0.3, rotY, 0.2)
        ring1Points.push(project(r1Rot))

        const a2 = (k / ringSegments) * Math.PI * 2 - time * 0.6
        const r2Raw = { x: Math.cos(a2) * 20, y: Math.sin(a2) * 16, z: Math.sin(a2) * 8 }
        const r2Rot = rotatePoint(r2Raw, rotX - 0.4, rotY + 0.5, -0.3)
        ring2Points.push(project(r2Rot))
      }

      depthQueue.push({ z: 0, type: 'ring', points: ring1Points, color: 'rgba(56, 189, 248, 0.4)' })
      depthQueue.push({ z: -5, type: 'ring', points: ring2Points, color: 'rgba(168, 85, 247, 0.35)' })

      // 3. Satellite Neural Nodes & Connections
      satelliteNodes.forEach((node, idx) => {
        const currentAngle = node.baseAngle + time * node.speed
        const nodeRaw = {
          x: Math.cos(currentAngle) * node.orbitRadius,
          y: node.yOffset + Math.sin(time * 2 + idx) * 3,
          z: Math.sin(currentAngle) * node.orbitRadius
        }
        const nodeRot = rotatePoint(nodeRaw, rotX, rotY)
        const nodeProj = project(nodeRot)

        // Satellite Node
        depthQueue.push({
          z: nodeRot.z,
          type: 'node',
          proj: nodeProj,
          color: node.color,
          radius: (isHovered ? 2.5 : 1.8) * nodeProj.scale
        })

        // Connection to Core Center
        depthQueue.push({
          z: nodeRot.z - 2,
          type: 'connection',
          p1: nodeProj,
          p2: coreProj,
          color: node.color,
          pulse: (time * 2 + idx * 0.4) % 1
        })
      })

      // 4. Micro Data Particles
      particles.forEach(pt => {
        pt.y += pt.speedY
        if (pt.y < -30) pt.y = 30

        const ptRot = rotatePoint(pt, rotX, rotY)
        const ptProj = project(ptRot)

        depthQueue.push({
          z: ptRot.z,
          type: 'particle',
          proj: ptProj,
          size: pt.size * ptProj.scale,
          alpha: pt.alpha
        })
      })

      // Sort Z-Depth Queue for Proper 3D Occlusion
      depthQueue.sort((a, b) => a.z - b.z)

      // Draw Depth Sorted Elements
      depthQueue.forEach(item => {
        if (item.type === 'ring') {
          ctx.beginPath()
          item.points.forEach((p, i) => {
            if (i === 0) ctx.moveTo(p.x, p.y)
            else ctx.lineTo(p.x, p.y)
          })
          ctx.closePath()
          ctx.strokeStyle = item.color
          ctx.lineWidth = 1
          ctx.stroke()
        } else if (item.type === 'edge') {
          ctx.beginPath()
          ctx.moveTo(item.p1.x, item.p1.y)
          ctx.lineTo(item.p2.x, item.p2.y)
          ctx.strokeStyle = item.color
          ctx.lineWidth = 1.2 * item.p1.scale
          ctx.shadowColor = item.color
          ctx.shadowBlur = isHovered ? 8 : 4
          ctx.stroke()
          ctx.shadowBlur = 0
        } else if (item.type === 'coreNucleus') {
          const glowRad = (isHovered ? 9 : 7) * item.proj.scale
          const grad = ctx.createRadialGradient(
            item.proj.x, item.proj.y, 0,
            item.proj.x, item.proj.y, glowRad
          )
          grad.addColorStop(0, '#ffffff')
          grad.addColorStop(0.4, isHovered ? '#ec4899' : '#a855f7')
          grad.addColorStop(1, 'rgba(6, 182, 212, 0)')

          ctx.beginPath()
          ctx.arc(item.proj.x, item.proj.y, glowRad, 0, Math.PI * 2)
          ctx.fillStyle = grad
          ctx.fill()
        } else if (item.type === 'node') {
          ctx.beginPath()
          ctx.arc(item.proj.x, item.proj.y, item.radius, 0, Math.PI * 2)
          ctx.fillStyle = item.color
          ctx.shadowColor = item.color
          ctx.shadowBlur = isHovered ? 10 : 5
          ctx.fill()
          ctx.shadowBlur = 0
        } else if (item.type === 'connection') {
          ctx.beginPath()
          ctx.moveTo(item.p1.x, item.p1.y)
          ctx.lineTo(item.p2.x, item.p2.y)
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.15)'
          ctx.lineWidth = 0.8
          ctx.stroke()

          // Traveling Data Pulse Point
          const pulseX = item.p1.x + (item.p2.x - item.p1.x) * item.pulse
          const pulseY = item.p1.y + (item.p2.y - item.p1.y) * item.pulse
          ctx.beginPath()
          ctx.arc(pulseX, pulseY, 1.2 * item.p1.scale, 0, Math.PI * 2)
          ctx.fillStyle = '#ffffff'
          ctx.fill()
        } else if (item.type === 'particle') {
          ctx.beginPath()
          ctx.arc(item.proj.x, item.proj.y, item.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(167, 139, 250, ${item.alpha})`
          ctx.fill()
        }
      })

      ctx.restore()

      if (isMounted) {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    // Handle Page Visibility for CPU Performance
    const handleVisibilityChange = () => {
      if (document.hidden) {
        if (animationFrameId) cancelAnimationFrame(animationFrameId)
      } else {
        animationFrameId = requestAnimationFrame(render)
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    render()

    return () => {
      isMounted = false
      if (animationFrameId) cancelAnimationFrame(animationFrameId)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (parentElem) {
        parentElem.removeEventListener('mousemove', handleMouseMove)
        parentElem.removeEventListener('mouseenter', handleMouseEnter)
        parentElem.removeEventListener('mouseleave', handleMouseLeave)
      }
    }
  }, [isHovered])

  return (
    <div
      ref={containerRef}
      className="neural-core-3d-wrap"
      style={{
        width: '36px',
        height: '36px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        cursor: 'pointer',
        flexShrink: 0
      }}
      title="Into the Algorithm — 3D AI Neural Core"
    >
      <canvas
        ref={canvasRef}
        style={{
          width: '36px',
          height: '36px',
          display: 'block',
          pointerEvents: 'none'
        }}
      />
    </div>
  )
}
