"use client"

/**
 * Hero Section Component
 * 
 * Main landing section featuring:
 * - 3D animated logo with audio-reactive visualizations
 * - Glass morphism card with dynamic light reflections
 * - Integrated audio player with playlist support
 * - Responsive design with mobile scroll-based effects
 */

import { useEffect, useRef, useState, useCallback, useMemo } from "react"
import dynamic from "next/dynamic"
import { ChevronDown, Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Gauge } from "lucide-react"
import { RippleButton } from "@/components/ripple-button"
import { useGlobalPlayer } from "@/components/GlobalPlayerContext"
import { HeroVisualizer } from "@/components/HeroVisualizer"

const SynthopiaLogo = dynamic(() => import('@/components/3d/SynthopiaLogo'), {
  ssr: false,
  loading: () => null,
})

export function Hero() {
  const textRef = useRef<HTMLDivElement>(null)
  const glassCardRef = useRef<HTMLDivElement>(null)
  const [glassPosition, setGlassPosition] = useState({ x: 50, y: 50 })
  const [scrollPosition, setScrollPosition] = useState({ x: 50, y: 50 })
  const isInteractingRef = useRef(false)
  const [reflectionLayers, setReflectionLayers] = useState<Array<{ id: number; x: number; y: number; intensity: number; size: number; speed: number }>>([])
  const { state, playTrack, togglePlay, analyserRef, setPlaybackRate, seek, nextTrack, prevTrack, setShuffle, setAutoplay } = useGlobalPlayer()
  
  // NOTE: Track data anonymized for public code repository
  // Audio playback disabled - see live site for full functionality
  const heroTracks = useMemo(() => [
    {
      id: 100,
      title: "Demo Track 1",
      artist: "Demo Artist",
      src: "#", // Audio files not included in public repo
    },
    {
      id: 101,
      title: "Demo Track 2",
      artist: "Demo Artist",
      src: "#",
    },
    {
      id: 102,
      title: "Demo Track 3",
      artist: "Demo Artist",
      src: "#",
    },
  ], [])
  
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2]
  
  const currentHeroTrack = heroTracks[state.currentIndex] || heroTracks[0]
  const isHeroTrackPlaying = heroTracks.some(t => t.id === state.currentTrack?.id) && state.isPlaying
  const isHeroTrackLoaded = heroTracks.some(t => t.id === state.currentTrack?.id)
  const progress = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0
  
  const animationRef = useRef<number | null>(null)
  const [audioIntensity, setAudioIntensity] = useState(0)

  const handleHeroPlay = () => {
    if (isHeroTrackLoaded) {
      togglePlay()
    } else {
      // Pass the playlist to GlobalPlayer
      playTrack(heroTracks[0], heroTracks)
    }
  }
  
  const handlePrevTrack = () => {
    if (isHeroTrackLoaded) {
      prevTrack()
    } else {
      playTrack(heroTracks[heroTracks.length - 1], heroTracks)
    }
  }
  
  const handleNextTrack = () => {
    if (isHeroTrackLoaded) {
      nextTrack()
    } else {
      playTrack(heroTracks[0], heroTracks)
    }
  }
  
  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Simplified audio intensity calculation (visualization is now in 3D)
  const updateAudioIntensity = useCallback(() => {
    const analyser = analyserRef.current
    if (!analyser || !isHeroTrackPlaying) {
      setAudioIntensity(0)
      return
    }
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(dataArray)
    
    // Fast intensity calculation using sampling instead of full array
    let sum = 0
    const sampleSize = 32
    const step = Math.floor(dataArray.length / sampleSize)
    for (let i = 0; i < sampleSize; i++) {
      sum += dataArray[i * step] ?? 0
    }
    setAudioIntensity(sum / sampleSize / 255)
    
    animationRef.current = requestAnimationFrame(updateAudioIntensity)
  }, [isHeroTrackPlaying, analyserRef])

  useEffect(() => {
    if (isHeroTrackPlaying) {
      updateAudioIntensity()
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isHeroTrackPlaying, updateAudioIntensity])

  useEffect(() => {
    // Initialize reflection layers for realistic light refraction
    const layers = []
    for (let i = 0; i < 8; i++) {
      layers.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        intensity: Math.random() * 0.3 + 0.1,
        size: Math.random() * 3 + 1,
        speed: Math.random() * 0.02 + 0.01
      })
    }
    setReflectionLayers(layers)
  }, [])

  useEffect(() => {
    let rafId: number
    
    const handleMouseMove = (e: MouseEvent) => {
      if (textRef.current && window.innerWidth >= 768) {
        rafId = requestAnimationFrame(() => {
          const textRect = textRef.current!.getBoundingClientRect()
          const x = ((e.clientX - textRect.left) / textRect.width) * 100
          const y = ((e.clientY - textRect.top) / textRect.height) * 100
          
          setGlassPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
          isInteractingRef.current = true
          
          // Update reflection layers based on mouse position
          setReflectionLayers(prev => prev.map(layer => ({
            ...layer,
            x: layer.x + (x - 50) * 0.05,
            y: layer.y + (y - 50) * 0.05,
            intensity: Math.min(0.8, layer.intensity + Math.abs(x - 50) * 0.005)
          })))
        })
      }
    }

    const handleMouseLeave = () => {
      isInteractingRef.current = false
    }

    window.addEventListener("mousemove", handleMouseMove)
    window.addEventListener("mouseleave", handleMouseLeave)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("mouseleave", handleMouseLeave)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    let rafId: number
    let lastScrollY = 0
    let scrollTimeout: NodeJS.Timeout
    
    const handleScroll = () => {
      const scrollY = window.scrollY
      
      // Throttle scroll events for mobile performance
      if (window.innerWidth < 768) {
        if (Math.abs(scrollY - lastScrollY) < 5) return // Skip small scroll movements
        clearTimeout(scrollTimeout)
        scrollTimeout = setTimeout(() => {
          rafId = requestAnimationFrame(() => {
            const x = 50 + Math.sin(scrollY * 0.0008) * 40
            const y = 50 + Math.cos(scrollY * 0.0008) * 40
            
            setScrollPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
          })
        }, 16) // ~60fps throttling
      } else {
        // Desktop: immediate response
        rafId = requestAnimationFrame(() => {
          const x = 50 + Math.sin(scrollY * 0.0008) * 40
          const y = 50 + Math.cos(scrollY * 0.0008) * 40
          
          setScrollPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
          
          // Animate reflection layers during scroll (desktop only)
          setReflectionLayers(prev => prev.map(layer => ({
            ...layer,
            x: layer.x + Math.sin(scrollY * 0.001 + layer.speed) * 20,
            y: layer.y + Math.cos(scrollY * 0.001 + layer.speed) * 20,
            intensity: 0.3 + Math.sin(scrollY * 0.002 + layer.speed * 2) * 0.2
          })))
        })
      }
      
      lastScrollY = scrollY
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial call
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (rafId) cancelAnimationFrame(rafId)
      if (scrollTimeout) clearTimeout(scrollTimeout)
    }
  }, [])

  useEffect(() => {
    // Continuous animation loop for living glass effect (desktop only)
    if (window.innerWidth < 768) return // Skip on mobile for performance
    
    let animationFrame: number
    let lastTime = 0
    
    function animate(currentTime: number) {
      if (currentTime - lastTime >= 16) { // ~60fps throttling
        if (isInteractingRef.current) {
          setReflectionLayers(prev => prev.map(layer => ({
            ...layer,
            x: layer.x + layer.speed * 2,
            y: layer.y + layer.speed * 3,
            intensity: Math.sin(Date.now() * 0.001 + layer.speed * 5) * 0.3 + 0.4
          })))
        }
        lastTime = currentTime
      }
      animationFrame = requestAnimationFrame(animate)
    }
    
    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [])

  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 sm:pt-24">
      {/* Gradient overlay - seamless transition */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-transparent z-10 pointer-events-none" />

      {/* Content */}
      <div className="relative z-20 text-center px-3 sm:px-6 w-full max-w-[95vw] sm:max-w-[85vw] md:max-w-3xl lg:max-w-4xl mx-auto">
        <div className="mb-8 animate-fade-in-up" ref={textRef}>
          <div 
            className={`relative transition-all duration-300 ${isHeroTrackPlaying ? 'is-playing' : ''}`} 
            style={{ 
              // No pulse effect - purely visual container
              transform: 'scale(1)',
            }}
          >
            {/* Audio-reactive background glow - furthest back */}
            {isHeroTrackPlaying && (
              <div 
                className="absolute -inset-4 rounded-[2rem] pointer-events-none transition-opacity duration-100"
                style={{
                  zIndex: 1,
                  background: `radial-gradient(ellipse at center, 
                    rgba(212, 175, 55, ${0.1 + audioIntensity * 0.3}) 0%, 
                    rgba(212, 175, 55, ${0.05 + audioIntensity * 0.15}) 30%, 
                    transparent 70%)`,
                  filter: `blur(${20 + audioIntensity * 20}px)`,
                }}
              />
            )}

            {/* Audio Visualizer is now integrated into the 3D Logo */}

            {/* 3D Logo - in front of visualizer (z:3), behind glass card content */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-visible"
              style={{
                zIndex: 3,
              }}
            >
              <div 
                className="absolute pointer-events-none"
                style={{
                  width: '100%',
                  height: '100%',
                  minHeight: '300px',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  opacity: 0.9,
                  touchAction: 'none',
                }}
              >
                <SynthopiaLogo 
                  quality="high" 
                  autoRotate={false} 
                  analyser={analyserRef.current}
                  isPlaying={isHeroTrackPlaying}
                />
              </div>
            </div>

            {/* Glass morphism background for text */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none transition-all duration-100"
              style={{
                zIndex: 4,
                background: isHeroTrackPlaying 
                  ? `rgba(0, 0, 0, ${0.2 + audioIntensity * 0.1})`
                  : "transparent",
                backdropFilter: isHeroTrackPlaying ? "blur(8px)" : "none",
                WebkitBackdropFilter: isHeroTrackPlaying ? "blur(8px)" : "none",
                border: `1px solid rgba(212, 175, 55, ${isHeroTrackPlaying ? 0.3 + audioIntensity * 0.4 : 0.2})`,
                boxShadow: isHeroTrackPlaying 
                  ? `0 8px 32px 0 rgba(0, 0, 0, 0.25), 
                     0 0 ${40 + audioIntensity * 60}px rgba(212, 175, 55, ${0.1 + audioIntensity * 0.2}),
                     inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`
                  : "0 8px 32px 0 rgba(0, 0, 0, 0.15), inset 0 1px 0 0 rgba(255, 255, 255, 0.3)",
                opacity: isHeroTrackPlaying ? 1 : 0.3,
              }}
            />

            
            {/* Advanced light refraction layers */}
            {reflectionLayers.map((layer) => (
              <div
                key={layer.id}
                className="absolute inset-0 rounded-3xl pointer-events-none hidden md:block"
                style={{
                  background: `radial-gradient(circle ${layer.size * 100}px at ${layer.x}% ${layer.y}%, 
                    rgba(255, 255, 255, ${layer.intensity}) 0%, 
                    rgba(255, 255, 255, ${layer.intensity * 0.5}) 20%, 
                    rgba(255, 255, 255, ${layer.intensity * 0.2}) 40%, 
                    transparent 70%)`,
                  mixBlendMode: "overlay",
                  transform: `scale(${1 + layer.intensity * 0.1})`,
                }}
              />
            ))}
            
            {/* Primary light reflection */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none hidden md:block"
              style={{
                background: `radial-gradient(circle 800px at ${glassPosition.x}% ${glassPosition.y}%, 
                  rgba(255, 255, 255, 0.5) 0%, 
                  rgba(255, 255, 255, 0.3) 15%, 
                  rgba(255, 255, 255, 0.15) 30%, 
                  rgba(255, 255, 255, 0.05) 50%, 
                  transparent 70%)`,
                mixBlendMode: "overlay",
              }}
            />
            
            {/* Secondary reflection for depth */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none hidden md:block"
              style={{
                background: `radial-gradient(circle 500px at ${100 - glassPosition.x}% ${100 - glassPosition.y}%, 
                  rgba(212, 175, 55, 0.4) 0%, 
                  rgba(212, 175, 55, 0.25) 25%, 
                  rgba(212, 175, 55, 0.1) 45%, 
                  transparent 65%)`,
                mixBlendMode: "screen",
              }}
            />
            
            {/* Scroll-based reflection for mobile */}
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none md:hidden"
              style={{
                background: `radial-gradient(circle 400px at ${scrollPosition.x}% ${scrollPosition.y}%, 
                  rgba(255, 255, 255, 0.2) 0%, 
                  rgba(255, 255, 255, 0.1) 20%, 
                  rgba(255, 255, 255, 0.05) 40%, 
                  transparent 60%)`,
                mixBlendMode: "overlay",
              }}
            />
            
            <div 
              className="absolute inset-0 rounded-3xl pointer-events-none md:hidden"
              style={{
                background: `radial-gradient(circle 250px at ${100 - scrollPosition.x}% ${100 - scrollPosition.y}%, 
                  rgba(212, 175, 55, 0.2) 0%, 
                  rgba(212, 175, 55, 0.1) 30%, 
                  transparent 50%)`,
                mixBlendMode: "screen",
              }}
            />
            
            {/* Crystal edge highlights */}
            <div className="absolute inset-0 rounded-3xl pointer-events-none hidden md:block">
              <div 
                className="absolute top-0 left-0 right-0 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.8), transparent)",
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.6)",
                }}
              />
              <div 
                className="absolute bottom-0 left-0 right-0 h-px"
                style={{
                  background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.4)",
                }}
              />
              <div 
                className="absolute top-0 bottom-0 left-0 w-px"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.7), transparent)",
                  boxShadow: "0 0 20px rgba(255, 255, 255, 0.6)",
                }}
              />
              <div 
                className="absolute top-0 bottom-0 right-0 w-px"
                style={{
                  background: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                  boxShadow: "0 0 15px rgba(255, 255, 255, 0.4)",
                }}
              />
              
            </div>
            
            {/* Text content - responsive padding */}
            <div ref={glassCardRef} className="relative p-4 sm:p-6 md:p-8 lg:p-10 z-[100]">
              {/* Combined Audio Visualizer - INSIDE container for correct positioning */}
              {isHeroTrackPlaying && (
                <HeroVisualizer 
                  analyser={analyserRef.current}
                  isPlaying={isHeroTrackPlaying}
                  containerRef={glassCardRef}
                />
              )}
              <h1
                className="font-bold tracking-tight text-foreground mb-2 text-balance"
                style={{
                  fontSize: "clamp(40px, 8vw, 80px)",
                  lineHeight: 1.1,
                  textShadow: `
                    0 1px 2px rgba(0, 0, 0, 0.1),
                    0 2px 4px rgba(0, 0, 0, 0.05)
                  `,
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0.7) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  filter: "drop-shadow(0 2px 8px rgba(0, 0, 0, 0.1))",
                }}
              >
                <span id="synthopia-title" className="inline-block">SynthopiaScale</span>
                <span 
                  className="block"
                  style={{ 
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(212, 175, 55, 0.7) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    filter: "drop-shadow(0 2px 8px rgba(212, 175, 55, 0.2))",
                  }}
                >
                  Records
                </span>
              </h1>
              
              <h2
                className="font-bold tracking-tight text-foreground mb-4 text-balance"
                style={{
                  fontSize: "clamp(18px, 4vw, 36px)",
                  lineHeight: 1.2,
                  textShadow: `
                    0 1px 2px rgba(0, 0, 0, 0.1),
                    0 2px 4px rgba(0, 0, 0, 0.05)
                  `,
                  background: "linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Independent Electronic{" "}
                <span 
                  style={{ 
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.8) 0%, rgba(212, 175, 55, 0.6) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Arts & Sound
                </span>
              </h2>

              {/* Dedication text */}
              <p 
                className="text-sm sm:text-base italic mb-4 max-w-lg mx-auto"
                style={{
                  color: "rgba(232, 234, 237, 0.7)",
                  textShadow: "0 1px 3px rgba(0, 0, 0, 0.3)",
                  lineHeight: 1.6,
                }}
              >
                To every soul, every mind and every wave that shapes SynthopiaScale – these tracks belong to you.
              </p>
              <p 
                className="text-xs sm:text-sm mb-6 max-w-md mx-auto"
                style={{
                  color: "rgba(232, 234, 237, 0.5)",
                }}
              >
                We climb the Scale together, story by story, sound by sound.
              </p>

              {/* Full Player Controls - responsive spacing */}
              <div className="flex flex-col gap-2 sm:gap-3 px-2 sm:px-4">
                {/* Main controls row */}
                <div className="flex items-center justify-center gap-2 sm:gap-3">
                  {/* Shuffle */}
                  <button
                    onClick={() => setShuffle(!state.shuffle)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${state.shuffle ? 'bg-primary/30' : 'bg-white/5'}`}
                    title="Shuffle"
                  >
                    <Shuffle className={`w-3.5 h-3.5 ${state.shuffle ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                  
                  {/* Previous */}
                  <button
                    onClick={handlePrevTrack}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 bg-white/10 hover:bg-white/20"
                    title="Previous track"
                  >
                    <SkipBack className="w-4 h-4 text-foreground" />
                  </button>
                  
                  {/* Play/Pause */}
                  <button
                    onClick={handleHeroPlay}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all flex-shrink-0 cursor-pointer hover:scale-110 ${isHeroTrackPlaying ? 'scale-110' : ''}`}
                    style={{
                      background: 'linear-gradient(135deg, rgba(212, 175, 55, 0.9) 0%, rgba(212, 175, 55, 0.7) 100%)',
                      boxShadow: isHeroTrackPlaying 
                        ? '0 0 20px rgba(212, 175, 55, 0.5)' 
                        : '0 4px 15px rgba(212, 175, 55, 0.3)',
                    }}
                  >
                    {isHeroTrackPlaying ? (
                      <Pause className="w-5 h-5 text-black" />
                    ) : (
                      <Play className="w-5 h-5 text-black ml-0.5" />
                    )}
                  </button>
                  
                  {/* Next */}
                  <button
                    onClick={handleNextTrack}
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 bg-white/10 hover:bg-white/20"
                    title="Next track"
                  >
                    <SkipForward className="w-4 h-4 text-foreground" />
                  </button>
                  
                  {/* Autoplay */}
                  <button
                    onClick={() => setAutoplay(!state.autoplay)}
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${state.autoplay ? 'bg-primary/30' : 'bg-white/5'}`}
                    title="Autoplay"
                  >
                    <Repeat className={`w-3.5 h-3.5 ${state.autoplay ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                  
                  {/* Speed control - matching style */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer hover:scale-110 ${state.playbackRate !== 1 ? 'bg-primary/30' : 'bg-white/5'}`}
                      title="Playback speed"
                    >
                      <span className={`text-[10px] font-bold ${state.playbackRate !== 1 ? 'text-primary' : 'text-muted-foreground'}`}>
                        {state.playbackRate}x
                      </span>
                    </button>
                    {showSpeedMenu && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 rounded-xl bg-background/95 backdrop-blur-xl border border-white/10 shadow-xl z-50">
                        <div className="flex gap-1">
                          {speeds.map((speed) => (
                            <button
                              key={speed}
                              onClick={() => { setPlaybackRate(speed); setShowSpeedMenu(false); }}
                              className={`w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                                state.playbackRate === speed
                                  ? 'bg-primary/30 text-primary'
                                  : 'text-muted-foreground hover:bg-white/10'
                              }`}
                            >
                              {speed}x
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Track info row */}
                <div className="flex items-center justify-center gap-3">
                  <div className="text-center min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">{currentHeroTrack.title}</p>
                    <p className="text-xs text-muted-foreground">{currentHeroTrack.artist} • Track {(state.currentIndex || 0) + 1}/{heroTracks.length}</p>
                  </div>
                </div>
                
                {/* Progress bar / Timeline - responsive width */}
                <div className="flex items-center gap-1.5 sm:gap-2 w-full max-w-[90%] sm:max-w-md mx-auto">
                  <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 text-right">{formatTime(state.currentTime)}</span>
                  <div 
                    className="flex-1 h-1.5 bg-white/10 rounded-full cursor-pointer group relative"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect()
                      const percent = (e.clientX - rect.left) / rect.width
                      seek(percent * state.duration)
                    }}
                  >
                    <div 
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                      style={{ left: `${progress}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10">{formatTime(state.duration)}</span>
                </div>
              </div>
              </div>
          </div>
        </div>

        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-6 sm:mb-8 animate-fade-in-up stagger-2 text-balance">
          Premium Sample Packs, Full-Stem Albums & Professional Production Tools (Coming soon) for producers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8 sm:mb-10 animate-fade-in-up stagger-3">
          <RippleButton
            onClick={() => {
              const element = document.getElementById('samplepacks')
              element?.scrollIntoView({ behavior: 'smooth' })
            }}
            className="px-8 py-3 text-base font-medium"
          >
            Browse Sample Packs
          </RippleButton>
        </div>

        <div className="text-sm text-muted-foreground max-w-xl mx-auto animate-fade-in-up stagger-3">
          <p className="text-center">
            All packs: 24-bit WAV, royalty-free, instant download
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 animate-bounce">
        <a
          href="#about"
          className="text-muted-foreground hover:text-foreground transition-colors duration-300"
          aria-label="Scroll to about section"
        >
          <ChevronDown className="h-6 w-6 sm:h-8 sm:w-8" />
        </a>
      </div>
    </section>
  )
}
