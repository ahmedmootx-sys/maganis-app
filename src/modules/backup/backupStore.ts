import { z } from 'zod'
import { appStorage } from '../../platform/storage.ts'
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

export const ProfileImportSchema = z
  .object({
    id: z.string({ message: 'معرف الملف الشخصي مفقود أو غير صالح' }).min(1),
    createdAt: z.number({ message: 'تاريخ إنشاء الملف الشخصي غير صالح' }),
    updatedAt: z.number({ message: 'تاريخ تحديث الملف الشخصي غير صالح' }),
    name: z.string().optional(),
    goals: z
      .array(z.string(), { message: 'أهداف الملف الشخصي يجب أن تكون مصفوفة' })
      .min(1, 'يجب تحديد هدف واحد على الأقل'),
    primaryGoal: z.string({ message: 'الهدف الرئيسي للملف الشخصي غير صالح' }),
    trainingDaysPerWeek: z
      .number({ message: 'أيام التدريب في الملف الشخصي يجب أن تكون رقماً' })
      .min(0)
      .max(7),
    medical: z
      .object({
        hasIssues: z.boolean().optional(),
        injuryTags: z.array(z.string()).optional(),
        notes: z.string().optional(),
      })
      .passthrough()
      .optional()
      .default({ hasIssues: false, injuryTags: [], notes: '' }),
    body: z
      .object({
        sex: z.string().optional(),
        age: z.number().optional(),
        heightCm: z.number().optional(),
        weightKg: z.number().optional(),
        activityLevel: z.string().optional(),
      })
      .passthrough(),
  })
  .passthrough()

export const WorkoutProgramImportSchema = z
  .object({
    id: z.string({ message: 'معرف البرنامج غير صالح' }).min(1),
    days: z
      .array(
        z
          .object({
            id: z.string().optional(),
            dayIndex: z.number({ message: 'رقم اليوم يجب أن يكون رقماً' }),
            labelAr: z.string().optional(),
            focus: z.string().optional(),
            exercises: z
              .array(
                z
                  .object({
                    exerciseId: z.string({ message: 'معرف التمرين غير صالح' }),
                  })
                  .passthrough(),
                { message: 'تمارين اليوم يجب أن تكون مصفوفة' },
              )
              .optional()
              .default([]),
          })
          .passthrough(),
        { message: 'أيام البرنامج التدريبي يجب أن تكون مصفوفة' },
      )
      .min(1, 'البرنامج التدريبي يجب أن يحتوي على يوم واحد على الأقل'),
    trainingDaysPerWeek: z.number().optional(),
    primaryGoal: z.string().optional(),
  })
  .passthrough()

export const TrackingSessionImportSchema = z
  .object({
    id: z.string({ message: 'معرف الجلسة غير صالح' }),
    date: z.string({ message: 'تاريخ الجلسة غير صالح' }),
    exercises: z
      .array(
        z
          .object({
            exerciseId: z.string({
              message: 'معرف التمرين في الجلسة غير صالح',
            }),
            sets: z
              .array(
                z
                  .object({
                    reps: z.number({
                      message: 'عدد التكرارات يجب أن يكون رقماً',
                    }),
                    weightKg: z.number({ message: 'الوزن يجب أن يكون رقماً' }),
                  })
                  .passthrough(),
                { message: 'مجموعات التمرين يجب أن تكون مصفوفة' },
              )
              .optional()
              .default([]),
            completed: z.boolean().optional().default(true),
          })
          .passthrough(),
        { message: 'تمارين الجلسة يجب أن تكون مصفوفة' },
      )
      .optional()
      .default([]),
    notes: z.string().optional().default(''),
    createdAt: z.number().optional(),
  })
  .passthrough()

export const BodyLogImportSchema = z
  .object({
    date: z.string({ message: 'تاريخ تسجيل الوزن غير صالح' }),
    weightKg: z.number({ message: 'وزن الجسم يجب أن يكون رقماً' }),
  })
  .passthrough()

export const DayNotesImportSchema = z
  .object({
    date: z.string({ message: 'تاريخ الملاحظة غير صالح' }),
    note: z.string({ message: 'نص الملاحظة غير صالح' }),
  })
  .passthrough()

export const CustomExerciseImportSchema = z
  .object({
    id: z.string({ message: 'معرف التمرين المخصص غير صالح' }),
    nameAr: z.string({ message: 'اسم التمرين المخصص بالعربية مطلوب' }),
    category: z.string({ message: 'تصنيف العضلة للتمرين المخصص مطلوب' }),
  })
  .passthrough()

export const ExerciseOverrideItemSchema = z
  .object({
    customImage: z
      .object({
        id: z.string().optional(),
        url: z.string().optional(),
        mediaId: z.string().optional(),
        firstFrameUrl: z.string().optional(),
        kind: z.string().optional(),
      })
      .passthrough()
      .optional(),
    customVideo: z
      .object({
        url: z.string().optional(),
        platform: z.string().optional(),
        videoId: z.string().optional(),
      })
      .passthrough()
      .optional(),
    notes: z.string().optional(),
  })
  .passthrough()

export const ExerciseOverrideImportSchema = z.record(
  z.string(),
  ExerciseOverrideItemSchema,
  { message: 'بيانات تعديلات التمارين في النسخة الاحتياطية غير صالحة' },
)

export const BackupImportSchema = z
  .object({
    exportVersion: z.number({
      message: 'رقم إصدار ملف النسخة الاحتياطية مفقود أو غير صالح',
    }),
    exportedAt: z.number().optional(),
    profile: ProfileImportSchema.nullable().optional(),
    workoutProgram: WorkoutProgramImportSchema.nullable().optional(),
    customExercises: z
      .array(CustomExerciseImportSchema, {
        message: 'بيانات customExercises في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    trackingSessions: z
      .array(TrackingSessionImportSchema, {
        message: 'بيانات trackingSessions في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    bodyLog: z
      .array(BodyLogImportSchema, {
        message: 'بيانات bodyLog في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    dayNotes: z
      .array(DayNotesImportSchema, {
        message: 'بيانات dayNotes في النسخة الاحتياطية غير صالحة',
      })
      .optional()
      .default([]),
    exerciseOverrides: ExerciseOverrideImportSchema.optional(),
  })
  .passthrough()

export function createBackupStore(): BackupStore {
  function getLastExport(): number | null {
    try {
      const raw = appStorage.getItem(LAST_EXPORT_KEY)
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
      appStorage.setItem(LAST_EXPORT_KEY, JSON.stringify(Date.now()))
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
            title: 'نسخة احتياطية من تطبيق Bunyan',
            text: 'إليك ملف النسخة الاحتياطية لبياناتك من تطبيق بُنْيَان (Bunyan).',
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
        const top5Issues = zodResult.error.issues.slice(0, 5)
        const formattedErrors = top5Issues.map((issue) => {
          const pathStr =
            issue.path.length > 0 ? ` (${issue.path.join('.')})` : ''
          return `${issue.message}${pathStr}`
        })
        return {
          ok: false,
          error: `أخطاء في بنية ملف النسخة:\n• ` + formattedErrors.join('\n• '),
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
