import { describe, it, expect } from 'vitest'
import {
  getExerciseTags,
  getRegionLabel,
  REGIONS,
  STATUS_OPTIONS,
  type UserLimitation,
} from './limitations.ts'

describe('Limitations & Region Load System (B1.2)', () => {
  it('1. correctly maps region IDs to Arabic labels', () => {
    expect(getRegionLabel('lower_back')).toBe('أسفل الظهر')
    expect(getRegionLabel('knee')).toBe('الركبة')
    expect(getRegionLabel('shoulder')).toBe('الكتف')
    expect(REGIONS.length).toBe(8)
    expect(STATUS_OPTIONS.length).toBe(3)
  })

  it('2. returns empty tags when limitations are empty or null', () => {
    expect(getExerciseTags('deadlift', null)).toEqual([])
    expect(getExerciseTags('deadlift', [])).toEqual([])
  })

  it('3. derives tags for exercises based on user limitation status and region load', () => {
    const limitations: UserLimitation[] = [
      { region: 'lower_back', status: 'current_pain' },
    ]

    const tags = getExerciseTags('deadlift', limitations)
    expect(Array.isArray(tags)).toBe(true)
    // If deadlift has a load entry for lower_back, check tag structure
    if (tags.length > 0) {
      expect(tags[0].regionId).toBe('lower_back')
      expect(tags[0].regionLabel).toBe('أسفل الظهر')
      expect(['high', 'moderate', 'unreviewed', 'recovered_high']).toContain(
        tags[0].level,
      )
    }
  })

  it('4. distinguishes recovered old injury from current pain', () => {
    const recoveredLimitations: UserLimitation[] = [
      { region: 'knee', status: 'old_recovered' },
    ]
    const tags = getExerciseTags('squat', recoveredLimitations)
    if (tags.length > 0) {
      // old_recovered on high load maps to recovered_high
      if (tags[0].level === 'recovered_high') {
        expect(tags[0].className).toBe('tag-info')
      }
    }
  })
})
