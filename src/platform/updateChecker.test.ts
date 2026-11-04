import { describe, it, expect, vi } from 'vitest'
import {
  compareSemver,
  extractArabicReleaseNotes,
  checkForUpdates,
} from './updateChecker.ts'

describe('Update Checker & Sideload Guidance (Task N5.5)', () => {
  it('compareSemver compares version numbers correctly and strips debug suffixes', () => {
    expect(compareSemver('0.2.0', '0.1.0')).toBe(1)
    expect(compareSemver('0.1.0', '0.2.0')).toBe(-1)
    expect(compareSemver('v1.0.0', '1.0.0-debug')).toBe(0)
    expect(compareSemver('0.1.5', '0.1.4')).toBe(1)
    expect(compareSemver('0.1.0', '0.1.0')).toBe(0)
  })

  it('extractArabicReleaseNotes extracts plain text and strips HTML tags', () => {
    const rawBody = `
## [v0.2.0]

### ar
- تحسين أداء حفظ النسخ الاحتياطية.
- إضافة منبه انتهاء الراحة <b>المحسّن</b>.
- إصلاح عرض أسماء العضلات.
- هذا السطر الرابع يجب ألا يظهر (حد أقصى 3).

### en
- Updated SQLite schema
- Fixed background worker
    `

    const notes = extractArabicReleaseNotes(rawBody)
    expect(notes.length).toBe(3)
    expect(notes[0]).toBe('تحسين أداء حفظ النسخ الاحتياطية.')
    expect(notes[1]).toBe('إضافة منبه انتهاء الراحة المحسّن.') // <b> stripped
    expect(notes[2]).toBe('إصلاح عرض أسماء العضلات.')
  })

  it('debug build: blocks update check with Arabic message', async () => {
    const fetchMock = vi.fn()
    const res = await checkForUpdates(
      '0.1.0-debug',
      'debug',
      fetchMock as unknown as typeof fetch,
    )

    expect(fetchMock).not.toHaveBeenCalled()
    expect(res.status).toBe('debug_build')
    expect(res.messageAr).toContain('نسخة تجريبية')
  })

  it('offline case: returns status offline when fetch throws network error', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValue(new Error('Failed to fetch (offline)'))
    const res = await checkForUpdates(
      '0.1.0',
      'release',
      fetchMock as unknown as typeof fetch,
    )

    expect(res.status).toBe('offline')
    expect(res.messageAr).toContain('مفيش اتصال بالإنترنت')
  })

  it('rate limited case: returns rate_limited when HTTP status is 403 or 429', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      statusText: 'rate limit exceeded',
    })
    const res = await checkForUpdates(
      '0.1.0',
      'release',
      fetchMock as unknown as typeof fetch,
    )

    expect(res.status).toBe('rate_limited')
    expect(res.messageAr).toContain('طلبات التحديث')
  })

  it('malformed response: rejects untrusted schema or hostile download URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        tag_name: 'v0.2.0',
        assets: [
          {
            name: 'maganis-0.2.0.apk',
            // Hostile third-party domain (violates rule)
            browser_download_url: 'https://evil-site.com/malware.apk',
          },
        ],
      }),
    })

    const res = await checkForUpdates(
      '0.1.0',
      'release',
      fetchMock as unknown as typeof fetch,
    )
    expect(res.status).toBe('invalid_response')
    expect(res.messageAr).toContain('غير مطابقة لمعايير الأمان')
  })

  it('update available: parses valid release with trusted GitHub download URL', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        tag_name: 'v0.2.0',
        body: '### ar\n- ميزة جديدة ومهمة.\n- استقرار أكبر للتمارين.',
        published_at: '2026-11-05T12:00:00Z',
        assets: [
          {
            name: 'maganis-0.2.0-2.apk',
            browser_download_url:
              'https://github.com/ahmedmootx-sys/maganis-app/releases/download/v0.2.0/maganis-0.2.0-2.apk',
            size: 15 * 1024 * 1024,
          },
        ],
      }),
    })

    const res = await checkForUpdates(
      '0.1.0',
      'release',
      fetchMock as unknown as typeof fetch,
    )
    expect(res.status).toBe('update_available')
    expect(res.latestVersion).toBe('0.2.0')
    expect(res.downloadUrl).toBe(
      'https://github.com/ahmedmootx-sys/maganis-app/releases/download/v0.2.0/maganis-0.2.0-2.apk',
    )
    expect(res.releaseNotesAr?.length).toBe(2)
  })

  it('up to date: detects when current version matches or exceeds latest release', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        tag_name: 'v0.1.0',
        body: '### ar\n- نسخة سابقة',
        assets: [
          {
            name: 'maganis-0.1.0-1.apk',
            browser_download_url:
              'https://github.com/ahmedmootx-sys/maganis-app/releases/download/v0.1.0/maganis-0.1.0-1.apk',
          },
        ],
      }),
    })

    const res = await checkForUpdates(
      '0.1.0',
      'release',
      fetchMock as unknown as typeof fetch,
    )
    expect(res.status).toBe('up_to_date')
    expect(res.messageAr).toContain('أنت بتستخدم أحدث إصدار بالفعل')
  })
})
