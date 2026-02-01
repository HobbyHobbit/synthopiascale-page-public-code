"use client"

import { useEffect, useRef } from 'react'

interface PerformanceMetrics {
  fcp: number | null
  lcp: number | null
  fid: number | null
  cls: number | null
  ttfb: number | null
}

export function PerformanceMonitor() {
  const metricsRef = useRef<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null
  })

  useEffect(() => {
    const measurePerformance = () => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
      
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.requestStart
        metricsRef.current.ttfb = ttfb
        
        console.log(`[Performance] TTFB: ${ttfb}ms`)
        
        // Send to analytics
        if (window.gtag) {
          window.gtag('event', 'ttfb', {
            event_category: 'Performance',
            value: Math.round(ttfb),
            non_interaction: true
          })
        }
      }
    }

    const measureLCP = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (lastEntry) {
          const lcp = lastEntry.startTime
          metricsRef.current.lcp = lcp
          
          console.log(`[Performance] LCP: ${lcp}ms`)
          
          if (window.gtag) {
            window.gtag('event', 'lcp', {
              event_category: 'Performance',
              value: Math.round(lcp),
              non_interaction: true
            })
          }
        }
      })
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] })
      return observer
    }

    const measureFID = () => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry: any) => {
          if (entry.processingStart && entry.startTime) {
            const fid = entry.processingStart - entry.startTime
            metricsRef.current.fid = fid
            
            console.log(`[Performance] FID: ${fid}ms`)
            
            if (window.gtag) {
              window.gtag('event', 'fid', {
                event_category: 'Performance',
                value: Math.round(fid),
                non_interaction: true
              })
            }
          }
        })
      })
      
      observer.observe({ entryTypes: ['first-input'] })
      return observer
    }

    const measureCLS = () => {
      let clsValue = 0
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
          }
        })
        
        metricsRef.current.cls = clsValue
        console.log(`[Performance] CLS: ${clsValue}`)
        
        if (window.gtag) {
          window.gtag('event', 'cls', {
            event_category: 'Performance',
            value: Math.round(clsValue * 1000),
            non_interaction: true
          })
        }
      })
      
      observer.observe({ entryTypes: ['layout-shift'] })
      return observer
    }

    const measureMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory
        const usedMemory = memory.usedJSHeapSize / 1048576 // Convert to MB
        const totalMemory = memory.totalJSHeapSize / 1048576
        const memoryLimit = memory.jsHeapSizeLimit / 1048576
        
        console.log(`[Memory] Used: ${usedMemory.toFixed(2)}MB, Total: ${totalMemory.toFixed(2)}MB, Limit: ${memoryLimit.toFixed(2)}MB`)
        
        if (window.gtag) {
          window.gtag('event', 'memory_usage', {
            event_category: 'Performance',
            value: Math.round(usedMemory),
            non_interaction: true
          })
        }
      }
    }

    // Run measurements
    measurePerformance()
    
    const lcpObserver = measureLCP()
    const fidObserver = measureFID()
    const clsObserver = measureCLS()
    
    // Monitor memory usage every 30 seconds
    const memoryInterval = setInterval(measureMemoryUsage, 30000)
    
    // Cleanup
    return () => {
      lcpObserver?.disconnect()
      fidObserver?.disconnect()
      clsObserver?.disconnect()
      clearInterval(memoryInterval)
    }
  }, [])

  return null
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}
