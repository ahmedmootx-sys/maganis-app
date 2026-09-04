/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_ENV?: string
  readonly VITE_APP_NAME?: string
  readonly VITE_STORAGE_PREFIX?: string
  readonly VITE_LOG_LEVEL?: string
  readonly VITE_DEV_PORT?: string
}
