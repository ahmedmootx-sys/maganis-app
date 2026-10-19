/**
 * Arabic Plural Helper: plural(n, noun)
 * Implements strict Arabic grammatical plural rules:
 * - one (n = 1)
 * - two (n = 2)
 * - few (3 <= n <= 10)
 * - many (n = 0 and n >= 11)
 */

export interface PluralEntry {
  one: string
  two: string
  few: string
  many: string
}

export type PluralNoun =
  | 'مجموعة'
  | 'تمرين'
  | 'جلسة'
  | 'يوم'
  | 'أسبوع'
  | 'دقيقة'
  | 'ثانية'
  | 'تكرار'
  | 'وجبة'
  | 'مكوّن'
  | 'عضلة'
  | 'نشاط'
  | 'سعرة'

export const PLURAL_NOUNS: Record<PluralNoun, PluralEntry> = {
  'مجموعة': {
    one: 'مجموعة',
    two: 'مجموعتان',
    few: 'مجموعات',
    many: 'مجموعة',
  },
  'تمرين': {
    one: 'تمرين',
    two: 'تمرينان',
    few: 'تمارين',
    many: 'تمرين',
  },
  'جلسة': {
    one: 'جلسة',
    two: 'جلستان',
    few: 'جلسات',
    many: 'جلسة',
  },
  'يوم': {
    one: 'يوم',
    two: 'يومان',
    few: 'أيام',
    many: 'يوم',
  },
  'أسبوع': {
    one: 'أسبوع',
    two: 'أسبوعان',
    few: 'أسابيع',
    many: 'أسبوع',
  },
  'دقيقة': {
    one: 'دقيقة',
    two: 'دقيقتان',
    few: 'دقائق',
    many: 'دقيقة',
  },
  'ثانية': {
    one: 'ثانية',
    two: 'ثانيتان',
    few: 'ثوانٍ',
    many: 'ثانية',
  },
  'تكرار': {
    one: 'تكرار',
    two: 'تكراران',
    few: 'تكرارات',
    many: 'تكرار',
  },
  'وجبة': {
    one: 'وجبة',
    two: 'وجبتان',
    few: 'وجبات',
    many: 'وجبة',
  },
  'مكوّن': {
    one: 'مكوّن',
    two: 'مكوّنان',
    few: 'مكوّنات',
    many: 'مكوّن',
  },
  'عضلة': {
    one: 'عضلة',
    two: 'عضلتان',
    few: 'عضلات',
    many: 'عضلة',
  },
  'نشاط': {
    one: 'نشاط',
    two: 'نشاطان',
    few: 'أنشطة',
    many: 'نشاط',
  },
  'سعرة': {
    one: 'سعرة',
    two: 'سعرتان',
    few: 'سعرات',
    many: 'سعرة',
  },
}

/**
 * Format a number and noun according to Arabic grammar rules.
 * @param n the count
 * @param noun the base noun key from the dictionary
 * @param forceNumber if true, forces the number prefix even for 1 and 2 (e.g. "1 مجموعة" instead of "مجموعة")
 */
export function plural(n: number, noun: PluralNoun, forceNumber = false): string {
  const entry = PLURAL_NOUNS[noun]
  if (!entry) {
    return `${n} ${noun}`
  }

  const rounded = Math.round(n)

  if (rounded === 1) {
    return forceNumber ? `1 ${entry.one}` : entry.one
  }

  if (rounded === 2) {
    return forceNumber ? `2 ${entry.two}` : entry.two
  }

  if (rounded >= 3 && rounded <= 10) {
    return `${rounded} ${entry.few}`
  }

  // 0 and 11+
  return `${rounded} ${entry.many}`
}
