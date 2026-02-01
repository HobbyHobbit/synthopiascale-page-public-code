"use client"

import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#home", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#artists", label: "Artists" },
  { href: "#samplepacks", label: "Releases" },
  { href: "#desktop-player", label: "Desktop Player" },
  { href: "#contact", label: "Contact" },
]

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [isMobileMenuOpen])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 ${isScrolled ? "glass" : "bg-transparent"}`}
      style={{ transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}
      role="banner"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <nav className="flex items-center justify-between" role="navigation" aria-label="Main navigation">
          {/* Logo */}
          <a
            href="#home"
            className="text-lg sm:text-xl font-bold tracking-tight text-foreground"
            style={{ 
              transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              color: "var(--foreground)"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "rgba(212, 175, 55, 0.8)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--foreground)"
            }}
          >
            SynthopiaScale
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground group"
                style={{ transition: "color 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--foreground)"
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = ""
                }}
              >
                {link.label}
                <span
                  className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full"
                  style={{ transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="icon"
              className="text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </nav>

        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pt-4 pb-2 border-t border-border/30 mt-3">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground py-3 px-2 rounded-lg hover:bg-white/5 transition-all duration-300"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
