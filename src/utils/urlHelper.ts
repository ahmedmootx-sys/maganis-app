/**
 * src/utils/urlHelper.ts
 *
 * Reliable external URL launcher for Web & Android APK.
 */

import { isNative } from '../platform/runtime.ts'
import { MaganisNative } from '../platform/native/maganisNative.ts'

export async function openExternalUrl(url: string): Promise<boolean> {
  const trimmed = (url || '').trim()
  if (!trimmed) return false

  if (isNative()) {
    try {
      const res = await MaganisNative.openExternalUrl({ url: trimmed })
      if (res && res.success) return true
    } catch (err) {
      console.warn('[openExternalUrl] Native open failed, falling back:', err)
    }
  }

  if (typeof window !== 'undefined') {
    try {
      const win = window.open(trimmed, '_blank', 'noopener,noreferrer')
      if (win) return true
    } catch {
      // Fallback
    }
    try {
      window.location.href = trimmed
      return true
    } catch {
      return false
    }
  }

  return false
}
