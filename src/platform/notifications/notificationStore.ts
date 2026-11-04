import { appStorage } from '../storage.ts'
import {
  DEFAULT_NOTIFICATION_SETTINGS,
  type NotificationSettings,
} from './schedule.ts'

export const NOTIFICATION_SETTINGS_KEY = 'maganis:notify.settings'

type SettingsChangeListener = (settings: NotificationSettings) => void
const listeners = new Set<SettingsChangeListener>()

export function getNotificationSettings(): NotificationSettings {
  try {
    const raw = appStorage.getItem(NOTIFICATION_SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_NOTIFICATION_SETTINGS }
    const parsed = JSON.parse(raw)
    return {
      ...DEFAULT_NOTIFICATION_SETTINGS,
      ...parsed,
    }
  } catch {
    return { ...DEFAULT_NOTIFICATION_SETTINGS }
  }
}

export function saveNotificationSettings(
  partial: Partial<NotificationSettings>,
): NotificationSettings {
  const current = getNotificationSettings()
  const updated: NotificationSettings = {
    ...current,
    ...partial,
  }
  try {
    appStorage.setItem(NOTIFICATION_SETTINGS_KEY, JSON.stringify(updated))
  } catch (err) {
    console.error('Failed to save notification settings:', err)
  }
  for (const listener of listeners) {
    try {
      listener(updated)
    } catch (e) {
      console.error('Error in notification settings listener:', e)
    }
  }
  return updated
}

export function onNotificationSettingsChange(
  listener: SettingsChangeListener,
): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
