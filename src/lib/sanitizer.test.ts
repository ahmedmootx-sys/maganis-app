import { describe, it, expect } from 'vitest'
import { sanitizeInput } from './sanitizer.ts'

describe('sanitizeInput', () => {
  it('trims leading and trailing whitespace', () => {
    expect(sanitizeInput('   تمرين الضغط   ')).toBe('تمرين الضغط')
  })

  it('strips non-printable control characters', () => {
    const dirty = 'مجانص\u0000\u0007\u001Fتمرين'
    expect(sanitizeInput(dirty)).toBe('مجانصتمرين')
  })

  it('preserves valid unicode arabic characters and newlines', () => {
    const arabic = 'تمرين الصدر بالبار\n٤ مجموعات'
    expect(sanitizeInput(arabic)).toBe('تمرين الصدر بالبار\n٤ مجموعات')
  })

  it('handles empty or non-string input safely', () => {
    expect(sanitizeInput('')).toBe('')
    // @ts-expect-error test invalid types
    expect(sanitizeInput(null)).toBe('')
  })
})
