"use client"

import { useEffect } from "react"
import { reportWebVitals, getRating } from "@/lib/performance-monitoring"

export function WebVitals() {
  useEffect(() => {
    const observers: PerformanceObserver[] = []

    if (!('PerformanceObserver' in window)) {
      return
    }

    // LCP Observer
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        if (lastEntry) {
          const value = lastEntry.startTime
          reportWebVitals({
            name: 'LCP',
            value,
            rating: getRating('LCP', value),
            delta: value,
            id: `lcp-${Date.now()}`,
            navigationType: 'navigate',
          })
        }
      })
      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })
      observers.push(lcpObserver)
    } catch (e) {
      // LCP not supported
    }

    // FID Observer
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const fidEntry = entry as PerformanceEventTiming
          const value = fidEntry.processingStart - fidEntry.startTime
          reportWebVitals({
            name: 'FID',
            value,
            rating: getRating('FID', value),
            delta: value,
            id: `fid-${Date.now()}`,
            navigationType: 'navigate',
          })
        })
      })
      fidObserver.observe({ type: 'first-input', buffered: true })
      observers.push(fidObserver)
    } catch (e) {
      // FID not supported
    }

    // CLS Observer
    let clsValue = 0
    try {
      const clsObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & { value: number; hadRecentInput: boolean }
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value
          }
        }
        reportWebVitals({
          name: 'CLS',
          value: clsValue,
          rating: getRating('CLS', clsValue),
          delta: clsValue,
          id: `cls-${Date.now()}`,
          navigationType: 'navigate',
        })
      })
      clsObserver.observe({ type: 'layout-shift', buffered: true })
      observers.push(clsObserver)
    } catch (e) {
      // CLS not supported
    }

    // TTFB from Navigation Timing
    try {
      const navObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          const navEntry = entry as PerformanceNavigationTiming
          const value = navEntry.responseStart - navEntry.requestStart
          if (value > 0) {
            reportWebVitals({
              name: 'TTFB',
              value,
              rating: getRating('TTFB', value),
              delta: value,
              id: `ttfb-${Date.now()}`,
              navigationType: navEntry.type || 'navigate',
            })
          }
        })
      })
      navObserver.observe({ type: 'navigation', buffered: true })
      observers.push(navObserver)
    } catch (e) {
      // Navigation timing not supported
    }

    // FCP Observer
    try {
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        entries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            const value = entry.startTime
            reportWebVitals({
              name: 'FCP',
              value,
              rating: getRating('FCP', value),
              delta: value,
              id: `fcp-${Date.now()}`,
              navigationType: 'navigate',
            })
          }
        })
      })
      fcpObserver.observe({ type: 'paint', buffered: true })
      observers.push(fcpObserver)
    } catch (e) {
      // FCP not supported
    }

    return () => {
      observers.forEach(observer => observer.disconnect())
    }
  }, [])

  return null
}

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: unknown[]) => void
  }
}
