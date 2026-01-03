/**
 * Production-safe logger utility
 * Only logs in development mode to avoid performance issues and information leakage
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) {
      // In production, only log errors
      return level === 'error'
    }
    return true
  }

  log(...args: unknown[]): void {
    if (this.shouldLog('log')) {
      console.log('[LOG]', ...args)
    }
  }

  info(...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.info('[INFO]', ...args)
    }
  }

  warn(...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.warn('[WARN]', ...args)
    }
  }

  error(...args: unknown[]): void {
    // Always log errors, but format them properly
    const errorMessage = args.map((arg) => {
      if (arg instanceof Error) {
        return {
          message: arg.message,
          stack: this.isDevelopment ? arg.stack : undefined,
          name: arg.name,
        }
      }
      return arg
    })

    console.error('[ERROR]', ...errorMessage)

    // In production, send to error tracking service
    if (!this.isDevelopment && typeof window !== 'undefined') {
      // Example: Send to error tracking service
      // errorTrackingService.captureException(errorMessage)
    }
  }

  debug(...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.debug('[DEBUG]', ...args)
    }
  }

  // Performance logging
  performance(label: string, fn: () => void): void {
    if (!this.shouldLog('debug')) return

    const start = performance.now()
    fn()
    const end = performance.now()
    this.debug(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`)
  }

  async performanceAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    if (!this.shouldLog('debug')) return fn()

    const start = performance.now()
    const result = await fn()
    const end = performance.now()
    this.debug(`[PERF] ${label}: ${(end - start).toFixed(2)}ms`)
    return result
  }
}

export const logger = new Logger()

// Export individual methods for convenience
export const { log, info, warn, error, debug, performance, performanceAsync } = logger

