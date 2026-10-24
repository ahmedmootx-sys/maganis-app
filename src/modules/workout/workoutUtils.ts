import type {
  Exercise,
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
} from '../shared/types.ts'
import { EXERCISES } from './exercises.ts'

/**
 * Workout and exercise helper utility functions.
 */

/**
 * Formats a total duration in seconds to MM:SS string.
 */
export function formatTime(totalSeconds: number): string {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return '00:00'
  const mins = Math.floor(totalSeconds / 60)
  const secs = Math.floor(totalSeconds % 60)
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
}

/**
 * Converts all exercises of a program day to home-friendly equivalents
 * (bodyweight, resistance band, dumbbell) targeting the exact same muscle groups.
 */
export function convertDayToHomeWorkout(
  day: ProgramDay,
  customExercises: Exercise[] = [],
  userInjuries: string[] = [],
  excludedExerciseIds: string[] = [],
): ProgramDay {
  const allExercises = [...EXERCISES, ...customExercises].filter(
    (e) =>
      !excludedExerciseIds.includes(e.id) &&
      (!userInjuries.length ||
        !e.avoidForInjuries?.some((inj) => userInjuries.includes(inj))),
  )

  const homePool = allExercises.filter(
    (e) =>
      e.equipment === 'bodyweight' ||
      e.equipment === 'band' ||
      e.equipment === 'dumbbell',
  )

  const usedToday = new Set<string>()
  const newExercises: ProgramExercise[] = []

  for (const pe of day.exercises) {
    const current = allExercises.find((e) => e.id === pe.exerciseId)
    if (!current) {
      newExercises.push(pe)
      continue
    }

    // If already home-friendly and not already used, keep it
    if (
      (current.equipment === 'bodyweight' ||
        current.equipment === 'band' ||
        current.equipment === 'dumbbell') &&
      !usedToday.has(current.id)
    ) {
      usedToday.add(current.id)
      newExercises.push(pe)
      continue
    }

    // Find best home alternative in same category and matching sub-muscle
    const candidates = homePool.filter(
      (h) => h.category === current.category && !usedToday.has(h.id),
    )

    let match = candidates.find(
      (c) =>
        c.targetSubMuscleAr &&
        current.targetSubMuscleAr &&
        c.targetSubMuscleAr === current.targetSubMuscleAr,
    )

    if (!match && candidates.length > 0) {
      // Prioritize same difficulty
      match =
        candidates.find((c) => c.difficulty === current.difficulty) ||
        candidates[0]
    }

    if (match) {
      usedToday.add(match.id)
      newExercises.push({
        ...pe,
        exerciseId: match.id,
      })
    } else {
      // Fallback: any unused home exercise from same category
      const fallback = homePool.find(
        (h) => h.category === current.category && !usedToday.has(h.id),
      )
      if (fallback) {
        usedToday.add(fallback.id)
        newExercises.push({
          ...pe,
          exerciseId: fallback.id,
        })
      } else {
        newExercises.push(pe)
      }
    }
  }

  return {
    ...day,
    exercises: newExercises,
  }
}

export interface ExportedRoutinePayload {
  app: 'maganis'
  version: string
  type: 'workout_routine'
  exportedAt: number
  title?: string
  program: WorkoutProgram
}

/**
 * Serializes a workout program to formatted JSON for sharing and export.
 */
export function exportRoutineToJson(
  program: WorkoutProgram,
  title = 'جدول تمارين Maganis',
): string {
  const payload: ExportedRoutinePayload = {
    app: 'maganis',
    version: '1.0',
    type: 'workout_routine',
    exportedAt: Date.now(),
    title,
    program,
  }
  return JSON.stringify(payload, null, 2)
}

/**
 * Triggers browser download of the routine JSON file.
 */
export function downloadRoutineFile(
  program: WorkoutProgram,
  title = 'جدول تمارين Maganis',
): void {
  const json = exportRoutineToJson(program, title)
  const blob = new Blob([json], { type: 'application/json;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const safeTitle = title.replace(/[^\w\u0600-\u06FF-]/g, '_')
  a.href = url
  a.download = `maganis-routine-${safeTitle}-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/**
 * Shares the routine file directly via Web Share API (WhatsApp, Telegram, etc.)
 * Falls back to standard download if Web Share API is not supported.
 */
export async function shareRoutineFile(
  program: WorkoutProgram,
  title = 'جدول تمارين Maganis',
): Promise<{ shared: boolean; method: 'native' | 'download' }> {
  const json = exportRoutineToJson(program, title)
  const safeTitle = title.replace(/[^\w\u0600-\u06FF-]/g, '_')
  const fileName = `maganis-routine-${safeTitle}-${new Date().toISOString().split('T')[0]}.json`
  const blob = new Blob([json], { type: 'application/json' })

  if (
    typeof navigator !== 'undefined' &&
    typeof navigator.share === 'function'
  ) {
    try {
      const file = new File([blob], fileName, { type: 'application/json' })
      if (
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          files: [file],
          title: `جدول تمرين مجانس: ${title}`,
          text: `جدول تمرين (${title}) من تطبيق مجانس — تقدر تفتحه في التطبيق علطول!`,
        })
        return { shared: true, method: 'native' }
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        return { shared: false, method: 'native' }
      }
    }
  }

  // Fallback to downloading
  downloadRoutineFile(program, title)
  return { shared: true, method: 'download' }
}

/**
 * Validates and parses an imported routine JSON string.
 */
export function parseAndValidateRoutineJson(
  jsonStr: string,
):
  | { success: true; program: WorkoutProgram; title: string }
  | { success: false; error: string } {
  try {
    const data = JSON.parse(jsonStr)

    // Check if wrapped in ExportedRoutinePayload or pure WorkoutProgram
    const candidateProg: WorkoutProgram =
      data && typeof data === 'object' && 'program' in data
        ? data.program
        : data

    const title: string =
      (data && typeof data === 'object' && typeof data.title === 'string'
        ? data.title
        : '') || 'جدول تمارين مستورد'

    if (!candidateProg || typeof candidateProg !== 'object') {
      return {
        success: false,
        error: 'الملف لا يحتوي على كائن جدول تمارين صالح.',
      }
    }

    if (!Array.isArray(candidateProg.days) || candidateProg.days.length === 0) {
      return {
        success: false,
        error: 'الملف غير صالح: لا توجد أيام تمارين مسجلة في هذا الجدول.',
      }
    }

    // Validate days and exercises structure
    for (const [dayIdx, day] of candidateProg.days.entries()) {
      if (typeof day !== 'object' || day === null) {
        return {
          success: false,
          error: `اليوم رقم ${dayIdx + 1} بتنسيق غير صحيح.`,
        }
      }
      if (!Array.isArray(day.exercises)) {
        return {
          success: false,
          error: `اليوم (${day.labelAr || dayIdx + 1}) لا يحتوي على قائمة تمارين صحيحة.`,
        }
      }
      for (const ex of day.exercises) {
        if (!ex.exerciseId || typeof ex.exerciseId !== 'string') {
          return {
            success: false,
            error: `يوجد تمرين مجهول الهوية في اليوم (${day.labelAr || dayIdx + 1}).`,
          }
        }
      }
    }

    const sanitizedProgram: WorkoutProgram = {
      ...candidateProg,
      id: candidateProg.id || `imported-${Date.now()}`,
      createdAt: candidateProg.createdAt || Date.now(),
      days: candidateProg.days.map((d: ProgramDay, idx: number) => ({
        dayIndex: typeof d.dayIndex === 'number' ? d.dayIndex : idx,
        labelAr: d.labelAr || `اليوم ${idx + 1}`,
        focus: d.focus || 'تمارين متنوعة',
        exercises: (d.exercises || []).map((e: ProgramExercise) => ({
          exerciseId:
            String(e.exerciseId) === 'shoulder-2'
              ? 'shoulder-15'
              : String(e.exerciseId),
          sets: Number(e.sets) || 3,
          reps: Number(e.reps) || 10,
          restSeconds: Number(e.restSeconds) || 60,
          notes: e.notes ? String(e.notes) : undefined,
          section: e.section || 'primary',
        })),
      })),
    }

    return { success: true, program: sanitizedProgram, title }
  } catch (err) {
    return {
      success: false,
      error: `تعذر قراءة الملف كـ JSON صالح: ${err instanceof Error ? err.message : 'خطأ غير معروف'}`,
    }
  }
}

/**
 * Heals orphaned or legacy exercise IDs to canonical IDs.
 * Specifically: 'shoulder-2' was an orphaned ID that canonically maps to 'shoulder-15' (Dumbbell Shoulder Press).
 */
export function healExerciseId(id: string): string {
  if (id === 'shoulder-2') return 'shoulder-15'
  return id
}

export function healProgram(
  program: WorkoutProgram | null,
): WorkoutProgram | null {
  if (!program || !Array.isArray(program.days)) return program
  return {
    ...program,
    days: program.days.map((day) => ({
      ...day,
      exercises: (day.exercises || []).map((ex) => ({
        ...ex,
        exerciseId: healExerciseId(ex.exerciseId),
      })),
    })),
  }
}
