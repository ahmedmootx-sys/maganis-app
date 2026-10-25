/**
 * src/modules/workout/weekLoadSelector.ts
 * TASK G5-A1: Single source of truth for weekly training load and day counts.
 *
 * Semantics:
 * - `profile.trainingDaysPerWeek` means RESISTANCE days only.
 * - Cardio day is an extra scheduled session and never counts toward resistance.
 * - Planned cardio minutes come strictly from `day.cardio.plannedMinutes`.
 * - Home, Training, the week strip, the sessions tile, and every callout read ONLY this selector.
 */

import type { UserProfile } from '../onboarding/types.ts'
import type { WorkoutProgram, ProgramDay } from '../shared/types.ts'
import { plural } from '../../utils/plural.ts'

export interface WeekLoad {
  /** Count of resistance (strength) days */
  resistanceDays: number
  /** Count of cardio days */
  cardioDays: number
  /** Count of mobility / flexibility days */
  mobilityDays: number
  /** Count of rest days in a 7-day week (7 - totalScheduledSessions) */
  restDays: number
  /** Total scheduled sessions (resistance + cardio + mobility) */
  totalScheduledSessions: number
  /** Sum of planned cardio minutes across all cardio sessions */
  plannedCardioMinutes: number
  /** Breakdown line formatted in Arabic, e.g. "5 مقاومة + 1 كارديو" */
  breakdownAr: string
}

/**
 * Normalizes day.cardio from day.cardio or legacy day.cardioConfig
 */
export function getDayCardio(day: ProgramDay | null | undefined) {
  if (!day) return undefined
  if (day.cardio) return day.cardio
  if (day.cardioConfig) return day.cardioConfig
  return undefined
}

/**
 * Primary selector for weekly training load.
 */
export function selectWeekLoad(
  _profile: Partial<UserProfile> | null | undefined,
  program: WorkoutProgram | null | undefined,
): WeekLoad {
  if (!program || !program.days || program.days.length === 0) {
    return {
      resistanceDays: 0,
      cardioDays: 0,
      mobilityDays: 0,
      restDays: 7,
      totalScheduledSessions: 0,
      plannedCardioMinutes: 0,
      breakdownAr: 'لا توجد جلسات مجدولة',
    }
  }

  let resistanceDays = 0
  let cardioDays = 0
  let mobilityDays = 0
  let plannedCardioMinutes = 0

  for (const day of program.days) {
    const kind = day.kind || 'strength'
    if (kind === 'cardio') {
      cardioDays++
      const cardio = getDayCardio(day)
      if (cardio && typeof cardio.plannedMinutes === 'number') {
        plannedCardioMinutes += cardio.plannedMinutes
      }
    } else if (kind === 'mobility') {
      mobilityDays++
    } else {
      // 'strength' or any non-cardio/non-mobility day counts as resistance
      resistanceDays++
      // If resistance day has a cardio finisher (B3.2), add its minutes
      const finisher = day.finisher as
        | { minutes?: number; plannedMinutes?: number }
        | undefined
      if (finisher) {
        const finMin = finisher.minutes ?? finisher.plannedMinutes ?? 0
        if (typeof finMin === 'number' && finMin > 0) {
          plannedCardioMinutes += finMin
        }
      }
    }
  }

  const totalScheduledSessions = resistanceDays + cardioDays + mobilityDays
  const restDays = Math.max(0, 7 - totalScheduledSessions)

  // Build breakdown string
  const parts: string[] = []
  if (resistanceDays > 0) {
    parts.push(plural(resistanceDays, 'مقاومة'))
  }
  if (cardioDays > 0) {
    parts.push(plural(cardioDays, 'كارديو'))
  }
  if (mobilityDays > 0) {
    parts.push(`${plural(mobilityDays, 'يوم')} إطالة واستشفاء`)
  }

  const breakdownAr = parts.length > 0 ? parts.join(' + ') : 'لا توجد جلسات مجدولة'

  return {
    resistanceDays,
    cardioDays,
    mobilityDays,
    restDays,
    totalScheduledSessions,
    plannedCardioMinutes,
    breakdownAr,
  }
}
