/**
 * CSRF Protection Utilities
 * Provides token generation and validation for form submissions
 */

// Generate a random CSRF token
export function generateCSRFToken(): string {
  if (typeof window === 'undefined') {
    // Server-side: use crypto
    const crypto = require('crypto')
    return crypto.randomBytes(32).toString('hex')
  }
  
  // Client-side: use Web Crypto API
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}

// Store CSRF token in session storage
export function storeCSRFToken(token: string): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('csrf_token', token)
    // Also set in a cookie for server-side validation
    document.cookie = `csrf_token=${token}; SameSite=Strict; Secure; Path=/; Max-Age=3600`
  }
}

// Get CSRF token from storage
export function getCSRFToken(): string | null {
  if (typeof window === 'undefined') {
    return null
  }
  
  // Try session storage first
  const token = sessionStorage.getItem('csrf_token')
  if (token) {
    return token
  }
  
  // Fallback to cookie
  const cookies = document.cookie.split(';')
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=')
    if (name === 'csrf_token') {
      return value
    }
  }
  
  return null
}

// Validate CSRF token
export function validateCSRFToken(token: string | null): boolean {
  if (!token) {
    return false
  }
  
  const storedToken = getCSRFToken()
  if (!storedToken) {
    return false
  }
  
  // Use constant-time comparison to prevent timing attacks
  return constantTimeCompare(token, storedToken)
}

// Constant-time string comparison to prevent timing attacks
function constantTimeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  
  return result === 0
}

// Initialize CSRF token on page load
export function initializeCSRF(): string {
  let token = getCSRFToken()
  
  if (!token) {
    token = generateCSRFToken()
    storeCSRFToken(token)
  }
  
  return token
}

// Add CSRF token to fetch request headers
export function addCSRFHeader(headers: HeadersInit = {}): HeadersInit {
  const token = getCSRFToken()
  
  if (token) {
    const headersObj = headers instanceof Headers ? headers : new Headers(headers)
    headersObj.set('X-CSRF-Token', token)
    return headersObj
  }
  
  return headers
}

