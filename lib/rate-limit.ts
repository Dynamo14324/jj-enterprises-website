/**
 * Client-side rate limiting utilities
 * Note: Real rate limiting should be implemented server-side
 * This provides basic client-side protection and user feedback
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

// Clear expired entries periodically
if (typeof window !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const key in store) {
      if (store[key].resetTime < now) {
        delete store[key]
      }
    }
  }, 60000) // Clean up every minute
}

export interface RateLimitOptions {
  maxRequests: number
  windowMs: number
  key?: string
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetTime: number
  retryAfter?: number
}

/**
 * Check if a request is allowed based on rate limiting
 */
export function checkRateLimit(options: RateLimitOptions): RateLimitResult {
  const {
    maxRequests,
    windowMs,
    key = 'default',
  } = options

  const now = Date.now()
  const entry = store[key]

  // If no entry or expired, create new one
  if (!entry || entry.resetTime < now) {
    store[key] = {
      count: 1,
      resetTime: now + windowMs,
    }
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  // Check if limit exceeded
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    }
  }

  // Increment count
  entry.count++

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  }
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string = 'default'): void {
  delete store[key]
}

/**
 * Get remaining requests for a key
 */
export function getRemainingRequests(key: string = 'default'): number {
  const entry = store[key]
  if (!entry || entry.resetTime < Date.now()) {
    return 0
  }
  return entry.count
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Form submissions: 5 per minute
  FORM_SUBMISSION: {
    maxRequests: 5,
    windowMs: 60000, // 1 minute
    key: 'form_submission',
  },
  
  // API calls: 30 per minute
  API_CALL: {
    maxRequests: 30,
    windowMs: 60000, // 1 minute
    key: 'api_call',
  },
  
  // Authentication attempts: 5 per 15 minutes
  AUTH_ATTEMPT: {
    maxRequests: 5,
    windowMs: 900000, // 15 minutes
    key: 'auth_attempt',
  },
  
  // Password reset: 3 per hour
  PASSWORD_RESET: {
    maxRequests: 3,
    windowMs: 3600000, // 1 hour
    key: 'password_reset',
  },
} as const

