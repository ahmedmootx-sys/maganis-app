import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { isNative } from './runtime.ts'
import { getNotificationSettings } from './notifications/notificationStore.ts'

export const haptics = {
  /**
   * Light tactile feedback on completing an exercise set or interactive action
   */
  async impactLight(): Promise<void> {
    const settings = getNotificationSettings()
    if (!settings.hapticsEnabled) return
    try {
      if (isNative()) {
        await Haptics.impact({ style: ImpactStyle.Light })
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(30)
      }
    } catch {
      // Non-fatal device capability fallback
    }
  },

  /**
   * Success vibration pattern on rest timer completion or workout finish
   */
  async notifySuccess(): Promise<void> {
    const settings = getNotificationSettings()
    if (!settings.hapticsEnabled) return
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Success })
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([100, 50, 100, 50, 200])
      }
    } catch {
      // Non-fatal
    }
  },

  /**
   * Distinct warning vibration pattern on cardio target reached
   */
  async notifyWarning(): Promise<void> {
    const settings = getNotificationSettings()
    if (!settings.hapticsEnabled) return
    try {
      if (isNative()) {
        await Haptics.notification({ type: NotificationType.Warning })
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([150, 100, 150])
      }
    } catch {
      // Non-fatal
    }
  },

  /**
   * Custom vibration duration or pattern fallback
   */
  async vibrate(duration = 200): Promise<void> {
    const settings = getNotificationSettings()
    if (!settings.hapticsEnabled) return
    try {
      if (isNative()) {
        await Haptics.vibrate({ duration })
      } else if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(duration)
      }
    } catch {
      // Non-fatal
    }
  },
}
