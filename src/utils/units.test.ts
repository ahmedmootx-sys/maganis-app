import { describe, it, expect } from 'vitest'
import { UNITS, formatCalories } from './units.ts'

describe('units utility', () => {
  it('exposes correct Arabic measurement unit strings', () => {
    expect(UNITS.calorie).toBe('سعرة')
    expect(UNITS.caloriePlural).toBe('سعرات')
    expect(UNITS.gram).toBe('جم')
    expect(UNITS.kg).toBe('كجم')
    expect(UNITS.cm).toBe('سم')
    expect(UNITS.minute).toBe('دقيقة')
    expect(UNITS.second).toBe('ثانية')
    expect(UNITS.rep).toBe('تكرار')
    expect(UNITS.set).toBe('مجموعة')
  })

  it('formats calories according to Arabic grammar rules via plural helper', () => {
    expect(formatCalories(0)).toBe('0 سعرات')
    expect(formatCalories(1)).toBe('1 سعرة')
    expect(formatCalories(2)).toBe('2 سعرة')
    expect(formatCalories(5)).toBe('5 سعرات')
    expect(formatCalories(10)).toBe('10 سعرات')
    expect(formatCalories(11)).toBe('11 سعرة')
    expect(formatCalories(2500)).toBe('2500 سعرة')
  })
})
