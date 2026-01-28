"use client"

import { useEffect, useRef, useState } from "react"
import { ShoppingBag, ExternalLink, Play, Pause } from "lucide-react"
import { useGlobalPlayer } from "./GlobalPlayerContext"

// NOTE: Sample pack data anonymized for public code repository
// Audio playback disabled - see live site for full functionality
const samplepacks = [
  {
    id: 1,
    title: "Genre Pack Vol 1 - Sample Pack",
    category: "Full Release",
    description: "Essential kicks, loops, and textures for music production.",
    link: "#",
    features: ["50+ Samples", "24-bit WAV", "120-140 BPM", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 2,
    title: "Genre Pack Vol 2 - Sample Pack",
    category: "Full Release",
    description: "Melodic samples and uplifting elements.",
    link: "#",
    features: ["40+ Samples", "24-bit WAV", "126-132 BPM", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 3,
    title: "Signature Sample Pack Vol. 1",
    category: "Full Release",
    description: "Signature sounds and samples from personal collection.",
    link: "#",
    features: ["60+ Samples", "24-bit WAV", "Multiple Genres", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 4,
    title: "Genre Pack Vol 3 - Sample Pack",
    category: "Full Release",
    description: "Authentic sounds with live instrument samples.",
    link: "#",
    features: ["35+ Samples", "24-bit WAV", "80-120 BPM", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 5,
    title: "Genre Pack Vol 4 - Sample Pack",
    category: "Full Release",
    description: "Cutting-edge sounds for modern electronic music.",
    link: "#",
    features: ["45+ Samples", "24-bit WAV", "140-150 BPM", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 6,
    title: "Album One - Full Album inkl. Stems and Samples",
    category: "Full Release",
    description: "Complete album with stems and samples.",
    link: "#",
    features: ["12 Full Tracks", "24-bit WAV", "Stems Included", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 7,
    title: "Album Two - Full Album inkl. Stems and Samples",
    category: "Full Release",
    description: "Complete album with stems and samples.",
    link: "#",
    features: ["10 Full Tracks", "24-bit WAV", "Stems Included", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 8,
    title: "Album Three - Full Album inkl. Stems and Samples",
    category: "Full Release",
    description: "Complete album with stems and samples.",
    link: "#",
    features: ["8 Full Tracks", "24-bit WAV", "Stems Included", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 9,
    title: "EP One - inkl. Stems and Samples",
    category: "Full Release",
    description: "Extended play collection.",
    link: "#",
    features: ["6 Full Tracks", "24-bit WAV", "Stems Included", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 10,
    title: "Album Four - Full Album inkl. Stems and Samples",
    category: "Full Release",
    description: "Complete album with stems and samples.",
    link: "#",
    features: ["14 Full Tracks", "24-bit WAV", "Stems Included", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 11,
    title: "Genre Pack Vol 5 - Sample Pack",
    category: "Full Release",
    description: "Unique blend of electronic dance music samples.",
    link: "#",
    features: ["30+ Samples", "24-bit WAV", "110-128 BPM", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
  {
    id: 12,
    title: "Signature Sample Pack Vol 2",
    category: "Full Release",
    description: "Second volume of signature sounds and samples.",
    link: "#",
    features: ["55+ Samples", "24-bit WAV", "Multiple Genres", "100% Royalty-free"],
    previewTrack: "#",
    previewTitle: "Demo Track"
  },
]

export function SamplepacksSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [glassPositions, setGlassPositions] = useState<{ [key: number]: { x: number; y: number } }>({})
  const [scrollPositions, setScrollPositions] = useState<{ [key: number]: { x: number; y: number } }>({})
  const [reflectionLayers, setReflectionLayers] = useState<{ [key: number]: Array<{ id: number; x: number; y: number; intensity: number; size: number; speed: number }> }>({})
  const isInteractingRef = useRef<{ [key: number]: boolean }>({})
  
  const { state, playTrack } = useGlobalPlayer()

  const handlePlayPreview = (pack: typeof samplepacks[0]) => {
    playTrack({
      id: pack.id,
      title: pack.previewTitle,
      artist: "SynthopiaScale",
      src: pack.previewTrack,
    })
  }

  const isCurrentTrackPlaying = (packId: number) => {
    return state.currentTrack?.id === packId && state.isPlaying
  }

  useEffect(() => {
    // Initialize reflection layers for each card
    const layers: { [key: number]: Array<{ id: number; x: number; y: number; intensity: number; size: number; speed: number }> } = {}
    for (let cardId = 1; cardId <= 12; cardId++) {
      layers[cardId] = []
      for (let i = 0; i < 6; i++) {
        layers[cardId].push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          intensity: Math.random() * 0.25 + 0.05,
          size: Math.random() * 2 + 0.5,
          speed: Math.random() * 0.015 + 0.005
        })
      }
    }
    setReflectionLayers(layers)
  }, [])

  useEffect(() => {
    let rafId: number
    
    const handleMouseMove = (e: MouseEvent) => {
      if (window.innerWidth < 768) return // Skip on mobile for performance
      
      rafId = requestAnimationFrame(() => {
        samplepacks.forEach((pack) => {
          const cardId = pack.id
          const card = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement
          
          if (card) {
            const rect = card.getBoundingClientRect()
            const x = ((e.clientX - rect.left) / rect.width) * 100
            const y = ((e.clientY - rect.top) / rect.height) * 100
            
            setGlassPositions(prev => ({
              ...prev,
              [cardId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
            }))
            
            isInteractingRef.current[cardId] = true
            
            // Update reflection layers based on mouse position
            setReflectionLayers(prev => {
              if (!prev[cardId]) return prev
              return {
                ...prev,
                [cardId]: prev[cardId].map(layer => ({
                  ...layer,
                  x: layer.x + (x - 50) * 0.05,
                  y: layer.y + (y - 50) * 0.05,
                  intensity: Math.min(0.8, layer.intensity + Math.abs(x - 50) * 0.005)
                }))
              }
            })
          }
        })
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
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
            samplepacks.forEach((pack, index) => {
              const cardId = pack.id
              const card = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement
              
              if (card) {
                const x = 50 + Math.sin(scrollY * 0.001 + index) * 30
                const y = 50 + Math.cos(scrollY * 0.001 + index) * 30
                
                setScrollPositions(prev => ({
                  ...prev,
                  [cardId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
                }))
              }
            })
          })
        }, 16) // ~60fps throttling
      } else {
        // Desktop: immediate response
        rafId = requestAnimationFrame(() => {
          samplepacks.forEach((pack, index) => {
            const cardId = pack.id
            const card = document.querySelector(`[data-card-id="${cardId}"]`) as HTMLElement
            
            if (card) {
              const rect = card.getBoundingClientRect()
              const cardCenterY = rect.top + rect.height / 2
              const windowHeight = window.innerHeight
              
              // Calculate position based on scroll
              const progress = (cardCenterY / windowHeight)
              const x = 50 + Math.sin(scrollY * 0.001 + index) * 30
              const y = 50 + Math.cos(scrollY * 0.001 + index) * 30
              
              setScrollPositions(prev => ({
                ...prev,
                [cardId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
              }))
              
              // Animate reflection layers during scroll (desktop only)
              setReflectionLayers(prev => {
                if (!prev[cardId]) return prev
                return {
                  ...prev,
                  [cardId]: prev[cardId].map(layer => ({
                    ...layer,
                    x: layer.x + Math.sin(scrollY * 0.001 + layer.speed) * 15,
                    y: layer.y + Math.cos(scrollY * 0.001 + layer.speed) * 15,
                    intensity: 0.2 + Math.sin(scrollY * 0.002 + layer.speed * 2) * 0.15
                  }))
                }
              })
            }
          })
        })
      }
      
      lastScrollY = scrollY
    }

    const snapContainer = document.querySelector('.snap-container')
    window.addEventListener("scroll", handleScroll, { passive: true })
    snapContainer?.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll() // Initial call
    return () => {
      snapContainer?.removeEventListener("scroll", handleScroll)
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
        setReflectionLayers(prev => {
          const updated = { ...prev }
          Object.keys(updated).forEach(cardId => {
            const id = parseInt(cardId)
            if (isInteractingRef.current[id] && updated[id]) {
              updated[id] = updated[id].map(layer => ({
                ...layer,
                x: layer.x + layer.speed * 2,
                y: layer.y + layer.speed * 3,
                intensity: Math.sin(Date.now() * 0.001 + layer.speed * 5) * 0.3 + 0.4
              }))
            }
          })
          return updated
        })
        lastTime = currentTime
      }
      animationFrame = requestAnimationFrame(animate)
    }
    
    animationFrame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(animationFrame)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  return (
    <section
      id="samplepacks"
      ref={sectionRef}
      className="relative py-20 md:py-40 px-4 sm:px-6"
    >
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Particle Background */}
        <div className="absolute inset-0">
          <div className="absolute top-10 left-10 w-2 h-2 bg-white/20 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-75"></div>
          <div className="absolute bottom-20 left-20 w-3 h-3 bg-white/10 rounded-full animate-pulse delay-150"></div>
          <div className="absolute top-40 right-40 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-300"></div>
          <div className="absolute bottom-40 right-10 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-500"></div>
          <div className="absolute top-60 left-30 w-2 h-2 bg-white/10 rounded-full animate-pulse delay-700"></div>
          <div className="absolute bottom-10 right-30 w-3 h-3 bg-white/20 rounded-full animate-pulse delay-1000"></div>
          <div className="absolute top-30 left-40 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-1200"></div>
          <div className="absolute bottom-60 left-10 w-2 h-2 bg-white/10 rounded-full animate-pulse delay-1400"></div>
          <div className="absolute top-80 right-20 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-1600"></div>
          <div className="absolute bottom-30 left-50 w-2 h-2 bg-white/15 rounded-full animate-pulse delay-1800"></div>
          <div className="absolute top-50 right-50 w-1 h-1 bg-white/10 rounded-full animate-pulse delay-2000"></div>
          <div className="absolute top-20 left-60 w-2 h-2 bg-white/20 rounded-full animate-pulse delay-2200"></div>
          <div className="absolute bottom-20 right-60 w-1 h-1 bg-white/15 rounded-full animate-pulse delay-2400"></div>
          <div className="absolute top-40 left-70 w-2 h-2 bg-white/10 rounded-full animate-pulse delay-2600"></div>
          <div className="absolute bottom-40 right-70 w-1 h-1 bg-white/20 rounded-full animate-pulse delay-2800"></div>
          <div className="absolute top-60 left-80 w-2 h-2 bg-white/15 rounded-full animate-pulse delay-3000"></div>
          <div className="absolute bottom-60 right-80 w-1 h-1 bg-white/10 rounded-full animate-pulse delay-3200"></div>
        </div>
        
        {/* Gradient Overlay */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
      </div>

      <div className="max-w-[1400px] mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-20">
          <div className={`inline-flex items-center px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6 ${
            isVisible ? "animate-fade-in-up" : "opacity-0"
          }`}>
            <span className="text-primary text-sm font-semibold">Premium Collection</span>
          </div>
          
          <h2
            className={`text-3xl sm:text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-6 ${
              isVisible ? "animate-fade-in-up stagger-1" : "opacity-0"
            }`}
          >
            Complete <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Music Production</span> Suite
          </h2>
          
          <p
            className={`text-muted-foreground/80 max-w-3xl mx-auto text-lg md:text-xl leading-relaxed ${
              isVisible ? "animate-fade-in-up stagger-2" : "opacity-0"
            }`}
          >
            Professional-grade sample packs, full albums with stems, and exclusive production tools. 
            <span className="block mt-2 text-primary/60">24-bit WAV quality • 100% royalty-free • Instant delivery</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {samplepacks.map((pack, index) => (
            <article
              key={pack.id}
              data-card-id={pack.id}
              className={`group rounded-3xl p-6 sm:p-8 transition-all duration-500 flex flex-col h-full relative overflow-hidden snap-section-mobile ${
                isVisible ? `animate-fade-in-up stagger-${Math.min(index + 2, 7)}` : "opacity-0"
              }`}
              style={{
                background: "transparent",
                backdropFilter: "none",
                WebkitBackdropFilter: "none",
                border: "1px solid rgba(212, 175, 55, 0.3)",
                boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)"
                e.currentTarget.style.transform = "translateY(-12px) scale(1.02)"
                e.currentTarget.style.boxShadow =
                  "0 25px 60px 0 rgba(0, 0, 0, 0.3), 0 0 80px rgba(212, 175, 55, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.3)"
                e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent"
                e.currentTarget.style.transform = "translateY(0) scale(1)"
                e.currentTarget.style.boxShadow =
                  "0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)"
                e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)"
              }}
            >
              {/* Card Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Advanced light refraction layers */}
              {reflectionLayers[pack.id]?.map((layer) => (
                <div
                  key={layer.id}
                  className="absolute inset-0 rounded-3xl pointer-events-none"
                  style={{
                    background: `radial-gradient(circle ${layer.size * 80}px at ${layer.x}% ${layer.y}%, 
                      rgba(255, 255, 255, ${layer.intensity}) 0%, 
                      rgba(255, 255, 255, ${layer.intensity * 0.5}) 20%, 
                      rgba(255, 255, 255, ${layer.intensity * 0.2}) 40%, 
                      transparent 70%)`,
                    mixBlendMode: "overlay",
                    transform: `scale(${1 + layer.intensity * 0.05})`,
                  }}
                />
              ))}
              
              {/* Primary light reflection */}
              {(glassPositions[pack.id] || scrollPositions[pack.id]) && (
                <>
                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 400px at ${
                        glassPositions[pack.id] 
                          ? `${glassPositions[pack.id].x}% ${glassPositions[pack.id].y}%` 
                          : `${scrollPositions[pack.id].x}% ${scrollPositions[pack.id].y}%`
                      }, 
                        rgba(255, 255, 255, 0.4) 0%, 
                        rgba(255, 255, 255, 0.25) 15%, 
                        rgba(255, 255, 255, 0.12) 30%, 
                        rgba(255, 255, 255, 0.05) 50%, 
                        transparent 70%)`,
                      mixBlendMode: "overlay",
                    }}
                  />
                  
                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 250px at ${
                        glassPositions[pack.id] 
                          ? `${100 - glassPositions[pack.id].x}% ${100 - glassPositions[pack.id].y}%` 
                          : `${100 - scrollPositions[pack.id].x}% ${100 - scrollPositions[pack.id].y}%`
                      }, 
                        rgba(212, 175, 55, 0.35) 0%, 
                        rgba(212, 175, 55, 0.2) 25%, 
                        rgba(212, 175, 55, 0.08) 45%, 
                        transparent 65%)`,
                      mixBlendMode: "screen",
                    }}
                  />
                </>
              )}
              
              {/* Crystal Edge Highlights */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div 
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.6), transparent)",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                  }}
                />
                <div 
                  className="absolute top-0 bottom-0 left-0 w-px"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.5), transparent)",
                    boxShadow: "0 0 10px rgba(255, 255, 255, 0.4)",
                  }}
                />
                <div 
                  className="absolute top-0 bottom-0 right-0 w-px"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.4), transparent)",
                    boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
                  }}
                />
                
                {/* Crystal corner highlights */}
                <div 
                  className="absolute top-2 left-2 w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                  }}
                />
                <div 
                  className="absolute top-2 right-2 w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                  }}
                />
                <div 
                  className="absolute bottom-2 left-2 w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                  }}
                />
                <div 
                  className="absolute bottom-2 right-2 w-2 h-2 rounded-full"
                  style={{
                    background: "radial-gradient(circle, rgba(255, 255, 255, 0.8) 0%, transparent 70%)",
                    boxShadow: "0 0 15px rgba(255, 255, 255, 0.6)",
                  }}
                />
              </div>
              
              <div className="relative z-10">
                <div
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(212, 175, 55, 0.05) 100%)",
                    border: "1px solid rgba(212, 175, 55, 0.2)",
                    boxShadow: "0 4px 20px rgba(212, 175, 55, 0.15)",
                  }}
                >
                  <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-primary" />
                </div>

                <h3
                  className="font-bold text-foreground mb-3 leading-tight"
                  style={{ fontSize: "clamp(18px, 2vw, 22px)", fontFamily: "Inter, sans-serif" }}
                >
                  {pack.title}
                </h3>

                <div className="flex items-center gap-2 mb-4">
                  <span
                    className="inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-full"
                    style={{
                      background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)",
                      color: "rgba(212, 175, 55, 0.9)",
                      border: "1px solid rgba(212, 175, 55, 0.2)",
                    }}
                  >
                    {pack.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-xs text-green-500 font-medium">Available</span>
                  </div>
                </div>

                <p className="text-muted-foreground/70 text-sm leading-relaxed mb-6">{pack.description}</p>

                {/* Features */}
                <div className="flex-grow mb-6">
                  <div className="space-y-3">
                    {pack.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-xs text-muted-foreground/80">
                        <div className="w-2 h-2 rounded-full bg-gradient-to-r from-primary to-primary/60 mr-3 flex-shrink-0"></div>
                        <span className="font-medium">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Buttons at bottom - premium styling */}
                <div className="space-y-3 mt-auto">
                  {/* Preview Player */}
                  {pack.previewTrack && (
                    <button
                      onClick={() => handlePlayPreview(pack)}
                      className="inline-flex items-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-all duration-400 w-full justify-center"
                      style={{
                        background: isCurrentTrackPlaying(pack.id)
                          ? "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.15) 100%)"
                          : "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)",
                        color: "rgba(212, 175, 55, 0.9)",
                        border: "1px solid rgba(212, 175, 55, 0.2)",
                        boxShadow: "0 4px 20px rgba(212, 175, 55, 0.1)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.3) 0%, rgba(212, 175, 55, 0.2) 100%)"
                        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)"
                        e.currentTarget.style.transform = "translateY(-2px)"
                        e.currentTarget.style.boxShadow = "0 8px 30px rgba(212, 175, 55, 0.2)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = isCurrentTrackPlaying(pack.id)
                          ? "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.15) 100%)"
                          : "linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)"
                        e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.2)"
                        e.currentTarget.style.transform = "translateY(0)"
                        e.currentTarget.style.boxShadow = "0 4px 20px rgba(212, 175, 55, 0.1)"
                      }}
                    >
                      {isCurrentTrackPlaying(pack.id) ? (
                        <Pause className="h-3 w-3" />
                      ) : (
                        <Play className="h-3 w-3" />
                      )}
                      {isCurrentTrackPlaying(pack.id) ? `Pause: ${pack.previewTitle}` : `Play: ${pack.previewTitle}`}
                    </button>
                  )}

                  {/* Purchase Button */}
                  <a
                    href={pack.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Purchase ${pack.title}`}
                    className="inline-flex items-center gap-3 px-6 py-4 rounded-xl text-sm font-semibold relative overflow-hidden w-full justify-center group"
                    style={{
                      background: "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)",
                      color: "rgba(212, 175, 55, 0.95)",
                      border: "1px solid rgba(212, 175, 55, 0.3)",
                      boxShadow: "0 4px 20px rgba(212, 175, 55, 0.15)",
                      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.15) 100%)"
                      e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.5)"
                      e.currentTarget.style.transform = "translateY(-2px) scale(1.02)"
                      e.currentTarget.style.boxShadow = "0 8px 40px rgba(212, 175, 55, 0.25)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.08) 100%)"
                      e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)"
                      e.currentTarget.style.transform = "translateY(0) scale(1)"
                      e.currentTarget.style.boxShadow = "0 4px 20px rgba(212, 175, 55, 0.15)"
                    }}
                  >
                    <ShoppingBag className="h-4 w-4" />
                    <span>Purchase</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
