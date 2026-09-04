import { describe, it, expect } from 'vitest'
import { formatArabicDate, formatDateOnly } from './dateUtils.ts'

describe('dateUtils', () => {
  it('formatDateOnly formats date in YYYY-MM-DD format', () => {
    const d = new Date(2026, 8, 3) // Sep 3, 2026
    expect(formatDateOnly(d)).toBe('2026-09-03')
  })

  it('formatArabicDate formats valid date correctly', () => {
    const d = new Date(2026, 8, 3)
    const str = formatArabicDate(d)
    expect(str).toBeDefined()
    expect(typeof str).toBe('string')
    expect(str.length).toBeGreaterThan(0)
  })

  it('formatArabicDate handles invalid dates safely', () => {
    expect(formatArabicDate('invalid-date')).toBe('—')
  })
})
