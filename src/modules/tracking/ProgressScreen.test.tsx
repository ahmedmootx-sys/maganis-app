import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ProgressScreen } from './ProgressScreen.tsx'
import type { TrackingSession, BodyLogEntry, DayNote } from '../shared/types.ts'

const mockSessions: TrackingSession[] = [
  {
    id: 'session-1',
    date: '2026-11-15',
    createdAt: 1763200000000,
    programDayIndex: 0,
    notes: '',
    exercises: [
      {
        exerciseId: 'chest-press',
        completed: true,
        sets: [
          { reps: 10, weightKg: 80 },
          { reps: 8, weightKg: 85 },
        ],
      },
    ],
  },
  {
    id: 'session-2',
    date: '2026-11-16',
    createdAt: 1763286400000,
    programDayIndex: null,
    notes: '',
    cardioDetails: {
      activityId: 'running',
      activityNameAr: 'جري خفيف',
      level: 'moderate',
      durationMinutes: 30,
      grossKcal: 300,
      netKcal: 250,
    },
    exercises: [],
  },
]

const mockBodyLog: BodyLogEntry[] = [
  { date: '2026-11-10', weightKg: 75.0 },
  { date: '2026-11-15', weightKg: 74.5 },
]

const mockNotes: DayNote[] = [
  { date: '2026-11-15', note: 'طاقة ممتازة ونوم عميق' },
]

describe('ProgressScreen - Workout Session Deletion and Reports Revamp', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    cleanup()
  })

  it('renders session delete button and calls onDeleteSession on confirmation', () => {
    const onDeleteSession = vi.fn()
    const onUpdateSessions = vi.fn()

    render(
      <ProgressScreen
        sessions={mockSessions}
        bodyLog={mockBodyLog}
        dayNotes={mockNotes}
        onAddBodyWeight={vi.fn()}
        onAddDayNote={vi.fn()}
        onDeleteSession={onDeleteSession}
        onUpdateSessions={onUpdateSessions}
      />,
    )

    // Check delete buttons for the sessions exist
    const deleteButtons = screen.getAllByRole('button', {
      name: /حذف جلسة 2026-11-15/i,
    })
    expect(deleteButtons.length).toBeGreaterThan(0)

    // Click delete
    fireEvent.click(deleteButtons[0])

    // Confirm sheet opens with destructive confirmation
    expect(screen.getByText('حذف جلسة التمرين؟')).toBeInTheDocument()
    expect(
      screen.getByText(/سيتم حذف بيانات هذه الجلسة بالكامل وإزالتها من التقارير/i),
    ).toBeInTheDocument()

    // Click confirm
    const confirmBtn = screen.getByRole('button', { name: 'نعم، حذف الجلسة' })
    fireEvent.click(confirmBtn)

    expect(onDeleteSession).toHaveBeenCalledWith('session-1')
  })

  it('falls back to onUpdateSessions when onDeleteSession is not provided', () => {
    const onUpdateSessions = vi.fn()

    render(
      <ProgressScreen
        sessions={mockSessions}
        bodyLog={mockBodyLog}
        dayNotes={mockNotes}
        onAddBodyWeight={vi.fn()}
        onAddDayNote={vi.fn()}
        onUpdateSessions={onUpdateSessions}
      />,
    )

    const deleteButtons = screen.getAllByRole('button', {
      name: /حذف جلسة 2026-11-15/i,
    })
    fireEvent.click(deleteButtons[0])

    const confirmBtn = screen.getByRole('button', { name: 'نعم، حذف الجلسة' })
    fireEvent.click(confirmBtn)

    expect(onUpdateSessions).toHaveBeenCalled()
    const updated = onUpdateSessions.mock.calls[0][0]
    expect(updated.find((s: TrackingSession) => s.id === 'session-1')).toBeUndefined()
  })

  it('renders redesigned reports tab with overview stats, muscle sets, and PRs', () => {
    render(
      <ProgressScreen
        sessions={mockSessions}
        bodyLog={mockBodyLog}
        dayNotes={mockNotes}
        onAddBodyWeight={vi.fn()}
        onAddDayNote={vi.fn()}
        initialSubTab="reports"
      />,
    )

    // Overview Stats
    expect(screen.getByText('إجمالي الجلسات')).toBeInTheDocument()
    expect(screen.getByText('إجمالي الحمل المرفوع')).toBeInTheDocument()
    expect(screen.getByText('معدل الحمل لكل جلسة')).toBeInTheDocument()
    expect(screen.getByText('أعلى وزن مسجل')).toBeInTheDocument()

    // Sections
    expect(screen.getByText('الحمل المرفوع (كجم)')).toBeInTheDocument()
    expect(screen.getByText('المجموعات الأسبوعية لكل عضلة')).toBeInTheDocument()
    expect(screen.getByText('منحنى تغير وزن الجسم')).toBeInTheDocument()
    expect(
      screen.getByText('الأرقام القياسية الشخصية (أعلى وزن)'),
    ).toBeInTheDocument()
  })
})
