/**
 * Comprehensive validation utilities for forms and inputs
 * Provides reusable validation functions with proper error messages
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
}

export interface ValidationRule {
  validator: (value: any) => boolean
  message: string
}

// Email validation
export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: "Email is required" }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" }
  }

  // Additional checks for common issues
  if (email.length > 254) {
    return { isValid: false, error: "Email address is too long" }
  }

  const localPart = email.split('@')[0]
  if (localPart.length > 64) {
    return { isValid: false, error: "Email address is invalid" }
  }

  return { isValid: true }
}

// Phone validation (supports international formats)
export function validatePhone(phone: string, countryCode?: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: "Phone number is required" }
  }

  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '')
  
  // International phone regex (E.164 format)
  const internationalRegex = /^\+?[1-9]\d{1,14}$/
  
  if (!internationalRegex.test(cleaned)) {
    return { isValid: false, error: "Please enter a valid phone number" }
  }

  // Check length (minimum 10 digits, maximum 15)
  const digitsOnly = cleaned.replace(/\D/g, '')
  if (digitsOnly.length < 10 || digitsOnly.length > 15) {
    return { isValid: false, error: "Phone number must be between 10 and 15 digits" }
  }

  return { isValid: true }
}

// Indian phone number validation
export function validateIndianPhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: "Phone number is required" }
  }

  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '')
  
  // Indian phone numbers: 10 digits, starting with 6-9
  const indianRegex = /^[6-9]\d{9}$/
  
  if (!indianRegex.test(cleaned)) {
    return { isValid: false, error: "Please enter a valid 10-digit Indian phone number" }
  }

  return { isValid: true }
}

// Password validation
export function validatePassword(password: string, options?: {
  minLength?: number
  requireUppercase?: boolean
  requireLowercase?: boolean
  requireNumbers?: boolean
  requireSpecial?: boolean
}): ValidationResult {
  const {
    minLength = 8,
    requireUppercase = true,
    requireLowercase = true,
    requireNumbers = true,
    requireSpecial = false,
  } = options || {}

  if (!password || password.length === 0) {
    return { isValid: false, error: "Password is required" }
  }

  if (password.length < minLength) {
    return { isValid: false, error: `Password must be at least ${minLength} characters long` }
  }

  if (requireUppercase && !/[A-Z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one uppercase letter" }
  }

  if (requireLowercase && !/[a-z]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one lowercase letter" }
  }

  if (requireNumbers && !/\d/.test(password)) {
    return { isValid: false, error: "Password must contain at least one number" }
  }

  if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) {
    return { isValid: false, error: "Password must contain at least one special character" }
  }

  return { isValid: true }
}

// Name validation
export function validateName(name: string, options?: {
  minLength?: number
  maxLength?: number
  allowNumbers?: boolean
}): ValidationResult {
  const {
    minLength = 2,
    maxLength = 100,
    allowNumbers = false,
  } = options || {}

  if (!name || name.trim().length === 0) {
    return { isValid: false, error: "Name is required" }
  }

  const trimmed = name.trim()

  if (trimmed.length < minLength) {
    return { isValid: false, error: `Name must be at least ${minLength} characters long` }
  }

  if (trimmed.length > maxLength) {
    return { isValid: false, error: `Name must be no more than ${maxLength} characters long` }
  }

  // Check for valid characters
  const nameRegex = allowNumbers ? /^[a-zA-Z0-9\s\-'\.]+$/ : /^[a-zA-Z\s\-'\.]+$/
  if (!nameRegex.test(trimmed)) {
    return { isValid: false, error: "Name contains invalid characters" }
  }

  return { isValid: true }
}

// Pincode validation (Indian)
export function validatePincode(pincode: string): ValidationResult {
  if (!pincode || pincode.trim().length === 0) {
    return { isValid: false, error: "Pincode is required" }
  }

  const cleaned = pincode.replace(/\D/g, '')
  
  // Indian pincode: 6 digits
  if (cleaned.length !== 6) {
    return { isValid: false, error: "Pincode must be 6 digits" }
  }

  const pincodeRegex = /^[1-9]\d{5}$/
  if (!pincodeRegex.test(cleaned)) {
    return { isValid: false, error: "Please enter a valid 6-digit pincode" }
  }

  return { isValid: true }
}

// URL validation
export function validateURL(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: false, error: "URL is required" }
  }

  try {
    const urlObj = new URL(url)
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return { isValid: false, error: "URL must use http or https protocol" }
    }
    return { isValid: true }
  } catch {
    return { isValid: false, error: "Please enter a valid URL" }
  }
}

// Number validation
export function validateNumber(
  value: string | number,
  options?: {
    min?: number
    max?: number
    integer?: boolean
    positive?: boolean
  }
): ValidationResult {
  const {
    min,
    max,
    integer = false,
    positive = false,
  } = options || {}

  const numValue = typeof value === 'string' ? parseFloat(value) : value

  if (isNaN(numValue)) {
    return { isValid: false, error: "Please enter a valid number" }
  }

  if (integer && !Number.isInteger(numValue)) {
    return { isValid: false, error: "Please enter a whole number" }
  }

  if (positive && numValue <= 0) {
    return { isValid: false, error: "Please enter a positive number" }
  }

  if (min !== undefined && numValue < min) {
    return { isValid: false, error: `Value must be at least ${min}` }
  }

  if (max !== undefined && numValue > max) {
    return { isValid: false, error: `Value must be no more than ${max}` }
  }

  return { isValid: true }
}

// Required field validation
export function validateRequired(value: any, fieldName?: string): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: fieldName ? `${fieldName} is required` : "This field is required" }
  }

  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: fieldName ? `${fieldName} is required` : "This field is required" }
  }

  if (Array.isArray(value) && value.length === 0) {
    return { isValid: false, error: fieldName ? `${fieldName} is required` : "This field is required" }
  }

  return { isValid: true }
}

// Custom validator builder
export function createValidator(rules: ValidationRule[]) {
  return (value: any): ValidationResult => {
    for (const rule of rules) {
      if (!rule.validator(value)) {
        return { isValid: false, error: rule.message }
      }
    }
    return { isValid: true }
  }
}

// Sanitize input (basic XSS prevention)
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }

  // Remove potentially dangerous characters
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .trim()
}

// Validate form data object
export function validateFormData<T extends Record<string, any>>(
  data: T,
  validators: Record<keyof T, (value: any) => ValidationResult>
): { isValid: boolean; errors: Partial<Record<keyof T, string>> } {
  const errors: Partial<Record<keyof T, string>> = {}
  let isValid = true

  for (const [key, validator] of Object.entries(validators)) {
    const result = validator(data[key as keyof T])
    if (!result.isValid) {
      errors[key as keyof T] = result.error
      isValid = false
    }
  }

  return { isValid, errors }
}

