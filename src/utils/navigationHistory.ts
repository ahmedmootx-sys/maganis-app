/**
 * Navigation History Manager
 * Intercepts mobile back gestures and hardware back buttons (via popstate)
 * so that back action closes modals, dismisses overlays, or navigates back to Dashboard
 * instead of exiting the PWA or browser tab.
 */

type BackHandler = () => boolean | void // return false to prevent default pop

export type NavSource = 'app' | 'browser'
let navSource: NavSource = 'browser'

export function setNavSource(source: NavSource) {
  navSource = source
}

export function getNavSource(): NavSource {
  return navSource
}

class NavigationHistoryManager {
  private handlerStack: Array<{ id: string; handler: BackHandler }> = []
  private isPushing = false
  private isProgrammaticBack = false
  private lastBackPressTime = 0
  private exitToastTimeout: ReturnType<typeof setTimeout> | null = null
  private onShowToast?: (msg: string) => void
  private tabBackHandler?: () => boolean | void

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('popstate', this.handlePopState)
    }
  }

  public setOnShowToast(cb: (msg: string) => void) {
    this.onShowToast = cb
  }

  public setTabBackHandler(handler?: () => boolean | void) {
    this.tabBackHandler = handler
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
      // step back in history without triggering handler execution
      if (
        typeof window !== 'undefined' &&
        window.history.state?.maganisBackId === id
      ) {
        this.isProgrammaticBack = true
        window.history.back()
      }
    }
  }

  private handlePopState = () => {
    if (this.isPushing) return

    if (this.isProgrammaticBack) {
      this.isProgrammaticBack = false
      return
    }

    const currentNavSource = navSource
    // Reset back to browser for subsequent physical gestures
    navSource = 'browser'

    // (a) The navigation was not started by the app
    if (currentNavSource === 'app') {
      return
    }

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

    // 2. If no modal is open, check if tab back handler wants to return to dashboard
    if (this.tabBackHandler) {
      const handled = this.tabBackHandler()
      if (handled) {
        window.history.pushState({ maganisRoot: true }, '')
        return
      }
    }

    // (c) matchMedia('(display-mode: standalone)') is true
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia?.('(display-mode: standalone)').matches === true ||
        (window.navigator as unknown as { standalone?: boolean })?.standalone ===
          true)

    if (!isStandalone) {
      // In a normal browser tab the exit toast never appears
      return
    }

    // 3. If stack is empty and at root in standalone mode, check double-press exit behavior
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
