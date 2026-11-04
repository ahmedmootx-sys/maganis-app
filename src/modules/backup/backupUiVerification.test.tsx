import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { BackupPanel } from './BackupPanel.tsx'
import { BackupHealthBanner } from './BackupHealthBanner.tsx'
import { backupEngine } from './backupEngine.ts'
import { appStorage } from '../../platform/storage.ts'
import { clearMockFilesForTesting } from '../../platform/native/maganisNative.ts'

describe('Rule D4 UI Verification and Truth in Claims (Task N3)', () => {
  beforeEach(() => {
    appStorage.clear()
    clearMockFilesForTesting()
    backupEngine.resetForTesting()
    appStorage.removeItem('maganis:backup.status')
    appStorage.removeItem('maganis:backup.settings')
    appStorage.removeItem('maganis:backup.snooze')
  })

  afterEach(() => {
    cleanup()
  })

  it('renders "never" state truthfully and NEVER claims "متأكد منها" before verified backup', () => {
    render(<BackupPanel />)

    // Truthful never state header
    expect(
      screen.getByText('لم يتم أخذ أي نسخة احتياطية متأكد منها بعد'),
    ).toBeDefined()

    // Must NOT display "آخر نسخة متأكد منها:" or "تم التحقق بالكامل" badge
    const verifiedBadge = screen.queryByText('تم التحقق بالكامل')
    expect(verifiedBadge).toBeNull()

    const bodyText = document.body.textContent || ''
    expect(bodyText).not.toContain('آخر نسخة متأكد منها:')

    // Destinations must say "في الانتظار"
    expect(screen.getAllByText('في الانتظار').length).toBeGreaterThan(0)
  })

  it('claims "متأكد منها" ONLY after read-back verification actually passes', async () => {
    // Populate some data to backup
    appStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({ name: 'كابتن أحمد' }),
    )

    // Execute real verified backup pipeline
    const res = await backupEngine.runBackup('test_d4')
    expect(res.success).toBe(true)

    render(<BackupPanel />)

    // Now verified header and badge MUST be present
    expect(screen.getByText('تم التحقق بالكامل')).toBeDefined()
    const bodyText = document.body.textContent || ''
    expect(bodyText).toContain('آخر نسخة متأكد منها:')

    // L4 disclaimer line must also be present honestly
    expect(bodyText).toContain(
      'النسخ الاحتياطي التلقائي من Google ممكن يساعدك على جهاز جديد لو مفعله من إعدادات الموبايل، لكن التطبيق مقدرش يتحقق منه.',
    )
  })

  it('BackupHealthBanner appears when unverified/stale and disappears when verified', async () => {
    // 1. Initial unverified state -> banner must appear
    const { rerender } = render(<BackupHealthBanner recentSessionsCount={0} />)
    expect(
      screen.getByText('لسه مفيش أي نسخة احتياطية متأكدين منها'),
    ).toBeDefined()

    // 2. Perform verified backup -> banner must vanish
    await backupEngine.runBackup('test_banner')
    rerender(<BackupHealthBanner recentSessionsCount={0} />)

    const bannerText = document.body.textContent || ''
    expect(bannerText).not.toContain('لسه مفيش أي نسخة احتياطية متأكدين منها')
  })

  it('BackupHealthBanner displays first-run nudge card after first completed workout', () => {
    render(<BackupHealthBanner recentSessionsCount={1} />)

    expect(
      screen.getByText('مبروك أول تمرين! بياناتك متأمنة تلقائياً'),
    ).toBeDefined()
    expect(screen.getByText('احفظ أول نسخة دلوقتي')).toBeDefined()
    expect(screen.getByText('فهمت')).toBeDefined()
  })
})
