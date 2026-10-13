import { describe, it, expect } from 'vitest'
import {
  formatTime,
  exportRoutineToJson,
  parseAndValidateRoutineJson,
} from './workoutUtils.ts'

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

  it('exports and validates imported routine successfully', () => {
    const sampleProgram = {
      id: 'test-prog-1',
      createdAt: 12345678,
      primaryGoal: 'hypertrophy' as const,
      trainingDaysPerWeek: 3,
      days: [
        {
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'صدر وتراي',
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: 4,
              reps: 8,
              restSeconds: 90,
              section: 'primary' as const,
            },
            {
              exerciseId: 'push-ups',
              sets: 2,
              reps: 15,
              restSeconds: 60,
              section: 'warmup' as const,
            },
          ],
        },
      ],
    }

    const exportedJson = exportRoutineToJson(sampleProgram, 'جدول اختبار')
    expect(exportedJson).toContain('maganis')
    expect(exportedJson).toContain('workout_routine')

    const parsed = parseAndValidateRoutineJson(exportedJson)
    expect(parsed.success).toBe(true)
    if (parsed.success) {
      expect(parsed.title).toBe('جدول اختبار')
      expect(parsed.program.days).toHaveLength(1)
      expect(parsed.program.days[0].exercises[0].exerciseId).toBe('bench-press')
      expect(parsed.program.days[0].exercises[1].section).toBe('warmup')
    }
  })

  it('rejects invalid or malformed routine JSON with descriptive error', () => {
    const invalidJson = '{ "broken": true }'
    const res = parseAndValidateRoutineJson(invalidJson)
    expect(res.success).toBe(false)

    const syntaxError = parseAndValidateRoutineJson('not json at all')
    expect(syntaxError.success).toBe(false)
  })

  it('shares routine file via Web Share API when supported or falls back to download', async () => {
    const sampleProgram = {
      id: 'test-prog-share',
      createdAt: 12345678,
      primaryGoal: 'hypertrophy' as const,
      trainingDaysPerWeek: 1,
      days: [
        {
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'كارديو',
          exercises: [],
        },
      ],
    }

    // Mock navigator.share
    const originalShare = navigator.share
    const originalCanShare = navigator.canShare
    let sharedPayload: unknown = null

    Object.defineProperty(navigator, 'canShare', {
      value: () => true,
      configurable: true,
    })
    Object.defineProperty(navigator, 'share', {
      value: async (data: unknown) => {
        sharedPayload = data
      },
      configurable: true,
    })

    const { shareRoutineFile } = await import('./workoutUtils.ts')
    const res = await shareRoutineFile(sampleProgram, 'جدول مشاركة')
    expect(res.shared).toBe(true)
    expect(res.method).toBe('native')
    expect(sharedPayload).not.toBeNull()

    // Restore
    Object.defineProperty(navigator, 'share', {
      value: originalShare,
      configurable: true,
    })
    Object.defineProperty(navigator, 'canShare', {
      value: originalCanShare,
      configurable: true,
    })
  })
})
