import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DEFAULT_NOTIFICATION_SETTINGS } from './schedule.ts'

const mockKvReadAll = vi.fn()
const mockKvWrite = vi.fn()
const mockScheduleWorkoutAlarms = vi.fn()
const mockCancelWorkoutAlarms = vi.fn()
const mockCheckExactAlarm = vi.fn()

vi.mock('../runtime.ts', () => ({
  isNative: () => true,
}))

vi.mock('@capacitor/local-notifications', () => ({
  LocalNotifications: {
    createChannel: vi.fn().mockResolvedValue(undefined),
    checkPermissions: vi.fn().mockResolvedValue({ display: 'granted' }),
    getPending: vi.fn().mockResolvedValue({ notifications: [] }),
    cancel: vi.fn().mockResolvedValue(undefined),
    schedule: vi.fn().mockResolvedValue(undefined),
    listChannels: vi.fn().mockResolvedValue({ channels: [] }),
  },
}))

vi.mock('../native/maganisNative.ts', () => ({
  MaganisNative: {
    kvReadAll: (...args: unknown[]) => mockKvReadAll(...args),
    kvWrite: (...args: unknown[]) => mockKvWrite(...args),
    scheduleWorkoutAlarms: (...args: unknown[]) =>
      mockScheduleWorkoutAlarms(...args),
    cancelWorkoutAlarms: (...args: unknown[]) =>
      mockCancelWorkoutAlarms(...args),
    checkExactAlarm: (...args: unknown[]) => mockCheckExactAlarm(...args),
  },
}))

import { syncSchedule } from './notificationEngine.ts'

describe('notificationEngine native snooze & cancellation sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockKvWrite.mockResolvedValue({ success: true })
    mockScheduleWorkoutAlarms.mockResolvedValue({ success: true })
    mockCancelWorkoutAlarms.mockResolvedValue({ success: true })
    mockCheckExactAlarm.mockResolvedValue({
      exactAllowed: true,
      supported: true,
    })
  })

  it('preserves future snoozes while workout reminders remain enabled', async () => {
    const snoozeTrigger = Date.now() + 60 * 60 * 1000
    mockKvReadAll.mockResolvedValue({
      data: {
        'maganis:notify.schedule': JSON.stringify([
          {
            id: 900777,
            type: 'workout_day',
            channelId: 'workout_v1',
            title: 'بُنْيَان — تذكير التمرين',
            body: 'حان وقت التمرين',
            triggerAt: snoozeTrigger,
            isExactNotification: true,
            isExactMandatory: false,
            isSnooze: true,
            extra: { type: 'workout_day', route: 'weekly_plan' },
          },
        ]),
      },
    })

    const diag = await syncSchedule({
      settings: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        masterEnabled: true,
        workoutReminderEnabled: true,
      },
      profile: { weekStartDay: 6, trainingDaysPerWeek: 4 },
      program: null,
      activeRestEndsAt: null,
      activeCardioEndsAt: null,
    })

    expect(mockCancelWorkoutAlarms).not.toHaveBeenCalled()
    expect(mockKvWrite).toHaveBeenCalled()
    const writtenJson = mockKvWrite.mock.calls[0][0].value as string
    const written = JSON.parse(writtenJson) as Array<{
      id: number
      isSnooze?: boolean
    }>
    expect(written.some((item) => item.id === 900777 && item.isSnooze)).toBe(
      true,
    )
    expect(diag.pendingCount).toBeGreaterThanOrEqual(1)
  })

  it('cancels active snoozes and clears them when workoutReminderEnabled is turned off', async () => {
    const snoozeTrigger = Date.now() + 60 * 60 * 1000
    mockKvReadAll.mockResolvedValue({
      data: {
        'maganis:notify.schedule': JSON.stringify([
          {
            id: 900888,
            type: 'workout_day',
            channelId: 'workout_v1',
            title: 'بُنْيَان — تذكير التمرين',
            body: 'حان وقت التمرين',
            triggerAt: snoozeTrigger,
            isExactNotification: true,
            isExactMandatory: false,
            isSnooze: true,
            extra: { type: 'workout_day', route: 'weekly_plan' },
          },
        ]),
      },
    })

    const diag = await syncSchedule({
      settings: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        masterEnabled: true,
        workoutReminderEnabled: false,
      },
      profile: null,
      program: null,
      activeRestEndsAt: null,
      activeCardioEndsAt: null,
    })

    expect(mockCancelWorkoutAlarms).toHaveBeenCalledWith({ ids: [900888] })
    const writtenJson = mockKvWrite.mock.calls[0][0].value as string
    const written = JSON.parse(writtenJson) as Array<{ id: number }>
    expect(written.some((item) => item.id === 900888)).toBe(false)
    expect(diag.pendingCount).toBe(0)
  })

  it('cancels active snoozes when masterEnabled is turned off', async () => {
    const snoozeTrigger = Date.now() + 30 * 60 * 1000
    mockKvReadAll.mockResolvedValue({
      data: {
        'maganis:notify.schedule': JSON.stringify([
          {
            id: 900999,
            type: 'workout_day',
            channelId: 'workout_v1',
            title: 'بُنْيَان — تذكير التمرين',
            body: 'حان وقت التمرين',
            triggerAt: snoozeTrigger,
            isSnooze: true,
            extra: { type: 'workout_day', route: 'weekly_plan' },
          },
        ]),
      },
    })

    const diag = await syncSchedule({
      settings: {
        ...DEFAULT_NOTIFICATION_SETTINGS,
        masterEnabled: false,
        workoutReminderEnabled: true,
      },
      profile: null,
      program: null,
      activeRestEndsAt: null,
      activeCardioEndsAt: null,
    })

    expect(mockCancelWorkoutAlarms).toHaveBeenCalledWith({ ids: [900999] })
    expect(diag.pendingCount).toBe(0)
  })
})
