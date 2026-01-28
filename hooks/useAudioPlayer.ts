"use client"

import { useEffect, useRef, useState, useCallback } from 'react'

interface AudioPlayerState {
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  playbackRate: number
  isMuted: boolean
  bufferedPercentage: number
}

interface UseAudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement | null>
  analyserRef: React.RefObject<AnalyserNode | null>
  state: AudioPlayerState
  togglePlay: () => Promise<void>
  skip: (seconds: number) => void
  seek: (time: number) => void
  adjustVolume: (delta: number) => void
  setVolume: (volume: number) => void
  setPlaybackRate: (rate: number) => void
  toggleMute: () => void
}

export const useAudioPlayer = (audioSrc?: string): UseAudioPlayerReturn => {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  const [state, setState] = useState<AudioPlayerState>(() => {
    // Load persisted state from localStorage
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

  // Web Audio API Setup
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
      const gainNode = audioContext.createGain()

      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.85
      gainNode.gain.value = state.isMuted ? 0 : state.volume

      source.connect(gainNode)
      gainNode.connect(analyser)
      analyser.connect(audioContext.destination)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      gainNodeRef.current = gainNode
      sourceRef.current = source
    } catch (error) {
      console.warn('Web Audio API not supported:', error)
    }
  }, [state.volume, state.isMuted])

  // Event Listeners
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
    }

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setState(prev => ({ ...prev, duration: audio.duration }))
      }
    }

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('progress', handleProgress)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('durationchange', handleDurationChange)

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('progress', handleProgress)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('durationchange', handleDurationChange)
    }
  }, [])

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't interfere with input fields
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement ||
          e.target instanceof HTMLSelectElement) {
        return
      }

      switch (e.code) {
        case 'Space':
          e.preventDefault()
          togglePlay()
          break
        case 'ArrowLeft':
          skip(-10)
          break
        case 'ArrowRight':
          skip(10)
          break
        case 'ArrowUp':
          e.preventDefault()
          adjustVolume(0.1)
          break
        case 'ArrowDown':
          e.preventDefault()
          adjustVolume(-0.1)
          break
        case 'KeyM':
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return

    if (!sourceRef.current) {
      setupWebAudio()
    }

    // Resume Web Audio Context if suspended (iOS requirement)
    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    if (state.isPlaying) {
      audio.pause()
      setState(prev => ({ ...prev, isPlaying: false }))
    } else {
      try {
        await audio.play()
        setState(prev => ({ ...prev, isPlaying: true }))
      } catch (error) {
        console.error('Playback failed:', error)
      }
    }
  }, [state.isPlaying, setupWebAudio])

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds))
    }
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, time))
    }
  }, [])

  const adjustVolume = useCallback((delta: number) => {
    setState(prev => {
      const newVolume = Math.max(0, Math.min(1, prev.volume + delta))
      const audio = audioRef.current
      if (audio) audio.volume = newVolume
      if (gainNodeRef.current) gainNodeRef.current.gain.value = newVolume
      return { ...prev, volume: newVolume, isMuted: false }
    })
  }, [])

  const setVolume = useCallback((volume: number) => {
    const newVolume = Math.max(0, Math.min(1, volume))
    const audio = audioRef.current
    if (audio) audio.volume = newVolume
    if (gainNodeRef.current) gainNodeRef.current.gain.value = newVolume
    setState(prev => ({ ...prev, volume: newVolume, isMuted: false }))
  }, [])

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = rate
      setState(prev => ({ ...prev, playbackRate: rate }))
    }
  }, [])

  const toggleMute = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    setState(prev => {
      const newMuted = !prev.isMuted
      audio.muted = newMuted
      if (gainNodeRef.current) {
        gainNodeRef.current.gain.value = newMuted ? 0 : prev.volume
      }
      return { ...prev, isMuted: newMuted }
    })
  }, [])

  // Persist Player State in localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const playerState = {
      volume: state.volume,
      playbackRate: state.playbackRate,
      isMuted: state.isMuted,
    }
    localStorage.setItem('synthopia_player_state', JSON.stringify(playerState))
  }, [state.volume, state.playbackRate, state.isMuted])

  // Sync audio element volume with state
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.volume = state.isMuted ? 0 : state.volume
      audio.playbackRate = state.playbackRate
    }
  }, [state.volume, state.isMuted, state.playbackRate])

  return {
    audioRef,
    analyserRef,
    state,
    togglePlay,
    skip,
    seek,
    adjustVolume,
    setVolume,
    setPlaybackRate,
    toggleMute,
  }
}
