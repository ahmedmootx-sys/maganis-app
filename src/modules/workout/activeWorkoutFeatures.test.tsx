import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, act } from '@testing-library/react'
import { ActiveWorkoutSession } from './ActiveWorkoutSession.tsx'
import type { ProgramDay } from '../shared/types.ts'

const mockProgramDay: ProgramDay = {
  dayIndex: 0,
  labelAr: 'يوم الصدر المطور',
  focus: 'عضلات الصدر والترايسبس',
  exercises: [
    {
      exerciseId: 'chest-warmup-1',
      sets: 2,
      reps: 15,
      restSeconds: 30,
      warmup: true,
    },
    {
      exerciseId: 'chest-main-1',
      sets: 3,
      reps: 10,
      restSeconds: 90,
    },
    {
      exerciseId: 'plank-timed',
      sets: 2,
      reps: 60,
      restSeconds: 45,
      cooldown: true,
      measurementType: 'time',
    },
  ],
}

describe('ActiveWorkoutSession - Sections, YouTube Search, and Live Timed Sets', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
    localStorage.clear()
  })

  it('separates exercises into distinct sections (Warmup, Primary, Cooldown)', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Warmup section header
    expect(screen.getByText('تمارين الإحماء')).toBeInTheDocument()
    // Primary exercises section header
    expect(screen.getByText('التمارين الأساسية')).toBeInTheDocument()
    // Cooldown section header
    expect(screen.getByText('تمارين الإطالة والتهدئة')).toBeInTheDocument()
  })

  it('renders direct YouTube search tutorial buttons on exercises', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const ytButtons = screen.getAllByRole('button', {
      name: /فيديو الشرح|يوتيوب/i,
    })
    expect(ytButtons.length).toBeGreaterThan(0)
  })

  it('renders measurement type selector pills on exercise cards', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Pill options should exist
    expect(screen.getAllByRole('button', { name: /وقت وثبات/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /أوزان/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /وزن الجسم/i }).length).toBeGreaterThan(0)
  })

  it('allows starting, live counting, and stopping the stopwatch on timed sets', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Find the start timer button for the timed exercise
    const startBtns = screen.getAllByRole('button', { name: /بدء|ابدأ/i })
    expect(startBtns.length).toBeGreaterThan(0)

    // Click start timer
    fireEvent.click(startBtns[0])

    // Advance timer by 45 seconds
    act(() => {
      vi.advanceTimersByTime(45000)
    })

    // Stop button should now be visible
    const stopBtn = screen.getByRole('button', { name: /إيقاف عداد وقت/i })
    expect(stopBtn).toBeInTheDocument()

    // Click stop to record the score
    fireEvent.click(stopBtn)

    // The recorded seconds should be saved in the set's duration input
    const inputs = screen.getAllByDisplayValue('45')
    expect(inputs.length).toBeGreaterThan(0)
  })

  it('renders Google search button on exercise cards and triggers external search', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const googleBtns = screen.getAllByRole('button', {
      name: /جوجل|Google/i,
    })
    expect(googleBtns.length).toBeGreaterThan(0)
  })

  it('classifies Arabic-named exercises into warmup and cooldown sections', () => {
    const arabicProgramDay: ProgramDay = {
      dayIndex: 1,
      labelAr: 'يوم تدريبي مع مسميات عربية',
      focus: 'تجربة التصنيف',
      exercises: [
        {
          exerciseId: 'custom-warmup-ar',
          customName: 'إحماء عام وتسخين مفاصل',
          sets: 2,
          reps: 10,
          restSeconds: 30,
        },
        {
          exerciseId: 'custom-main-ar',
          customName: 'ضغط بنش مستوي بالبار',
          sets: 3,
          reps: 10,
          restSeconds: 90,
        },
        {
          exerciseId: 'custom-cooldown-ar',
          customName: 'إطالة واستشفاء عضلات الصدر',
          sets: 2,
          reps: 30,
          restSeconds: 30,
        },
      ],
    }

    render(
      <ActiveWorkoutSession
        programDay={arabicProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    expect(screen.getByText('تمارين الإحماء')).toBeInTheDocument()
    expect(screen.getByText('التمارين الأساسية')).toBeInTheDocument()
    expect(screen.getByText('تمارين الإطالة والتهدئة')).toBeInTheDocument()
  })

  it('renders clean fallback exercise names without raw placeholder kebab-case ids', () => {
    const placeholderDay: ProgramDay = {
      dayIndex: 2,
      labelAr: 'اليوم الثاني',
      focus: 'تجربة',
      exercises: [
        {
          exerciseId: 'placeholder-arm-circle',
          sets: 2,
          reps: 12,
          restSeconds: 30,
        },
      ],
    }

    render(
      <ActiveWorkoutSession
        programDay={placeholderDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Should NOT contain the raw kebab-case id
    expect(screen.queryByText('placeholder-arm-circle')).not.toBeInTheDocument()
    // Should contain the clean human-readable name
    expect(screen.getByText('Arm Circle')).toBeInTheDocument()
  })

  it('renders concise hint claim guidance without dumping raw bibliographic citations', () => {
    // When previous sessions exist or first-time weight hint is triggered
    render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // The full academic paper bibliographic citation should NOT be displayed in the session logger
    expect(
      screen.queryByText(/Helms ER, Cronin J, Storey A/i),
    ).not.toBeInTheDocument()
    expect(
      screen.queryByText(/American College of Sports Medicine/i),
    ).not.toBeInTheDocument()
  })

  it('keeps exercise title group separate from action buttons so titles are not squeezed', () => {
    const { container } = render(
      <ActiveWorkoutSession
        programDay={mockProgramDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // Ensure header row only contains title group
    const headers = container.querySelectorAll('.exercise-card-header')
    expect(headers.length).toBeGreaterThan(0)
    for (const header of headers) {
      expect(header.querySelector('.exercise-title-group')).not.toBeNull()
      // Actions group must NOT be nested inside the header row
      expect(header.querySelector('.exercise-actions-group')).toBeNull()
    }

    // Actions group exists directly in the exercise card as its own full-width row
    const actionGroups = container.querySelectorAll('.exercise-actions-group')
    expect(actionGroups.length).toBeGreaterThan(0)
  })
})
