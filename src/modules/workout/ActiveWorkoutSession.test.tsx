import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { ActiveWorkoutSession } from './ActiveWorkoutSession.tsx'
import type { ProgramDay } from '../shared/types.ts'

const mockDay: ProgramDay = {
  dayIndex: 0,
  labelAr: 'الأحد (صدر)',
  focus: 'صدر وترايسبس',
  exercises: [
    { exerciseId: 'chest-1', sets: 3, reps: 10, restSeconds: 60 },
    { exerciseId: 'chest-3', sets: 2, reps: 12, restSeconds: 45 },
  ],
}

describe('ActiveWorkoutSession', () => {
  afterEach(() => {
    cleanup()
  })
  it('renders routine day title, stopwatch, and exercises with sets tables', () => {
    const handleFinish = vi.fn()
    const handleCancel = vi.fn()

    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />,
    )

    expect(screen.getByText('الأحد (صدر)')).toBeInTheDocument()
    expect(screen.getByText('صدر وترايسبس')).toBeInTheDocument()
    expect(screen.getByText('ضغط صدري بالبار')).toBeInTheDocument()
    expect(screen.getByText('تمرين الضغط (ضغط أرضي)')).toBeInTheDocument()
  })

  it('marks sets as completed on checkmark button click', () => {
    const handleFinish = vi.fn()
    const handleCancel = vi.fn()

    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />,
    )

    const checkButtons = screen.getAllByRole('button', { name: '✓' })
    expect(checkButtons.length).toBeGreaterThanOrEqual(3)

    // Click first set checkmark
    fireEvent.click(checkButtons[0])
    expect(checkButtons[0]).toHaveClass('checked')
  })

  it('opens confirmation modal and triggers onFinish when clicking finish workout', () => {
    const handleFinish = vi.fn()
    const handleCancel = vi.fn()

    render(
      <ActiveWorkoutSession
        programDay={mockDay}
        onFinish={handleFinish}
        onCancel={handleCancel}
      />,
    )

    const finishBtn = screen.getByTestId('header-finish-btn')
    fireEvent.click(finishBtn)

    expect(screen.getByText('🎉 مبروك إنهاء التمرين!')).toBeInTheDocument()

    const confirmBtn = screen.getByTestId('confirm-save-session-btn')
    fireEvent.click(confirmBtn)

    expect(handleFinish).toHaveBeenCalledTimes(1)
  })
})
