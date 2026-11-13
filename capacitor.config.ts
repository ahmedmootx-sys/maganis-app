import type { CapacitorConfig } from '@capacitor/cli'

/**
 * Bunyan Native Shell Configuration (Capacitor 8)
 * Default appId: 'app.maganis.coach' (preserved permanently for existing device installs & data)
 */
const isDebug =
  process.env.CAPACITOR_DEBUG === 'true' ||
  process.env.NODE_ENV === 'development'

const config: CapacitorConfig = {
  appId: 'app.maganis.coach',
  appName: 'Bunyan',
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
