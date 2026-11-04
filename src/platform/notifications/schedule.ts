import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CONFIG,
  NOTIFICATION_COPY,
  type NotificationChannelId,
  type NotificationType,
} from '../../content/notificationCopy.ts'
import {
  ALL_WEEKDAYS,
  getOrDeriveSchedule,
} from '../../modules/workout/scheduleManager.ts'
import type { WorkoutProgram } from '../../modules/shared/types.ts'
import type { UserProfile } from '../../modules/onboarding/types.ts'

export interface NotificationSettings {
  masterEnabled: boolean
  workoutReminderEnabled: boolean
  workoutReminderTime: string // "HH:mm", default "18:00"
  nutritionReminderEnabled: boolean
  nutritionReminderTime: string // "HH:mm", default "21:00"
  restEndEnabled: boolean
  cardioEndEnabled: boolean
  backupAlertEnabled: boolean
  keepScreenOnEnabled: boolean
  hapticsEnabled: boolean
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  masterEnabled: true,
  workoutReminderEnabled: false, // Starts OFF per owner decision
  workoutReminderTime: '18:00',
  nutritionReminderEnabled: false, // Starts OFF per owner decision
  nutritionReminderTime: '21:00',
  restEndEnabled: true, // ON once permission exists
  cardioEndEnabled: true, // ON once permission exists
  backupAlertEnabled: true,
  keepScreenOnEnabled: true, // Screen on during workouts
  hapticsEnabled: true, // Vibration on set/timer finish
}

export interface ScheduleStateInput {
  settings: NotificationSettings
  profile: Partial<UserProfile> | null | undefined
  program: WorkoutProgram | null | undefined
  activeRestEndsAt: number | null
  activeCardioEndsAt: number | null
  backupStatus?: 'never' | 'ok' | 'stale' | 'failing' | 'folder_permission_lost'
  lastBackupAlertAt?: number | null
  hasLoggedNutritionToday?: boolean
}

export interface DesiredNotification {
  id: number
  type: NotificationType
  title: string
  body: string
  channelId: NotificationChannelId
  triggerAt: number // epoch ms
  extra: {
    type: NotificationType
    targetDate?: string
    route?: string
    payload?: Record<string, unknown>
  }
  isExactNotification: boolean
  isExactMandatory: boolean
  smallIcon: string
  iconColor: string
}

export interface PendingNotificationSummary {
  id: number
  triggerAt?: number | null
  title?: string
}

export interface ScheduleDiff {
  toSchedule: DesiredNotification[]
  toCancel: number[] // IDs to cancel
}

/**
 * 31-bit positive integer hash of (type|key|localDateStr).
 * Never returns 0 or negative; avoids collisions between notification types.
 */
export function generateNotificationId(
  type: string,
  key: string,
  localDateStr: string,
): number {
  const input = `${type}|${key}|${localDateStr}`
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  // 31-bit unsigned integer (positive)
  const positive = h >>> 1 || 1
  return positive
}

/**
 * Formats a local date to YYYY-MM-DD
 */
export function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/**
 * Parses "HH:mm" string into hour and minute
 */
export function parseTimeHHmm(timeStr: string): {
  hour: number
  minute: number
} {
  const [hStr, mStr] = (timeStr || '18:00').split(':')
  const hour = Math.max(0, Math.min(23, Number(hStr) || 0))
  const minute = Math.max(0, Math.min(59, Number(mStr) || 0))
  return { hour, minute }
}

/**
 * Constructs a Date object in the local time zone for a specific day at HH:mm
 */
export function getLocalTriggerDate(baseDate: Date, timeStr: string): Date {
  const { hour, minute } = parseTimeHHmm(timeStr)
  return new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hour,
    minute,
    0,
    0,
  )
}

/**
 * Pure function: computes the exact list of notifications that SHOULD exist
 * based on current application state, current time, and a 14-day rolling window.
 */
export function computeDesiredSchedule(
  state: ScheduleStateInput,
  now: Date,
): DesiredNotification[] {
  const desired: DesiredNotification[] = []
  const nowMs = now.getTime()
  const settings = state.settings || DEFAULT_NOTIFICATION_SETTINGS

  if (!settings.masterEnabled) {
    return []
  }

  // 1. Active Rest Timer End (exact)
  if (
    settings.restEndEnabled &&
    state.activeRestEndsAt &&
    state.activeRestEndsAt > nowMs
  ) {
    const id = generateNotificationId('rest_end', 'active', 'timer')
    desired.push({
      id,
      type: 'rest_end',
      title: NOTIFICATION_COPY.rest_end.title,
      body: NOTIFICATION_COPY.rest_end.body,
      channelId: NOTIFICATION_CHANNELS.timer_v1.id,
      triggerAt: state.activeRestEndsAt,
      extra: {
        type: 'rest_end',
        route: 'workout_active',
      },
      isExactNotification: true,
      isExactMandatory: false,
      smallIcon: NOTIFICATION_CONFIG.smallIcon,
      iconColor: NOTIFICATION_CONFIG.accentColor,
    })
  }

  // 2. Active Cardio Session Target End (exact)
  if (
    settings.cardioEndEnabled &&
    state.activeCardioEndsAt &&
    state.activeCardioEndsAt > nowMs
  ) {
    const id = generateNotificationId('cardio_end', 'active', 'timer')
    desired.push({
      id,
      type: 'cardio_end',
      title: NOTIFICATION_COPY.cardio_end.title,
      body: NOTIFICATION_COPY.cardio_end.body,
      channelId: NOTIFICATION_CHANNELS.timer_v1.id,
      triggerAt: state.activeCardioEndsAt,
      extra: {
        type: 'cardio_end',
        route: 'cardio_runner',
      },
      isExactNotification: true,
      isExactMandatory: false,
      smallIcon: NOTIFICATION_CONFIG.smallIcon,
      iconColor: NOTIFICATION_CONFIG.accentColor,
    })
  }

  // Derived program schedule across weekdays 0..6
  const programSchedule = state.program
    ? getOrDeriveSchedule(state.profile, state.program)
    : {}

  // 14-day rolling window: day 0 (today) through day 13
  for (let offset = 0; offset < 14; offset++) {
    const targetDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + offset,
    )
    const dateStr = formatLocalDate(targetDate)
    const weekday = targetDate.getDay() // 0 (Sun) .. 6 (Sat)
    const weekdayObj = ALL_WEEKDAYS.find((w) => w.weekday === weekday)
    const weekdayName = weekdayObj ? weekdayObj.nameAr : ''

    // 3. Workout Day Reminder
    if (
      settings.workoutReminderEnabled &&
      state.program &&
      state.program.days?.length
    ) {
      const slot = programSchedule[weekday]
      const isTrainingDay = slot && slot !== 'rest'
      if (isTrainingDay) {
        const triggerDate = getLocalTriggerDate(
          targetDate,
          settings.workoutReminderTime,
        )
        const triggerMs = triggerDate.getTime()
        // Only schedule if trigger time is in the future
        if (triggerMs > nowMs) {
          // Resolve program day title or fallback to weekday name
          let dayLabel = weekdayName
          if (typeof slot === 'string' && slot !== 'cardio') {
            const foundDay = state.program.days.find((d) => d.id === slot)
            if (foundDay?.name) {
              dayLabel = `${weekdayName} (${foundDay.name})`
            }
          }
          const id = generateNotificationId(
            'workout_day',
            String(weekday),
            dateStr,
          )
          desired.push({
            id,
            type: 'workout_day',
            title: NOTIFICATION_COPY.workout_day.title,
            body: NOTIFICATION_COPY.workout_day.getBody(dayLabel),
            channelId: NOTIFICATION_CHANNELS.workout_v1.id,
            triggerAt: triggerMs,
            extra: {
              type: 'workout_day',
              targetDate: dateStr,
              route: 'weekly_plan',
              payload: { weekday, slot },
            },
            isExactNotification: false,
            isExactMandatory: false,
            smallIcon: NOTIFICATION_CONFIG.smallIcon,
            iconColor: NOTIFICATION_CONFIG.accentColor,
          })
        }
      }
    }

    // 4. Daily Nutrition Log Reminder
    if (settings.nutritionReminderEnabled) {
      // If offset === 0 (today), check if already logged today
      const skipToday = offset === 0 && Boolean(state.hasLoggedNutritionToday)
      if (!skipToday) {
        const triggerDate = getLocalTriggerDate(
          targetDate,
          settings.nutritionReminderTime,
        )
        const triggerMs = triggerDate.getTime()
        if (triggerMs > nowMs) {
          const id = generateNotificationId('nutrition_log', 'daily', dateStr)
          desired.push({
            id,
            type: 'nutrition_log',
            title: NOTIFICATION_COPY.nutrition_log.title,
            body: NOTIFICATION_COPY.nutrition_log.body,
            channelId: NOTIFICATION_CHANNELS.nutrition_v1.id,
            triggerAt: triggerMs,
            extra: {
              type: 'nutrition_log',
              targetDate: dateStr,
              route: 'nutrition',
            },
            isExactNotification: false,
            isExactMandatory: false,
            smallIcon: NOTIFICATION_CONFIG.smallIcon,
            iconColor: NOTIFICATION_CONFIG.accentColor,
          })
        }
      }
    }
  }

  // 5. Backup Alert Notification (only if failing or stale, at most once per 3 days)
  if (settings.backupAlertEnabled) {
    const isFailing =
      state.backupStatus === 'failing' ||
      state.backupStatus === 'stale' ||
      state.backupStatus === 'folder_permission_lost'
    if (isFailing) {
      const threeDaysMs = 3 * 24 * 3600 * 1000
      const lastAlert = state.lastBackupAlertAt || 0
      const canAlert = nowMs - lastAlert >= threeDaysMs

      if (canAlert) {
        // Schedule for 12:00 PM today or 1 hour from now
        const noonToday = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          12,
          0,
          0,
          0,
        )
        const triggerMs =
          noonToday.getTime() > nowMs
            ? noonToday.getTime()
            : nowMs + 3600 * 1000
        const dateStr = formatLocalDate(now)
        const id = generateNotificationId('backup_alert', 'health', dateStr)
        desired.push({
          id,
          type: 'backup_alert',
          title: NOTIFICATION_COPY.backup_alert.title,
          body: NOTIFICATION_COPY.backup_alert.body,
          channelId: NOTIFICATION_CHANNELS.backup_v1.id,
          triggerAt: triggerMs,
          extra: {
            type: 'backup_alert',
            route: 'settings_backup',
          },
          isExactNotification: false,
          isExactMandatory: false,
          smallIcon: NOTIFICATION_CONFIG.smallIcon,
          iconColor: NOTIFICATION_CONFIG.accentColor,
        })
      }
    }
  }

  return desired
}

/**
 * Pure function: compares desired notifications against currently pending notifications
 * and returns minimal set of notifications to cancel and notifications to schedule.
 * Never cancels and re-schedules identical pending items (avoids burst gaps).
 */
export function diffSchedule(
  desired: DesiredNotification[],
  pending: PendingNotificationSummary[],
): ScheduleDiff {
  const desiredMap = new Map<number, DesiredNotification>()
  for (const d of desired) {
    desiredMap.set(d.id, d)
  }

  const pendingMap = new Map<number, PendingNotificationSummary>()
  for (const p of pending) {
    pendingMap.set(p.id, p)
  }

  const toCancel: number[] = []
  const toSchedule: DesiredNotification[] = []

  // 1. Check pending items: if not in desired, or triggerAt shifted by > 2000ms, cancel
  for (const p of pending) {
    const d = desiredMap.get(p.id)
    if (!d) {
      toCancel.push(p.id)
    } else if (
      p.triggerAt != null &&
      Math.abs(p.triggerAt - d.triggerAt) > 2000
    ) {
      // Trigger time changed significantly -> cancel and re-schedule
      toCancel.push(p.id)
      toSchedule.push(d)
    }
  }

  // 2. Check desired items: if not in pending, schedule
  for (const d of desired) {
    const p = pendingMap.get(d.id)
    if (!p) {
      toSchedule.push(d)
    }
  }

  return {
    toSchedule,
    toCancel,
  }
}
