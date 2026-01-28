"use client"

import { useEffect, useRef, useState } from "react"
import { Shield, Gem, Users } from "lucide-react"

const aboutCards = [
  {
    icon: Shield,
    title: "Autonomy & Respect",
    description:
      "Every artist maintains full creative control. We believe in supporting vision, not shaping it. Your art, your rules.",
  },
  {
    icon: Gem,
    title: "Quality over Quantity",
    description:
      "We focus on curated releases that matter. Each release receives full attention and support from our collective.",
  },
  {
    icon: Users,
    title: "Collaboration",
    description:
      "A shared infrastructure where artists support each other. Knowledge sharing, cross-promotion, and community growth.",
  },
]

export function About() {
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
      { threshold: 0.2 },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll('[data-about-id]')
      cards.forEach((card) => {
        const aboutId = parseInt(card.getAttribute('data-about-id') || '0')
        const rect = card.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          setGlassPositions(prev => ({
            ...prev,
            [aboutId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
          }))
        }
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const cards = document.querySelectorAll('[data-about-id]')
      const scrollY = window.scrollY
      
      cards.forEach((card, index) => {
        const aboutId = parseInt(card.getAttribute('data-about-id') || '0')
        
        // Calculate position based on scroll
        const x = 50 + Math.sin(scrollY * 0.001 + index) * 30
        const y = 50 + Math.cos(scrollY * 0.001 + index) * 30
        
        setScrollPositions(prev => ({
          ...prev,
          [aboutId]: { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) }
        }))
      })
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="about" ref={sectionRef} className="relative py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Our <span className="text-primary">Philosophy</span>
          </h2>
          <p
            className={`text-muted-foreground max-w-2xl mx-auto ${
              isVisible ? "animate-fade-in-up stagger-1" : "opacity-0"
            }`}
          >
            Independent music deserves independent infrastructure. We&apos;re building a platform that puts artists
            first.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {aboutCards.map((card, index) => (
            <div
              key={card.title}
              data-about-id={index}
              className={`relative group rounded-3xl p-8 transition-all duration-400 overflow-hidden ${
                isVisible ? `animate-fade-in-up stagger-${index + 2}` : "opacity-0"
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
                          : `${scrollPositions[index]?.x ?? 50}% ${scrollPositions[index]?.y ?? 50}%`
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
                          : `${100 - (scrollPositions[index]?.x ?? 50)}% ${100 - (scrollPositions[index]?.y ?? 50)}%`
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
                <div className="absolute top-4 right-4 p-2 rounded-lg bg-primary/10 text-primary">
                  <card.icon className="h-5 w-5" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
