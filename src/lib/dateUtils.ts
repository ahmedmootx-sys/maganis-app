/**
 * Standard date utilities for formatting dates in Arabic and ISO formats.
 */

export function formatArabicDate(
  date: Date | number | string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const d =
    typeof date === 'object' && date instanceof Date ? date : new Date(date)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(
    'ar-EG',
    options ?? {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    },
  )
}

export function formatDateOnly(d: Date = new Date()): string {
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
