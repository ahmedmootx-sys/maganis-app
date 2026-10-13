/**
 * Navigation History Manager
 * Intercepts mobile back gestures and hardware back buttons (via popstate)
 * so that back action closes modals, dismisses overlays, or navigates back to Dashboard
 * instead of exiting the PWA or browser tab.
 */

type BackHandler = () => boolean | void // return false to prevent default pop

class NavigationHistoryManager {
  private handlerStack: Array<{ id: string; handler: BackHandler }> = []
  private isPushing = false
  private lastBackPressTime = 0
  private exitToastTimeout: ReturnType<typeof setTimeout> | null = null
  private onShowToast?: (msg: string) => void

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState)
    }
  }

  public setOnShowToast(cb: (msg: string) => void) {
    this.onShowToast = cb
  }

  /**
   * Pushes a closer handler onto the back navigation stack.
   * Automatically pushes a dummy history state so hardware back triggers popstate.
   * Returns an unsubscribe function to remove the handler if closed manually.
   */
  public push(id: string, handler: BackHandler): () => void {
    if (typeof window === 'undefined') return () => {}

    this.handlerStack.push({ id, handler })
    this.isPushing = true
    window.history.pushState(
      { maganisBackId: id, depth: this.handlerStack.length },
      '',
    )
    this.isPushing = false

    return () => {
      this.remove(id)
    }
  }

  public remove(id: string) {
    const idx = this.handlerStack.findIndex((item) => item.id === id)
    if (idx !== -1) {
      this.handlerStack.splice(idx, 1)
      // If the top state was removed manually (e.g. user clicked Close button),
      // we can optionally step back in history if the current state matched it
      if (
        typeof window !== 'undefined' &&
        window.history.state?.maganisBackId === id
      ) {
        window.history.back()
      }
    }
  }

  private handlePopState = () => {
    if (this.isPushing) return

    // 1. If there's an active modal or overlay handler in the stack, pop and execute it
    if (this.handlerStack.length > 0) {
      const top = this.handlerStack.pop()
      if (top) {
        try {
          top.handler()
        } catch (e) {
          console.error('Error in back handler:', e)
        }
      }
      return
    }

    // 2. If stack is empty, check root back behavior
    const now = Date.now()
    if (now - this.lastBackPressTime < 2000) {
      // Second back press within 2s: allow normal exit / back
      return
    }

    // First back press: push state back to keep user in app and show toast
    this.lastBackPressTime = now
    window.history.pushState({ maganisRoot: true }, '')
    if (this.onShowToast) {
      this.onShowToast('اضغط مرة أخرى للخروج من التطبيق')
    }
    if (this.exitToastTimeout) clearTimeout(this.exitToastTimeout)
    this.exitToastTimeout = setTimeout(() => {
      this.lastBackPressTime = 0
    }, 2000)
  }

  public destroy() {
    if (typeof window !== 'undefined') {
      window.removeEventListener('popstate', this.handlePopState)
    }
    if (this.exitToastTimeout) clearTimeout(this.exitToastTimeout)
  }
}

export const navigationHistory = new NavigationHistoryManager()
