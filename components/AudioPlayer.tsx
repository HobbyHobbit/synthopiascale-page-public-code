"use client"

import React, { useRef, useEffect, useState, useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from 'lucide-react'

interface AudioPlayerProps {
  src: string
  title?: string
  artist?: string
  coverArt?: string
  primaryColor?: string
  accentColor?: string
  onEnded?: () => void
  onPlayStateChange?: (isPlaying: boolean) => void
}

interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isMuted: boolean
  bufferedPercentage: number
}

export function AudioPlayer({
  src,
  title,
  artist,
  coverArt,
  primaryColor = '#f7d25a',
  accentColor = '#f0b840',
  onEnded,
  onPlayStateChange,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  const [state, setState] = useState<AudioPlayerState>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('synthopia_player_state')
        if (saved) {
          const parsed = JSON.parse(saved)
          return {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            volume: parsed.volume ?? 1,
            playbackRate: parsed.playbackRate ?? 1,
            isMuted: parsed.isMuted ?? false,
            bufferedPercentage: 0,
          }
        }
      } catch {
        // Ignore parse errors
      }
    }
    return {
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 1,
      playbackRate: 1,
      isMuted: false,
      bufferedPercentage: 0,
    }
  })

  // Setup Web Audio API
  const setupWebAudio = useCallback(() => {
    const audio = audioRef.current
    if (!audio || sourceRef.current) return

    try {
      const AudioContextClass = window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      if (!AudioContextClass) return

      const audioContext = new AudioContextClass()
      const source = audioContext.createMediaElementSource(audio)
      const analyser = audioContext.createAnalyser()

      analyser.fftSize = 512
      analyser.smoothingTimeConstant = 0.85

      source.connect(analyser)
      analyser.connect(audioContext.destination)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      sourceRef.current = source
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }, [])

  // Waveform drawing
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const BAR_COUNT = 48

    const draw = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)

      ctx.clearRect(0, 0, rect.width, rect.height)

      let dataArray: Uint8Array<ArrayBuffer>
      if (analyserRef.current && state.isPlaying) {
        dataArray = new Uint8Array(analyserRef.current.frequencyBinCount) as Uint8Array<ArrayBuffer>
        analyserRef.current.getByteFrequencyData(dataArray)
      } else {
        dataArray = new Uint8Array(BAR_COUNT).fill(0) as Uint8Array<ArrayBuffer>
      }

      const barWidth = rect.width / BAR_COUNT - 2
      const maxBarHeight = rect.height - 4

      const gradient = ctx.createLinearGradient(0, rect.height, 0, 0)
      gradient.addColorStop(0, primaryColor)
      gradient.addColorStop(0.5, accentColor)
      gradient.addColorStop(1, primaryColor)

      for (let i = 0; i < BAR_COUNT; i++) {
        const binIndex = Math.floor((i / BAR_COUNT) * (dataArray.length * 0.7))
        const value = dataArray[binIndex] || 0
        const barHeight = Math.max(2, (value / 255) * maxBarHeight)

        const x = i * (barWidth + 2) + 1
        const y = rect.height - barHeight

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.roundRect(x, y, barWidth, barHeight, [barWidth / 2, barWidth / 2, 0, 0])
        ctx.fill()
      }

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [state.isPlaying, primaryColor, accentColor])

  // Audio event handlers
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setState(prev => ({ ...prev, duration: audio.duration }))
      }
    }

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }))
    }

    const handleProgress = () => {
      if (audio.buffered.length > 0) {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1)
        const buffered = (bufferedEnd / audio.duration) * 100
        setState(prev => ({ ...prev, bufferedPercentage: buffered }))
      }
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
      audio.currentTime = 0
      onEnded?.()
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('progress', handleProgress)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('progress', handleProgress)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [onEnded])

  // Persist state
  useEffect(() => {
    if (typeof window === 'undefined') return
    const playerState = {
      volume: state.volume,
      playbackRate: state.playbackRate,
      isMuted: state.isMuted,
    }
    localStorage.setItem('synthopia_player_state', JSON.stringify(playerState))
  }, [state.volume, state.playbackRate, state.isMuted])

  const togglePlay = async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!sourceRef.current) {
      setupWebAudio()
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    if (state.isPlaying) {
      audio.pause()
      setState(prev => ({ ...prev, isPlaying: false }))
      onPlayStateChange?.(false)
    } else {
      try {
        await audio.play()
        setState(prev => ({ ...prev, isPlaying: true }))
        onPlayStateChange?.(true)
      } catch (error) {
        console.error('Playback failed:', error)
      }
    }
  }

  const skip = (seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds))
    }
  }

  const seek = (time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, time))
    }
  }

  const setVolume = (volume: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = volume
      setState(prev => ({ ...prev, volume, isMuted: false }))
    }
  }

  const toggleMute = () => {
    const audio = audioRef.current
    if (audio) {
      const newMuted = !state.isMuted
      audio.muted = newMuted
      setState(prev => ({ ...prev, isMuted: newMuted }))
    }
  }

  const setPlaybackRate = (rate: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = rate
      setState(prev => ({ ...prev, playbackRate: rate }))
    }
  }

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full space-y-3 bg-black/20 backdrop-blur-sm rounded-xl p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        crossOrigin="anonymous"
      />

      {/* Metadata Section */}
      {(coverArt || title || artist) && (
        <div className="flex items-center gap-3 mb-3">
          {coverArt && (
            <img
              src={coverArt}
              alt={title || 'Cover art'}
              className="w-12 h-12 rounded-lg object-cover"
            />
          )}
          <div className="flex-1 min-w-0">
            {title && <h4 className="text-sm font-medium text-white truncate">{title}</h4>}
            {artist && <p className="text-xs text-white/60 truncate">{artist}</p>}
          </div>
        </div>
      )}

      {/* Waveform Visualization */}
      <canvas
        ref={canvasRef}
        className="w-full rounded-lg"
        style={{ height: '50px', background: 'transparent' }}
      />

      {/* Progress Bar with Click-to-Seek */}
      <div className="relative w-full h-2 group cursor-pointer">
        <div
          className="absolute inset-0 w-full h-full"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            const percent = (e.clientX - rect.left) / rect.width
            seek(percent * state.duration)
          }}
        />
        <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden pointer-events-none">
          {/* Buffered indicator */}
          <div
            className="absolute h-full bg-white/20 rounded-full"
            style={{ width: `${state.bufferedPercentage}%` }}
          />
          {/* Progress */}
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: state.duration ? `${(state.currentTime / state.duration) * 100}%` : '0%',
              background: `linear-gradient(90deg, ${primaryColor}, ${accentColor})`,
              boxShadow: `0 0 8px ${primaryColor}60`,
            }}
          />
        </div>
      </div>

      {/* Time Display */}
      <div className="flex justify-between text-xs text-white/60">
        <span>{formatTime(state.currentTime)}</span>
        <span>{formatTime(state.duration)}</span>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-2">
        {/* Skip Back */}
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          onClick={() => skip(-10)}
          aria-label="Skip back 10 seconds"
          title="Skip -10s (←)"
        >
          <SkipBack className="w-5 h-5" />
        </button>

        {/* Play/Pause */}
        <button
          className="flex items-center justify-center w-12 h-12 rounded-full transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})`,
            boxShadow: state.isPlaying
              ? `0 0 20px ${primaryColor}40, 0 0 40px ${accentColor}30`
              : `0 4px 12px rgba(0,0,0,0.3)`,
          }}
          onClick={togglePlay}
          aria-label={state.isPlaying ? 'Pause' : 'Play'}
          title={`${state.isPlaying ? 'Pause' : 'Play'} (Space)`}
        >
          {state.isPlaying ? (
            <Pause className="w-5 h-5 text-black" fill="currentColor" />
          ) : (
            <Play className="w-5 h-5 text-black ml-0.5" fill="currentColor" />
          )}
        </button>

        {/* Skip Forward */}
        <button
          className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
          onClick={() => skip(10)}
          aria-label="Skip forward 10 seconds"
          title="Skip +10s (→)"
        >
          <SkipForward className="w-5 h-5" />
        </button>

        {/* Volume Control */}
        <div className="flex items-center gap-2 ml-2">
          <button
            className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/80 hover:text-white"
            onClick={toggleMute}
            aria-label={state.isMuted ? 'Unmute' : 'Mute'}
          >
            {state.isMuted ? (
              <VolumeX className="w-5 h-5" />
            ) : (
              <Volume2 className="w-5 h-5" />
            )}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={state.isMuted ? 0 : state.volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer
                       [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 
                       [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full 
                       [&::-webkit-slider-thumb]:bg-white"
            aria-label="Volume"
          />
        </div>

        {/* Playback Speed */}
        <select
          value={state.playbackRate}
          onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
          className="bg-white/10 text-white text-xs rounded px-2 py-1 border-none outline-none cursor-pointer"
          aria-label="Playback speed"
        >
          <option value={0.5}>0.5x</option>
          <option value={0.75}>0.75x</option>
          <option value={1}>1x</option>
          <option value={1.25}>1.25x</option>
          <option value={1.5}>1.5x</option>
          <option value={2}>2x</option>
        </select>
      </div>
    </div>
  )
}
