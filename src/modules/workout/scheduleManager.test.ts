import { describe, it, expect } from 'vitest'
import { getScheduledSessionsCount, getNextSession } from './scheduleManager.ts'
import { generateProgram } from './programGenerator.ts'
import type { WorkoutProgram } from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('scheduleManager & programGenerator weekStartDay / cardio support', () => {
  it('getScheduledSessionsCount includes cardio sessions alongside strength days', () => {
    const schedule = {
      6: 'd1',
      0: 'd2',
      1: 'd3',
      2: 'd4',
      3: 'd5',
      4: 'cardio',
      5: 'rest',
    }
    expect(getScheduledSessionsCount(schedule)).toBe(6)
  })

  it('getNextSession returns cardio session when the next scheduled day is cardio', () => {
    const program: WorkoutProgram = {
      id: 'p1',
      title: 'برنامج',
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      createdAt: Date.now(),
      days: [
        {
          id: 'd1',
          dayIndex: 0,
          labelAr: 'السبت',
          focus: 'علوي',
          exercises: [],
        },
      ],
    }
    const schedule = {
      6: 'd1',
      0: 'rest',
      1: 'cardio',
      2: 'rest',
      3: 'rest',
      4: 'rest',
      5: 'rest',
    }
    // Today = Sunday (0, rest); next scheduled day = Monday (1, cardio)
    const next = getNextSession(schedule, 0, program, 6)
    expect(next).not.toBeNull()
    expect(next?.weekday).toBe(1)
    expect(next?.nameAr).toBe('الإثنين')
    expect(next?.day.kind).toBe('cardio')
  })

  it('generateProgram uses profile.weekStartDay for generated day labels instead of always starting Sunday', () => {
    const profile: UserProfile = {
      id: 'u1',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      name: 'اختبار',
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      trainingDaysPerWeek: 3,
      weekStartDay: 6, // Saturday
      experienceLevel: 'intermediate',
      trainingLocation: 'gym',
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      body: {
        sex: 'male',
        age: 28,
        heightCm: 178,
        weightKg: 78,
        activityLevel: 'moderate',
      },
    }
    const prog = generateProgram({
      goal: 'hypertrophy',
      trainingDaysPerWeek: 3,
      profile,
    })
    expect(prog.days[0].labelAr).toBe('السبت')
    expect(prog.days[1].labelAr).toBe('الأحد')
    expect(prog.days[2].labelAr).toBe('الإثنين')
  })
})
