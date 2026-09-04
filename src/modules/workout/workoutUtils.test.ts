import { describe, it, expect } from 'vitest'
import { formatTime } from './workoutUtils.ts'

describe('workoutUtils', () => {
  it('formats zero seconds as 00:00', () => {
    expect(formatTime(0)).toBe('00:00')
  })

  it('formats seconds less than a minute correctly', () => {
    expect(formatTime(45)).toBe('00:45')
  })

  it('formats minutes and seconds correctly', () => {
    expect(formatTime(125)).toBe('02:05')
    expect(formatTime(3600)).toBe('60:00')
  })

  it('handles negative or invalid seconds safely', () => {
    expect(formatTime(-10)).toBe('00:00')
    expect(formatTime(NaN)).toBe('00:00')
  })
})
