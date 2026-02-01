"use client"

/**
 * StickyPlayer - Global floating audio player with visualizations
 * 
 * Features:
 * - Multiple visualizer modes: frequency bars, waveform, lightning bolts, flames, water
 * - Expandable UI with full controls
 * - Appears after scrolling past hero section
 * - Responsive design with touch-friendly controls
 */

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useGlobalPlayer } from './GlobalPlayerContext'
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward, ChevronUp, ChevronDown, X, Gauge, Waves, Activity, Zap, Shuffle, Repeat, Flame, Droplets } from 'lucide-react'

type VisualizerMode = 'frequency' | 'waveform' | 'synthopiaStyle' | 'flame' | 'water'

export function StickyPlayer() {
  const { state, analyserRef, togglePlay, seek, setVolume, toggleMute, setPlaybackRate, stop, nextTrack, prevTrack, setShuffle, setAutoplay } = useGlobalPlayer()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [visualizerMode, setVisualizerMode] = useState<VisualizerMode>('synthopiaStyle')
  const [showVolumeSlider, setShowVolumeSlider] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile for immediate visibility during playback
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Show player: on mobile immediately when playing, on desktop after scroll
  useEffect(() => {
    // On mobile: show immediately when track is playing (no scroll required)
    if (isMobile && state.isPlaying) {
      setIsVisible(true)
      return
    }

    const handleScroll = () => {
      // Check both window scroll and snap-container scroll
      const snapContainer = document.querySelector('.snap-container')
      const scrollY = snapContainer ? snapContainer.scrollTop : window.scrollY
      const threshold = window.innerHeight * 0.5 // Show after scrolling 50% of viewport
      setIsVisible(scrollY > threshold)
    }
    
    handleScroll() // Check initial position
    
    // Listen to both window and snap-container scroll events
    const snapContainer = document.querySelector('.snap-container')
    window.addEventListener('scroll', handleScroll, { passive: true })
    snapContainer?.addEventListener('scroll', handleScroll, { passive: true })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      snapContainer?.removeEventListener('scroll', handleScroll)
    }
  }, [isMobile, state.isPlaying])

  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]

  const handleClose = () => {
    stop()
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    ctx.clearRect(0, 0, rect.width, rect.height)

    let dataArray: Uint8Array<ArrayBuffer>
    if (analyser && state.isPlaying) {
      dataArray = new Uint8Array(analyser.frequencyBinCount) as Uint8Array<ArrayBuffer>
      analyser.getByteFrequencyData(dataArray)
    } else {
      dataArray = new Uint8Array(64).fill(0) as Uint8Array<ArrayBuffer>
    }

    // RGB color function (white -> blue -> red based on intensity)
    const getRGBColor = (intensity: number) => {
      let r: number, g: number, b: number
      if (intensity < 0.5) {
        const t = intensity * 2
        r = Math.floor(255 - t * 155)
        g = Math.floor(255 - t * 155)
        b = 255
      } else {
        const t = (intensity - 0.5) * 2
        r = Math.floor(100 + t * 155)
        g = Math.floor(100 - t * 100)
        b = Math.floor(255 - t * 155)
      }
      return { r, g, b }
    }

    if (visualizerMode === 'frequency') {
      const barCount = 32
      const barWidth = rect.width / barCount - 1
      for (let i = 0; i < barCount; i++) {
        // EQ mapping: left = low freq (50Hz), right = high freq (16kHz)
        const binIndex = Math.floor((i / barCount) * (dataArray.length * 0.7))
        const value = dataArray[binIndex] ?? 0
        const intensity = value / 255
        const barHeight = intensity * rect.height * 0.9
        const x = i * (barWidth + 1)
        const y = rect.height - barHeight
        
        const { r, g, b } = getRGBColor(intensity)
        
        // Glow
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`
        ctx.beginPath()
        ctx.roundRect(x - 2, y - 2, barWidth + 4, barHeight + 4, [4, 4, 0, 0])
        ctx.fill()
        
        // Main bar
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.8)`
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0])
        ctx.fill()
      }
    } else if (visualizerMode === 'waveform') {
      const sliceWidth = rect.width / dataArray.length
      
      // Draw waveform with RGB colors
      for (let i = 0; i < dataArray.length - 1; i++) {
        const v1 = (dataArray[i] ?? 128) / 255
        const v2 = (dataArray[i + 1] ?? 128) / 255
        const intensity = Math.abs(v1 - 0.5) * 2
        const { r, g, b } = getRGBColor(intensity)
        
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.8)`
        ctx.lineWidth = 2 + intensity * 2
        ctx.lineCap = 'round'
        ctx.moveTo(i * sliceWidth, v1 * rect.height)
        ctx.lineTo((i + 1) * sliceWidth, v2 * rect.height)
        ctx.stroke()
      }
      
      // Mirror waveform
      for (let i = 0; i < dataArray.length - 1; i++) {
        const v1 = (dataArray[i] ?? 128) / 255
        const v2 = (dataArray[i + 1] ?? 128) / 255
        const intensity = Math.abs(v1 - 0.5) * 2
        const { r, g, b } = getRGBColor(intensity)
        
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`
        ctx.lineWidth = 1 + intensity
        ctx.moveTo(i * sliceWidth, rect.height - v1 * rect.height)
        ctx.lineTo((i + 1) * sliceWidth, rect.height - v2 * rect.height)
        ctx.stroke()
      }
    } else if (visualizerMode === 'synthopiaStyle') {
      // SynthopiaScale Style visualization - doubled bolts, EQ style 50Hz-16kHz
      const boltCount = 144 // Doubled from 72
      const time = Date.now() * 0.001
      
      for (let bolt = 0; bolt < boltCount; bolt++) {
        // EQ mapping: left = low freq (50Hz), right = high freq (16kHz)
        const binIndex = Math.floor((bolt / boltCount) * (dataArray.length * 0.7))
        const intensity = (dataArray[binIndex] ?? 0) / 255
        
        if (intensity < 0.15) continue
        
        // Start position distributed across the bar
        const startX = (bolt / boltCount) * rect.width + (rect.width / boltCount / 2)
        const startY = rect.height
        const endY = rect.height * (1 - intensity * 0.9)
        
        // Generate lightning path with chaotic movement
        const segments = 8 + Math.floor(intensity * 6)
        const points: {x: number, y: number}[] = []
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments
          const baseX = startX
          const baseY = startY + (endY - startY) * t
          
          // Add chaotic horizontal displacement
          const chaos = Math.sin(t * 12 + time * 3 + bolt * 2.5) * 8 * intensity
          const chaos2 = Math.sin(t * 7 + time * 5 + bolt * 1.7) * 5 * intensity
          const randomKink = (Math.random() - 0.5) * 6 * intensity
          
          points.push({
            x: baseX + chaos + chaos2 + randomKink,
            y: baseY
          })
        }
        
        const { r, g, b } = getRGBColor(intensity)
        
        // Draw glow
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.3 * intensity})`
        ctx.lineWidth = 4 + intensity * 3
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
        
        // Draw main bolt
        ctx.beginPath()
        ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.7 + intensity * 0.3})`
        ctx.lineWidth = 1 + intensity
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
        
        // Draw bright core
        ctx.beginPath()
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + intensity * 0.4})`
        ctx.lineWidth = 0.5
        ctx.moveTo(points[0].x, points[0].y)
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y)
        }
        ctx.stroke()
      }
    } else if (visualizerMode === 'flame') {
      // Dense flame visualization - EQ style 50Hz-16kHz left to right
      const flameGroups = 150 // More dense
      const flameBaseY = rect.height
      
      for (let depth = 3; depth >= 0; depth--) {
        const depthAlpha = 0.4 - depth * 0.08
        
        for (let f = 0; f < flameGroups; f++) {
          const binIndex = Math.floor((f / flameGroups) * (dataArray.length * 0.4))
          const intensity = (dataArray[binIndex] ?? 0) / 255
          if (intensity < 0.05) continue
          
          const padding = rect.width / 80
          const usableWidth = rect.width - (padding * 2)
          const baseX = padding + (f / flameGroups) * usableWidth + (usableWidth / flameGroups / 2)
          const maxFlameHeight = rect.height * 0.5 + intensity * rect.height * 0.4
          
          const tongueSeed = f * 100 + depth * 7
          const tongueX = baseX
          
          const tongueHeight = maxFlameHeight * (0.5 + Math.sin(tongueSeed) * 0.25 + intensity * 0.2)
          const tongueWidth = (10 + intensity * 5 - depth * 2)
          
          // Draw organic flame shape using bezier curves
          ctx.beginPath()
          ctx.moveTo(tongueX - tongueWidth * 0.5, flameBaseY)
          
          // Left side - wide at base, curving inward
          ctx.bezierCurveTo(
            tongueX - tongueWidth * 0.7, flameBaseY - tongueHeight * 0.2,
            tongueX - tongueWidth * 0.5, flameBaseY - tongueHeight * 0.4,
            tongueX - tongueWidth * 0.3, flameBaseY - tongueHeight * 0.55
          )
          ctx.bezierCurveTo(
            tongueX - tongueWidth * 0.15, flameBaseY - tongueHeight * 0.7,
            tongueX - tongueWidth * 0.05, flameBaseY - tongueHeight * 0.85,
            tongueX, flameBaseY - tongueHeight
          )
          
          // Right side - mirror
          ctx.bezierCurveTo(
            tongueX + tongueWidth * 0.05, flameBaseY - tongueHeight * 0.85,
            tongueX + tongueWidth * 0.15, flameBaseY - tongueHeight * 0.7,
            tongueX + tongueWidth * 0.3, flameBaseY - tongueHeight * 0.55
          )
          ctx.bezierCurveTo(
            tongueX + tongueWidth * 0.5, flameBaseY - tongueHeight * 0.4,
            tongueX + tongueWidth * 0.7, flameBaseY - tongueHeight * 0.2,
            tongueX + tongueWidth * 0.5, flameBaseY
          )
          
          ctx.closePath()
          
          const colorIntensity = intensity * (1 - depth * 0.15)
          const { r, g, b } = getRGBColor(colorIntensity)
          
          const gradient = ctx.createLinearGradient(tongueX, flameBaseY, tongueX, flameBaseY - tongueHeight)
          gradient.addColorStop(0, `rgba(${r}, ${g * 0.5}, ${b * 0.2}, ${depthAlpha})`)
          gradient.addColorStop(0.3, `rgba(${r}, ${g * 0.7}, ${b * 0.4}, ${depthAlpha * 0.9})`)
          gradient.addColorStop(0.6, `rgba(${r}, ${g}, ${b}, ${depthAlpha * 0.6})`)
          gradient.addColorStop(1, `rgba(${r * 0.8}, ${g}, ${b}, 0)`)
          
          ctx.fillStyle = gradient
          ctx.fill()
        }
      }
    } else if (visualizerMode === 'water') {
      // Water/liquid simulation visualization
      const waveCount = 5
      const time = Date.now() * 0.001
      
      // Draw multiple wave layers from back to front
      for (let wave = waveCount - 1; wave >= 0; wave--) {
        const waveOffset = wave * 0.15
        const waveDepth = 1 - wave * 0.12
        
        ctx.beginPath()
        ctx.moveTo(0, rect.height)
        
        // Create wave path
        const points: {x: number, y: number}[] = []
        const resolution = 80
        
        for (let i = 0; i <= resolution; i++) {
          const x = (i / resolution) * rect.width
          const binIndex = Math.floor((i / resolution) * (dataArray.length * 0.5))
          const intensity = (dataArray[binIndex] ?? 0) / 255
          
          // Multiple sine waves for organic water movement
          const wave1 = Math.sin(time * 2 + i * 0.08 + wave * 0.5) * 15 * intensity
          const wave2 = Math.sin(time * 3.5 + i * 0.12 + wave * 0.8) * 10 * intensity
          const wave3 = Math.sin(time * 1.5 + i * 0.05 + wave * 0.3) * 20 * intensity
          const ripple = Math.sin(time * 5 + i * 0.2) * 5 * intensity
          
          const baseHeight = rect.height * (0.4 + waveOffset) // 10% lower (0.3 -> 0.4)
          const waveHeight = (wave1 + wave2 + wave3 + ripple) * waveDepth
          const audioReact = intensity * rect.height * 0.3 * waveDepth // Reduced from 0.4
          
          const y = baseHeight - waveHeight - audioReact
          points.push({ x, y })
        }
        
        // Draw smooth curve through points
        ctx.moveTo(0, rect.height)
        ctx.lineTo(points[0].x, points[0].y)
        
        for (let i = 0; i < points.length - 1; i++) {
          const xc = (points[i].x + points[i + 1].x) / 2
          const yc = (points[i].y + points[i + 1].y) / 2
          ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
        }
        
        ctx.lineTo(rect.width, points[points.length - 1].y)
        ctx.lineTo(rect.width, rect.height)
        ctx.closePath()
        
        // Calculate average intensity for this wave's color
        const avgIntensity = points.reduce((sum, p) => sum + (rect.height - p.y) / rect.height, 0) / points.length
        const { r, g, b } = getRGBColor(avgIntensity * waveDepth)
        
        // Create gradient for water depth effect
        const gradient = ctx.createLinearGradient(0, rect.height * 0.2, 0, rect.height)
        gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${0.4 - wave * 0.06})`)
        gradient.addColorStop(0.5, `rgba(${r * 0.8}, ${g * 0.9}, ${b}, ${0.5 - wave * 0.08})`)
        gradient.addColorStop(1, `rgba(${r * 0.6}, ${g * 0.7}, ${b}, ${0.3 - wave * 0.05})`)
        
        ctx.fillStyle = gradient
        ctx.fill()
        
        // Add surface highlight/foam on top wave
        if (wave === 0) {
          ctx.beginPath()
          for (let i = 0; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2
            const yc = (points[i].y + points[i + 1].y) / 2
            if (i === 0) ctx.moveTo(points[i].x, points[i].y)
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc)
          }
          ctx.strokeStyle = `rgba(255, 255, 255, 0.3)`
          ctx.lineWidth = 2
          ctx.stroke()
        }
      }
      
    }

    animationRef.current = requestAnimationFrame(drawVisualizer)
  }, [state.isPlaying, analyserRef, visualizerMode])

  useEffect(() => {
    if (state.currentTrack && isVisible) {
      // Start animation loop immediately when player becomes visible
      drawVisualizer()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state.currentTrack, state.isPlaying, isVisible, drawVisualizer])

  const cycleVisualizerMode = () => {
    // On mobile: exclude 'flame' mode for performance
    const modes: VisualizerMode[] = isMobile 
      ? ['frequency', 'waveform', 'synthopiaStyle', 'water']
      : ['frequency', 'waveform', 'synthopiaStyle', 'flame', 'water']
    const currentIndex = modes.indexOf(visualizerMode)
    // If current mode not in list (e.g. flame on mobile), go to first
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % modes.length
    setVisualizerMode(modes[nextIndex])
  }

  if (!state.currentTrack || !isVisible) return null

  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 transition-all duration-500 ${
        isExpanded ? 'h-48' : 'h-20'
      }`}
      style={{
        background: 'linear-gradient(to top, rgba(12, 13, 15, 0.98) 0%, rgba(15, 17, 20, 0.95) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(212, 175, 55, 0.15)',
        boxShadow: '0 -10px 60px rgba(0, 0, 0, 0.6), 0 -2px 20px rgba(212, 175, 55, 0.05)',
      }}
    >
      {/* Visualizer Canvas */}
      <canvas
        ref={canvasRef}
        onClick={cycleVisualizerMode}
        className={`absolute inset-0 w-full cursor-pointer transition-opacity duration-300 ${
          isExpanded ? 'opacity-100' : 'opacity-40'
        }`}
        style={{ 
          height: isExpanded ? '100%' : '100%',
          pointerEvents: isExpanded ? 'auto' : 'none'
        }}
      />

      {/* Progress Bar - Click & Touch enabled */}
      <div 
        className="absolute top-0 left-0 right-0 h-4 bg-transparent cursor-pointer group z-20"
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
          seek(percent * state.duration)
        }}
        onTouchStart={(e) => {
          const touch = e.touches[0]
          const rect = e.currentTarget.getBoundingClientRect()
          const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
          seek(percent * state.duration)
        }}
        onTouchMove={(e) => {
          const touch = e.touches[0]
          const rect = e.currentTarget.getBoundingClientRect()
          const percent = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width))
          seek(percent * state.duration)
        }}
      >
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10">
          <div 
            className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div 
          className="absolute bottom-0 w-4 h-4 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
          style={{ left: `${progress}%`, transform: 'translate(-50%, 50%)' }}
        />
      </div>

      {/* Controls */}
      <div className="relative z-10 h-full flex items-center px-4 md:px-8">
        {/* Track Info with Visualizer Mode Button */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <button
            onClick={cycleVisualizerMode}
            className="w-12 h-12 rounded-lg flex-shrink-0 flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
            }}
            title={`Visualizer: ${visualizerMode}`}
          >
            {visualizerMode === 'frequency' && <Activity className="w-5 h-5 text-primary" />}
            {visualizerMode === 'waveform' && <Waves className="w-5 h-5 text-primary" />}
            {visualizerMode === 'synthopiaStyle' && <Zap className="w-5 h-5 text-primary" />}
            {visualizerMode === 'flame' && <Flame className="w-5 h-5 text-primary" />}
            {visualizerMode === 'water' && <Droplets className="w-5 h-5 text-primary" />}
          </button>
          <div className="min-w-0">
            <p className="text-sm font-medium text-foreground truncate">{state.currentTrack.title}</p>
            {state.currentTrack.artist && (
              <p className="text-xs text-muted-foreground truncate">{state.currentTrack.artist}</p>
            )}
          </div>
        </div>

        {/* Center Controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {/* Shuffle */}
          <button
            onClick={() => setShuffle(!state.shuffle)}
            className={`p-2 transition-colors hidden sm:block ${state.shuffle ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Shuffle"
          >
            <Shuffle className="w-4 h-4" />
          </button>

          {/* Previous Track */}
          <button
            onClick={prevTrack}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Previous track"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(212, 175, 55, 0.7) 100%)',
              boxShadow: '0 4px 20px rgba(212, 175, 55, 0.3)',
            }}
          >
            {state.isPlaying ? (
              <Pause className="w-5 h-5 text-black" />
            ) : (
              <Play className="w-5 h-5 text-black ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            title="Next track"
          >
            <SkipForward className="w-4 h-4" />
          </button>

          {/* Autoplay */}
          <button
            onClick={() => setAutoplay(!state.autoplay)}
            className={`p-2 transition-colors hidden sm:block ${state.autoplay ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            title="Autoplay"
          >
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <span className="text-xs text-muted-foreground hidden md:block">
            {formatTime(state.currentTime)} / {formatTime(state.duration)}
          </span>

          {/* Volume */}
          <div 
            className="relative hidden sm:block"
            onMouseEnter={() => setShowVolumeSlider(true)}
            onMouseLeave={() => setShowVolumeSlider(false)}
          >
            <button
              onClick={toggleMute}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {state.isMuted || state.volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            
            {showVolumeSlider && (
              <div 
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-3 rounded-lg"
                style={{
                  background: 'rgba(15, 17, 20, 0.95)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                }}
              >
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={state.isMuted ? 0 : state.volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 appearance-none bg-white/20 rounded-full cursor-pointer"
                  style={{
                    writingMode: 'horizontal-tb',
                  }}
                />
              </div>
            )}
          </div>

          {/* Speed Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSpeedMenu(!showSpeedMenu)}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              title="Playback Speed"
            >
              <Gauge className="w-4 h-4" />
              <span className="text-xs">{state.playbackRate}x</span>
            </button>
            
            {showSpeedMenu && (
              <div 
                className="absolute bottom-full right-0 mb-2 p-2 rounded-lg flex gap-1"
                style={{
                  background: 'rgba(15, 17, 20, 0.98)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                }}
              >
                {speeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => { setPlaybackRate(speed); setShowSpeedMenu(false) }}
                    className={`px-2 py-1 rounded text-xs ${
                      state.playbackRate === speed
                        ? 'bg-primary/20 text-primary'
                        : 'bg-white/5 text-muted-foreground'
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Expand Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            )}
          </button>

          {/* Close Button */}
          <button
            onClick={handleClose}
            className="p-2 text-muted-foreground hover:text-red-400 transition-colors"
            title="Close Player"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
