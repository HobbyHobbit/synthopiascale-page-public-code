interface WebVitalMetric {
  name: string
  value: number
  rating: 'good' | 'needs-improvement' | 'poor'
  delta: number
  id: string
  navigationType: string
}

interface PerformanceData {
  metrics: WebVitalMetric[]
  timestamp: string
  url: string
  userAgent: string
}

const metricsBuffer: WebVitalMetric[] = []

export const reportWebVitals = (metric: WebVitalMetric) => {
  if (typeof window === 'undefined') return

  metricsBuffer.push(metric)

  // Store locally for analysis
  try {
    const existingData = JSON.parse(
      localStorage.getItem('synthopia_web_vitals') || '[]'
    ) as PerformanceData[]

    const newEntry: PerformanceData = {
      metrics: [metric],
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    }

    existingData.push(newEntry)

    // Keep only last 50 entries
    if (existingData.length > 50) {
      existingData.splice(0, existingData.length - 50)
    }

    localStorage.setItem('synthopia_web_vitals', JSON.stringify(existingData))
  } catch (error) {
    console.warn('Failed to store web vitals:', error)
  }

  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Web Vitals] ${metric.name}: ${metric.value} (${metric.rating})`)
  }
}

export const getStoredWebVitals = (): PerformanceData[] => {
  if (typeof window === 'undefined') return []

  try {
    return JSON.parse(
      localStorage.getItem('synthopia_web_vitals') || '[]'
    ) as PerformanceData[]
  } catch {
    return []
  }
}

export const clearStoredWebVitals = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem('synthopia_web_vitals')
}

// Performance thresholds based on Core Web Vitals
export const thresholds = {
  LCP: { good: 2500, poor: 4000 },
  FID: { good: 100, poor: 300 },
  CLS: { good: 0.1, poor: 0.25 },
  FCP: { good: 1800, poor: 3000 },
  TTFB: { good: 800, poor: 1800 },
  INP: { good: 200, poor: 500 },
}

export const getRating = (
  name: string,
  value: number
): 'good' | 'needs-improvement' | 'poor' => {
  const threshold = thresholds[name as keyof typeof thresholds]
  if (!threshold) return 'good'

  if (value <= threshold.good) return 'good'
  if (value <= threshold.poor) return 'needs-improvement'
  return 'poor'
}

// Resource timing analysis
export const analyzeResourceTiming = () => {
  if (typeof window === 'undefined' || !window.performance) return null

  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  
  const analysis = {
    totalResources: resources.length,
    totalSize: 0,
    byType: {} as Record<string, { count: number; totalDuration: number }>,
    slowestResources: [] as Array<{ name: string; duration: number }>,
  }

  for (const resource of resources) {
    const type = resource.initiatorType || 'other'
    const duration = resource.responseEnd - resource.startTime

    if (!analysis.byType[type]) {
      analysis.byType[type] = { count: 0, totalDuration: 0 }
    }
    analysis.byType[type].count++
    analysis.byType[type].totalDuration += duration

    analysis.slowestResources.push({
      name: resource.name,
      duration,
    })
  }

  // Sort and keep top 10 slowest
  analysis.slowestResources.sort((a, b) => b.duration - a.duration)
  analysis.slowestResources = analysis.slowestResources.slice(0, 10)

  return analysis
}

// Navigation timing analysis
export const analyzeNavigationTiming = () => {
  if (typeof window === 'undefined' || !window.performance) return null

  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
  if (!navigation) return null

  return {
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    tcp: navigation.connectEnd - navigation.connectStart,
    ssl: navigation.secureConnectionStart > 0 
      ? navigation.connectEnd - navigation.secureConnectionStart 
      : 0,
    ttfb: navigation.responseStart - navigation.requestStart,
    download: navigation.responseEnd - navigation.responseStart,
    domInteractive: navigation.domInteractive - navigation.responseEnd,
    domComplete: navigation.domComplete - navigation.responseEnd,
    loadComplete: navigation.loadEventEnd - navigation.startTime,
  }
}

// Memory usage (if available)
export const getMemoryUsage = () => {
  if (typeof window === 'undefined') return null
  
  const memory = (performance as Performance & { 
    memory?: { 
      usedJSHeapSize: number
      totalJSHeapSize: number
      jsHeapSizeLimit: number
    } 
  }).memory

  if (!memory) return null

  return {
    usedHeap: memory.usedJSHeapSize,
    totalHeap: memory.totalJSHeapSize,
    heapLimit: memory.jsHeapSizeLimit,
    usagePercent: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100,
  }
}

// Create a performance report
export const generatePerformanceReport = () => {
  return {
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : '',
    navigation: analyzeNavigationTiming(),
    resources: analyzeResourceTiming(),
    memory: getMemoryUsage(),
    webVitals: metricsBuffer,
  }
}
