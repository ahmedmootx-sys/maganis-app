import { describe, it, expect, vi, afterEach } from 'vitest'
import { copyToClipboard } from './clipboard.ts'

describe('copyToClipboard', () => {
  const originalClipboard = navigator.clipboard

  afterEach(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: originalClipboard,
      writable: true,
      configurable: true,
    })
    vi.restoreAllMocks()
  })

  it('returns false for empty text', async () => {
    const res = await copyToClipboard('')
    expect(res).toBe(false)
  })

  it('copies via navigator.clipboard.writeText when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: writeTextMock },
      writable: true,
      configurable: true,
    })

    const res = await copyToClipboard('test copy')
    expect(res).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('test copy')
  })

  it('falls back to execCommand when clipboard API fails', async () => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
      writable: true,
      configurable: true,
    })

    document.execCommand = vi.fn().mockReturnValue(true)
    const res = await copyToClipboard('fallback copy')
    expect(res).toBe(true)
    expect(document.execCommand).toHaveBeenCalledWith('copy')
  })
})
