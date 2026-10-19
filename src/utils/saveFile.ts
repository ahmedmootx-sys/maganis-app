/**
 * Universal file save utility adhering strictly to Task G Part 3.3.
 *
 * 1. If window.showSaveFilePicker exists: use it; ignore AbortError.
 * 2. Else if navigator.canShare?.({files:[file]}) is true: navigator.share({files:[file]}).
 *    (Permitted on Chrome Android for PDF, CSV, TXT, but skipped for JSON).
 * 3. Else: anchor download with Blob URL, returning notice to show Callout.
 */

export interface SaveFileResult {
  method: 'picker' | 'share' | 'download'
  downloadNoticeNeeded?: boolean
  error?: string
}

export const DOWNLOAD_NOTICE_CALLOUT_AR =
  'سيُحفظ الملف في مجلد التنزيلات. لاختيار المكان في كل مرة، فعّل «اسأل عن مكان حفظ الملفات» من إعدادات Chrome ← التنزيلات'

export async function saveFile(
  blob: Blob,
  filename: string,
  mime: string,
): Promise<SaveFileResult> {
  // 1. showSaveFilePicker (Desktop Chromium)
  if (typeof window !== 'undefined' && 'showSaveFilePicker' in window) {
    try {
      const picker = (
        window as unknown as {
          showSaveFilePicker: (opts: unknown) => Promise<FileSystemFileHandle>
        }
      ).showSaveFilePicker
      const handle = await picker({
        suggestedName: filename,
        types: [
          {
            description: filename,
            accept: { [mime]: [`.${filename.split('.').pop() || 'txt'}`] },
          },
        ],
      })
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
      return { method: 'picker' }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { method: 'picker' }
      }
      // Fall through if picker failed for reasons other than abort
    }
  }

  // 2. navigator.share({ files }) (Chrome Android for permitted MIME types, e.g. text/csv, application/pdf)
  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.canShare === 'function'
  ) {
    try {
      const file = new File([blob], filename, { type: mime })
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: filename,
        })
        return { method: 'share' }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') {
        return { method: 'share' }
      }
      // Fall through to download anchor
    }
  }

  // 3. Fallback: Blob URL anchor download
  if (typeof document !== 'undefined') {
    const url =
      typeof URL.createObjectURL === 'function'
        ? URL.createObjectURL(blob)
        : `data:${mime};base64,`
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    if (typeof URL.revokeObjectURL === 'function') {
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }

    return {
      method: 'download',
      downloadNoticeNeeded: true,
    }
  }

  return { method: 'download' }
}
