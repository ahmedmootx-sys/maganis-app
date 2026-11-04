/**
 * src/platform/globalErrorHandlers.ts
 * Global Uncaught Error & Unhandled Promise Rejection Handler (Task N5.1).
 *
 * Forwards all window errors and promise rejections to the privacy-safe logger.
 */

import { logger, sanitizeLogMessage } from './logger.ts'

let isInitialized = false

export function initGlobalErrorHandlers(): void {
  if (isInitialized || typeof window === 'undefined') return
  isInitialized = true

  window.addEventListener('error', (event) => {
    try {
      const message =
        event.message ||
        (event.error && event.error.message) ||
        'Unknown window error'
      const sanitized = sanitizeLogMessage(message)
      const source = event.filename
        ? event.filename.split('/').pop()
        : 'unknown'
      logger.error(
        'GLOBAL',
        'UNCAUGHT_EXCEPTION',
        `${sanitized} (source: ${source}:${event.lineno || 0}:${event.colno || 0})`,
      )
    } catch {
      // Best-effort handler must never throw
    }
  })

  window.addEventListener('unhandledrejection', (event) => {
    try {
      const reason = event.reason
      const message =
        reason instanceof Error
          ? reason.message
          : String(reason || 'Unhandled Promise rejection')
      const sanitized = sanitizeLogMessage(message)
      logger.error('GLOBAL', 'UNHANDLED_REJECTION', sanitized)
    } catch {
      // Best-effort handler must never throw
    }
  })
}
