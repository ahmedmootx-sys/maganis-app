/**
 * Maganis Bidi & Internationalization Helpers
 * Enforces Arabic-first, Latin-digits ('latn'), and bidi-safe wrappers.
 */

const EMOJI_REGEX = /\p{Extended_Pictographic}/gu

/**
 * Strips all pictographic emojis at render time, preserving copyright/registered/trademark symbols.
 */
export function stripEmoji(str: string | null | undefined): string {
  if (!str) return ''
  return str
    .replace(EMOJI_REGEX, (match) => {
      if (match === '©' || match === '®' || match === '™') return match
      return ''
    })
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Format a number using Arabic locale with Western Latin numerals ('latn').
 */
export function fmtNumber(
  val: number | string | null | undefined,
  options?: Intl.NumberFormatOptions,
): string {
  if (val === null || val === undefined || isNaN(Number(val))) return '0'
  const num = Number(val)
  return new Intl.NumberFormat('ar-EG-u-nu-latn', {
    maximumFractionDigits: 1,
    ...options,
  }).format(num)
}

/**
 * Format a date string or timestamp using Arabic locale with Western Latin numerals.
 */
export function fmtDate(
  dateInput: Date | string | number | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
): string {
  if (!dateInput) return ''
  const date = typeof dateInput === 'object' && dateInput instanceof Date ? dateInput : new Date(dateInput)
  if (isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ar-EG-u-nu-latn', options).format(date)
}

/**
 * Format duration in seconds into 'MM:SS' or 'H:MM:SS' using Latin digits.
 */
export function fmtDuration(secondsInput: number | null | undefined): string {
  if (!secondsInput || secondsInput <= 0) return '00:00'
  const total = Math.floor(secondsInput)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const seconds = total % 60

  const pad = (n: number) => n.toString().padStart(2, '0')

  if (hours > 0) {
    return `${hours}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

/**
 * Format weight with unit in a bidi-safe string.
 */
export function fmtWeight(kg: number | string | null | undefined, unit = 'كجم'): string {
  return `${fmtNumber(kg)} ${unit}`
}
