import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { ConfigError, loadConfig } from './config/appConfig.ts'
import { ConfigErrorView } from './components/ConfigError.tsx'
import { updateManager } from './utils/updateManager.ts'
import { isNative } from './platform/runtime.ts'
import { bootstrapPlatform } from './platform/bootstrap.ts'
import { storageHealth } from './platform/storageHealth.ts'
import { RecoveryModeScreen } from './components/RecoveryModeScreen.tsx'
import './styles/app.css'

async function init() {
  const container = document.getElementById('root')
  if (!container) {
    throw new Error('Root container #root is missing in index.html')
  }

  try {
    const config = loadConfig(import.meta.env)

    // Await platform hydration & migrations before rendering
    const bootstrapRes = await bootstrapPlatform()

    // If storage is unreadable or fatal migration error occurred, enter recovery mode (D1)
    if (storageHealth.getStatus() === 'readonly' || !bootstrapRes.ok) {
      createRoot(container).render(
        <StrictMode>
          <RecoveryModeScreen />
        </StrictMode>,
      )
      return
    }

    createRoot(container).render(
      <StrictMode>
        <App config={config} />
      </StrictMode>,
    )

    // Service worker registration (Web PWA only; never in native Capacitor shell)
    if (!isNative() && 'serviceWorker' in navigator) {
      if (import.meta.env.DEV) {
        // In development mode, unregister active service workers to prevent stale caching
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister()
          }
        })
        if ('caches' in window) {
          caches
            .keys()
            .then((keys) => keys.forEach((key) => caches.delete(key)))
        }
      } else {
        window.addEventListener('load', () => {
          navigator.serviceWorker
            .register(`${import.meta.env.BASE_URL}sw.js`)
            .then((reg) => {
              updateManager.init(reg)
            })
            .catch(() => {
              updateManager.checkForUpdate()
            })
        })
      }
    }

    // In native mode, ensure external web links open in the system browser
    if (isNative() && typeof window !== 'undefined') {
      document.addEventListener(
        'click',
        (e) => {
          const anchor = (e.target as HTMLElement)?.closest('a')
          if (anchor && anchor.href) {
            const href = anchor.href
            if (
              (href.startsWith('http://') || href.startsWith('https://')) &&
              !href.startsWith(window.location.origin)
            ) {
              e.preventDefault()
              window.open(href, '_system')
            }
          }
        },
        { capture: true },
      )
    }
  } catch (error) {
    if (error instanceof ConfigError) {
      console.error(error.message)
      createRoot(container).render(<ConfigErrorView message={error.message} />)
    } else {
      throw error
    }
  }
}

void init()
