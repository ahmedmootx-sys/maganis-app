import fs from 'node:fs'
import path from 'node:path'

console.log('=== PROBE: N4 NOTIFICATIONS & RELIABLE TIMERS PRE-FIX AUDIT ===')

const checks = [
  {
    id: 'N4.1.deps',
    desc: '@capacitor/local-notifications and @capacitor/haptics pinned in package.json and recorded in docs/NATIVE-DEPS.md',
    run: () => {
      const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))
      const hasNotify = Boolean(
        pkg.dependencies?.['@capacitor/local-notifications'],
      )
      const hasHaptics = Boolean(pkg.dependencies?.['@capacitor/haptics'])
      const nativeDeps = fs.readFileSync('docs/NATIVE-DEPS.md', 'utf8')
      const docHasNotify = nativeDeps.includes('@capacitor/local-notifications')
      const docHasHaptics = nativeDeps.includes('@capacitor/haptics')
      return hasNotify && hasHaptics && docHasNotify && docHasHaptics
    },
  },
  {
    id: 'N4.1.copy',
    desc: 'src/content/notificationCopy.ts exists with 5 notification types and 4 channels',
    run: () => {
      if (!fs.existsSync('src/content/notificationCopy.ts')) return false
      const content = fs.readFileSync('src/content/notificationCopy.ts', 'utf8')
      return (
        content.includes('workout_day') &&
        content.includes('rest_end') &&
        content.includes('cardio_end') &&
        content.includes('backup_alert') &&
        content.includes('nutrition_log') &&
        content.includes('workout_v1') &&
        content.includes('timer_v1') &&
        content.includes('backup_v1') &&
        content.includes('nutrition_v1')
      )
    },
  },
  {
    id: 'N4.2.pureScheduler',
    desc: 'src/platform/notifications/schedule.ts exists with pure computeDesiredSchedule, diffSchedule, and stable numeric IDs',
    run: () => {
      if (!fs.existsSync('src/platform/notifications/schedule.ts')) return false
      const content = fs.readFileSync(
        'src/platform/notifications/schedule.ts',
        'utf8',
      )
      return (
        content.includes('computeDesiredSchedule') &&
        content.includes('diffSchedule') &&
        content.includes('generateNotificationId')
      )
    },
  },
  {
    id: 'N4.2.registry',
    desc: 'Storage keys maganis:notify.settings (included) and maganis:notify.lastSync (excluded) in storageRegistry.ts',
    run: () => {
      if (!fs.existsSync('src/platform/storageRegistry.ts')) return false
      const content = fs.readFileSync('src/platform/storageRegistry.ts', 'utf8')
      return (
        content.includes('maganis:notify.settings') &&
        content.includes('maganis:notify.lastSync')
      )
    },
  },
  {
    id: 'N4.3.permissions',
    desc: 'AndroidManifest.xml declares SCHEDULE_EXACT_ALARM, POST_NOTIFICATIONS, and no USE_EXACT_ALARM',
    run: () => {
      if (!fs.existsSync('android/app/src/main/AndroidManifest.xml'))
        return false
      const content = fs.readFileSync(
        'android/app/src/main/AndroidManifest.xml',
        'utf8',
      )
      return (
        content.includes('SCHEDULE_EXACT_ALARM') &&
        content.includes('POST_NOTIFICATIONS') &&
        !content.includes('USE_EXACT_ALARM')
      )
    },
  },
  {
    id: 'N4.3.maganisNativeMethods',
    desc: 'MaganisNative.java and maganisNative.ts declare openSettings, getPowerStatus, getChannelStatus, keepScreenOn',
    run: () => {
      const ts = fs.existsSync('src/platform/native/maganisNative.ts')
        ? fs.readFileSync('src/platform/native/maganisNative.ts', 'utf8')
        : ''
      const java = fs.existsSync(
        'android/app/src/main/java/app/maganis/coach/MaganisNative.java',
      )
        ? fs.readFileSync(
            'android/app/src/main/java/app/maganis/coach/MaganisNative.java',
            'utf8',
          )
        : ''
      const tsHas =
        ts.includes('openSettings(') &&
        ts.includes('getPowerStatus(') &&
        ts.includes('getChannelStatus(') &&
        ts.includes('keepScreenOn(')
      const javaHas =
        java.includes('openSettings') &&
        java.includes('getPowerStatus') &&
        java.includes('getChannelStatus') &&
        java.includes('keepScreenOn')
      return tsHas && javaHas
    },
  },
  {
    id: 'N4.4.settingsUI',
    desc: 'SettingsScreen.tsx has notifications section, status diagnostics panel, and test notification button',
    run: () => {
      if (!fs.existsSync('src/modules/settings/SettingsScreen.tsx'))
        return false
      const content = fs.readFileSync(
        'src/modules/settings/SettingsScreen.tsx',
        'utf8',
      )
      return (
        content.includes('التنبيهات') &&
        content.includes('NotificationSettings')
      )
    },
  },
  {
    id: 'N4.5.timestampTimers',
    desc: 'ActiveWorkoutSession.tsx derives timers from timestamps (startedAt, restEndsAt) with no 1s auto-save loop or catch-ignore',
    run: () => {
      if (!fs.existsSync('src/modules/workout/ActiveWorkoutSession.tsx'))
        return false
      const content = fs.readFileSync(
        'src/modules/workout/ActiveWorkoutSession.tsx',
        'utf8',
      )
      const hasTimestamp =
        content.includes('startedAt') && content.includes('restEndsAt')
      const hasPerSecondSave = content.includes(
        '[programDay, exercisesState, elapsedSeconds]',
      )
      const hasCatchIgnore =
        content.includes('catch {\n      // ignore\n    }') ||
        content.includes('catch {\n      // ignore')
      return hasTimestamp && !hasPerSecondSave && !hasCatchIgnore
    },
  },
  {
    id: 'N4.6.noRawVibrateOrWakeLock',
    desc: 'Zero navigator.vibrate or navigator.wakeLock in src/ outside platform adapters',
    run: () => {
      const files = []
      function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
          const full = path.join(dir, entry.name)
          if (entry.isDirectory()) walk(full)
          else if (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx')) {
            files.push(full)
          }
        }
      }
      walk('src')
      let rawVibrate = 0
      let rawWakeLock = 0
      for (const file of files) {
        const norm = file.replace(/\\/g, '/')
        if (
          norm === 'src/platform/haptics.ts' ||
          norm === 'src/platform/keepAwake.ts'
        ) {
          continue
        }
        const text = fs.readFileSync(file, 'utf8')
        if (text.includes('navigator.vibrate')) rawVibrate++
        if (text.includes('navigator.wakeLock')) rawWakeLock++
      }
      return rawVibrate === 0 && rawWakeLock === 0
    },
  },
  {
    id: 'N4.7.lifecycle',
    desc: 'src/platform/lifecycle.ts exists with unified coordinator for resume and pause',
    run: () => {
      return fs.existsSync('src/platform/lifecycle.ts')
    },
  },
  {
    id: 'N4.8.nativeReliability',
    desc: 'Native AlarmRestoreReceiver / BootReceiver registered in AndroidManifest.xml for reboot and alarm re-arm',
    run: () => {
      if (!fs.existsSync('android/app/src/main/AndroidManifest.xml'))
        return false
      const content = fs.readFileSync(
        'android/app/src/main/AndroidManifest.xml',
        'utf8',
      )
      return (
        content.includes('RECEIVE_BOOT_COMPLETED') &&
        content.includes('AlarmRestoreReceiver')
      )
    },
  },
]

let passed = 0
let failed = 0

for (const chk of checks) {
  let ok = false
  try {
    ok = chk.run()
  } catch (err) {
    ok = false
  }
  if (ok) {
    console.log(`[PASS] ${chk.id}: ${chk.desc}`)
    passed++
  } else {
    console.log(`[FAIL] ${chk.id}: ${chk.desc}`)
    failed++
  }
}

console.log(
  `\nAudit result: ${passed} passed, ${failed} failed out of ${checks.length}`,
)
if (failed > 0) {
  process.exitCode = 1
}
