import type { UserProfile } from '../onboarding/types.ts'
import type {
  ProgramDay,
  ProgramExercise,
  WorkoutProgram,
} from '../shared/types.ts'
import {
  ALL_WEEKDAYS,
  getOrDeriveSchedule,
} from './scheduleManager.ts'

export interface Prescription {
  sets: number
  reps?: number
  repsMin: number
  repsMax?: number
  unit?: 'reps' | 'seconds'
  perSide?: boolean
  amrap?: boolean
  rpe?: number
  restSec?: number
}

/**
 * Strips any auto-generated weekday names from day labels
 * to guarantee day.name never contains an auto-generated weekday word.
 */
export function cleanDayName(name: string | undefined): string {
  if (!name) return 'يوم تدريبي'
  // Remove weekday prefix like "الإثنين — ", "الأحد: ", etc.
  let cleaned = name
    .replace(/^(السبت|الأحد|الإثنين|الثلاثاء|الأربعاء|الخميس|الجمعة)\s*([—:–-]\s*)?/i, '')
    .trim()
  if (!cleaned) {
    cleaned = 'يوم تدريبي'
  }
  return cleaned
}

/**
 * Formats a prescription object or ProgramExercise according to TASK G3 6.4:
 * 3 × 8
 * 3 × 10–12
 * 3 × 30–45 ث
 * 3 × 8 لكل جانب
 * 3 × AMRAP
 */
export function formatPrescription(
  pe: Partial<Prescription> | (ProgramExercise & Record<string, unknown>),
): string {
  const sets = pe.sets ?? 3
  const amrap = Boolean(pe.amrap || pe.reps === 0 || pe.repsMin === 0)
  if (amrap) {
    return `${sets} × AMRAP`
  }

  const unit = pe.unit ?? 'reps'
  const repsMin = pe.repsMin ?? pe.reps ?? 10
  const repsMax = pe.repsMax

  let repStr: string
  if (repsMax && repsMax !== repsMin) {
    repStr = `${repsMin}–${repsMax}`
  } else {
    repStr = `${repsMin}`
  }

  if (unit === 'seconds') {
    return `${sets} × ${repStr} ث`
  }

  if (pe.perSide) {
    return `${sets} × ${repStr} لكل جانب`
  }

  return `${sets} × ${repStr}`
}

export interface ResolvedSession {
  date: string // YYYY-MM-DD
  weekday: number // 0 (Sun) .. 6 (Sat)
  weekdayNameAr: string
  weekdayShortAr: string
  isToday: boolean
  isRest: boolean
  isCardio: boolean
  programDay: ProgramDay | null
  dayId: string | null
  dayTitle: string
  daySubtitle: string
  estimatedMinutes: number
}

/**
 * One unified function resolveSession(date, options)
 * used by Home, Training, the day screen, history, and the finish sheet.
 */
export function resolveSession(
  targetDate: Date | string,
  options: {
    profile?: Partial<UserProfile> | null
    program?: WorkoutProgram | null
  },
): ResolvedSession {
  const { profile, program } = options
  const d = typeof targetDate === 'string' ? new Date(targetDate) : targetDate
  const dateStr = d.toISOString().split('T')[0]
  const weekday = d.getDay()

  const todayStr = new Date().toISOString().split('T')[0]
  const isToday = dateStr === todayStr

  const weekdayInfo = ALL_WEEKDAYS.find((w) => w.weekday === weekday) || {
    weekday,
    nameAr: 'اليوم',
    shortAr: 'اليوم',
  }

  const schedule = getOrDeriveSchedule(profile, program)
  const slot = schedule[weekday]

  if (!slot || slot === 'rest') {
    return {
      date: dateStr,
      weekday,
      weekdayNameAr: weekdayInfo.nameAr,
      weekdayShortAr: weekdayInfo.shortAr,
      isToday,
      isRest: true,
      isCardio: false,
      programDay: null,
      dayId: null,
      dayTitle: 'يوم راحة',
      daySubtitle: 'راحة واستشفاء ونشاط خفيف',
      estimatedMinutes: 0,
    }
  }

  if (slot === 'cardio') {
    return {
      date: dateStr,
      weekday,
      weekdayNameAr: weekdayInfo.nameAr,
      weekdayShortAr: weekdayInfo.shortAr,
      isToday,
      isRest: false,
      isCardio: true,
      programDay: null,
      dayId: 'cardio',
      dayTitle: 'كارديو واستشفاء نشط',
      daySubtitle: '20–25 دقيقة مجهود معتدل',
      estimatedMinutes: 25,
    }
  }

  // Find program day
  const programDays = program?.days ?? []
  const foundDay =
    programDays.find(
      (pd) => (pd.id && pd.id === slot) || String(pd.dayIndex) === slot,
    ) ?? null

  if (!foundDay) {
    return {
      date: dateStr,
      weekday,
      weekdayNameAr: weekdayInfo.nameAr,
      weekdayShortAr: weekdayInfo.shortAr,
      isToday,
      isRest: true,
      isCardio: false,
      programDay: null,
      dayId: null,
      dayTitle: 'يوم راحة',
      daySubtitle: 'لا يوجد تمرين مجدول',
      estimatedMinutes: 0,
    }
  }

  const cleanName = cleanDayName(foundDay.name || foundDay.labelAr)
  const dayTitle = `${weekdayInfo.nameAr} · ${cleanName}`
  const daySubtitle = foundDay.focus || 'تمارين متنوعة'
  const estimatedMinutes = Math.max(20, (foundDay.exercises?.length ?? 5) * 5)

  return {
    date: dateStr,
    weekday,
    weekdayNameAr: weekdayInfo.nameAr,
    weekdayShortAr: weekdayInfo.shortAr,
    isToday,
    isRest: false,
    isCardio: false,
    programDay: foundDay,
    dayId: foundDay.id || String(foundDay.dayIndex),
    dayTitle,
    daySubtitle,
    estimatedMinutes,
  }
}
