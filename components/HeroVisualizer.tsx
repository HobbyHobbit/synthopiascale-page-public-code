"use client"

/**
 * HeroVisualizer - Canvas-based audio visualization for Hero section
 * 
 * Renders EQ-style frequency bars (50Hz-16kHz) above the timeline.
 * Uses Web Audio API AnalyserNode for real-time frequency data.
 * Responsive bar count and height based on container width.
 */

import { useEffect, useRef, useCallback } from 'react'

interface HeroVisualizerProps {
  analyser: AnalyserNode | null
  isPlaying: boolean
  containerRef: React.RefObject<HTMLDivElement | null>
}

/** Maps audio intensity (0-1) to RGB color gradient: white → blue → red */
function getRGBColor(intensity: number): { r: number; g: number; b: number } {
  let r: number, g: number, b: number
  if (intensity < 0.5) {
    const t = intensity * 2
    r = Math.floor(255 - t * 155)
    g = Math.floor(255 - t * 155)
    b = 255
  } else {
    const t = (intensity - 0.5) * 2
    r = Math.floor(100 + t * 155)
    g = Math.floor(100 - t * 50)
    b = Math.floor(255 - t * 55)
  }
  return { r, g, b }
}

export function HeroVisualizer({ analyser, isPlaying, containerRef }: HeroVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, rect.width, rect.height)
    
    // Clip to rounded rectangle (responsive border-radius)
    const borderRadius = Math.min(24, rect.width * 0.04) // Responsive: max 24px or 4% of width
    ctx.beginPath()
    ctx.roundRect(0, 0, rect.width, rect.height, borderRadius)
    ctx.clip()

    let dataArray: Uint8Array<ArrayBuffer>
    if (analyser && isPlaying) {
      dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
      analyser.getByteFrequencyData(dataArray)
    } else {
      dataArray = new Uint8Array(128).fill(0) as Uint8Array<ArrayBuffer>
    }

    // === BAR VISUALIZER ON TRACK TIMELINE - EQ Style 50Hz-16kHz ===
    // Find the progress bar / timeline element (the flex-1 h-1.5 element)
    const progressBarContainer = container.querySelector('.flex-1.h-1\\.5') 
      || container.querySelector('[class*="flex-1"][class*="h-1"]')
      || container.querySelector('.bg-white\\/10.rounded-full')
    
    if (progressBarContainer) {
      const timelineRect = progressBarContainer.getBoundingClientRect()
      const startX = timelineRect.left - rect.left
      const timelineWidth = timelineRect.width
      const barBottom = timelineRect.top - rect.top - 2 // 2px above timeline
      // Responsive bar height based on container width
      const maxBarHeight = Math.min(35, rect.width * 0.08) // Max 35px or 8% of width
      
      // Responsive bar count based on container width
      const barCount = rect.width < 400 ? 32 : rect.width < 600 ? 48 : 64
      const barWidth = timelineWidth / barCount * 0.7
      const barGap = timelineWidth / barCount
      
      for (let i = 0; i < barCount; i++) {
        // EQ mapping: left = low freq (50Hz), right = high freq (16kHz)
        const binIndex = Math.floor((i / barCount) * (dataArray.length * 0.7))
        const intensity = (dataArray[binIndex] ?? 0) / 255
        
        if (intensity < 0.05) continue
        
        const x = startX + i * barGap
        const height = intensity * maxBarHeight
        const y = barBottom - height
        
        const { r, g, b } = getRGBColor(intensity)
        
        const gradient = ctx.createLinearGradient(x, barBottom, x, y)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`)
        gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.9)`)
        gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.5)`)
        
        ctx.fillStyle = gradient
        ctx.fillRect(x, y, barWidth, height)
      }
    }

    animationRef.current = requestAnimationFrame(drawVisualizer)
  }, [analyser, isPlaying, containerRef])

  useEffect(() => {
    if (isPlaying) {
      drawVisualizer()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, drawVisualizer])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 50, mixBlendMode: 'screen' }}
    />
  )
}
