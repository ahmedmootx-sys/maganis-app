/**
 * src/utils/clipboard.ts
 *
 * Resilient clipboard utility for MAGANIS (G5-A / G5-B).
 * Supports navigator.clipboard with fallbacks to document.execCommand('copy')
 * and selectable textarea fallback for mobile environments.
 */

export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false

  // 1. Try Modern Async Clipboard API
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // Fall through to legacy execCommand
    }
  }

  // 2. Fallback to document.execCommand('copy') with textarea
  if (typeof document !== 'undefined') {
    try {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.setAttribute('readonly', '')
      // Position offscreen but keep visible to browser selection
      textarea.style.position = 'fixed'
      textarea.style.left = '-9999px'
      textarea.style.top = '0'
      textarea.style.fontSize = '16px' // Prevent iOS auto-zoom
      document.body.appendChild(textarea)

      textarea.focus()
      textarea.select()
      textarea.setSelectionRange(0, textarea.value.length)

      const success = document.execCommand('copy')
      document.body.removeChild(textarea)
      if (success) return true
    } catch {
      // Fall through
    }
  }

  return false
}
