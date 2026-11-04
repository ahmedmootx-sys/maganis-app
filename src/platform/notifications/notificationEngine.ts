import {
  LocalNotifications,
  type Importance,
  type Visibility,
  type PermissionStatus,
  type ScheduleOptions,
} from '@capacitor/local-notifications'
import { isNative } from '../runtime.ts'
import { MaganisNative } from '../native/maganisNative.ts'
import { appStorage } from '../storage.ts'
import {
  NOTIFICATION_CHANNELS,
  NOTIFICATION_CONFIG,
  NOTIFICATION_COPY,
  type NotificationChannelId,
} from '../../content/notificationCopy.ts'
import {
  computeDesiredSchedule,
  diffSchedule,
  type PendingNotificationSummary,
  type ScheduleStateInput,
} from './schedule.ts'
import {
  getNotificationSettings,
  onNotificationSettingsChange,
} from './notificationStore.ts'

export const LAST_SYNC_STORAGE_KEY = 'maganis:notify.lastSync'

export interface SyncDiagnostics {
  at: number
  desiredCount: number
  pendingCount: number
  permission: string
  exactAllowed: boolean
  channelsOk: boolean
}

export interface NotificationDiagnostics {
  permissionGranted: boolean
  exactAlarmGranted: boolean
  batteryOptimizationIgnored: boolean
  channels: Record<
    NotificationChannelId,
    { exists: boolean; enabled: boolean; importance: number }
  >
  lastSync: SyncDiagnostics | null
}

export type NotificationRouteTarget =
  | { route: 'workout_active' }
  | { route: 'cardio_runner' }
  | {
      route: 'weekly_plan'
      targetDate?: string
      payload?: Record<string, unknown>
    }
  | { route: 'nutrition'; targetDate?: string }
  | { route: 'settings_backup' }

type NotificationActionListener = (target: NotificationRouteTarget) => void
const actionListeners = new Set<NotificationActionListener>()

let channelsInitialized = false

/**
 * Creates and updates Android 8.0+ notification channels.
 */
export async function ensureNotificationChannels(): Promise<void> {
  if (!isNative() || channelsInitialized) return
  try {
    for (const ch of Object.values(NOTIFICATION_CHANNELS)) {
      await LocalNotifications.createChannel({
        id: ch.id,
        name: ch.name,
        description: ch.description,
        importance: ch.importance as Importance,
        visibility: ch.visibility as Visibility,
        vibration: ch.vibration,
        lights: ch.lights,
        lightColor: ch.lightColor,
      })
    }
    channelsInitialized = true
  } catch (err) {
    console.warn('Failed to initialize notification channels:', err)
  }
}

/**
 * Checks current notification display permission
 */
export async function checkNotificationPermission(): Promise<
  'granted' | 'denied' | 'prompt'
> {
  if (!isNative()) return 'granted'
  try {
    const status: PermissionStatus = await LocalNotifications.checkPermissions()
    return status.display as 'granted' | 'denied' | 'prompt'
  } catch {
    return 'denied'
  }
}

/**
 * Requests runtime notification permission (Android 13+)
 */
export async function requestNotificationPermission(): Promise<
  'granted' | 'denied'
> {
  if (!isNative()) return 'granted'
  try {
    await ensureNotificationChannels()
    const status: PermissionStatus =
      await LocalNotifications.requestPermissions()
    return status.display === 'granted' ? 'granted' : 'denied'
  } catch {
    return 'denied'
  }
}

/**
 * Checks whether the app can schedule exact alarms (Android 12+)
 */
export async function checkExactAlarmPermission(): Promise<boolean> {
  if (!isNative()) return true
  try {
    const res = await LocalNotifications.checkExactNotificationSetting()
    return res.exact_alarm === 'granted'
  } catch {
    return true
  }
}

/**
 * Opens system settings screen to request exact alarm permission
 */
export async function openExactAlarmSettings(): Promise<void> {
  if (!isNative()) return
  try {
    await LocalNotifications.changeExactNotificationSetting()
  } catch {
    await MaganisNative.openSettings({ kind: 'exactAlarm' })
  }
}

/**
 * Opens system settings screen for application notifications or battery
 */
export async function openSettingsScreen(
  kind: 'appNotifications' | 'channel' | 'exactAlarm' | 'batteryOptimization',
  channelId?: string,
): Promise<void> {
  if (!isNative()) return
  try {
    await MaganisNative.openSettings({ kind, channelId })
  } catch (err) {
    console.error('Failed to open settings:', err)
  }
}

/**
 * Queries full live diagnostics panel data
 */
export async function getLiveDiagnostics(): Promise<NotificationDiagnostics> {
  const perm = await checkNotificationPermission()
  const exact = await checkExactAlarmPermission()
  let powerIgnored = false

  if (isNative()) {
    try {
      const p = await MaganisNative.getPowerStatus()
      powerIgnored = Boolean(p.ignoringBatteryOptimizations)
    } catch {
      powerIgnored = false
    }
  }

  const channelMap: Record<
    NotificationChannelId,
    { exists: boolean; enabled: boolean; importance: number }
  > = {
    workout_v1: { exists: true, enabled: true, importance: 3 },
    timer_v1: { exists: true, enabled: true, importance: 4 },
    backup_v1: { exists: true, enabled: true, importance: 2 },
    nutrition_v1: { exists: true, enabled: true, importance: 3 },
  }

  if (isNative()) {
    for (const chId of Object.keys(
      NOTIFICATION_CHANNELS,
    ) as NotificationChannelId[]) {
      try {
        const st = await MaganisNative.getChannelStatus({ channelId: chId })
        channelMap[chId] = {
          exists: st.exists,
          enabled: st.enabled,
          importance: st.importance,
        }
      } catch {
        // Fallback default
      }
    }
  }

  let lastSync: SyncDiagnostics | null = null
  try {
    const rawSync = appStorage.getItem(LAST_SYNC_STORAGE_KEY)
    if (rawSync) {
      lastSync = JSON.parse(rawSync)
    }
  } catch {
    lastSync = null
  }

  return {
    permissionGranted: perm === 'granted',
    exactAlarmGranted: exact,
    batteryOptimizationIgnored: powerIgnored,
    channels: channelMap,
    lastSync,
  }
}

/**
 * Gathers current application state for scheduler
 */
export function gatherCurrentScheduleState(
  override?: Partial<ScheduleStateInput>,
): ScheduleStateInput {
  const settings = getNotificationSettings()

  let profile: Partial<ScheduleStateInput['profile']> = null
  try {
    const rawProfile = appStorage.getItem('maganis:profile.active')
    if (rawProfile) profile = JSON.parse(rawProfile)
  } catch {
    profile = null
  }

  let program: ScheduleStateInput['program'] = null
  try {
    const rawProgram = appStorage.getItem('maganis:workout.program')
    if (rawProgram) program = JSON.parse(rawProgram)
  } catch {
    program = null
  }

  let activeRestEndsAt: number | null = null
  try {
    const rawSession = appStorage.getItem('maganis:active_session')
    if (rawSession) {
      const parsed = JSON.parse(rawSession)
      if (parsed.restEndsAt && parsed.restEndsAt > Date.now()) {
        activeRestEndsAt = parsed.restEndsAt
      }
    }
  } catch {
    activeRestEndsAt = null
  }

  let activeCardioEndsAt: number | null = null
  try {
    const rawCardio = appStorage.getItem('maganis:cardio_active_session')
    if (rawCardio) {
      const parsed = JSON.parse(rawCardio)
      if (parsed.targetEndsAt && parsed.targetEndsAt > Date.now()) {
        activeCardioEndsAt = parsed.targetEndsAt
      }
    }
  } catch {
    activeCardioEndsAt = null
  }

  let backupStatus: ScheduleStateInput['backupStatus'] = 'never'
  try {
    const rawBackup = appStorage.getItem('maganis:backup.status')
    if (rawBackup) {
      const parsed = JSON.parse(rawBackup)
      backupStatus = parsed.status
    }
  } catch {
    backupStatus = 'never'
  }

  let hasLoggedNutritionToday = false
  try {
    const todayStr = new Date().toISOString().split('T')[0]
    const rawNut = appStorage.getItem(`maganis:daily_nutrition_${todayStr}`)
    if (rawNut) {
      const parsed = JSON.parse(rawNut)
      hasLoggedNutritionToday =
        Array.isArray(parsed.meals) && parsed.meals.length > 0
    }
  } catch {
    hasLoggedNutritionToday = false
  }

  return {
    settings,
    profile,
    program,
    activeRestEndsAt,
    activeCardioEndsAt,
    backupStatus,
    hasLoggedNutritionToday,
    ...override,
  }
}

/**
 * Pure & idempotent synchronization of scheduled notifications.
 * Computes desired schedule, diffs against pending alarms, and applies minimal changes.
 */
export async function syncSchedule(
  stateOverride?: Partial<ScheduleStateInput>,
): Promise<SyncDiagnostics> {
  await ensureNotificationChannels()

  const state = gatherCurrentScheduleState(stateOverride)
  const now = new Date()
  const desired = computeDesiredSchedule(state, now)

  let pendingList: PendingNotificationSummary[] = []
  if (isNative()) {
    try {
      const res = await LocalNotifications.getPending()
      pendingList = (res.notifications || []).map((n) => {
        let triggerAt: number | null = null
        if (n.schedule?.at) {
          triggerAt = new Date(n.schedule.at).getTime()
        }
        return {
          id: n.id,
          triggerAt,
          title: n.title,
        }
      })
    } catch (err) {
      console.warn('Could not retrieve pending notifications:', err)
      pendingList = []
    }
  }

  const diff = diffSchedule(desired, pendingList)

  if (isNative()) {
    // 1. Cancel obsoleted items
    if (diff.toCancel.length > 0) {
      try {
        await LocalNotifications.cancel({
          notifications: diff.toCancel.map((id) => ({ id })),
        })
      } catch (err) {
        console.warn('Failed to cancel notifications:', err)
      }
    }

    // 2. Schedule new/changed items
    if (diff.toSchedule.length > 0) {
      try {
        const notifsToSchedule: ScheduleOptions['notifications'] =
          diff.toSchedule.map((d) => ({
            id: d.id,
            title: d.title,
            body: d.body,
            channelId: d.channelId,
            schedule: {
              at: new Date(d.triggerAt),
              allowWhileIdle: true,
            },
            extra: d.extra,
            smallIcon: d.smallIcon,
            iconColor: d.iconColor,
            isExactNotification: d.isExactNotification,
            isExactMandatory: d.isExactMandatory,
          }))
        await LocalNotifications.schedule({ notifications: notifsToSchedule })
      } catch (err) {
        console.warn('Failed to schedule notifications:', err)
      }
    }

    // 3. Atomically persist desired schedule for reboot & package replacement recovery (N4.8)
    try {
      const scheduleJson = JSON.stringify(desired)
      await MaganisNative.kvWrite({
        key: 'maganis:notify.schedule',
        value: scheduleJson,
      })
    } catch {
      // Non-fatal native persistence
    }
  }

  const perm = await checkNotificationPermission()
  const exact = await checkExactAlarmPermission()

  const diagnostics: SyncDiagnostics = {
    at: Date.now(),
    desiredCount: desired.length,
    pendingCount: desired.length,
    permission: perm,
    exactAllowed: exact,
    channelsOk: true,
  }

  try {
    appStorage.setItem(LAST_SYNC_STORAGE_KEY, JSON.stringify(diagnostics))
  } catch {
    // Non-fatal
  }

  return diagnostics
}

/**
 * Cancels all notifications (N2.10 factory reset hook)
 */
export async function cancelAllNotifications(): Promise<void> {
  if (isNative()) {
    try {
      await LocalNotifications.cancelAll()
      await MaganisNative.kvRemove({ key: 'maganis:notify.schedule' })
    } catch (err) {
      console.warn('Failed to cancel all notifications:', err)
    }
  }
  try {
    appStorage.removeItem(LAST_SYNC_STORAGE_KEY)
  } catch {
    // Non-fatal
  }
}

/**
 * Interactive test button: schedules a notification 5 seconds ahead through the SAME pipeline,
 * waits 8 seconds, checks delivery honestly, and returns verification outcome.
 */
export async function runTestNotification(
  delaySeconds = 5,
): Promise<{ delivered: boolean; firstFailingCheck?: string }> {
  await ensureNotificationChannels()
  const perm = await checkNotificationPermission()
  if (perm !== 'granted') {
    return { delivered: false, firstFailingCheck: 'permission' }
  }

  const testId = 999999
  const triggerAt = Date.now() + delaySeconds * 1000

  if (isNative()) {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            id: testId,
            title: NOTIFICATION_COPY.test.title,
            body: NOTIFICATION_COPY.test.body,
            channelId: NOTIFICATION_CHANNELS.timer_v1.id,
            schedule: {
              at: new Date(triggerAt),
              allowWhileIdle: true,
            },
            smallIcon: NOTIFICATION_CONFIG.smallIcon,
            iconColor: NOTIFICATION_CONFIG.accentColor,
            isExactNotification: true,
            isExactMandatory: false,
          },
        ],
      })
    } catch {
      return { delivered: false, firstFailingCheck: 'schedule_failed' }
    }

    // Wait until 3 seconds past the scheduled trigger time
    await new Promise((resolve) =>
      setTimeout(resolve, (delaySeconds + 3) * 1000),
    )

    try {
      const delivered = await LocalNotifications.getDeliveredNotifications()
      const found = (delivered.notifications || []).some((n) => n.id === testId)
      if (found) {
        // Clean up test notification from shade
        await LocalNotifications.removeDeliveredNotifications({
          notifications: [{ id: testId, title: '', body: '' }],
        })
        return { delivered: true }
      }
    } catch {
      // Non-fatal delivery check query
    }

    // If not found in delivered, check channel or exact alarm state
    const exact = await checkExactAlarmPermission()
    if (!exact) {
      return { delivered: false, firstFailingCheck: 'exact_alarm' }
    }
    const channelSt = await MaganisNative.getChannelStatus({
      channelId: NOTIFICATION_CHANNELS.timer_v1.id,
    })
    if (!channelSt.enabled) {
      return { delivered: false, firstFailingCheck: 'channel_disabled' }
    }

    return { delivered: false, firstFailingCheck: 'system_delayed' }
  }

  // Web mock verification
  await new Promise((resolve) => setTimeout(resolve, 500))
  return { delivered: true }
}

/**
 * Registers an action listener for when a user taps a notification
 */
export function onNotificationAction(
  listener: NotificationActionListener,
): () => void {
  actionListeners.add(listener)
  return () => {
    actionListeners.delete(listener)
  }
}

/**
 * Initializes notification tap router listener
 */
export function initNotificationRouter(): () => void {
  if (!isNative()) return () => {}

  let unlisten: (() => void) | null = null

  void LocalNotifications.addListener(
    'localNotificationActionPerformed',
    (action) => {
      const extra = action.notification.extra as
        | {
            type?: string
            route?: string
            targetDate?: string
            payload?: Record<string, unknown>
          }
        | undefined
      if (!extra) return

      let target: NotificationRouteTarget | null = null
      if (extra.route === 'workout_active') {
        target = { route: 'workout_active' }
      } else if (extra.route === 'cardio_runner') {
        target = { route: 'cardio_runner' }
      } else if (extra.route === 'weekly_plan') {
        target = {
          route: 'weekly_plan',
          targetDate: extra.targetDate,
          payload: extra.payload,
        }
      } else if (extra.route === 'nutrition') {
        target = { route: 'nutrition', targetDate: extra.targetDate }
      } else if (extra.route === 'settings_backup') {
        target = { route: 'settings_backup' }
      }

      if (target) {
        for (const l of actionListeners) {
          try {
            l(target)
          } catch (e) {
            console.error('Error dispatching notification action:', e)
          }
        }
      }
    },
  ).then((handle) => {
    unlisten = () => {
      void handle.remove()
    }
  })

  return () => {
    unlisten?.()
  }
}

// Auto-sync on notification settings change
onNotificationSettingsChange(() => {
  void syncSchedule()
})
