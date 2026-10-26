import { z } from 'zod'
import type { BackupData } from '../shared/types.ts'

export interface BackupStore {
  exportData(allData: BackupData): Promise<boolean>
  shareData(allData: BackupData): Promise<boolean>
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

export const BackupImportSchema = z
  .object({
    exportVersion: z.number({
      message: 'رقم إصدار ملف النسخة الاحتياطية مفقود أو غير صالح',
    }),
    exportedAt: z.number().optional(),
    profile: z
      .unknown()
      .refine(
        (val) =>
          val === undefined ||
          val === null ||
          (typeof val === 'object' && !Array.isArray(val)),
        { message: 'بيانات الملف الشخصي في النسخة غير صالحة' },
      )
      .optional(),
    workoutProgram: z
      .unknown()
      .refine(
        (val) =>
          val === undefined ||
          val === null ||
          (typeof val === 'object' && !Array.isArray(val)),
        { message: 'بيانات البرنامج التدريبي في النسخة غير صالحة' },
      )
      .optional(),
    customExercises: z
      .array(z.unknown(), {
        message: 'بيانات customExercises في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    trackingSessions: z
      .array(z.unknown(), {
        message: 'بيانات trackingSessions في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    bodyLog: z
      .array(z.unknown(), {
        message: 'بيانات bodyLog في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    dayNotes: z
      .array(z.unknown(), {
        message: 'بيانات dayNotes في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    exerciseOverrides: z
      .unknown()
      .refine(
        (val) => {
          if (val === undefined || val === null) return true
          if (typeof val !== 'object' || Array.isArray(val)) return false
          for (const [_id, overrideObj] of Object.entries(
            val as Record<string, unknown>,
          )) {
            if (!overrideObj || typeof overrideObj !== 'object') {
              return false
            }
          }
          return true
        },
        {
          message: 'بيانات تعديلات التمارين في النسخة الاحتياطية غير صالحة',
        },
      )
      .optional(),
  })
  .passthrough()

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

  async function shareData(allData: BackupData): Promise<boolean> {
    const json = JSON.stringify(allData, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const filename = `maganis-backup-${new Date().toISOString().slice(0, 10)}.json`

    if (
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function'
    ) {
      try {
        const file = new File([blob], filename, { type: 'application/json' })
        if (
          typeof navigator.canShare === 'function' &&
          navigator.canShare({ files: [file] })
        ) {
          await navigator.share({
            files: [file],
            title: 'نسخة احتياطية من تطبيق Maganis',
            text: 'إليك ملف النسخة الاحتياطية لبياناتك من تطبيق Maganis.',
          })
          recordExport()
          return true
        }
      } catch (err: unknown) {
        if ((err as Error)?.name === 'AbortError') {
          return false
        }
      }
    }
    return exportData(allData)
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

      const zodResult = BackupImportSchema.safeParse(parsed)
      if (!zodResult.success) {
        const issue = zodResult.error.issues[0]
        return {
          ok: false,
          error: issue?.message || 'ملف النسخة الاحتياطية غير صالح',
        }
      }

      return { ok: true, data: zodResult.data as unknown as BackupData }
    } catch {
      return { ok: false, error: 'فشل في قراءة أو تحليل ملف النسخة الاحتياطية' }
    }
  }

  return {
    exportData,
    shareData,
    importData,
    shouldShowReminder,
    recordExport,
    getLastExport,
  }
}
