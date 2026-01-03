"use client"

import { useEffect } from 'react'
import { logger } from '@/lib/logger'

// Web Vitals tracking
export function useWebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Import web-vitals dynamically to avoid SSR issues
      import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
        getCLS(sendToAnalytics)
        getFID(sendToAnalytics)
        getFCP(sendToAnalytics)
        getLCP(sendToAnalytics)
        getTTFB(sendToAnalytics)
      }).catch(() => {
        // Fallback if web-vitals is not available
        logger.warn('Web Vitals library not available')
      })
    }
  }, [])
}

function sendToAnalytics(metric: any) {
  // Send to Google Analytics if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_label: metric.id,
      non_interaction: true,
      event_category: 'Web Vitals',
    })
  }

  // Log in development
  logger.debug('Web Vital:', metric)

  // Send to custom analytics endpoint if needed
  if (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT) {
    fetch(process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(metric),
    }).catch(() => {
      // Silently fail if analytics endpoint is not available
    })
  }
}

// Performance observer for custom metrics
export function usePerformanceObserver() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Observe navigation timing
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming
            
            // Calculate custom metrics
            const metrics = {
              dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
              tcp: navEntry.connectEnd - navEntry.connectStart,
              ssl: navEntry.connectEnd - navEntry.secureConnectionStart,
              ttfb: navEntry.responseStart - navEntry.requestStart,
              download: navEntry.responseEnd - navEntry.responseStart,
              domParse: navEntry.domContentLoadedEventStart - navEntry.responseEnd,
              domReady: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
            }

            // Log performance metrics in development
            logger.debug('Navigation metrics:', metrics)

            // Send to analytics
            Object.entries(metrics).forEach(([name, value]) => {
              if (value > 0) {
                sendToAnalytics({
                  name: `custom_${name}`,
                  value,
                  id: `${Date.now()}-${Math.random()}`,
                })
              }
            })
          }
        }
      })

      navObserver.observe({ entryTypes: ['navigation'] })

      // Observe resource timing for critical resources
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const resourceEntry = entry as PerformanceResourceTiming
          
          // Track slow resources
          if (resourceEntry.duration > 1000) {
            sendToAnalytics({
              name: 'slow_resource',
              value: resourceEntry.duration,
              id: resourceEntry.name,
            })
          }
        }
      })

      resourceObserver.observe({ entryTypes: ['resource'] })

      // Cleanup observers
      return () => {
        navObserver.disconnect()
        resourceObserver.disconnect()
      }
    }
  }, [])
}

// Component to track page performance
export function PerformanceMonitor({ children }: { children: React.ReactNode }) {
  useWebVitals()
  usePerformanceObserver()

  return children
}

// Hook to measure component render time
export function useRenderTime(componentName: string) {
  useEffect(() => {
    const startTime = performance.now()
    
    return () => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      logger.debug(`${componentName} render time: ${renderTime.toFixed(2)}ms`)
      
      // Track slow components
      if (renderTime > 100) {
        sendToAnalytics({
          name: 'slow_component_render',
          value: renderTime,
          id: componentName,
        })
      }
    }
  })
}

// Utility to preload critical resources
export function preloadCriticalResources() {
  if (typeof window !== 'undefined') {
    // Preload critical images
    const criticalImages = [
      '/optimized/opt-corrugated-boxes-hero.jpg',
      '/optimized/opt-manufacturing-facility.jpg',
    ]

    criticalImages.forEach((src) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = src
      document.head.appendChild(link)
    })

    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
      'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap',
    ]

    criticalFonts.forEach((href) => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'style'
      link.href = href
      document.head.appendChild(link)
    })
  }
}

// Performance budget checker
export function checkPerformanceBudget() {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const budgets = {
      LCP: 2500, // Largest Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
      FCP: 1800, // First Contentful Paint
      TTFB: 800, // Time to First Byte
    }

    // Check against budgets
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS((metric) => {
        if (metric.value > budgets.CLS) {
          logger.warn(`CLS budget exceeded: ${metric.value} > ${budgets.CLS}`)
        }
      })

      getFID((metric) => {
        if (metric.value > budgets.FID) {
          logger.warn(`FID budget exceeded: ${metric.value}ms > ${budgets.FID}ms`)
        }
      })

      getFCP((metric) => {
        if (metric.value > budgets.FCP) {
          logger.warn(`FCP budget exceeded: ${metric.value}ms > ${budgets.FCP}ms`)
        }
      })

      getLCP((metric) => {
        if (metric.value > budgets.LCP) {
          logger.warn(`LCP budget exceeded: ${metric.value}ms > ${budgets.LCP}ms`)
        }
      })

      getTTFB((metric) => {
        if (metric.value > budgets.TTFB) {
          logger.warn(`TTFB budget exceeded: ${metric.value}ms > ${budgets.TTFB}ms`)
        }
      })
    }).catch(() => {
      logger.warn('Performance budget checking not available')
    })
  }
}
