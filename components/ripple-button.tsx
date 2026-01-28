"use client"

import type React from "react"

import { useState, useRef, type MouseEvent, type ReactNode } from "react"

interface RippleButtonProps {
  children: ReactNode
  href?: string
  onClick?: () => void
  className?: string
  external?: boolean
}

export function RippleButton({ children, href, onClick, className = "", external = false }: RippleButtonProps) {
  const [ripples, setRipples] = useState<Array<{ x: number; y: number; id: number }>>([])
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null)

  const createRipple = (e: MouseEvent) => {
    const button = buttonRef.current
    if (!button) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const id = Date.now()

    setRipples((prev) => [...prev, { x, y, id }])

    setTimeout(() => {
      setRipples((prev) => prev.filter((ripple) => ripple.id !== id))
    }, 600)
  }

  const baseStyles = `
    relative overflow-hidden px-8 py-3 rounded-xl font-medium text-sm uppercase tracking-wider
    transition-all duration-400 
    bg-[rgba(255,255,255,0.08)] backdrop-blur-md
    border border-[rgba(212,175,55,0.2)]
    hover:bg-[rgba(255,255,255,0.12)] hover:border-[rgba(212,175,55,0.45)]
    hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]
    active:scale-[0.98]
  `
  const combinedStyles = `${baseStyles} ${className}`.replace(/\s+/g, " ").trim()

  const rippleElements = ripples.map((ripple) => (
    <span
      key={ripple.id}
      className="absolute rounded-full bg-[rgba(212,175,55,0.3)] pointer-events-none"
      style={{
        left: ripple.x - 10,
        top: ripple.y - 10,
        width: 20,
        height: 20,
        animation: "ripple 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards",
      }}
    />
  ))

  if (href) {
    return (
      <a
        ref={buttonRef as React.RefObject<HTMLAnchorElement>}
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noopener noreferrer" : undefined}
        className={combinedStyles}
        onClick={createRipple as unknown as React.MouseEventHandler<HTMLAnchorElement>}
        style={{ color: "rgba(212, 175, 55, 0.7)" }}
      >
        {rippleElements}
        <span className="relative z-10">{children}</span>
      </a>
    )
  }

  return (
    <button
      ref={buttonRef as React.RefObject<HTMLButtonElement>}
      className={combinedStyles}
      onClick={(e) => {
        createRipple(e)
        onClick?.()
      }}
      style={{ color: "rgba(212, 175, 55, 0.7)" }}
    >
      {rippleElements}
      <span className="relative z-10">{children}</span>
    </button>
  )
}
