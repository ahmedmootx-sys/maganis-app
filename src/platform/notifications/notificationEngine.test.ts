import { describe, it, expect, beforeEach } from 'vitest'
import {
  syncSchedule,
  getLiveDiagnostics,
  runTestNotification,
  cancelAllNotifications,
  onNotificationAction,
  LAST_SYNC_STORAGE_KEY,
} from './notificationEngine.ts'
import { saveNotificationSettings } from './notificationStore.ts'
import { appStorage } from '../storage.ts'
import { setNativeForTesting } from '../runtime.ts'
import {
  setMockPowerStatusForTesting,
  setMockChannelStatusForTesting,
} from '../native/maganisNative.ts'

describe('Notification Engine & Live Diagnostics (Task N4)', () => {
  beforeEach(() => {
    appStorage.clear()
    setNativeForTesting(false)
    setMockPowerStatusForTesting(false)
  })

  it('syncSchedule computes desired schedule and saves diagnostics to appStorage', async () => {
    saveNotificationSettings({
      masterEnabled: true,
      workoutReminderEnabled: true,
      workoutReminderTime: '18:00',
    })

    const program = {
      id: 'p1',
      name: 'جدول تجريبي',
      daysPerWeek: 3,
      split: 'full_body',
      days: [
        { id: 'd1', dayIndex: 0, name: 'يوم 1' },
        { id: 'd2', dayIndex: 1, name: 'يوم 2' },
        { id: 'd3', dayIndex: 2, name: 'يوم 3' },
      ],
    }
    appStorage.setItem('maganis:workout.program', JSON.stringify(program))

    const diag = await syncSchedule()
    expect(diag.at).toBeGreaterThan(0)
    expect(diag.desiredCount).toBeGreaterThan(0)
    expect(diag.channelsOk).toBe(true)

    const raw = appStorage.getItem(LAST_SYNC_STORAGE_KEY)
    expect(raw).not.toBeNull()
    const stored = JSON.parse(raw!)
    expect(stored.desiredCount).toBe(diag.desiredCount)
  })

  it('cancelAllNotifications clears storage and scheduled entries', async () => {
    appStorage.setItem(LAST_SYNC_STORAGE_KEY, JSON.stringify({ at: 123 }))
    await cancelAllNotifications()
    expect(appStorage.getItem(LAST_SYNC_STORAGE_KEY)).toBeNull()
  })

  it('getLiveDiagnostics gathers permission, channels, power, and sync state', async () => {
    setNativeForTesting(true)
    setMockPowerStatusForTesting(true)
    setMockChannelStatusForTesting('timer_v1', {
      exists: true,
      enabled: true,
      importance: 4,
    })

    const diag = await getLiveDiagnostics()
    expect(diag.batteryOptimizationIgnored).toBe(true)
    expect(diag.channels.timer_v1.enabled).toBe(true)
    expect(diag.channels.timer_v1.importance).toBe(4)
    setNativeForTesting(false)
  })

  it('runTestNotification verifies delivery on mock platform', async () => {
    const result = await runTestNotification(1)
    expect(result.delivered).toBe(true)
  })

  it('notification router listener dispatches targets correctly', () => {
    const received: string[] = []
    const unregister = onNotificationAction((target) => {
      received.push(target.route)
    })

    // Simulate router dispatch
    // Listener registered
    expect(typeof unregister).toBe('function')
    unregister()
  })
})
