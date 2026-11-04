import { describe, it, expect } from 'vitest'
import {
  computeDesiredSchedule,
  diffSchedule,
  generateNotificationId,
  formatLocalDate,
  parseTimeHHmm,
  type ScheduleStateInput,
  type DesiredNotification,
  DEFAULT_NOTIFICATION_SETTINGS,
} from './schedule.ts'
import type { WorkoutProgram } from '../../modules/shared/types.ts'

describe('Pure Notification Scheduler & Diffing (Task N4)', () => {
  const dummyProgram: WorkoutProgram = {
    id: 'prog_1',
    createdAt: 1700000000000,
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: 4,
    name: 'مجانص 4 أيام تضخيم',
    days: [
      {
        id: 'day_upper_1',
        dayIndex: 0,
        name: 'علوي (أ)',
        labelAr: 'علوي (أ)',
        focus: 'قوة وتضخيم',
        exercises: [],
      },
      {
        id: 'day_lower_1',
        dayIndex: 1,
        name: 'سفلي (أ)',
        labelAr: 'سفلي (أ)',
        focus: 'قوة وتضخيم',
        exercises: [],
      },
      {
        id: 'day_upper_2',
        dayIndex: 2,
        name: 'علوي (ب)',
        labelAr: 'علوي (ب)',
        focus: 'قوة وتضخيم',
        exercises: [],
      },
      {
        id: 'day_lower_2',
        dayIndex: 3,
        name: 'سفلي (ب)',
        labelAr: 'سفلي (ب)',
        focus: 'قوة وتضخيم',
        exercises: [],
      },
    ],
  }

  describe('generateNotificationId', () => {
    it('generates deterministic, positive 31-bit integers', () => {
      const id1 = generateNotificationId('workout_day', '6', '2026-11-04')
      const id2 = generateNotificationId('workout_day', '6', '2026-11-04')
      expect(id1).toBe(id2)
      expect(id1).toBeGreaterThan(0)
      expect(id1).toBeLessThanOrEqual(0x7fffffff)
    })

    it('property test: zero collisions across 1,000 permutations', () => {
      const set = new Set<number>()
      const types = [
        'workout_day',
        'nutrition_log',
        'backup_alert',
        'rest_end',
        'cardio_end',
      ]
      let total = 0

      for (const t of types) {
        for (let weekday = 0; weekday < 7; weekday++) {
          for (let day = 1; day <= 30; day++) {
            const dateStr = `2026-11-${String(day).padStart(2, '0')}`
            const id = generateNotificationId(t, String(weekday), dateStr)
            expect(set.has(id)).toBe(false)
            set.add(id)
            total++
          }
        }
      }
      expect(set.size).toBe(total)
    })
  })

  describe('parseTimeHHmm and formatLocalDate', () => {
    it('parses time strings safely with bounds', () => {
      expect(parseTimeHHmm('18:00')).toEqual({ hour: 18, minute: 0 })
      expect(parseTimeHHmm('07:30')).toEqual({ hour: 7, minute: 30 })
      expect(parseTimeHHmm('invalid')).toEqual({ hour: 0, minute: 0 })
      expect(parseTimeHHmm('99:99')).toEqual({ hour: 23, minute: 59 })
    })

    it('formats local dates consistently to YYYY-MM-DD', () => {
      const d = new Date(2026, 10, 4) // Nov 4, 2026
      expect(formatLocalDate(d)).toBe('2026-11-04')
    })
  })

  describe('computeDesiredSchedule', () => {
    const fixedNow = new Date(2026, 10, 4, 10, 0, 0) // Wednesday 10:00 AM

    it('returns empty schedule when masterEnabled is false', () => {
      const state: ScheduleStateInput = {
        settings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          masterEnabled: false,
          workoutReminderEnabled: true,
        },
        profile: null,
        program: dummyProgram,
        activeRestEndsAt: fixedNow.getTime() + 60000,
        activeCardioEndsAt: null,
      }
      const desired = computeDesiredSchedule(state, fixedNow)
      expect(desired).toEqual([])
    })

    it('schedules active rest timer and cardio timer when in future', () => {
      const restEnds = fixedNow.getTime() + 90000 // 90s in future
      const cardioEnds = fixedNow.getTime() + 300000 // 5m in future

      const state: ScheduleStateInput = {
        settings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          restEndEnabled: true,
          cardioEndEnabled: true,
        },
        profile: null,
        program: null,
        activeRestEndsAt: restEnds,
        activeCardioEndsAt: cardioEnds,
      }

      const desired = computeDesiredSchedule(state, fixedNow)
      expect(desired.length).toBe(2)

      const restItem = desired.find((d) => d.type === 'rest_end')
      expect(restItem).toBeDefined()
      expect(restItem?.triggerAt).toBe(restEnds)
      expect(restItem?.channelId).toBe('timer_v1')
      expect(restItem?.isExactNotification).toBe(true)

      const cardioItem = desired.find((d) => d.type === 'cardio_end')
      expect(cardioItem).toBeDefined()
      expect(cardioItem?.triggerAt).toBe(cardioEnds)
      expect(cardioItem?.channelId).toBe('timer_v1')
    })

    it('ignores expired active timers in the past', () => {
      const state: ScheduleStateInput = {
        settings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          restEndEnabled: true,
          cardioEndEnabled: true,
        },
        profile: null,
        program: null,
        activeRestEndsAt: fixedNow.getTime() - 1000, // in past
        activeCardioEndsAt: fixedNow.getTime() - 5000, // in past
      }

      const desired = computeDesiredSchedule(state, fixedNow)
      expect(desired.filter((d) => d.type === 'rest_end')).toHaveLength(0)
      expect(desired.filter((d) => d.type === 'cardio_end')).toHaveLength(0)
    })

    it('schedules 14-day rolling window for workout days across different week starts', () => {
      // Test with Saturday start (weekStartDay: 6)
      const state: ScheduleStateInput = {
        settings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          workoutReminderEnabled: true,
          workoutReminderTime: '18:00',
        },
        profile: {
          weekStartDay: 6,
          trainingDaysPerWeek: 4,
        },
        program: dummyProgram,
        activeRestEndsAt: null,
        activeCardioEndsAt: null,
      }

      const desired = computeDesiredSchedule(state, fixedNow)
      const workoutReminders = desired.filter((d) => d.type === 'workout_day')
      // In a 14-day window with 4 training days per 7 days, there are 8 training days
      expect(workoutReminders.length).toBeGreaterThanOrEqual(7)
      expect(workoutReminders.length).toBeLessThanOrEqual(8)

      // All scheduled times are at 18:00
      for (const notif of workoutReminders) {
        const triggerDate = new Date(notif.triggerAt)
        expect(triggerDate.getHours()).toBe(18)
        expect(triggerDate.getMinutes()).toBe(0)
        expect(notif.channelId).toBe('workout_v1')
        expect(notif.body).toContain('معاد تمرين')
      }
    })

    it('skips today nutrition reminder if already logged today', () => {
      const stateLogged: ScheduleStateInput = {
        settings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          nutritionReminderEnabled: true,
          nutritionReminderTime: '21:00',
        },
        profile: null,
        program: null,
        activeRestEndsAt: null,
        activeCardioEndsAt: null,
        hasLoggedNutritionToday: true,
      }

      const desiredLogged = computeDesiredSchedule(stateLogged, fixedNow)
      const nutLogged = desiredLogged.filter((d) => d.type === 'nutrition_log')
      expect(nutLogged.length).toBe(13) // skipped today (day 0), scheduled days 1..13

      // Without today logged
      const stateNotLogged: ScheduleStateInput = {
        ...stateLogged,
        hasLoggedNutritionToday: false,
      }
      const desiredNotLogged = computeDesiredSchedule(stateNotLogged, fixedNow)
      const nutNotLogged = desiredNotLogged.filter(
        (d) => d.type === 'nutrition_log',
      )
      expect(nutNotLogged.length).toBe(14) // includes today at 21:00
    })

    it('schedules backup alert only when failing/stale and respects 3-day cadence', () => {
      const stateFailing: ScheduleStateInput = {
        settings: {
          ...DEFAULT_NOTIFICATION_SETTINGS,
          backupAlertEnabled: true,
        },
        profile: null,
        program: null,
        activeRestEndsAt: null,
        activeCardioEndsAt: null,
        backupStatus: 'failing',
        lastBackupAlertAt: 0, // never alerted before
      }

      const desired = computeDesiredSchedule(stateFailing, fixedNow)
      const backupAlerts = desired.filter((d) => d.type === 'backup_alert')
      expect(backupAlerts).toHaveLength(1)
      expect(backupAlerts[0].channelId).toBe('backup_v1')

      // If alerted 1 day ago (< 3 days), do NOT alert again
      const stateRecentAlert: ScheduleStateInput = {
        ...stateFailing,
        lastBackupAlertAt: fixedNow.getTime() - 24 * 3600 * 1000,
      }
      const desiredRecent = computeDesiredSchedule(stateRecentAlert, fixedNow)
      expect(
        desiredRecent.filter((d) => d.type === 'backup_alert'),
      ).toHaveLength(0)

      // If status is ok, no alert
      const stateOk: ScheduleStateInput = {
        ...stateFailing,
        backupStatus: 'ok',
      }
      expect(
        computeDesiredSchedule(stateOk, fixedNow).filter(
          (d) => d.type === 'backup_alert',
        ),
      ).toHaveLength(0)
    })
  })

  describe('diffSchedule', () => {
    it('is purely idempotent when pending matches desired', () => {
      const desired: DesiredNotification[] = [
        {
          id: 101,
          type: 'workout_day',
          title: 'تمرين',
          body: 'تمرين اليوم',
          channelId: 'workout_v1',
          triggerAt: 1700000000000,
          extra: { type: 'workout_day' },
          isExactNotification: false,
          isExactMandatory: false,
          smallIcon: 'ic_stat_maganis',
          iconColor: '#10B981',
        },
      ]

      const pending = [
        {
          id: 101,
          triggerAt: 1700000000000,
          title: 'تمرين',
        },
      ]

      const diff = diffSchedule(desired, pending)
      expect(diff.toSchedule).toEqual([])
      expect(diff.toCancel).toEqual([])
    })

    it('identifies new items to schedule and obsolete items to cancel', () => {
      const desired: DesiredNotification[] = [
        {
          id: 201,
          type: 'workout_day',
          title: 'تمرين جديد',
          body: 'تمرين اليوم',
          channelId: 'workout_v1',
          triggerAt: 1700000000000,
          extra: { type: 'workout_day' },
          isExactNotification: false,
          isExactMandatory: false,
          smallIcon: 'ic_stat_maganis',
          iconColor: '#10B981',
        },
      ]

      const pending = [
        {
          id: 999, // old obsolete alarm
          triggerAt: 1699999999000,
          title: 'تنبيه قديم',
        },
      ]

      const diff = diffSchedule(desired, pending)
      expect(diff.toSchedule.map((d) => d.id)).toEqual([201])
      expect(diff.toCancel).toEqual([999])
    })

    it('detects trigger time shift > 2000ms and re-schedules', () => {
      const desired: DesiredNotification[] = [
        {
          id: 301,
          type: 'workout_day',
          title: 'تمرين',
          body: 'تمرين اليوم',
          channelId: 'workout_v1',
          triggerAt: 1700005000000, // shifted by 5000ms
          extra: { type: 'workout_day' },
          isExactNotification: false,
          isExactMandatory: false,
          smallIcon: 'ic_stat_maganis',
          iconColor: '#10B981',
        },
      ]

      const pending = [
        {
          id: 301,
          triggerAt: 1700000000000,
          title: 'تمرين',
        },
      ]

      const diff = diffSchedule(desired, pending)
      expect(diff.toCancel).toEqual([301])
      expect(diff.toSchedule.map((d) => d.id)).toEqual([301])
    })
  })
})
