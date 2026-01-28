"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink, Youtube, Music2, Radio } from "lucide-react"

// NOTE: Artist data anonymized for public code repository
// See live site for actual artist information
const artists = [
  {
    name: "Artist One",
    initials: "A1",
    genre: "Hip-Hop / Rap",
    bio: "Thought-provoking lyricism and deep storytelling through authentic rap narratives.",
    link: "#",
    platform: "Linktree",
  },
  {
    name: "Artist Two",
    initials: "A2",
    genre: "Ambient / Experimental",
    bio: "Crafting ethereal soundscapes that blur the line between dreams and reality.",
    link: "#",
    platform: "YouTube",
  },
  {
    name: "Artist Three",
    initials: "A3",
    genre: "Melodic Techno",
    bio: "DJane with high-energy sets infused with emotional depth and true vibes.",
    link: "#",
    platform: "TikTok",
  },
  {
    name: "Artist Four",
    initials: "A4",
    genre: "Deep House",
    bio: "DJane with mysterious atmospheres and hypnotic grooves from the underground.",
    link: "#",
    platform: "SoundCloud",
  },
  {
    name: "Artist Five",
    initials: "A5",
    genre: "Drum & Bass",
    bio: "Raw, unfiltered sonic experiments pushing the boundaries of electronic music.",
    link: "#",
    platform: "SoundCloud",
  },
  {
    name: "Artist Six",
    initials: "A6",
    genre: "Techno",
    bio: "Precise, stripped-back productions that let the rhythm speak.",
    link: "#",
    platform: "SoundCloud",
  },
  {
    name: "Artist Seven",
    initials: "A7",
    genre: "Melodic Hard Techno",
    bio: "Prescribing heavy doses of pounding beats and driving basslines.",
    link: "#",
    platform: "SoundCloud",
  },
  {
    name: "Artist Eight",
    initials: "A8",
    genre: "Live/Hardware Techno",
    bio: "Live streams and sets that break the mold of conventional techno.",
    link: "#",
    platform: "SoundCloud",
  },
]

function getPlatformIcon(platform: string) {
  switch (platform) {
    case "YouTube":
      return <Youtube className="h-4 w-4" />
    case "SoundCloud":
      return <Music2 className="h-4 w-4" />
    case "Twitch":
      return <Radio className="h-4 w-4" />
    default:
      return <ExternalLink className="h-4 w-4" />
  }
}

export function ArtistsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [glassPositions, setGlassPositions] = useState<{ [key: number]: { x: number; y: number } }>({})
  const [scrollPositions, setScrollPositions] = useState<{ [key: number]: { x: number; y: number } }>({})

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

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('[data-artist-id]')
      cards.forEach((card) => {
        const artistId = parseInt(card.getAttribute('data-artist-id') || '0')
        const rect = card.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          setGlassPositions(prev => ({
            ...prev,
            [artistId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          }))
        }
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll('[data-artist-id]')
      const scrollY = window.scrollY
      
      cards.forEach((card, index) => {
        const artistId = parseInt(card.getAttribute('data-artist-id') || '0')
        const rect = card.getBoundingClientRect()
        const cardCenterY = rect.top + rect.height / 2
        const windowHeight = window.innerHeight
        
        // Calculate position based on scroll
        const x = 50 + Math.sin(scrollY * 0.001 + index) * 30
        const y = 50 + Math.cos(scrollY * 0.001 + index) * 30
        
        setScrollPositions(prev => ({
          ...prev,
          [artistId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        }))
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="artists" ref={sectionRef} className="relative py-20 md:py-40 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <h2
            className={`text-2xl sm:text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Our <span className="text-primary">Artists</span>
          </h2>
          <p
            className={`text-muted-foreground max-w-2xl mx-auto text-sm sm:text-base ${
              isVisible ? "animate-fade-in-up stagger-1" : "opacity-0"
            }`}
          >
            A collective of unique voices shaping the future of electronic music.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {artists.map((artist, index) => (
            <article
              key={artist.name}
              data-artist-id={index}
              className={`group rounded-3xl p-5 sm:p-6 transition-all duration-400 relative overflow-hidden snap-section-mobile ${
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
                e.currentTarget.style.transform = "translateY(-8px) scale(1.02)"
                e.currentTarget.style.boxShadow =
                  "0 20px 50px 0 rgba(0, 0, 0, 0.3), 0 0 40px rgba(212, 175, 55, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.3)"
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
              {/* Glass Light Reflection Effect */}
              {(glassPositions[index] || scrollPositions[index]) && (
                <>
                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 250px at ${
                        glassPositions[index] 
                          ? `${glassPositions[index].x}% ${glassPositions[index].y}%` 
                          : `${scrollPositions[index].x}% ${scrollPositions[index].y}%`
                      }, 
                        rgba(255, 255, 255, 0.25) 0%, 
                        rgba(255, 255, 255, 0.12) 20%, 
                        rgba(255, 255, 255, 0.06) 40%, 
                        transparent 70%)`,
                      mixBlendMode: "overlay",
                    }}
                  />
                  
                  <div 
                    className="absolute inset-0 rounded-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle 150px at ${
                        glassPositions[index] 
                          ? `${100 - glassPositions[index].x}% ${100 - glassPositions[index].y}%` 
                          : `${100 - scrollPositions[index].x}% ${100 - scrollPositions[index].y}%`
                      }, 
                        rgba(212, 175, 55, 0.2) 0%, 
                        rgba(212, 175, 55, 0.1) 30%, 
                        transparent 60%)`,
                      mixBlendMode: "screen",
                    }}
                  />
                </>
              )}
              
              {/* Glass Edge Highlights */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div 
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent)",
                  }}
                />
                <div 
                  className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background: "linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.12), transparent)",
                  }}
                />
                <div 
                  className="absolute top-0 bottom-0 left-0 w-px"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.15), transparent)",
                  }}
                />
                <div 
                  className="absolute top-0 bottom-0 right-0 w-px"
                  style={{
                    background: "linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.12), transparent)",
                  }}
                />
              </div>
              
              <div className="relative z-10">
                {/* Avatar/Initials */}
                <div
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                  style={{
                    background: "linear-gradient(135deg, rgba(212, 175, 55, 0.25) 0%, rgba(212, 175, 55, 0.08) 100%)",
                  }}
                >
                  <span className="text-primary font-bold text-base sm:text-lg">{artist.initials}</span>
                </div>

                <h3
                  className="font-bold text-foreground mb-2"
                  style={{ fontSize: "24px", fontFamily: "Inter, sans-serif" }}
                >
                  {artist.name}
                </h3>

                <span
                  className="inline-block px-3 py-1.5 text-xs font-semibold rounded-full mb-3"
                  style={{
                    background: "rgba(212, 175, 55, 0.6)",
                    color: "#0f1114",
                  }}
                >
                  {artist.genre}
                </span>

                {/* Bio - clean text */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">{artist.bio}</p>

                <a
                  href={artist.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Visit ${artist.name} on ${artist.platform}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium relative overflow-hidden"
                  style={{
                    background: "rgba(212, 175, 55, 0.1)",
                    color: "rgba(212, 175, 55, 0.8)",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(212, 175, 55, 0.2)"
                    e.currentTarget.style.color = "rgba(212, 175, 55, 1)"
                    e.currentTarget.style.boxShadow = "0 0 20px rgba(212, 175, 55, 0.15)"
                    e.currentTarget.style.transform = "scale(1.02)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(212, 175, 55, 0.1)"
                    e.currentTarget.style.color = "rgba(212, 175, 55, 0.8)"
                    e.currentTarget.style.boxShadow = "none"
                    e.currentTarget.style.transform = "scale(1)"
                  }}
                >
                  {getPlatformIcon(artist.platform)}
                  Show me more
                  <ExternalLink className="h-3.5 w-3.5 ml-1" />
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
