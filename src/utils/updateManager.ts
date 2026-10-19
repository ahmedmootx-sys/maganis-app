/**
 * updateManager.ts
 * Manages Service Worker updates and version checking against version.json.
 */

type UpdateListener = (hasUpdate: boolean) => void

class UpdateManager {
  private hasUpdate = false
  private waitingWorker: ServiceWorker | null = null
  private registration: ServiceWorkerRegistration | null = null
  private listeners = new Set<UpdateListener>()
  private isChecking = false

  init(registration: ServiceWorkerRegistration) {
    this.registration = registration

    // Check if there is already a waiting worker
    if (registration.waiting) {
      this.waitingWorker = registration.waiting
      this.notifyUpdate(true)
    }

    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing
      if (!newWorker) return

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'installed' &&
          navigator.serviceWorker.controller
        ) {
          this.waitingWorker = newWorker
          this.notifyUpdate(true)
        }
      })
    })

    // Listen for visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        this.checkForUpdate()
      }
    })

    // Initial check
    this.checkForUpdate()
  }

  async checkForUpdate() {
    if (this.isChecking) return
    this.isChecking = true

    try {
      if (this.registration) {
        await this.registration.update().catch(() => {})
        if (this.registration.waiting) {
          this.waitingWorker = this.registration.waiting
          this.notifyUpdate(true)
          this.isChecking = false
          return
        }
      }

      // Also check version.json directly with no-store
      const base = import.meta.env.BASE_URL || '/'
      const versionUrl = `${base}version.json?t=${Date.now()}`
      const response = await fetch(versionUrl, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      })

      if (response.ok) {
        const data = await response.json()
        if (
          typeof __BUILD_ID__ !== 'undefined' &&
          data.buildId &&
          data.buildId !== __BUILD_ID__
        ) {
          this.notifyUpdate(true)
        }
      }
    } catch {
      // Offline or network error
    } finally {
      this.isChecking = false
    }
  }

  subscribe(listener: UpdateListener) {
    this.listeners.add(listener)
    listener(this.hasUpdate)
    return () => {
      this.listeners.delete(listener)
    }
  }

  private notifyUpdate(hasUpdate: boolean) {
    this.hasUpdate = hasUpdate
    for (const listener of this.listeners) {
      try {
        listener(hasUpdate)
      } catch (err) {
        console.error(err)
      }
    }
  }

  applyUpdate() {
    if (this.waitingWorker) {
      this.waitingWorker.postMessage({ type: 'SKIP_WAITING' })
    }

    navigator.serviceWorker?.addEventListener('controllerchange', () => {
      window.location.reload()
    })

    // Fallback if controllerchange does not fire within 1s
    setTimeout(() => {
      window.location.reload()
    }, 800)
  }
}

export const updateManager = new UpdateManager()
