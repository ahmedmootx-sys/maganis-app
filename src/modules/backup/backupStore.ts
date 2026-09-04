import type { BackupData } from '../shared/types.ts'

export interface BackupStore {
  exportData(allData: BackupData): Promise<boolean>
  importData(
    file: File,
  ): Promise<{ ok: boolean; data?: BackupData; error?: string }>
  shouldShowReminder(): boolean
  recordExport(): void
  getLastExport(): number | null
}

const LAST_EXPORT_KEY = 'backup.last-export'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

function readWithFileReader(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsText(file)
  })
}

export function createBackupStore(): BackupStore {
  function getLastExport(): number | null {
    try {
      const raw = localStorage.getItem(LAST_EXPORT_KEY)
      if (!raw) return null
      const ts = Number(JSON.parse(raw))
      return Number.isFinite(ts) ? ts : null
    } catch {
      return null
    }
  }

  function shouldShowReminder(): boolean {
    const ts = getLastExport()
    return !ts || Date.now() - ts > ONE_WEEK_MS
  }

  function recordExport(): void {
    try {
      localStorage.setItem(LAST_EXPORT_KEY, JSON.stringify(Date.now()))
    } catch {
      // silent
    }
  }

  async function exportData(allData: BackupData): Promise<boolean> {
    const json = JSON.stringify(allData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const filename = `maganis-backup-${new Date().toISOString().slice(0, 10)}.json`

    // Try File System Access API
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await (
          window as unknown as {
            showSaveFilePicker(opts: unknown): Promise<FileSystemFileHandle>
          }
        ).showSaveFilePicker({
          suggestedName: filename,
          types: [
            {
              description: 'ملف JSON',
              accept: { 'application/json': ['.json'] },
            },
          ],
        })
        const writable = await handle.createWritable()
        await writable.write(blob)
        await writable.close()
        recordExport()
        return true
      } catch {
        // User cancelled or API not fully supported - fall through
      }
    }

    // Fallback: download link
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    recordExport()
    return true
  }

  async function importData(
    file: File,
  ): Promise<{ ok: boolean; data?: BackupData; error?: string }> {
    let text = ''
    try {
      if (typeof file.text === 'function') {
        try {
          text = await file.text()
        } catch {
          text = await readWithFileReader(file)
        }
      } else {
        text = await readWithFileReader(file)
      }
    } catch {
      return { ok: false, error: 'فشل في قراءة ملف النسخة الاحتياطية' }
    }

    try {
      const parsed: unknown = JSON.parse(text)

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return {
          ok: false,
          error: 'ملف النسخة الاحتياطية غير صالح (ليس كائناً)',
        }
      }

      const raw = parsed as Record<string, unknown>
      if (typeof raw.exportVersion !== 'number') {
        return {
          ok: false,
          error: 'رقم إصدار ملف النسخة الاحتياطية مفقود أو غير صالح',
        }
      }

      if (raw.profile !== undefined && raw.profile !== null) {
        if (typeof raw.profile !== 'object' || Array.isArray(raw.profile)) {
          return { ok: false, error: 'بيانات الملف الشخصي في النسخة غير صالحة' }
        }
      }

      if (raw.workoutProgram !== undefined && raw.workoutProgram !== null) {
        if (
          typeof raw.workoutProgram !== 'object' ||
          Array.isArray(raw.workoutProgram)
        ) {
          return {
            ok: false,
            error: 'بيانات البرنامج التدريبي في النسخة غير صالحة',
          }
        }
      }

      const arrayKeys = [
        'customExercises',
        'trackingSessions',
        'bodyLog',
        'dayNotes',
      ] as const
      for (const key of arrayKeys) {
        if (
          raw[key] !== undefined &&
          raw[key] !== null &&
          !Array.isArray(raw[key])
        ) {
          return {
            ok: false,
            error: `بيانات ${key} في النسخة الاحتياطية غير صالحة`,
          }
        }
      }

      return { ok: true, data: parsed as BackupData }
    } catch {
      return { ok: false, error: 'فشل في قراءة أو تحليل ملف النسخة الاحتياطية' }
    }
  }

  return {
    exportData,
    importData,
    shouldShowReminder,
    recordExport,
    getLastExport,
  }
}
