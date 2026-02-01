type EventProperties = Record<string, string | number | boolean | undefined>

interface AnalyticsEvent {
  event: string
  properties?: EventProperties
  timestamp: string
  userAgent: string
  referrer: string
  url: string
}

const eventQueue: AnalyticsEvent[] = []
let isProcessing = false

const processQueue = async () => {
  if (isProcessing || eventQueue.length === 0) return
  isProcessing = true

  while (eventQueue.length > 0) {
    const event = eventQueue.shift()
    if (!event) continue

    try {
      // Store locally in sessionStorage for debugging/analysis
      const existingEvents = JSON.parse(
        sessionStorage.getItem('synthopia_analytics') || '[]'
      ) as AnalyticsEvent[]
      existingEvents.push(event)
      
      // Keep only last 100 events
      if (existingEvents.length > 100) {
        existingEvents.splice(0, existingEvents.length - 100)
      }
      
      sessionStorage.setItem('synthopia_analytics', JSON.stringify(existingEvents))
    } catch (error) {
      console.warn('Analytics storage failed:', error)
    }
  }

  isProcessing = false
}

export const trackEvent = (
  eventName: string, 
  properties?: EventProperties
) => {
  if (typeof window === 'undefined') return

  const event: AnalyticsEvent = {
    event: eventName,
    properties,
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    url: window.location.href,
  }

  eventQueue.push(event)
  
  // Process queue asynchronously
  setTimeout(processQueue, 0)
}

export const ConversionFunnelEvents = {
  PAGE_VIEW: 'page_view',
  PRODUCT_VIEW: 'product_view',
  PRODUCT_CLICK: 'product_click',
  ADD_TO_CART: 'add_to_cart',
  CHECKOUT_START: 'checkout_start',
  PURCHASE_COMPLETE: 'purchase_complete',
  DOWNLOAD_START: 'download_start',
  PREVIEW_PLAY: 'preview_play',
  PREVIEW_COMPLETE: 'preview_complete',
  SCROLL_DEPTH: 'scroll_depth',
  OUTBOUND_LINK: 'outbound_link',
  SEARCH: 'search',
  FILTER_APPLIED: 'filter_applied',
  NEWSLETTER_SIGNUP: 'newsletter_signup',
  CONTACT_FORM_SUBMIT: 'contact_form_submit',
  THEME_TOGGLE: 'theme_toggle',
  AUDIO_PLAYER_INTERACTION: 'audio_player_interaction',
} as const

export type ConversionEvent = typeof ConversionFunnelEvents[keyof typeof ConversionFunnelEvents]

export const trackPageView = (pageName?: string) => {
  trackEvent(ConversionFunnelEvents.PAGE_VIEW, {
    page: pageName || document.title,
    path: window.location.pathname,
  })
}

export const trackProductView = (productId: string, productName: string) => {
  trackEvent(ConversionFunnelEvents.PRODUCT_VIEW, {
    product_id: productId,
    product_name: productName,
  })
}

export const trackPreviewPlay = (
  trackId: string, 
  trackName: string, 
  duration?: number
) => {
  trackEvent(ConversionFunnelEvents.PREVIEW_PLAY, {
    track_id: trackId,
    track_name: trackName,
    duration,
  })
}

export const trackCheckoutStart = (productId: string, price: number) => {
  trackEvent(ConversionFunnelEvents.CHECKOUT_START, {
    product_id: productId,
    price,
  })
}

export const trackOutboundLink = (url: string, label?: string) => {
  trackEvent(ConversionFunnelEvents.OUTBOUND_LINK, {
    url,
    label,
  })
}

export const trackScrollDepth = (depth: number) => {
  trackEvent(ConversionFunnelEvents.SCROLL_DEPTH, {
    depth_percent: depth,
  })
}

export const getStoredEvents = (): AnalyticsEvent[] => {
  if (typeof window === 'undefined') return []
  
  try {
    return JSON.parse(
      sessionStorage.getItem('synthopia_analytics') || '[]'
    ) as AnalyticsEvent[]
  } catch {
    return []
  }
}

export const clearStoredEvents = () => {
  if (typeof window === 'undefined') return
  sessionStorage.removeItem('synthopia_analytics')
}

// Scroll depth tracking (call once per page)
export const initScrollTracking = () => {
  if (typeof window === 'undefined') return

  const thresholds = [25, 50, 75, 90, 100]
  const trackedThresholds = new Set<number>()

  const handleScroll = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / docHeight) * 100)

    for (const threshold of thresholds) {
      if (scrollPercent >= threshold && !trackedThresholds.has(threshold)) {
        trackedThresholds.add(threshold)
        trackScrollDepth(threshold)
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true })
  
  return () => {
    window.removeEventListener('scroll', handleScroll)
  }
}
