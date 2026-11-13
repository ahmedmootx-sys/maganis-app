import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { Dashboard } from './Dashboard'

afterEach(() => {
  cleanup()
})
import type { UserProfile } from '../onboarding/types'
import type { WorkoutProgram } from '../shared/types'

const baseProfile: UserProfile = {
  id: 'test-user',
  createdAt: Date.now(),
  updatedAt: Date.now(),
  name: 'كريم',
  goals: ['hypertrophy'],
  primaryGoal: 'hypertrophy',
  trainingDaysPerWeek: 6,
  medical: { hasIssues: false, injuryTags: [], notes: '' },
  body: {
    sex: 'male',
    age: 30,
    heightCm: 180,
    weightKg: 80,
    activityLevel: 'moderate',
  },
}

describe('Dashboard Sessions Card Planned Count (Task H4.4)', () => {
  it('renders "0 من 6" when profile has 6 training days and no active program', () => {
    render(
      <Dashboard
        profile={baseProfile}
        program={null}
        recentSessions={[]}
        bodyLog={[]}
      />,
    )

    expect(screen.getByText('0 من 6')).toBeInTheDocument()
    expect(screen.getByText('0 جلسات')).toBeInTheDocument()
  })

  it('renders "لسه ما اخترتش عدد أيام التمرين" when trainingDaysPerWeek is 0 or missing and no program', () => {
    const unconfiguredProfile: UserProfile = {
      ...baseProfile,
      trainingDaysPerWeek: 0,
    }

    render(
      <Dashboard
        profile={unconfiguredProfile}
        program={null}
        recentSessions={[]}
        bodyLog={[]}
      />,
    )

    expect(
      screen.getByText('لسه ما اخترتش عدد أيام التمرين'),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'تحديد الأيام' }),
    ).toBeInTheDocument()
  })

  it('renders planned count correctly when active program is present', () => {
    const sampleProgram: WorkoutProgram = {
      id: 'prog-1',
      name: 'جدول تجريبي',
      description: 'وصف',
      source: 'manual',
      primaryGoal: 'hypertrophy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trainingDaysPerWeek: 3,
      cycleDays: 7,
      days: [
        {
          id: 'day-1',
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'صدر وتراي',
          exercises: [],
        },
        {
          id: 'day-2',
          dayIndex: 1,
          labelAr: 'اليوم الثاني',
          focus: 'ظهر وباي',
          exercises: [],
        },
        {
          id: 'day-3',
          dayIndex: 2,
          labelAr: 'اليوم الثالث',
          focus: 'أرجل وأكتاف',
          exercises: [],
        },
      ],
    }

    render(
      <Dashboard
        profile={baseProfile}
        program={sampleProgram}
        recentSessions={[]}
        bodyLog={[]}
      />,
    )

    // With 3 days scheduled in weekLoad and 0 done
    expect(screen.getByText('0 من 3')).toBeInTheDocument()
  })

  it('renders dedicated cardio card instead of rest day when today is cardio', () => {
    const todayWeekday = new Date().getDay()
    const onStartCardio = vi.fn()
    const cardioProfile: UserProfile = {
      ...baseProfile,
      weekStartDay: 6,
      trainingDaysPerWeek: 3,
      schedule: {
        0: 'rest',
        1: 'rest',
        2: 'rest',
        3: 'rest',
        4: 'rest',
        5: 'rest',
        6: 'rest',
        [todayWeekday]: 'cardio',
      },
    }
    const prog: WorkoutProgram = {
      id: 'prog-cardio',
      name: 'برنامج',
      description: '',
      source: 'manual',
      primaryGoal: 'hypertrophy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trainingDaysPerWeek: 3,
      cycleDays: 7,
      days: [
        {
          id: 'd1',
          dayIndex: 0,
          labelAr: 'السبت',
          focus: 'صدر وتراي',
          exercises: [],
        },
      ],
    }

    render(
      <Dashboard
        profile={cardioProfile}
        program={prog}
        recentSessions={[]}
        bodyLog={[]}
        onStartCardio={onStartCardio}
      />,
    )

    expect(screen.queryByText('لا يوجد تمرين اليوم (يوم راحة)')).toBeNull()
    expect(screen.getByText(/كارديو واستشفاء نشط/)).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'ابدأ جلسة الكارديو' }))
    expect(onStartCardio).toHaveBeenCalledTimes(1)
  })

  it('respects weekStartDay for next workout button label on rest days', () => {
    const todayWeekday = new Date().getDay()
    const nextWeekday = (todayWeekday + 1) % 7
    const weekdayNames: Record<number, string> = {
      0: 'الأحد',
      1: 'الإثنين',
      2: 'الثلاثاء',
      3: 'الأربعاء',
      4: 'الخميس',
      5: 'الجمعة',
      6: 'السبت',
    }
    const restProfile: UserProfile = {
      ...baseProfile,
      weekStartDay: nextWeekday,
      trainingDaysPerWeek: 1,
      schedule: {
        0: 'rest',
        1: 'rest',
        2: 'rest',
        3: 'rest',
        4: 'rest',
        5: 'rest',
        6: 'rest',
        [nextWeekday]: 'd-first',
      },
    }
    const prog: WorkoutProgram = {
      id: 'prog-rest',
      name: 'برنامج',
      description: '',
      source: 'manual',
      primaryGoal: 'hypertrophy',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      trainingDaysPerWeek: 1,
      cycleDays: 7,
      days: [
        {
          id: 'd-first',
          dayIndex: 0,
          labelAr: 'الأحد', // Deliberately stale label; Dashboard should show nextWeekday's actual name!
          focus: 'علوي',
          exercises: [],
        },
      ],
    }

    render(
      <Dashboard
        profile={restProfile}
        program={prog}
        recentSessions={[]}
        bodyLog={[]}
        onStartWorkout={vi.fn()}
      />,
    )

    expect(
      screen.getByText('لا يوجد تمرين اليوم (يوم راحة)'),
    ).toBeInTheDocument()
    const expectedDayName = weekdayNames[nextWeekday]
    expect(
      screen.getByRole('button', {
        name: `بدء تمرين مبكر (${expectedDayName})`,
      }),
    ).toBeInTheDocument()
  })
})
