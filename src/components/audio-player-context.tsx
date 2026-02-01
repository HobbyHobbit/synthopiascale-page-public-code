"use client"

import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react"

interface AudioPlayerContextType {
  audioRef: React.RefObject<HTMLAudioElement | null>
  analyserRef: React.RefObject<AnalyserNode | null>
  isPlaying: boolean
  currentTime: number
  duration: number
  togglePlay: () => Promise<void>
  seek: (time: number) => void
  primaryColor: string
  accentColor: string
}

const AudioPlayerContext = createContext<AudioPlayerContextType | null>(null)

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext)
  if (!context) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider")
  }
  return context
}

interface AudioPlayerProviderProps {
  children: ReactNode
  audioUrl: string
  primaryColor?: string
  accentColor?: string
  onPlayStateChange?: (isPlaying: boolean) => void
}

export function AudioPlayerProvider({
  children,
  audioUrl,
  primaryColor = "#f7d25a",
  accentColor = "#f0b840",
  onPlayStateChange,
}: AudioPlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  const setupAudio = useCallback(async () => {
    if (!audioRef.current || sourceRef.current) return

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      audioContextRef.current = new AudioContextClass()
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 512
      analyserRef.current.smoothingTimeConstant = 0.85

      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    } catch (error) {
      console.warn("Web Audio API not supported:", error)
    }
  }, [])

  const togglePlay = useCallback(async () => {
    if (!audioRef.current) return

    if (!sourceRef.current) {
      await setupAudio()
    }

    if (audioContextRef.current?.state === "suspended") {
      await audioContextRef.current.resume()
    }

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
      onPlayStateChange?.(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
        onPlayStateChange?.(true)
      } catch (error) {
        console.error("Playback failed:", error)
      }
    }
  }, [isPlaying, onPlayStateChange, setupAudio])

  const seek = useCallback((time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }, [])

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleDurationChange = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleCanPlayThrough = useCallback(() => {
    if (audioRef.current && audioRef.current.duration && isFinite(audioRef.current.duration)) {
      setDuration(audioRef.current.duration)
    }
  }, [])

  const handleEnded = useCallback(() => {
    setIsPlaying(false)
    onPlayStateChange?.(false)
    if (audioRef.current) {
      audioRef.current.currentTime = 0
      setCurrentTime(0)
    }
  }, [onPlayStateChange])

  return (
    <AudioPlayerContext.Provider
      value={{
        audioRef,
        analyserRef,
        isPlaying,
        currentTime,
        duration,
        togglePlay,
        seek,
        primaryColor,
        accentColor,
      }}
    >
      <audio
        ref={audioRef}
        src={audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={handleDurationChange}
        onCanPlayThrough={handleCanPlayThrough}
        onEnded={handleEnded}
        preload="auto"
      />
      {children}
    </AudioPlayerContext.Provider>
  )
}
