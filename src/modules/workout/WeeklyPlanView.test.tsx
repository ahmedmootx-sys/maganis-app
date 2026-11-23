import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WeeklyPlanView } from './WeeklyPlanView.tsx'
import { generateProgram } from './programGenerator.ts'
import type { UserProfile } from '../onboarding/types.ts'
import type { TrackingSession } from '../shared/types.ts'

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

  it('allows deleting a completed workout session for a trained day', () => {
    const program = generateProgram({
      goal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      profile: mockProfile,
    })

    const onDeleteSession = vi.fn()
    const mockSessions: TrackingSession[] = [
      {
        id: 'session-day-0',
        date: '2026-11-18',
        programDayIndex: program.days[0].dayIndex,
        exercises: [],
        notes: '',
        createdAt: Date.now(),
      },
    ]

    render(
      <WeeklyPlanView
        program={program}
        profile={mockProfile}
        sessions={mockSessions}
        onDeleteSession={onDeleteSession}
      />,
    )

    // Open day menu for day 0
    const dayMenuBtn = document.querySelector('.day-menu-btn')
    expect(dayMenuBtn).not.toBeNull()
    fireEvent.click(dayMenuBtn!)

    // Delete session button should be visible in the options sheet
    const deleteSessionBtn = screen.getByText('حذف جلسة التمرين المسجلة لهذا اليوم')
    expect(deleteSessionBtn).toBeInTheDocument()
    fireEvent.click(deleteSessionBtn)

    // Confirm sheet should appear
    const confirmBtn = screen.getByRole('button', { name: 'نعم، حذف الجلسة' })
    expect(confirmBtn).toBeInTheDocument()
    fireEvent.click(confirmBtn)

    expect(onDeleteSession).toHaveBeenCalledWith('session-day-0')
  })

  it('renders exercise count in tertiary metadata and keeps trailing container compact', () => {
    const program = generateProgram({
      goal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      profile: mockProfile,
    })

    const { container } = render(
      <WeeklyPlanView program={program} profile={mockProfile} />,
    )

    // Check that exercise count appears in the DOM
    const exerciseCountTexts = screen.getAllByText(/\d+ تمارين/)
    expect(exerciseCountTexts.length).toBeGreaterThan(0)

    // The trailing container should only contain the action menu button and chevron, not the exercise count
    const trailingContainers = container.querySelectorAll('.list-row__trailing')
    expect(trailingContainers.length).toBeGreaterThan(0)
    for (const trailing of trailingContainers) {
      expect(trailing.textContent).not.toContain('تمارين')
    }
  })

  it('renders long Arabic day titles with clean line-clamp wrapping without nowrap truncation', () => {
    const program = generateProgram({
      goal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      profile: mockProfile,
    })
    program.days[0].labelAr = 'الأربعاء · علوي (أ) — قوة وبناء عضلي شامل ومكثف'

    const { container } = render(
      <WeeklyPlanView program={program} profile={mockProfile} />,
    )

    const titleEl = container.querySelector('.list-row__title span') as HTMLElement
    expect(titleEl).not.toBeNull()
    // Must NOT be single-line nowrap
    expect(titleEl.style.whiteSpace).not.toBe('nowrap')
    // Must have line-clamp 2 and wordBreak
    expect(titleEl.style.webkitLineClamp).toBe('2')
    expect(titleEl.style.wordBreak).toBe('break-word')
  })
})
