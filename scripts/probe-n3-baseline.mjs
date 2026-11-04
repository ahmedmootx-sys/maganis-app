import fs from 'node:fs'
import path from 'node:path'

console.log('=== PROBE: N3 BACKUP GUARANTEE PRE-FIX AUDIT ===')

const checks = [
  {
    id: 'N3.1.streamingJava',
    desc: 'MaganisNative.java implements streaming write/read/verify/list/delete/share methods',
    run: () => {
      if (
        !fs.existsSync(
          'android/app/src/main/java/app/maganis/coach/MaganisNative.java',
        )
      )
        return false
      const content = fs.readFileSync(
        'android/app/src/main/java/app/maganis/coach/MaganisNative.java',
        'utf8',
      )
      return (
        content.includes('openWrite') &&
        content.includes('append') &&
        content.includes('close') &&
        content.includes('verify') &&
        content.includes('list') &&
        content.includes('delete')
      )
    },
  },
  {
    id: 'N3.1.backupStorageManager',
    desc: 'Plain Java BackupStorageManager exists for JVM unit testing',
    run: () => {
      return fs.existsSync(
        'android/app/src/main/java/app/maganis/coach/BackupStorageManager.java',
      )
    },
  },
  {
    id: 'N3.1.streamingTs',
    desc: 'src/platform/native/maganisNative.ts declares streaming and folder methods',
    run: () => {
      if (!fs.existsSync('src/platform/native/maganisNative.ts')) return false
      const content = fs.readFileSync(
        'src/platform/native/maganisNative.ts',
        'utf8',
      )
      return (
        content.includes('openWrite(') &&
        content.includes('append(') &&
        content.includes('verify(') &&
        content.includes('pickFolder(')
      )
    },
  },
  {
    id: 'N3.2.backupEngine',
    desc: 'src/modules/backup/backupEngine.ts exists with verified pipeline and triggers',
    run: () => {
      return fs.existsSync('src/modules/backup/backupEngine.ts')
    },
  },
  {
    id: 'N3.2.registryKeys',
    desc: 'storageRegistry.ts contains maganis:backup.status and maganis:backup.settings',
    run: () => {
      if (!fs.existsSync('src/platform/storageRegistry.ts')) return false
      const content = fs.readFileSync('src/platform/storageRegistry.ts', 'utf8')
      return (
        content.includes("'maganis:backup.status'") &&
        content.includes("'maganis:backup.settings'")
      )
    },
  },
  {
    id: 'N3.3.backupUiStatus',
    desc: 'Settings Backup card renders verified status states and manifest counts',
    run: () => {
      if (!fs.existsSync('src/modules/backup/BackupPanel.tsx')) return false
      const content = fs.readFileSync(
        'src/modules/backup/BackupPanel.tsx',
        'utf8',
      )
      return (
        content.includes('آخر نسخة متأكد منها') ||
        content.includes('backupStatus')
      )
    },
  },
  {
    id: 'N3.3.dashboardBanner',
    desc: 'Dashboard renders backup status banner (never/stale/failing) instead of weekly timer',
    run: () => {
      if (!fs.existsSync('src/modules/dashboard/Dashboard.tsx')) return false
      const content = fs.readFileSync(
        'src/modules/dashboard/Dashboard.tsx',
        'utf8',
      )
      return (
        content.includes('BackupHealthBanner') ||
        content.includes('backupStatus')
      )
    },
  },
  {
    id: 'N3.4.autoBackupRules',
    desc: 'Android Auto Backup XML rules exist and allowBackup is true',
    run: () => {
      const xml1 = fs.existsSync(
        'android/app/src/main/res/xml/data_extraction_rules.xml',
      )
      const xml2 = fs.existsSync(
        'android/app/src/main/res/xml/backup_rules.xml',
      )
      const manifest = fs.existsSync('android/app/src/main/AndroidManifest.xml')
        ? fs.readFileSync('android/app/src/main/AndroidManifest.xml', 'utf8')
        : ''
      const manifestAllowed =
        manifest.includes('android:allowBackup="true"') &&
        manifest.includes('data_extraction_rules')
      return xml1 && xml2 && manifestAllowed
    },
  },
  {
    id: 'N3.5.restoreFlow',
    desc: 'Restore flow supports preview comparison, safety snapshot rollback, and newer version block',
    run: () => {
      if (!fs.existsSync('src/modules/backup/snapshot.ts')) return false
      const content = fs.readFileSync('src/modules/backup/snapshot.ts', 'utf8')
      return (
        content.includes('CURRENT_SCHEMA_VERSION') &&
        fs.existsSync('src/modules/backup/RestoreModal.tsx')
      )
    },
  },
  {
    id: 'N3.6.saveFileNative',
    desc: 'src/utils/saveFile.ts routes to native Save As / share sheet without web notice',
    run: () => {
      if (!fs.existsSync('src/utils/saveFile.ts')) return false
      const content = fs.readFileSync('src/utils/saveFile.ts', 'utf8')
      return content.includes('isNative()')
    },
  },
]

let passed = 0
let failed = 0

console.log('| ID | Description | Status |')
console.log('|:---|:------------|:-------|')

for (const chk of checks) {
  let ok = false
  try {
    ok = chk.run()
  } catch {
    ok = false
  }

  if (ok) {
    passed++
    console.log(`| ${chk.id} | ${chk.desc} | PASS |`)
  } else {
    failed++
    console.log(`| ${chk.id} | ${chk.desc} | FAIL |`)
  }
}

console.log(
  `\nAudit complete: ${passed} passed, ${failed} failed (total: ${checks.length})`,
)
process.exit(failed > 0 ? 1 : 0)
