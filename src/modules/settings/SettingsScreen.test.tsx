import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { SettingsScreen } from './SettingsScreen'
import type { UserProfile } from '../onboarding/types'
import type { BackupData } from '../shared/types'

const mockProfile: UserProfile = {
  id: 'usr_test_1',
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
  name: 'أحمد',
  primaryGoal: 'hypertrophy',
  goals: ['hypertrophy'],
  trainingDaysPerWeek: 4,
  experienceLevel: 'intermediate',
  trainingLocation: 'gym',
  restrictions: 'لا توجد إصابات',
  weekStartDay: 6,
  body: {
    sex: 'male',
    age: 28,
    heightCm: 178,
    weightKg: 82,
    activityLevel: 'moderate',
  },
  medical: {
    hasIssues: false,
    injuryTags: [],
    notes: '',
  },
}

const mockBackupData: BackupData = {
  exportVersion: 1,
  exportedAt: 1700000000000,
  profile: mockProfile,
  workoutProgram: null,
  customExercises: [],
  trackingSessions: [],
  bodyLog: [],
  dayNotes: [],
}

describe('SettingsScreen', () => {
  beforeEach(() => {
    localStorage.clear()
    window.history.replaceState({}, '', '/')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders TopBar with "الإعدادات" and all primary grouped sections', () => {
    render(
      <SettingsScreen
        profile={mockProfile}
        onUpdateProfile={vi.fn()}
        onEditProfile={vi.fn()}
        theme="dark"
        onToggleTheme={vi.fn()}
        backupData={() => mockBackupData}
        onOpenAtlasDebug={vi.fn()}
        onFactoryReset={vi.fn()}
      />,
    )

    expect(screen.getByText('الإعدادات')).toBeDefined()
    expect(screen.getByText('الملف الشخصي')).toBeDefined()
    expect(screen.getByText('التفضيلات')).toBeDefined()
    expect(screen.getByText('البيانات والمزامنة')).toBeDefined()
    expect(screen.getByText('حول التطبيق')).toBeDefined()
    expect(screen.getByText('منطقة الخطر')).toBeDefined()

    // KeyValue profile items
    expect(screen.getByText('أحمد')).toBeDefined()
    expect(screen.getByText('82 كجم')).toBeDefined()
    expect(screen.getByText('178 سم')).toBeDefined()
    expect(screen.getByText('28 سنة')).toBeDefined()
  })

  it('allows switching theme via segmented control', () => {
    const handleToggle = vi.fn()
    const handleChangeMode = vi.fn()

    render(
      <SettingsScreen
        profile={mockProfile}
        onUpdateProfile={vi.fn()}
        onEditProfile={vi.fn()}
        theme="light"
        onToggleTheme={handleToggle}
        onChangeThemeMode={handleChangeMode}
        backupData={() => mockBackupData}
        onOpenAtlasDebug={vi.fn()}
        onFactoryReset={vi.fn()}
      />,
    )

    const darkBtn = screen.getByRole('radio', { name: /داكن/ })
    fireEvent.click(darkBtn)
    expect(handleChangeMode).toHaveBeenCalledWith('dark')
  })

  it('opens edit profile sheet and saves updated fields', () => {
    const handleUpdate = vi.fn()

    render(
      <SettingsScreen
        profile={mockProfile}
        onUpdateProfile={handleUpdate}
        onEditProfile={vi.fn()}
        theme="light"
        onToggleTheme={vi.fn()}
        backupData={() => mockBackupData}
        onOpenAtlasDebug={vi.fn()}
        onFactoryReset={vi.fn()}
      />,
    )

    const editBtn = screen.getByRole('button', { name: /تعديل بياناتي/ })
    fireEvent.click(editBtn)

    // Edit sheet should appear
    expect(screen.getByText('تعديل بيانات الملف الشخصي')).toBeDefined()

    // Change name
    const nameInput = screen.getByPlaceholderText('مثال: أحمد')
    fireEvent.change(nameInput, { target: { value: 'محمد' } })

    // Save
    const saveBtn = screen.getByRole('button', { name: 'حفظ التعديلات' })
    fireEvent.click(saveBtn)

    expect(handleUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'محمد',
        primaryGoal: 'hypertrophy',
      }),
    )
  })

  it('shows destructive ConfirmSheet on factory reset click and executes callback on confirm', () => {
    const handleReset = vi.fn()

    render(
      <SettingsScreen
        profile={mockProfile}
        onUpdateProfile={vi.fn()}
        onEditProfile={vi.fn()}
        theme="light"
        onToggleTheme={vi.fn()}
        backupData={() => mockBackupData}
        onOpenAtlasDebug={vi.fn()}
        onFactoryReset={handleReset}
      />,
    )

    const resetTrigger = screen.getByRole('button', {
      name: /إعادة ضبط التطبيق/i,
    })
    fireEvent.click(resetTrigger)

    // Reset sheet title & options
    expect(screen.getByTestId('reset-sheet-content')).toBeDefined()
    expect(screen.getByTestId('reset-option-keep-edits')).toBeDefined()
    expect(screen.getByTestId('reset-option-delete-all')).toBeDefined()

    const confirmBtn = screen.getByTestId('btn-confirm-factory-reset')
    expect(confirmBtn).toBeDisabled()

    // Select delete all option
    fireEvent.click(screen.getByTestId('reset-option-delete-all'))
    expect(confirmBtn).toBeDisabled()

    const input = screen.getByPlaceholderText('حذف')
    fireEvent.change(input, { target: { value: 'حذف' } })
    expect(confirmBtn).not.toBeDisabled()

    fireEvent.click(confirmBtn)

    expect(handleReset).toHaveBeenCalledWith('delete-all')
  })

  it('only displays Atlas Inspector when ?debug=1 is in URL', () => {
    const { unmount } = render(
      <SettingsScreen
        profile={mockProfile}
        onUpdateProfile={vi.fn()}
        onEditProfile={vi.fn()}
        theme="light"
        onToggleTheme={vi.fn()}
        backupData={() => mockBackupData}
        onOpenAtlasDebug={vi.fn()}
        onFactoryReset={vi.fn()}
      />,
    )

    expect(screen.queryByText('أدوات المطور والتصحيح')).toBeNull()
    unmount()

    // Set debug=1
    window.history.replaceState({}, '', '/?debug=1')

    render(
      <SettingsScreen
        profile={mockProfile}
        onUpdateProfile={vi.fn()}
        onEditProfile={vi.fn()}
        theme="light"
        onToggleTheme={vi.fn()}
        backupData={() => mockBackupData}
        onOpenAtlasDebug={vi.fn()}
        onFactoryReset={vi.fn()}
      />,
    )

    expect(screen.getByText('أدوات المطور والتصحيح')).toBeDefined()
    expect(
      screen.getByText('أداة فحص الرؤوس العضلية (Muscle Atlas Inspector)'),
    ).toBeDefined()
  })
})
