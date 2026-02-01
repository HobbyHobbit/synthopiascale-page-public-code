"use client"

import { useEffect, useState } from "react"

export function CursorGlow() {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY })
      setIsVisible(true)
    }

    const handleMouseLeave = () => {
      setIsVisible(false)
    }

    window.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      className="fixed pointer-events-none z-50 transition-opacity duration-300"
      style={{
        left: position.x - 25,
        top: position.y - 25,
        width: 50,
        height: 50,
        background:
          "radial-gradient(circle, rgba(220, 225, 230, 0.15) 0%, rgba(212, 175, 55, 0.05) 40%, transparent 70%)",
        borderRadius: "50%",
        opacity: isVisible ? 1 : 0,
        transform: "translate3d(0, 0, 0)",
      }}
    />
  )
}
