"use client"

import { useEffect, useRef, useCallback } from 'react'

interface ScrollOptions {
  throttle?: number
  debounce?: number
  passive?: boolean
}

export function useOptimizedScroll(
  callback: (scrollY: number) => void,
  options: ScrollOptions = {}
) {
  const { throttle = 16, debounce = 0, passive = true } = options
  const lastScrollY = useRef(0)
  const ticking = useRef(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const optimizedCallback = useCallback((scrollY: number) => {
    if (debounce > 0) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = setTimeout(() => {
        callback(scrollY)
        lastScrollY.current = scrollY
      }, debounce)
    } else {
      callback(scrollY)
      lastScrollY.current = scrollY
    }
  }, [callback, debounce])

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY

      if (throttle > 0 && !ticking.current) {
        requestAnimationFrame(() => {
          optimizedCallback(scrollY)
          ticking.current = false
        })
        ticking.current = true
      } else if (throttle === 0) {
        optimizedCallback(scrollY)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive })
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [optimizedCallback, throttle, passive])

  return {
    currentScroll: lastScrollY.current
  }
}
