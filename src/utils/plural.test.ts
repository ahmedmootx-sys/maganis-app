import { describe, it, expect } from 'vitest'
import { plural, PLURAL_NOUNS } from './plural.ts'

describe('Arabic Plural Helper: plural(n, noun)', () => {
  it('correctly formats "مجموعة"', () => {
    expect(plural(1, 'مجموعة')).toBe('مجموعة')
    expect(plural(2, 'مجموعة')).toBe('مجموعتان')
    expect(plural(3, 'مجموعة')).toBe('3 مجموعات')
    expect(plural(5, 'مجموعة')).toBe('5 مجموعات')
    expect(plural(10, 'مجموعة')).toBe('10 مجموعات')
    expect(plural(11, 'مجموعة')).toBe('11 مجموعة')
    expect(plural(0, 'مجموعة')).toBe('0 مجموعة')
  })

  it('correctly formats "تمرين"', () => {
    expect(plural(1, 'تمرين')).toBe('تمرين')
    expect(plural(2, 'تمرين')).toBe('تمرينان')
    expect(plural(4, 'تمرين')).toBe('4 تمارين')
    expect(plural(15, 'تمرين')).toBe('15 تمرين')
  })

  it('correctly formats all required nouns in the dictionary', () => {
    const requiredNouns = [
      'مجموعة',
      'تمرين',
      'جلسة',
      'يوم',
      'أسبوع',
      'دقيقة',
      'ثانية',
      'تكرار',
      'وجبة',
      'مكوّن',
      'عضلة',
      'نشاط',
    ] as const

    for (const noun of requiredNouns) {
      expect(PLURAL_NOUNS[noun]).toBeDefined()
      expect(plural(1, noun)).toBe(PLURAL_NOUNS[noun].one)
      expect(plural(2, noun)).toBe(PLURAL_NOUNS[noun].two)
      expect(plural(5, noun)).toBe(`5 ${PLURAL_NOUNS[noun].few}`)
      expect(plural(12, noun)).toBe(`12 ${PLURAL_NOUNS[noun].many}`)
    }
  })
})
