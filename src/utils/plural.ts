/**
 * src/utils/plural.ts
 * Unified Arabic Plural Helper based on Intl.PluralRules('ar')
 * Implements Appendix B2 of TASK G4b.
 */

export type PluralWordKey =
  | 'exercise'
  | 'program'
  | 'day'
  | 'session'
  | 'minute'
  | 'set'
  | 'meal'
  | 'calorie'
  | 'تمرين'
  | 'جدول'
  | 'يوم'
  | 'جلسة'
  | 'دقيقة'
  | 'مجموعة'
  | 'وجبة'
  | 'سعرة'
  // Legacy aliases
  | 'ثانية'
  | 'تكرار'
  | 'مكوّن'
  | 'عضلة'
  | 'نشاط'
  | 'أسبوع'

export interface PluralRuleForms {
  zero: string
  one: string
  two: string
  few: string
  many: string
  other: string
}

export const ARABIC_PLURAL_TABLE: Record<string, PluralRuleForms> = {
  exercise: {
    zero: 'لا توجد تمارين',
    one: 'تمرين واحد',
    two: 'تمرينان',
    few: '{n} تمارين',
    many: '{n} تمرينًا',
    other: '{n} تمرين',
  },
  program: {
    zero: 'لا توجد جداول',
    one: 'جدول واحد',
    two: 'جدولان',
    few: '{n} جداول',
    many: '{n} جدولًا',
    other: '{n} جدول',
  },
  day: {
    zero: '0 أيام',
    one: 'يوم واحد',
    two: 'يومان',
    few: '{n} أيام',
    many: '{n} يومًا',
    other: '{n} يوم',
  },
  session: {
    zero: '0 جلسات',
    one: 'جلسة واحدة',
    two: 'جلستان',
    few: '{n} جلسات',
    many: '{n} جلسة',
    other: '{n} جلسة',
  },
  minute: {
    zero: '0 دقائق',
    one: 'دقيقة واحدة',
    two: 'دقيقتان',
    few: '{n} دقائق',
    many: '{n} دقيقة',
    other: '{n} دقيقة',
  },
  set: {
    zero: '0 مجموعات',
    one: 'مجموعة واحدة',
    two: 'مجموعتان',
    few: '{n} مجموعات',
    many: '{n} مجموعة',
    other: '{n} مجموعة',
  },
  meal: {
    zero: '0 وجبات',
    one: 'وجبة واحدة',
    two: 'وجبتان',
    few: '{n} وجبات',
    many: '{n} وجبة',
    other: '{n} وجبة',
  },
  // Calorie unit dictionary keywords: 'سعرة' and 'سعرات'
  calorie: {
    zero: '0 سعرات',
    one: 'سعرة واحدة',
    two: 'سعرتان',
    few: '{n} سعرات',
    many: '{n} سعرة',
    other: '{n} سعرة',
  },
  // Legacy / Additional helpers
  second: {
    zero: '0 ثوانٍ',
    one: 'ثانية واحدة',
    two: 'ثانيتان',
    few: '{n} ثوانٍ',
    many: '{n} ثانية',
    other: '{n} ثانية',
  },
  rep: {
    zero: '0 تكرارات',
    one: 'تكرار واحد',
    two: 'تكراران',
    few: '{n} تكرارات',
    many: '{n} تكرارًا',
    other: '{n} تكرار',
  },
  week: {
    zero: '0 أسابيع',
    one: 'أسبوع واحد',
    two: 'أسبوعان',
    few: '{n} أسابيع',
    many: '{n} أسبوعًا',
    other: '{n} أسبوع',
  },
}

// Map Arabic keys to canonical English keys
const ALIASES: Record<string, string> = {
  تمرين: 'exercise',
  جدول: 'program',
  يوم: 'day',
  جلسة: 'session',
  دقيقة: 'minute',
  مجموعة: 'set',
  وجبة: 'meal',
  سعرة: 'calorie',
  ثانية: 'second',
  تكرار: 'rep',
  أسبوع: 'week',
}

const arPluralRules = new Intl.PluralRules('ar')

/**
 * Universal Arabic Plural Helper (Appendix B2)
 *
 * @param n the count
 * @param word the word key (English or Arabic)
 * @param options optional { forceNumber?: boolean, zeroForm?: 'zero' | 'numeric' }
 */
export function plural(
  n: number,
  word: PluralWordKey,
  options: { forceNumber?: boolean; zeroNumeric?: boolean } | boolean = {},
): string {
  const opts = typeof options === 'boolean' ? { forceNumber: options } : options
  const canonical = ALIASES[word] || word
  const forms = ARABIC_PLURAL_TABLE[canonical]

  if (!forms) {
    return `${n} ${word}`
  }

  const rounded = Math.round(n)

  if (opts.zeroNumeric && rounded === 0) {
    return `0 ${canonical === 'calorie' || canonical === 'سعرة' ? 'سعرة' : forms.other.replace('{n} ', '')}`
  }

  if (opts.forceNumber) {
    if (rounded === 1) return `1 ${forms.other.replace('{n} ', '')}`
    if (rounded === 2) return `2 ${forms.other.replace('{n} ', '')}`
  }

  // Use Intl.PluralRules category
  const category = arPluralRules.select(rounded)
  const template = forms[category] || forms.other

  return template.replace('{n}', String(rounded))
}

// Legacy alias compatibility
export const PLURAL_NOUNS = ARABIC_PLURAL_TABLE
export type PluralNoun = PluralWordKey
