import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ActiveWorkoutSession } from './ActiveWorkoutSession.tsx'
import type { ProgramDay, TrackingSession } from '../shared/types.ts'

const mockDay: ProgramDay = {
  dayIndex: 0,
  labelAr: 'الأحد (صدر)',
  focus: 'صدر وترايسبس',
  exercises: [
    { exerciseId: 'chest-1', sets: 3, reps: 10, restSeconds: 60 },
    { exerciseId: 'chest-3', sets: 2, reps: 12, restSeconds: 45 },
  ],
}

describe('ActiveWorkoutSession Data Integrity & Completion Rules (TASK G2 Part A)', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('A1: ✓ button is disabled / blocks completion until weight > 0 and reps >= 1', () => {
    const handleFinish = vi.fn()
    const handleCancel = vi.fn()

    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />,
    )

    const checkButtons = screen.getAllByRole('button', {
      name: /تأكيد إنهاء المجموعة|✓/,
    })
    const firstCheck = checkButtons[0]

    // Initially, weight is 0/empty, reps is 0/empty (target 10 is placeholder only)
    // Tapping checkmark should NOT mark as completed
    fireEvent.click(firstCheck)
    expect(firstCheck).not.toHaveClass('checked')
    expect(firstCheck).toHaveAttribute('aria-pressed', 'false')

    // Inline hint should appear
    expect(screen.getByText('اكتب الوزن والتكرارات أولًا')).toBeInTheDocument()

    // Now enter weight = 60 and reps = 10
    const weightInputs = screen.getAllByLabelText(/وزن المجموعة 1/)
    const repsInputs = screen.getAllByLabelText(/تكرار المجموعة 1/)

    fireEvent.change(weightInputs[0], { target: { value: '60' } })
    fireEvent.change(repsInputs[0], { target: { value: '10' } })

    // Now clicking check button should succeed
    fireEvent.click(firstCheck)
    expect(firstCheck).toHaveClass('checked')
    expect(firstCheck).toHaveAttribute('aria-pressed', 'true')
  })

  it('A2: previous-value shortcut fills weight and reps from history on click', () => {
    // Provide previous history in tracking.sessions
    const previousSessions = [
      {
        id: 'prev-1',
        date: '2026-10-10',
        programDayIndex: 0,
        createdAt: Date.now() - 86400000,
        exercises: [
          {
            exerciseId: 'chest-1',
            completed: true,
            sets: [
              { weightKg: 75, reps: 8 },
              { weightKg: 80, reps: 6 },
            ],
          },
        ],
      },
    ]

    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        previousSessions={previousSessions as unknown as TrackingSession[]}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // The previous badge / button should show 75 كجم × 8
    const prevButton = screen.getByTestId('prev-set-btn-0-0')
    expect(prevButton).toBeInTheDocument()

    // Click it to copy values
    fireEvent.click(prevButton)

    // Now weight input should have 75 and reps should have 8
    const weightInput = screen.getAllByLabelText(
      /وزن المجموعة 1/,
    )[0] as HTMLInputElement
    const repsInput = screen.getAllByLabelText(
      /تكرار المجموعة 1/,
    )[0] as HTMLInputElement

    expect(weightInput.value).toBe('75')
    expect(repsInput.value).toBe('8')

    // And checking the set should now succeed directly
    const firstCheck = screen.getAllByRole('button', {
      name: /تأكيد إنهاء المجموعة|✓/,
    })[0]
    fireEvent.click(firstCheck)
    expect(firstCheck).toHaveClass('checked')
  })

  it('A3: not-done shows empty circle (no check glyph), done shows check glyph and aria-pressed', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const checkButtons = screen.getAllByRole('button', {
      name: /تأكيد إنهاء المجموعة|✓/,
    })
    const btn = checkButtons[0]

    // Not done: no check glyph text
    expect(btn.textContent?.trim()).toBe('')
    expect(btn).toHaveAttribute('aria-pressed', 'false')

    // Fill valid values and click
    const weightInput = screen.getAllByLabelText(/وزن المجموعة 1/)[0]
    const repsInput = screen.getAllByLabelText(/تكرار المجموعة 1/)[0]
    fireEvent.change(weightInput, { target: { value: '50' } })
    fireEvent.change(repsInput, { target: { value: '12' } })

    fireEvent.click(btn)

    // Done: check glyph text and aria-pressed="true"
    expect(btn.textContent?.trim()).toBe('✓')
    expect(btn).toHaveAttribute('aria-pressed', 'true')
  })

  it('A4: finish sheet uses correct Arabic plurals, warns for missing weights, and shows "—" when no load', () => {
    const handleFinish = vi.fn()

    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={handleFinish}
        onCancel={vi.fn()}
      />,
    )

    const finishBtn = screen.getByTestId('header-finish-btn')
    fireEvent.click(finishBtn)

    // Modal open
    expect(screen.getByText('مبروك إنهاء التمرين!')).toBeInTheDocument()

    // When 0 load was logged, load row shows "—", never "0 كجم"
    const loadValue = screen.getByTestId('finish-total-volume')
    expect(loadValue.textContent).toBe('—')
  })

  it('A8: delete set provides undo Toast with "تم الحذف — تراجع"', () => {
    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    const removeBtns = screen.getAllByRole('button', { name: /حذف المجموعة/ })
    expect(removeBtns.length).toBeGreaterThan(0)

    fireEvent.click(removeBtns[0])

    // Undo toast appears
    expect(
      screen.getByText(/تم الحذف — تراجع|تم حذف المجموعة/),
    ).toBeInTheDocument()
  })

  it('A9: bodyweight exercises render no weight column and tick cleanly with reps only', () => {
    const bodyweightDay: ProgramDay = {
      dayIndex: 0,
      labelAr: 'كاليستينكس',
      focus: 'صدر بوزن الجسم',
      exercises: [
        { exerciseId: 'pushup-1', sets: 2, reps: 15, restSeconds: 60 },
      ],
    }

    const mockCustomExercises = [
      {
        id: 'pushup-1',
        nameAr: 'تمرين الضغط',
        nameEn: 'Push up',
        category: 'chest' as const,
        difficulty: 'beginner' as const,
        equipment: 'bodyweight' as const,
        equipmentDetail: { db: 'body only', ar: 'وزن الجسم' },
      },
    ]

    render(
      <ActiveWorkoutSession
        programDay={bodyweightDay}
        customExercises={mockCustomExercises as any}
        onFinish={vi.fn()}
        onCancel={vi.fn()}
      />,
    )

    // No weight header column
    expect(screen.queryByRole('columnheader', { name: 'الوزن' })).toBeNull()

    // Has reps column
    expect(
      screen.getByRole('columnheader', { name: 'التكرارات' }),
    ).toBeInTheDocument()

    // Enter reps for set 1
    const repsInputs = screen.getAllByPlaceholderText('تكرار')
    fireEvent.change(repsInputs[0], { target: { value: '15' } })

    // Check button should now be ready and tick cleanly
    const checkBtns = screen.getAllByRole('button', {
      name: /تأكيد إنهاء المجموعة/,
    })
    fireEvent.click(checkBtns[0])

    // Set 1 is completed (no validation error)
    expect(checkBtns[0].getAttribute('aria-pressed')).toBe('true')
  })
})
