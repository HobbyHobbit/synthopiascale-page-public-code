"use client"

import { useRef, useState, useCallback } from 'react'

interface StemData {
  vocals: number[]
  drums: number[]
  bass: number[]
  other: number[]
}

interface StemSeparationState {
  stems: StemData
  loading: boolean
  error: string | null
  analyzed: boolean
}

interface FrequencyRanges {
  bass: { min: number; max: number }
  drums: { min: number; max: number }
  vocals: { min: number; max: number }
  other: { min: number; max: number }
}

const DEFAULT_FREQUENCY_RANGES: FrequencyRanges = {
  bass: { min: 0, max: 250 },
  drums: { min: 250, max: 2000 },
  vocals: { min: 2000, max: 8000 },
  other: { min: 8000, max: 20000 },
}

export const useStemSeparation = (frequencyRanges = DEFAULT_FREQUENCY_RANGES) => {
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  
  const [state, setState] = useState<StemSeparationState>({
    stems: { vocals: [], drums: [], bass: [], other: [] },
    loading: false,
    error: null,
    analyzed: false,
  })

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || 
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      audioContextRef.current = new AudioContextClass()
    }
    return audioContextRef.current
  }, [])

  const analyzeStemFrequencies = useCallback(
    async (audioBuffer: AudioBuffer) => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const audioContext = getAudioContext()
        
        const analyser = audioContext.createAnalyser()
        analyser.fftSize = 4096
        analyserRef.current = analyser

        const source = audioContext.createBufferSource()
        source.buffer = audioBuffer
        source.connect(analyser)

        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        const nyquist = audioContext.sampleRate / 2
        const hertzPerBin = nyquist / bufferLength

        const stems: StemData = {
          vocals: [],
          drums: [],
          bass: [],
          other: [],
        }

        // Analyze frequency data
        analyser.getByteFrequencyData(dataArray)

        for (let i = 0; i < bufferLength; i++) {
          const hz = i * hertzPerBin
          const value = dataArray[i] ?? 0

          if (hz >= frequencyRanges.bass.min && hz < frequencyRanges.bass.max) {
            stems.bass.push(value)
          } else if (hz >= frequencyRanges.drums.min && hz < frequencyRanges.drums.max) {
            stems.drums.push(value)
          } else if (hz >= frequencyRanges.vocals.min && hz < frequencyRanges.vocals.max) {
            stems.vocals.push(value)
          } else if (hz >= frequencyRanges.other.min) {
            stems.other.push(value)
          }
        }

        setState({
          stems,
          loading: false,
          error: null,
          analyzed: true,
        })

        return stems
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during analysis'
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
        return null
      }
    },
    [getAudioContext, frequencyRanges]
  )

  const analyzeFromUrl = useCallback(
    async (audioUrl: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }))

      try {
        const audioContext = getAudioContext()
        
        const response = await fetch(audioUrl)
        if (!response.ok) {
          throw new Error(`Failed to fetch audio: ${response.statusText}`)
        }
        
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
        
        return await analyzeStemFrequencies(audioBuffer)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load audio'
        setState(prev => ({
          ...prev,
          error: errorMessage,
          loading: false,
        }))
        return null
      }
    },
    [getAudioContext, analyzeStemFrequencies]
  )

  const getAverageEnergy = useCallback((stemData: number[]): number => {
    if (stemData.length === 0) return 0
    const sum = stemData.reduce((acc, val) => acc + val, 0)
    return sum / stemData.length / 255 // Normalize to 0-1
  }, [])

  const getStemEnergyLevels = useCallback(() => {
    return {
      bass: getAverageEnergy(state.stems.bass),
      drums: getAverageEnergy(state.stems.drums),
      vocals: getAverageEnergy(state.stems.vocals),
      other: getAverageEnergy(state.stems.other),
    }
  }, [state.stems, getAverageEnergy])

  const reset = useCallback(() => {
    setState({
      stems: { vocals: [], drums: [], bass: [], other: [] },
      loading: false,
      error: null,
      analyzed: false,
    })
  }, [])

  const cleanup = useCallback(() => {
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
    analyserRef.current = null
    reset()
  }, [reset])

  return {
    ...state,
    analyserRef,
    analyzeStemFrequencies,
    analyzeFromUrl,
    getStemEnergyLevels,
    reset,
    cleanup,
  }
}
