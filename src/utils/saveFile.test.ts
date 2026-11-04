import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { saveFile } from './saveFile.ts'
import { setNativeForTesting } from '../platform/runtime.ts'
import { webMockImplementation } from '../platform/native/maganisNative.ts'

describe('saveFile capability ladder', () => {
  const originalNavigator = globalThis.navigator

  beforeEach(() => {
    vi.restoreAllMocks()
    setNativeForTesting(null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    setNativeForTesting(null)
  })

  it('Branch 1: Uses showSaveFilePicker when available', async () => {
    const writeMock = vi.fn()
    const closeMock = vi.fn()
    const showSaveFilePicker = vi.fn().mockResolvedValue({
      createWritable: vi.fn().mockResolvedValue({
        write: writeMock,
        close: closeMock,
      }),
    })

    // Attach picker
    ;(
      globalThis as unknown as { showSaveFilePicker: typeof showSaveFilePicker }
    ).showSaveFilePicker = showSaveFilePicker

    const blob = new Blob(['test'], { type: 'text/csv' })
    const res = await saveFile(blob, 'program.csv', 'text/csv')

    expect(res.method).toBe('picker')
    expect(showSaveFilePicker).toHaveBeenCalled()

    delete (globalThis as unknown as { showSaveFilePicker?: unknown })
      .showSaveFilePicker
  })

  it('Branch 2: Uses navigator.share when canShare is true (e.g. text/csv on Chrome Android)', async () => {
    // Ensure showSaveFilePicker is absent
    delete (globalThis as unknown as { showSaveFilePicker?: unknown })
      .showSaveFilePicker

    const shareMock = vi.fn().mockResolvedValue(undefined)
    const canShareMock = vi.fn().mockImplementation(({ files }) => {
      // Allow CSV, disallow JSON
      return files[0]?.type === 'text/csv'
    })

    vi.stubGlobal('navigator', {
      ...originalNavigator,
      share: shareMock,
      canShare: canShareMock,
    })

    const blob = new Blob(['a,b,c'], { type: 'text/csv' })
    const res = await saveFile(blob, 'program.csv', 'text/csv')

    expect(res.method).toBe('share')
    expect(shareMock).toHaveBeenCalled()
  })

  it('Branch 3: Falls back to anchor download for JSON (unsupported MIME in navigator.share)', async () => {
    delete (globalThis as unknown as { showSaveFilePicker?: unknown })
      .showSaveFilePicker

    const shareMock = vi.fn()
    const canShareMock = vi.fn().mockImplementation(({ files }) => {
      return files[0]?.type === 'text/csv'
    })

    vi.stubGlobal('navigator', {
      ...originalNavigator,
      share: shareMock,
      canShare: canShareMock,
    })

    const blob = new Blob(['{}'], { type: 'application/json' })
    const res = await saveFile(blob, 'backup.json', 'application/json')

    expect(res.method).toBe('download')
    expect(res.downloadNoticeNeeded).toBe(true)
    expect(shareMock).not.toHaveBeenCalled()
  })

  it('Branch 0: Routes natively to MaganisNative.saveAs with downloadNoticeNeeded: false', async () => {
    setNativeForTesting(true)
    const saveAsSpy = vi
      .spyOn(webMockImplementation, 'saveAs')
      .mockResolvedValue({
        success: true,
        bytes: 1024,
        uri: 'content://doc/1',
      })

    const blob = new Blob(['{"test":1}'], { type: 'application/json' })
    const res = await saveFile(blob, 'backup.json', 'application/json')

    expect(res.method).toBe('picker')
    expect(res.downloadNoticeNeeded).toBe(false)
    expect(saveAsSpy).toHaveBeenCalledWith({
      name: 'backup.json',
      mime: 'application/json',
    })
  })
})
