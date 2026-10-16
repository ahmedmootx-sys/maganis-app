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
    'ar-EG-u-nu-latn',
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

export interface ArabicWeekday {
  dayIndex: number // JS Date.getDay(): 0=Sun, 1=Mon, ..., 6=Sat
  short: string
  full: string
}

export const ARABIC_WEEKDAYS: ArabicWeekday[] = [
  { dayIndex: 6, short: 'سبت', full: 'السبت' },
  { dayIndex: 0, short: 'أحد', full: 'الأحد' },
  { dayIndex: 1, short: 'اثنين', full: 'الاثنين' },
  { dayIndex: 2, short: 'ثلاثاء', full: 'الثلاثاء' },
  { dayIndex: 3, short: 'أربعاء', full: 'الأربعاء' },
  { dayIndex: 4, short: 'خميس', full: 'الخميس' },
  { dayIndex: 5, short: 'جمعة', full: 'الجمعة' },
]

export function getOrderedWeekdays(startDayIndex: number = 6): ArabicWeekday[] {
  const startPos = ARABIC_WEEKDAYS.findIndex(
    (w) => w.dayIndex === startDayIndex,
  )
  if (startPos === -1) return ARABIC_WEEKDAYS
  return [
    ...ARABIC_WEEKDAYS.slice(startPos),
    ...ARABIC_WEEKDAYS.slice(0, startPos),
  ]
}
