import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App.tsx'
import { ConfigError, loadConfig } from './config/appConfig.ts'
import { ConfigErrorView } from './components/ConfigError.tsx'
import './styles/app.css'

const container = document.getElementById('root')
if (!container) {
  throw new Error('Root container #root is missing in index.html')
}

try {
  const config = loadConfig(import.meta.env)
  createRoot(container).render(
    <StrictMode>
      <App config={config} />
    </StrictMode>,
  )

  // Service worker registration
  if ('serviceWorker' in navigator) {
    if (import.meta.env.DEV) {
      // In development mode, unregister active service workers to prevent stale caching
      navigator.serviceWorker.getRegistrations().then((registrations) => {
        for (const registration of registrations) {
          registration.unregister()
        }
      })
      if ('caches' in window) {
        caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)))
      }
    } else {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register(`${import.meta.env.BASE_URL}sw.js`)
          .then((reg) => {
            reg.addEventListener('updatefound', () => {
              const newWorker = reg.installing
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'activated') {
                    window.location.reload()
                  }
                })
              }
            })
          })
          .catch(() => {
            // SW registration failed - app still works offline-first
          })
      })
    }
  }
} catch (error) {
  if (error instanceof ConfigError) {
    console.error(error.message)
    createRoot(container).render(<ConfigErrorView message={error.message} />)
  } else {
    throw error
  }
}
