import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Dashboard } from './Dashboard'
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
})
