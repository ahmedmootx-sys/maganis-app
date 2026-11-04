import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Maganis Native Shell Configuration (Capacitor 8)
 * Default appId: 'app.maganis.coach'
 * Owner decision: applicationId is permanent once installed on device.
 */
const isDebug =
  process.env.CAPACITOR_DEBUG === 'true' ||
  process.env.NODE_ENV === 'development'

const config: CapacitorConfig = {
  appId: 'app.maganis.coach',
  appName: 'Maganis',
  webDir: 'dist-native',
  server: {
    // App loads exclusively from local bundled assets
    cleartext: false,
    androidScheme: 'https',
  },
  android: {
    webContentsDebuggingEnabled: isDebug,
    allowMixedContent: false,
    captureInput: true,
  },
}

export default config
