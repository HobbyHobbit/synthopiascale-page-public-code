"use client"

import { Play, Pause } from "lucide-react"
import { useAudioPlayer } from "./audio-player-context"

interface AudioPlayerControlsProps {
  trackTitle: string
}

export function AudioPlayerControls({ trackTitle }: AudioPlayerControlsProps) {
  const { isPlaying, currentTime, duration, togglePlay, seek, primaryColor, accentColor } = useAudioPlayer()

  const formatTime = (time: number) => {
    if (!time || !isFinite(time)) return "0:00"
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value)
    seek(time)
  }

  return (
    <div className="w-full space-y-3">
      {/* Player controls row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            togglePlay()
          }}
          onTouchEnd={(e) => {
            e.preventDefault()
            e.stopPropagation()
            togglePlay()
          }}
          type="button"
          className="relative flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 select-none shrink-0"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            boxShadow: isPlaying
              ? `0 0 20px ${primaryColor}40, 0 0 40px ${accentColor}30`
              : `0 4px 12px rgba(0,0,0,0.3)`,
            touchAction: "manipulation",
          }}
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 text-black" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Track title and time */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground/90 truncate">{trackTitle}</p>
          <p className="text-xs text-muted-foreground">
            {formatTime(currentTime)} / {formatTime(duration)}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative w-full h-1.5 group">
        <input
          type="range"
          min={0}
          max={duration || 100}
          value={currentTime}
          onChange={handleSeek}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          style={{ WebkitAppearance: "none" }}
        />
        <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: duration ? `${(currentTime / duration) * 100}%` : "0%",
              background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
              boxShadow: `0 0 8px ${primaryColor}60`,
            }}
          />
        </div>
      </div>
    </div>
  )
}
