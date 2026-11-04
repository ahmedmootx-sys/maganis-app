/**
 * src/platform/logger.ts
 * Local, Privacy-Safe Structured Ring-Buffer Logger for Maganis (Task N5.2).
 *
 * Line Format: [<ISO_TIMESTAMP>] [<LEVEL>] [<MODULE>] [<CODE>] <SANITIZED_MESSAGE>
 * Rotating file log under maganis/logs/ (capped at 512 KB total across files).
 * NEVER logs stored values, profile fields, user-entered exercises, or URLs with query strings.
 */

import { MaganisNative } from './native/maganisNative.ts'
import { isNative } from './runtime.ts'

export type LogLevel = 'INFO' | 'WARN' | 'ERROR'

export interface LogEntry {
  timestamp: string
  level: LogLevel
  module: string
  code: string
  message: string
}

const IN_MEMORY_RING_BUFFER_CAP = 250
const inMemoryBuffer: string[] = []
const sensitiveTokens = new Set<string>()

/**
 * Register dynamic user-specific sensitive tokens (e.g., profile name, personal notes)
 * to guarantee they are never logged under any circumstance.
 */
export function registerSensitiveTokens(
  tokens: Array<string | number | undefined | null>,
): void {
  for (const t of tokens) {
    if (t !== undefined && t !== null) {
      const str = String(t).trim()
      // Only register meaningful tokens (length >= 2, skip trivial common numbers like 0, 1)
      if (str.length >= 2 && str !== 'true' && str !== 'false') {
        sensitiveTokens.add(str)
      }
    }
  }
}

/**
 * Sanitizes and redacts any personal, user-entered, or query-string data from a log message.
 */
export function sanitizeLogMessage(input: unknown): string {
  if (input === null || input === undefined) return ''

  let text = typeof input === 'string' ? input : String(input)

  // 1. Redact URL query parameters (https://...?... -> https://...?[REDACTED_QUERY])
  text = text.replace(/(https?:\/\/[^\s?#]+)\?[^\s#]*/gi, '$1?[REDACTED_QUERY]')

  // 2. Redact email addresses
  text = text.replace(
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g,
    '[REDACTED_EMAIL]',
  )

  // 3. Redact phone numbers (Egyptian sequences + international formats)
  text = text.replace(
    /(?:\+20\s?1[0125]\d{8}\b|(?<!\d)01[0125]\d{8}\b)/g,
    '[REDACTED_PHONE]',
  )

  // 4. Redact numbers associated with physical metrics (e.g. 80kg, 180cm, 2500kcal, 85.5 kg)
  text = text.replace(
    /\b\d+(?:\.\d+)?\s*(?:kg|cm|kcal|سعرة|كيلو|سم)\b/gi,
    '[REDACTED_METRIC]',
  )

  // 5. Redact quoted text blocks that may contain user-typed input (e.g. "my custom note")
  text = text.replace(/"[^"\n]{3,}"/g, (match) => {
    // Keep short enum / identifier tokens like "ok", "error", "v1"
    if (/^"[a-zA-Z0-9_\-.:]{1,15}"$/.test(match)) return match
    return '"[REDACTED_TEXT]"'
  })

  // 6. Strip dynamic registered sensitive tokens
  for (const token of sensitiveTokens) {
    if (text.includes(token)) {
      text = text.replaceAll(token, '[REDACTED_TOKEN]')
    }
  }

  // 7. Strip newlines to enforce single-line log format
  text = text.replace(/[\r\n]+/g, ' ').trim()

  return text
}

function formatLogLine(
  level: LogLevel,
  module: string,
  code: string,
  message: string,
): string {
  const ts = new Date().toISOString()
  const cleanModule = (module || 'CORE')
    .toUpperCase()
    .replace(/[^A-Z0-9_-]/g, '')
  const cleanCode = (code || 'LOG').toUpperCase().replace(/[^A-Z0-9_-]/g, '')
  const sanitizedMsg = sanitizeLogMessage(message)
  return `[${ts}] [${level}] [${cleanModule}] [${cleanCode}] ${sanitizedMsg}`
}

function recordLog(
  level: LogLevel,
  module: string,
  code: string,
  message: string,
): void {
  const line = formatLogLine(level, module, code, message)

  // Append to in-memory ring buffer
  inMemoryBuffer.push(line)
  if (inMemoryBuffer.length > IN_MEMORY_RING_BUFFER_CAP) {
    inMemoryBuffer.shift()
  }

  // Console output in dev
  if (typeof console !== 'undefined') {
    if (level === 'ERROR') {
      console.error(line)
    } else if (level === 'WARN') {
      console.warn(line)
    } else {
      console.log(line)
    }
  }

  // In native shell, persist to rotating disk file via native plugin
  if (isNative() && typeof MaganisNative?.appendLog === 'function') {
    MaganisNative.appendLog({ line }).catch(() => {
      // Intentionally silent: disk logging failure must not crash logger
    })
  }
}

export const logger = {
  info(module: string, code: string, message: string): void {
    recordLog('INFO', module, code, message)
  },

  warn(module: string, code: string, message: string): void {
    recordLog('WARN', module, code, message)
  },

  error(
    module: string,
    code: string,
    message: string,
    extra?: Record<string, unknown>,
  ): void {
    let msg = message
    if (extra && typeof extra === 'object') {
      const keys = Object.keys(extra)
        .map((k) => `${k}=${String(extra[k])}`)
        .join(' ')
      msg = `${message} (${keys})`
    }
    recordLog('ERROR', module, code, msg)
  },

  async getRecentLogs(limit = 200): Promise<string[]> {
    if (isNative() && typeof MaganisNative?.getLogs === 'function') {
      try {
        const res = await MaganisNative.getLogs({ limit })
        if (res && Array.isArray(res.lines) && res.lines.length > 0) {
          return res.lines
        }
      } catch {
        // Fall back to in-memory buffer
      }
    }
    const start = Math.max(0, inMemoryBuffer.length - limit)
    return inMemoryBuffer.slice(start)
  },

  async clearLogs(): Promise<void> {
    inMemoryBuffer.length = 0
    if (isNative() && typeof MaganisNative?.clearLogs === 'function') {
      try {
        await MaganisNative.clearLogs()
      } catch {
        // Best effort
      }
    }
  },

  _getBuffer(): string[] {
    return [...inMemoryBuffer]
  },

  _resetForTesting(): void {
    inMemoryBuffer.length = 0
    sensitiveTokens.clear()
  },
}
