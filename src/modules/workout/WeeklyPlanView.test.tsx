import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WeeklyPlanView } from './WeeklyPlanView.tsx'
import { generateProgram } from './programGenerator.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('WeeklyPlanView', () => {
  const mockProfile: UserProfile = {
    id: 'user-1',
    name: 'أحمد',
    experienceLevel: 'intermediate',
    trainingLocation: 'gym',
    primaryGoal: 'hypertrophy',
    goals: ['hypertrophy'],
    trainingDaysPerWeek: 4,
    weekStartDay: 6,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    body: {
      weightKg: 75,
      heightCm: 175,
      sex: 'male',
      age: 25,
      activityLevel: 'moderate',
    },
    medical: {
      hasIssues: false,
      injuryTags: [],
      notes: '',
    },
  }

  it('renders weekly plan overview with program days', () => {
    const program = generateProgram({
      goal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      profile: mockProfile,
    })
    render(<WeeklyPlanView program={program} profile={mockProfile} />)

    expect(screen.getByText('التدريب')).toBeInTheDocument()
    expect(screen.getByText('علوي / سفلي')).toBeInTheDocument()
  })
})
