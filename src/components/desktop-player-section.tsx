"use client"

import { useEffect, useRef, useState } from "react"
import { Monitor, Heart, Zap, Download } from "lucide-react"
import { RippleButton } from "@/components/ripple-button"

export function DesktopPlayerSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [glassPosition, setGlassPosition] = useState({ x: 50, y: 50 })
  const [scrollPosition, setScrollPosition] = useState({ x: 50, y: 50 })

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
      const card = document.querySelector('[data-player-card]')
      if (!card) return
      
      const rect = card.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width) * 100
      const y = ((e.clientY - rect.top) / rect.height) * 100
      
      if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
        setGlassPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
      }
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const x = 50 + Math.sin(scrollY * 0.001) * 30
      const y = 50 + Math.cos(scrollY * 0.001) * 30
      setScrollPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="desktop-player" ref={sectionRef} className="relative py-20 md:py-32 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-16">
          <h2
            className={`text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Desktop <span className="text-primary">Player</span>
          </h2>
          <p
            className={`text-muted-foreground max-w-2xl mx-auto ${
              isVisible ? "animate-fade-in-up stagger-1" : "opacity-0"
            }`}
          >
            Your music. Your control. No bullshit.
          </p>
        </div>

        <div
          data-player-card
          className={`relative group rounded-3xl p-8 md:p-12 transition-all duration-400 overflow-hidden max-w-4xl mx-auto ${
            isVisible ? "animate-fade-in-up stagger-2" : "opacity-0"
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
            e.currentTarget.style.boxShadow =
              "0 20px 50px 0 rgba(0, 0, 0, 0.3), 0 0 40px rgba(212, 175, 55, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.3), 0 0 0 1px rgba(212, 175, 55, 0.3)"
            e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.4)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.boxShadow =
              "0 8px 32px 0 rgba(0, 0, 0, 0.2), inset 0 1px 0 0 rgba(255, 255, 255, 0.2)"
            e.currentTarget.style.borderColor = "rgba(212, 175, 55, 0.3)"
          }}
        >
          {/* Glass Light Reflection Effect */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none hidden md:block"
            style={{
              background: `radial-gradient(circle 400px at ${glassPosition.x}% ${glassPosition.y}%, 
                rgba(255, 255, 255, 0.25) 0%, 
                rgba(255, 255, 255, 0.12) 20%, 
                rgba(255, 255, 255, 0.06) 40%, 
                transparent 70%)`,
              mixBlendMode: "overlay",
            }}
          />
          
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none hidden md:block"
            style={{
              background: `radial-gradient(circle 250px at ${100 - glassPosition.x}% ${100 - glassPosition.y}%, 
                rgba(212, 175, 55, 0.2) 0%, 
                rgba(212, 175, 55, 0.1) 30%, 
                transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />

          {/* Mobile scroll-based reflection */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none md:hidden"
            style={{
              background: `radial-gradient(circle 300px at ${scrollPosition.x}% ${scrollPosition.y}%, 
                rgba(255, 255, 255, 0.2) 0%, 
                rgba(255, 255, 255, 0.1) 20%, 
                transparent 60%)`,
              mixBlendMode: "overlay",
            }}
          />
          
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
            {/* Icon badge */}
            <div className="absolute top-0 right-0 p-2 rounded-lg bg-primary/10 text-primary">
              <Monitor className="h-6 w-6" />
            </div>

            {/* Main title */}
            <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4 pr-12">
              SynthopiaScale Desktop Player – <span className="text-primary">Music First, No Bullshit</span>
            </h3>

            <p className="text-muted-foreground leading-relaxed mb-6">
              For artists, DJs, and listeners fed up with cluttered interfaces and dark UX patterns. No subscriptions, no upsells, no mandatory accounts – just your music.
            </p>

            {/* Feature grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* Pay What You Want */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">From €0.99 – PWYW</h4>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Community support, not paywalls. Full version, no limitations. Pay more to fund new features.
                </p>
              </div>

              {/* Anti-Frustration */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">Built for Musicians</h4>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Library, playlists, sound – no feeds, no social noise. Precise control for reference listening. Tools by artists, for artists.
                </p>
              </div>

              {/* How to Get */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Download className="h-4 w-4 text-primary" />
                  </div>
                  <h4 className="text-base font-semibold text-foreground">Windows Download</h4>
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Pick your price, get the installer, start immediately. No account needed. Curated updates over feature bloat.
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="mt-8 flex justify-center">
              <RippleButton
                href="https://sebsizz.gumroad.com/l/qhivlx"
                external
                className="px-10 py-4 text-lg font-semibold"
              >
                Get the Desktop Player
              </RippleButton>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
