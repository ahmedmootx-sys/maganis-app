import fs from 'node:fs'
import path from 'node:path'

console.log('=== PROBE: N1 PRE-FIX BASELINE AUDIT ===')

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

const checks = [
  {
    id: 'N1.1.deps',
    desc: 'Capacitor 8 packages pinned in package.json',
    pass: Boolean(
      pkg.dependencies?.['@capacitor/core'] &&
      pkg.devDependencies?.['@capacitor/cli'],
    ),
  },
  {
    id: 'N1.1.config',
    desc: 'capacitor.config.ts exists',
    pass: fs.existsSync('capacitor.config.ts'),
  },
  {
    id: 'N1.1.androidDir',
    desc: 'android/ directory committed',
    pass: fs.existsSync('android'),
  },
  {
    id: 'N1.1.gradlew',
    desc: 'gradlew wrapper committed',
    pass: fs.existsSync('android/gradlew') || fs.existsSync('gradlew'),
  },
  {
    id: 'N1.1.depsDoc',
    desc: 'docs/NATIVE-DEPS.md exists',
    pass: fs.existsSync('docs/NATIVE-DEPS.md'),
  },
  {
    id: 'N1.2.script',
    desc: 'npm script build:native exists',
    pass: Boolean(pkg.scripts?.['build:native']),
  },
  {
    id: 'N1.2.runtime',
    desc: 'src/platform/runtime.ts exists',
    pass: fs.existsSync('src/platform/runtime.ts'),
  },
  {
    id: 'N1.2.smoke',
    desc: 'qa/native-web-smoke.mjs exists',
    pass: fs.existsSync('qa/native-web-smoke.mjs'),
  },
  {
    id: 'N1.3.permissionsDoc',
    desc: 'docs/ANDROID-PERMISSIONS.md exists',
    pass: fs.existsSync('docs/ANDROID-PERMISSIONS.md'),
  },
  {
    id: 'N1.4.platform',
    desc: 'src/platform/index.ts exists',
    pass: fs.existsSync('src/platform/index.ts'),
  },
  {
    id: 'N1.4.pluginJava',
    desc: 'MaganisNative.java exists',
    pass: fs.existsSync(
      'android/app/src/main/java/app/maganis/coach/MaganisNative.java',
    ),
  },
  {
    id: 'N1.4.pluginTs',
    desc: 'src/platform/native/maganisNative.ts exists',
    pass: fs.existsSync('src/platform/native/maganisNative.ts'),
  },
  {
    id: 'N1.5.backStack',
    desc: 'src/platform/backStack.ts exists',
    pass: fs.existsSync('src/platform/backStack.ts'),
  },
  {
    id: 'N1.5.backStackTest',
    desc: 'src/platform/backStack.test.ts exists',
    pass: fs.existsSync('src/platform/backStack.test.ts'),
  },
  {
    id: 'N1.7.workflow',
    desc: '.github/workflows/android.yml exists',
    pass: fs.existsSync('.github/workflows/android.yml'),
  },
  {
    id: 'N1.8.keystoreScript',
    desc: 'scripts/android-keystore.mjs exists',
    pass: fs.existsSync('scripts/android-keystore.mjs'),
  },
  {
    id: 'N1.8.releaseArDoc',
    desc: 'docs/ANDROID-RELEASE.ar.md exists',
    pass: fs.existsSync('docs/ANDROID-RELEASE.ar.md'),
  },
  {
    id: 'N1.8.releaseDoc',
    desc: 'docs/ANDROID-RELEASE.md exists',
    pass: fs.existsSync('docs/ANDROID-RELEASE.md'),
  },
  {
    id: 'N1.8.changelog',
    desc: 'CHANGELOG.md exists',
    pass: fs.existsSync('CHANGELOG.md'),
  },
]

let failedCount = 0
for (const check of checks) {
  if (check.pass) {
    console.log(`[PASS] ${check.id}: ${check.desc}`)
  } else {
    console.log(`[FAIL] ${check.id}: ${check.desc}`)
    failedCount++
  }
}

console.log(
  `\nTotal checks: ${checks.length}, Failed: ${failedCount}, Passed: ${checks.length - failedCount}`,
)
if (failedCount > 0) {
  console.log(
    '🔴 Baseline status is RED (all native tasks pending implementation as expected).',
  )
}
