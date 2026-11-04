import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { ErrorBoundary } from './ErrorBoundary.tsx'
import { storageHealth } from './storageHealth.ts'
import { backupEngine } from '../modules/backup/backupEngine.ts'

// Component that conditionally throws
function CrashingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Injected crash for testing')
  }
  return <div>محتوى الشاشة الطبيعي</div>
}

describe('ErrorBoundary & Honest Recovery Screen (Task N5.1)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    storageHealth.setOk()
    backupEngine.resetForTesting()
    backupEngine.setStatusForTesting({
      lastVerifiedTime: Date.now() - 3600000,
      isDirty: false,
    })
  })

  afterEach(() => {
    cleanup()
  })

  it('renders children normally when no error occurs', () => {
    render(
      <ErrorBoundary route="test">
        <CrashingComponent shouldThrow={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('محتوى الشاشة الطبيعي')).toBeInTheDocument()
  })

  it('catches thrown error and displays full recovery UI in Arabic with 4 action buttons', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary route="test">
        <CrashingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )

    expect(screen.getByText('حصلت مشكلة في الشاشة دي')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'جرّب تاني' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'الصفحة الرئيسية' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'ابعت تقرير' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'خد نسخة احتياطية دلوقتي' }),
    ).toBeInTheDocument()

    spy.mockRestore()
  })

  it('shows «بياناتك سليمة ومحفوظة» ONLY when storage is ok and backup is verified', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary route="test">
        <CrashingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )

    const indicator = screen.getByTestId('data-safety-indicator')
    expect(indicator.textContent).toContain('بياناتك سليمة ومحفوظة بالكامل')

    spy.mockRestore()
  })

  it('honest state: displays warning and NEVER claims data is safe if storage is degraded', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    storageHealth.setDegraded('فشل كتابة القرص')

    render(
      <ErrorBoundary route="test">
        <CrashingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )

    const indicator = screen.getByTestId('data-safety-indicator')
    expect(indicator.textContent).not.toContain('بياناتك سليمة')
    expect(indicator.textContent).toContain('غير مستقر')

    spy.mockRestore()
  })

  it('honest state: displays warning if no verified backup exists yet', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    backupEngine.setStatusForTesting({
      lastVerifiedTime: undefined,
    })

    render(
      <ErrorBoundary route="test">
        <CrashingComponent shouldThrow={true} />
      </ErrorBoundary>,
    )

    const indicator = screen.getByTestId('data-safety-indicator')
    expect(indicator.textContent).not.toContain('بياناتك سليمة')
    expect(indicator.textContent).toContain('لم يتم التحقق')

    spy.mockRestore()
  })

  it('anti-loop protection: blocks re-rendering loop after 2 consecutive hits within 10s', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})

    function StatefulTest() {
      return (
        <ErrorBoundary route="test-loop">
          <CrashingComponent shouldThrow={true} />
        </ErrorBoundary>
      )
    }

    render(<StatefulTest />)

    // First crash: retry button is enabled
    const retryBtn = screen.getByRole('button', { name: 'جرّب تاني' })
    expect(retryBtn).not.toBeDisabled()

    // Click retry to simulate rapid second failure
    fireEvent.click(retryBtn)

    // Second consecutive hit within 10s: loop protection activates!
    expect(screen.getByTestId('loop-blocked-warning')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'جرّب تاني' })).toBeDisabled()

    spy.mockRestore()
  })
})
