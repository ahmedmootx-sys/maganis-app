import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { UpdatePromptSheet } from './UpdatePromptSheet.tsx'
import type { UpdateCheckResult } from '../../platform/updateChecker.ts'

const mockUpdateResult: UpdateCheckResult = {
  status: 'update_available',
  messageAr: 'يتوفر تحديث جديد (v0.2.3).',
  currentVersion: '0.2.2',
  latestVersion: '0.2.3',
  apkSizeMb: 31.8,
  releaseDate: '2026-11-15',
  downloadUrl:
    'https://github.com/ahmedmootx-sys/maganis-app/releases/download/v0.2.3/bunyan-0.2.3.apk',
  releaseNotesAr: [
    'إضافة ميزة فحص التحديثات التلقائية',
    'تحسين واجهة الاستخدام والأداء',
    'إصلاح التمرير في شاشة التمارين',
  ],
  hasApkAsset: true,
}

describe('UpdatePromptSheet UI', () => {
  afterEach(() => {
    cleanup()
  })

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <UpdatePromptSheet
        isOpen={false}
        onClose={vi.fn()}
        result={mockUpdateResult}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders sheet with version info, release notes, and install button when open', () => {
    render(
      <UpdatePromptSheet
        isOpen={true}
        onClose={vi.fn()}
        result={mockUpdateResult}
        onDownloadAndInstall={vi.fn()}
      />,
    )

    expect(screen.getByText('يتوفر تحديث جديد')).toBeDefined()
    expect(screen.getByText('0.2.3')).toBeDefined()
    expect(screen.getByText('0.2.2')).toBeDefined()
    expect(screen.getByText(/31.8/)).toBeDefined()
    expect(screen.getByText(/2026-11-15/)).toBeDefined()

    // Release notes
    expect(screen.getByText('الجديد في هذا الإصدار:')).toBeDefined()
    expect(screen.getByText('إضافة ميزة فحص التحديثات التلقائية')).toBeDefined()
    expect(screen.getByText('تحسين واجهة الاستخدام والأداء')).toBeDefined()
    expect(screen.getByText('إصلاح التمرير في شاشة التمارين')).toBeDefined()

    // Safety guarantee text
    expect(screen.getByText(/بياناتك في أمان تام/)).toBeDefined()

    // Action buttons
    expect(screen.getByText('تنزيل وتثبيت التحديث')).toBeDefined()
    expect(screen.getByText('فتح بالمتصفح')).toBeDefined()
    expect(screen.getByText('لاحقاً')).toBeDefined()
  })

  it('fires onDownloadAndInstall when primary download button is clicked', () => {
    const handleDownload = vi.fn()
    render(
      <UpdatePromptSheet
        isOpen={true}
        onClose={vi.fn()}
        result={mockUpdateResult}
        onDownloadAndInstall={handleDownload}
      />,
    )

    const downloadBtn = screen.getByText('تنزيل وتثبيت التحديث')
    fireEvent.click(downloadBtn)
    expect(handleDownload).toHaveBeenCalledTimes(1)
  })

  it('fires onClose when dismiss button ("لاحقاً") is clicked', () => {
    const handleClose = vi.fn()
    render(
      <UpdatePromptSheet
        isOpen={true}
        onClose={handleClose}
        result={mockUpdateResult}
      />,
    )

    const dismissBtn = screen.getByText('لاحقاً')
    fireEvent.click(dismissBtn)
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it('shows downloading loading text when isDownloading is true', () => {
    render(
      <UpdatePromptSheet
        isOpen={true}
        onClose={vi.fn()}
        result={mockUpdateResult}
        isDownloading={true}
      />,
    )

    expect(screen.getByText('جاري التجهيز والتحميل...')).toBeDefined()
  })

  it('displays backup warning when provided', () => {
    render(
      <UpdatePromptSheet
        isOpen={true}
        onClose={vi.fn()}
        result={mockUpdateResult}
        backupWarning="تنبيه: تعذر إنشاء نسخة احتياطية"
      />,
    )

    expect(screen.getByText('تنبيه: تعذر إنشاء نسخة احتياطية')).toBeDefined()
  })
})
