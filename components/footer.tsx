"use client"

import { useGlobalPlayer } from './GlobalPlayerContext'

export function Footer() {
  const { state } = useGlobalPlayer()
  const hasActivePlayer = state.currentTrack !== null
  
  return (
    <footer
      className="relative py-10 sm:py-12 px-4 sm:px-6 transition-all duration-300"
      style={{
        background: "rgba(255, 255, 255, 0.04)",
        borderTop: "1px solid rgba(212, 175, 55, 0.15)",
        paddingBottom: hasActivePlayer ? '6rem' : '3rem', // 96px when player active, 48px otherwise
      }}
      role="contentinfo"
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p
              className="text-lg sm:text-xl font-bold text-foreground mb-1"
              style={{
                background: "linear-gradient(90deg, #e8eaed 0%, rgba(212, 175, 55, 0.7) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              SynthopiaScale Records
            </p>
            <p className="text-sm text-muted-foreground">Independent Electronic Arts & Sound</p>
          </div>

          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} SynthopiaScale Records. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Artist-run platform for the underground music community.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
