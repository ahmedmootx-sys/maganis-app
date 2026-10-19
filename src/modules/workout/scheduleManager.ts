import type { UserProfile } from '../onboarding/types.ts'
import type { WorkoutProgram, ProgramDay } from '../shared/types.ts'

export type ScheduleSlotType = 'rest' | 'cardio' | string

export interface WeekdaySlot {
  weekday: number // 0 (Sun) .. 6 (Sat)
  nameAr: string
  shortAr: string
  slotType: ScheduleSlotType
  programDay?: ProgramDay | null
}

export const ALL_WEEKDAYS: Array<{
  weekday: number
  nameAr: string
  shortAr: string
}> = [
  { weekday: 6, nameAr: 'السبت', shortAr: 'سبت' },
  { weekday: 0, nameAr: 'الأحد', shortAr: 'أحد' },
  { weekday: 1, nameAr: 'الإثنين', shortAr: 'إثنين' },
  { weekday: 2, nameAr: 'الثلاثاء', shortAr: 'ثلاثاء' },
  { weekday: 3, nameAr: 'الأربعاء', shortAr: 'أربعاء' },
  { weekday: 4, nameAr: 'الخميس', shortAr: 'خميس' },
  { weekday: 5, nameAr: 'الجمعة', shortAr: 'جمعة' },
]

export function getOrderedWeekdays(
  weekStartDay = 6,
): Array<{ weekday: number; nameAr: string; shortAr: string }> {
  const startIdx = ALL_WEEKDAYS.findIndex((w) => w.weekday === weekStartDay)
  if (startIdx === -1) return [...ALL_WEEKDAYS]
  return [...ALL_WEEKDAYS.slice(startIdx), ...ALL_WEEKDAYS.slice(0, startIdx)]
}

/**
 * Derives a schedule if none exists in profile:
 * Assigns program days to consecutive weekdays starting at weekStartDay, rest for remainder.
 */
export function getOrDeriveSchedule(
  profile: Partial<UserProfile> | null | undefined,
  program: WorkoutProgram | null | undefined,
): Record<number, ScheduleSlotType> {
  if (profile?.schedule && Object.keys(profile.schedule).length === 7) {
    return profile.schedule
  }

  const weekStartDay = profile?.weekStartDay ?? 6
  const ordered = getOrderedWeekdays(weekStartDay)
  const daysPerWeek = profile?.trainingDaysPerWeek ?? program?.days?.length ?? 4
  const programDays = program?.days ?? []

  const derived: Record<number, ScheduleSlotType> = {}

  ordered.forEach((w, idx) => {
    if (idx < daysPerWeek) {
      if (idx < programDays.length) {
        derived[w.weekday] =
          programDays[idx].id ?? String(programDays[idx].dayIndex)
      } else {
        // If program has fewer days than daysPerWeek, or owner real plan
        derived[w.weekday] = 'rest'
      }
    } else if (idx === 5 && daysPerWeek >= 5) {
      // Light cardio on day 6 for 5-day active splits if desired
      derived[w.weekday] = 'cardio'
    } else {
      derived[w.weekday] = 'rest'
    }
  })

  return derived
}

export function getScheduledSessionsCount(
  schedule: Record<number, ScheduleSlotType>,
): number {
  return Object.values(schedule).filter(
    (slot) => slot !== 'rest' && slot !== 'cardio',
  ).length
}

export function getNextSession(
  schedule: Record<number, ScheduleSlotType>,
  todayWeekday: number,
  program: WorkoutProgram | null | undefined,
  weekStartDay = 6,
): {
  day: ProgramDay
  weekday: number
  isToday: boolean
  nameAr: string
} | null {
  if (!program?.days || program.days.length === 0) return null

  const ordered = getOrderedWeekdays(weekStartDay)
  const todayIdx = ordered.findIndex((w) => w.weekday === todayWeekday)
  if (todayIdx === -1) return null

  // Check from today onwards in cycle
  for (let i = 0; i < 7; i++) {
    const w = ordered[(todayIdx + i) % 7]
    const slot = schedule[w.weekday]
    if (slot && slot !== 'rest' && slot !== 'cardio') {
      const foundDay = program.days.find(
        (d) => (d.id && d.id === slot) || String(d.dayIndex) === slot,
      )
      if (foundDay) {
        return {
          day: foundDay,
          weekday: w.weekday,
          isToday: i === 0,
          nameAr: w.nameAr,
        }
      }
    }
  }

  return null
}
