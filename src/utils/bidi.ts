/**
 * Maganis Bidi & Internationalization Helpers
 * Enforces Arabic-first, Latin-digits ('latn'), and bidi-safe wrappers.
 */

const EMOJI_REGEX = /(?:\p{Extended_Pictographic}|\uFE0F|\uFE0E|\u200D)+/gu

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
  const date =
    typeof dateInput === 'object' && dateInput instanceof Date
      ? dateInput
      : new Date(dateInput)
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
export function fmtWeight(
  kg: number | string | null | undefined,
  unit = 'كجم',
): string {
  return `${fmtNumber(kg)} ${unit}`
}

/**
 * Format a numeric range in Arabic: "من X إلى Y وحدة".
 */
export function fmtRange(
  a: number | string,
  b: number | string,
  unit?: string,
): string {
  const numA = fmtNumber(a)
  const numB = fmtNumber(b)
  if (unit) {
    return `من ${numA} إلى ${numB} ${unit}`
  }
  return `من ${numA} إلى ${numB}`
}

export interface ArabicPluralForms {
  zero?: string
  one: string
  two?: string
  few: string
  many: string
  other?: string
}

const arPluralRules = new Intl.PluralRules('ar')

/**
 * Format Arabic plurals using Intl.PluralRules('ar') adhering to Arabic grammar.
 */
export function fmtArabicPlural(
  count: number,
  forms: ArabicPluralForms,
  includeCount = true,
): string {
  const rule = arPluralRules.select(count)
  const numStr = fmtNumber(count)

  let word: string
  switch (rule) {
    case 'zero':
      word = forms.zero ?? forms.few
      return includeCount ? `${numStr} ${word}` : word
    case 'one':
      return forms.one
    case 'two':
      return forms.two ?? forms.one
    case 'few':
      word = forms.few
      return includeCount ? `${numStr} ${word}` : word
    case 'many':
      word = forms.many
      return includeCount ? `${numStr} ${word}` : word
    case 'other':
    default:
      word = forms.other ?? forms.many
      return includeCount ? `${numStr} ${word}` : word
  }
}

export function fmtSets(count: number): string {
  return fmtArabicPlural(count, {
    one: 'مجموعة واحدة',
    two: 'مجموعتان',
    few: 'مجموعات',
    many: 'مجموعة',
  })
}

export function fmtMuscles(count: number): string {
  return fmtArabicPlural(count, {
    one: 'عضلة واحدة',
    two: 'عضلتان',
    few: 'عضلات',
    many: 'عضلة',
  })
}

export function fmtExercises(count: number): string {
  return fmtArabicPlural(count, {
    one: 'تمرين واحد',
    two: 'تمرينان',
    few: 'تمارين',
    many: 'تمريناً',
  })
}

export function fmtReps(count: number): string {
  return fmtArabicPlural(count, {
    one: 'تكرار واحد',
    two: 'تكراران',
    few: 'تكرارات',
    many: 'تكراراً',
  })
}

export function fmtDays(count: number): string {
  return fmtArabicPlural(count, {
    one: 'يوم واحد',
    two: 'يومان',
    few: 'أيام',
    many: 'يوماً',
  })
}

/**
 * Format an exact activity factor tag (e.g. "×1.35", "×1.2", "×1.65").
 */
export function fmtFactor(factor: number): string {
  if (typeof factor !== 'number' || isNaN(factor)) return '×1.0'
  const str = Number.isInteger(factor)
    ? factor.toString()
    : factor.toFixed(2).replace(/0$/, '')
  return `×${str}`
}

