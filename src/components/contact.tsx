"use client"

import { useEffect, useRef, useState } from "react"
import { Mail } from "lucide-react"

export function Contact() {
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
      const contactCard = document.querySelector('[data-contact-card]')
      if (contactCard) {
        const rect = contactCard.getBoundingClientRect()
        const x = ((e.clientX - rect.left) / rect.width) * 100
        const y = ((e.clientY - rect.top) / rect.height) * 100
        
        if (x >= 0 && x <= 100 && y >= 0 && y <= 100) {
          setGlassPosition({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) })
        }
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

    window.addEventListener("scroll", handleScroll)
    handleScroll() // Initial call
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <section id="contact" ref={sectionRef} className="relative py-16 md:py-32 px-4 sm:px-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="text-center mb-12">
          <h2
            className={`text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4 ${
              isVisible ? "animate-fade-in-up" : "opacity-0"
            }`}
          >
            Get in <span className="text-primary">Touch</span>
          </h2>
          <p
            className={`text-muted-foreground max-w-2xl mx-auto ${
              isVisible ? "animate-fade-in-up stagger-1" : "opacity-0"
            }`}
          >
            Interested in joining our collective or collaborating? We&apos;d love to hear from you.
          </p>
        </div>

        <div
          data-contact-card
          className={`rounded-3xl p-8 md:p-12 max-w-xl mx-auto text-center transition-all duration-400 relative overflow-hidden ${
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
        >
          {/* Glass Light Reflection Effect */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none"
            style={{
              background: `radial-gradient(circle 300px at ${glassPosition.x}% ${glassPosition.y}%, 
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
              background: `radial-gradient(circle 200px at ${100 - glassPosition.x}% ${100 - glassPosition.y}%, 
                rgba(212, 175, 55, 0.2) 0%, 
                rgba(212, 175, 55, 0.1) 30%, 
                transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />
          
          {/* Scroll-based effect for mobile */}
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none md:hidden"
            style={{
              background: `radial-gradient(circle 250px at ${scrollPosition.x}% ${scrollPosition.y}%, 
                rgba(255, 255, 255, 0.2) 0%, 
                rgba(255, 255, 255, 0.1) 20%, 
                rgba(255, 255, 255, 0.05) 40%, 
                transparent 70%)`,
              mixBlendMode: "overlay",
            }}
          />
          
          <div 
            className="absolute inset-0 rounded-3xl pointer-events-none md:hidden"
            style={{
              background: `radial-gradient(circle 150px at ${100 - scrollPosition.x}% ${100 - scrollPosition.y}%, 
                rgba(212, 175, 55, 0.15) 0%, 
                rgba(212, 175, 55, 0.08) 30%, 
                transparent 60%)`,
              mixBlendMode: "screen",
            }}
          />
          
          {/* Glass Edge Highlights */}
          <div className="absolute inset-0 rounded-3xl pointer-events-none">
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
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center mx-auto mb-6">
              <Mail className="h-6 w-6 text-primary" />
            </div>

            <h3 className="text-xl font-semibold text-foreground mb-4">Get in Touch</h3>
            <p className="text-muted-foreground mb-6">For demos, collaborations, or general inquiries</p>

            <a
              href="mailto:info.sebastian.rau@web.de"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass gold-text font-medium hover:bg-primary/15 transition-all duration-300"
            >
              Contact SynthopiaScale Records
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
