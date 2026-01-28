"use client"

/**
 * GlobalPlayerContext - Centralized audio player state management
 * 
 * Provides a single audio instance shared across the application with:
 * - Web Audio API integration for visualizations (AnalyserNode)
 * - Playlist management with shuffle/autoplay
 * - Keyboard shortcuts for playback control
 * - Audio security measures to prevent direct file access
 */

import { createContext, useContext, useState, useRef, useCallback, useEffect, useMemo, ReactNode } from 'react'

interface Track {
  id: number
  title: string
  artist?: string
  src: string
  coverArt?: string
}

interface GlobalPlayerState {
  currentTrack: Track | null
  playlist: Track[]
  currentIndex: number
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  isMuted: boolean
  playbackRate: number
  shuffle: boolean
  autoplay: boolean
}

interface GlobalPlayerContextType {
  state: GlobalPlayerState
  audioRef: React.RefObject<HTMLAudioElement | null>
  analyserRef: React.RefObject<AnalyserNode | null>
  playTrack: (track: Track, playlist?: Track[]) => void
  togglePlay: () => void
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  toggleMute: () => void
  setPlaybackRate: (rate: number) => void
  skip: (seconds: number) => void
  nextTrack: () => void
  prevTrack: () => void
  setShuffle: (shuffle: boolean) => void
  setAutoplay: (autoplay: boolean) => void
}

const GlobalPlayerContext = createContext<GlobalPlayerContextType | null>(null)

const defaultState: GlobalPlayerState = {
  currentTrack: null,
  playlist: [],
  currentIndex: 0,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  isMuted: false,
  playbackRate: 1,
  shuffle: false,
  autoplay: true,
}

const noopRef = { current: null }

export function useGlobalPlayer(): GlobalPlayerContextType {
  const context = useContext(GlobalPlayerContext)
  if (!context) {
    return {
      state: defaultState,
      audioRef: noopRef,
      analyserRef: noopRef,
      playTrack: () => {},
      togglePlay: () => {},
      pause: () => {},
      stop: () => {},
      seek: () => {},
      setVolume: () => {},
      toggleMute: () => {},
      setPlaybackRate: () => {},
      skip: () => {},
      nextTrack: () => {},
      prevTrack: () => {},
      setShuffle: () => {},
      setAutoplay: () => {},
    }
  }
  return context
}

export function GlobalPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const gainNodeRef = useRef<GainNode | null>(null)

  const [state, setState] = useState<GlobalPlayerState>({
    currentTrack: null,
    playlist: [],
    currentIndex: 0,
    isPlaying: false,
    currentTime: 0,
    duration: 0,
    volume: 0.7,
    isMuted: false,
    playbackRate: 1,
    shuffle: false,
    autoplay: true,
  })

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

      analyser.fftSize = 256
      analyser.smoothingTimeConstant = 0.8
      gainNode.gain.value = state.volume

      source.connect(gainNode)
      gainNode.connect(analyser)
      analyser.connect(audioContext.destination)

      audioContextRef.current = audioContext
      analyserRef.current = analyser
      gainNodeRef.current = gainNode
      sourceRef.current = source
    } catch (error) {
      console.warn('Web Audio API setup failed:', error)
    }
  }, [state.volume])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleTimeUpdate = () => {
      setState(prev => ({ ...prev, currentTime: audio.currentTime }))
    }

    const handleLoadedMetadata = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setState(prev => ({ ...prev, duration: audio.duration }))
      }
    }

    const handleEnded = () => {
      setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
    }

    const handleDurationChange = () => {
      if (audio.duration && isFinite(audio.duration)) {
        setState(prev => ({ ...prev, duration: audio.duration }))
      }
    }

    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('durationchange', handleDurationChange)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('durationchange', handleDurationChange)
    }
  }, [])

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement) return
      if (!state.currentTrack) return

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
          setVolume(Math.min(1, state.volume + 0.1))
          break
        case 'ArrowDown':
          e.preventDefault()
          setVolume(Math.max(0, state.volume - 0.1))
          break
        case 'KeyM':
          toggleMute()
          break
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [state.currentTrack, state.volume])

  const playTrack = useCallback(async (track: Track, playlist?: Track[]) => {
    const audio = audioRef.current
    if (!audio) return

    if (state.currentTrack?.id === track.id && state.isPlaying) {
      audio.pause()
      setState(prev => ({ ...prev, isPlaying: false }))
      return
    }

    if (state.currentTrack?.src !== track.src) {
      audio.src = track.src
      audio.load()
    }

    const newPlaylist = playlist || state.playlist
    const newIndex = newPlaylist.findIndex(t => t.id === track.id)
    setState(prev => ({ 
      ...prev, 
      currentTrack: track, 
      currentTime: 0,
      playlist: newPlaylist,
      currentIndex: newIndex >= 0 ? newIndex : 0
    }))

    if (!sourceRef.current) {
      setupWebAudio()
    }

    if (audioContextRef.current?.state === 'suspended') {
      await audioContextRef.current.resume()
    }

    try {
      await audio.play()
      setState(prev => ({ ...prev, isPlaying: true }))
    } catch (error) {
      console.error('Playback failed:', error)
    }
  }, [state.currentTrack, state.isPlaying, state.playlist, setupWebAudio])

  const togglePlay = useCallback(async () => {
    const audio = audioRef.current
    if (!audio || !state.currentTrack) return

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
  }, [state.isPlaying, state.currentTrack])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setState(prev => ({ ...prev, isPlaying: false }))
  }, [])

  const stop = useCallback(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setState(prev => ({ ...prev, currentTrack: null, isPlaying: false, currentTime: 0, duration: 0 }))
  }, [])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(state.duration, time))
    }
  }, [state.duration])

  const setVolume = useCallback((volume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, volume))
    const audio = audioRef.current
    if (audio) audio.volume = clampedVolume
    if (gainNodeRef.current) gainNodeRef.current.gain.value = clampedVolume
    setState(prev => ({ ...prev, volume: clampedVolume, isMuted: false }))
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

  const setPlaybackRate = useCallback((rate: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.playbackRate = rate
      setState(prev => ({ ...prev, playbackRate: rate }))
    }
  }, [])

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current
    if (audio) {
      audio.currentTime = Math.max(0, Math.min(audio.duration || 0, audio.currentTime + seconds))
    }
  }, [])

  const nextTrack = useCallback(async () => {
    if (state.playlist.length === 0) return
    
    let newIndex: number
    if (state.shuffle) {
      newIndex = Math.floor(Math.random() * state.playlist.length)
    } else {
      newIndex = state.currentIndex >= state.playlist.length - 1 ? 0 : state.currentIndex + 1
    }
    
    const nextT = state.playlist[newIndex]
    if (nextT) {
      const audio = audioRef.current
      if (audio) {
        audio.src = nextT.src
        audio.load()
        setState(prev => ({ ...prev, currentTrack: nextT, currentIndex: newIndex, currentTime: 0 }))
        
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        try {
          await audio.play()
          setState(prev => ({ ...prev, isPlaying: true }))
        } catch (error) {
          console.error('Playback failed:', error)
        }
      }
    }
  }, [state.playlist, state.currentIndex, state.shuffle])

  const prevTrack = useCallback(async () => {
    if (state.playlist.length === 0) return
    
    let newIndex: number
    if (state.shuffle) {
      newIndex = Math.floor(Math.random() * state.playlist.length)
    } else {
      newIndex = state.currentIndex <= 0 ? state.playlist.length - 1 : state.currentIndex - 1
    }
    
    const prevT = state.playlist[newIndex]
    if (prevT) {
      const audio = audioRef.current
      if (audio) {
        audio.src = prevT.src
        audio.load()
        setState(prev => ({ ...prev, currentTrack: prevT, currentIndex: newIndex, currentTime: 0 }))
        
        if (audioContextRef.current?.state === 'suspended') {
          await audioContextRef.current.resume()
        }
        
        try {
          await audio.play()
          setState(prev => ({ ...prev, isPlaying: true }))
        } catch (error) {
          console.error('Playback failed:', error)
        }
      }
    }
  }, [state.playlist, state.currentIndex, state.shuffle])

  const setShuffle = useCallback((shuffle: boolean) => {
    setState(prev => ({ ...prev, shuffle }))
  }, [])

  const setAutoplay = useCallback((autoplay: boolean) => {
    setState(prev => ({ ...prev, autoplay }))
  }, [])

  // Auto-play next track when current ends
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    
    const handleEnded = () => {
      if (state.autoplay && state.playlist.length > 0) {
        nextTrack()
      } else {
        setState(prev => ({ ...prev, isPlaying: false, currentTime: 0 }))
      }
    }
    
    audio.addEventListener('ended', handleEnded)
    return () => audio.removeEventListener('ended', handleEnded)
  }, [state.autoplay, state.playlist.length, nextTrack])

  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    audioRef,
    analyserRef,
    playTrack,
    togglePlay,
    pause,
    stop,
    seek,
    setVolume,
    toggleMute,
    setPlaybackRate,
    skip,
    nextTrack,
    prevTrack,
    setShuffle,
    setAutoplay,
  }), [state, playTrack, togglePlay, pause, stop, seek, setVolume, toggleMute, setPlaybackRate, skip, nextTrack, prevTrack, setShuffle, setAutoplay])

  return (
    <GlobalPlayerContext.Provider value={contextValue}>
      {/* Audio element with security attributes to prevent direct access */}
      <audio 
        ref={audioRef} 
        preload="metadata"
        crossOrigin="anonymous"
        controlsList="nodownload noplaybackrate"
        onContextMenu={(e) => e.preventDefault()}
      />
      {children}
    </GlobalPlayerContext.Provider>
  )
}
