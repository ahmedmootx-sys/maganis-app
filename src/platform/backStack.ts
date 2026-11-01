import { App } from '@capacitor/app'
import { isNative } from './runtime.ts'

export type BackHandler = () => boolean | Promise<boolean>

interface RegisteredHandler {
  id: number
  handler: BackHandler
  priority: number
}

class BackButtonManager {
  private handlers: RegisteredHandler[] = []
  private nextId = 1
  private lastBackPressTime = 0
  private exitThresholdMs = 2000
  private toastCallback: ((message: string) => void) | null = null
  private nativeListenerAttached = false

  constructor() {
    this.initNativeListener()
  }

  private initNativeListener() {
    if (this.nativeListenerAttached) return
    if (isNative() && typeof window !== 'undefined') {
      try {
        void App.addListener('backButton', () => {
          void this.handleBackPress()
        })
        this.nativeListenerAttached = true
      } catch (err) {
        console.warn('Failed to attach Capacitor backButton listener:', err)
      }
    }
  }

  /**
   * Registers a back-press handler (e.g. for a modal, sheet, or confirmation dialog).
   * Handlers run in descending order of priority, with newer handlers with the same priority running first (LIFO).
   * If handler returns true, the back event is considered handled.
   * Returns an unregister function.
   */
  register(handler: BackHandler, priority = 10): () => void {
    const id = this.nextId++
    this.handlers.unshift({ id, handler, priority })
    // Keep sorted by priority descending, stable order for equal priorities
    this.handlers.sort((a, b) => b.priority - a.priority)

    return () => {
      this.handlers = this.handlers.filter((h) => h.id !== id)
    }
  }

  /**
   * Set callback to show user toast (e.g. «اضغط تاني للخروج»).
   */
  setOnShowToast(cb: (message: string) => void) {
    this.toastCallback = cb
  }

  /**
   * Checks whether the current screen is at the root navigation level.
   */
  isAtRootRoute(): boolean {
    if (typeof window === 'undefined') return true
    const hash = window.location.hash.replace(/^#\/?/, '').toLowerCase()
    // Root screens or default landing
    return hash === '' || hash === 'home' || hash === 'today'
  }

  /**
   * Main dispatcher for back events.
   * Returns true if handled by a custom handler, or false if defaulted to route back/exit.
   */
  async handleBackPress(
    exitAppFn: () => void = () => App.exitApp(),
  ): Promise<boolean> {
    // 1. Check registered modal/sheet handlers
    for (const item of [...this.handlers]) {
      try {
        const handled = await item.handler()
        if (handled) {
          return true
        }
      } catch (err) {
        console.error('Error running back handler:', err)
      }
    }

    // 2. If not at root route, navigate back in browser/hash history
    if (!this.isAtRootRoute()) {
      if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back()
        return true
      }
    }

    // 3. At root screen: double-press back to exit app
    const now = Date.now()
    if (
      this.lastBackPressTime &&
      now - this.lastBackPressTime < this.exitThresholdMs
    ) {
      exitAppFn()
      return true
    }

    this.lastBackPressTime = now
    if (this.toastCallback) {
      this.toastCallback('اضغط تاني للخروج')
    }
    return false
  }

  /**
   * Testing helper to reset internal state.
   */
  resetForTesting() {
    this.handlers = []
    this.lastBackPressTime = 0
    this.toastCallback = null
  }
}

export const backButtonManager = new BackButtonManager()
