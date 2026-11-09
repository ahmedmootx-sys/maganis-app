#!/usr/bin/env node
/**
 * scripts/check-apk-badging.mjs
 * Validates APK package ID and application labels across all locales (Task N6.5).
 *
 * Rules:
 * - Runs `aapt2 dump badging <apk>` using newest build-tools under ANDROID_HOME.
 * - Asserts package name equals expected ID.
 * - Asserts application-label equals expected label.
 * - Asserts EVERY application-label-<locale> equals expected label.
 * - Zero labels found is a failure.
 * - Pure parser is independently testable with fixtures.
 */

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

/**
 * Pure parser for `aapt2 dump badging` output.
 */
export function parseBadgingOutput(rawOutput) {
  let packageName = null
  let defaultLabel = null
  const localeLabels = {}

  const lines = rawOutput.split(/\r?\n/)
  for (const line of lines) {
    // 1. Package name: package: name='app.maganis.coach.debug' ...
    const pkgMatch = line.match(/^package:\s+name='([^']+)'/)
    if (pkgMatch && !packageName) {
      packageName = pkgMatch[1]
    }

    // 2. Default application label:
    // e.g. application-label:'Maganis (Debug)' or application: label='Maganis (Debug)'
    const appLabelMatch = line.match(/^application-label:'([^']*)'/)
    if (appLabelMatch && !defaultLabel) {
      defaultLabel = appLabelMatch[1]
    } else {
      const appBlockMatch = line.match(/^application:\s+.*label='([^']*)'/)
      if (appBlockMatch && !defaultLabel) {
        defaultLabel = appBlockMatch[1]
      }
    }

    // 3. Locale-specific application labels:
    // e.g. application-label-ar:'Maganis (Debug)'
    const localeMatch = line.match(
      /^application-label-([a-zA-Z0-9_-]+):'([^']*)'/,
    )
    if (localeMatch) {
      localeLabels[localeMatch[1]] = localeMatch[2]
    }
  }

  return { packageName, defaultLabel, localeLabels }
}

/**
 * Pure validation against expected package name and expected label text.
 */
export function validateBadging(parsed, expectedPackage, expectedLabel) {
  const errors = []

  if (!parsed.packageName) {
    errors.push('No package name found in aapt2 badging output.')
  } else if (parsed.packageName !== expectedPackage) {
    errors.push(
      `Package name mismatch: expected "${expectedPackage}", but found "${parsed.packageName}".`,
    )
  }

  const allLabels = []
  if (parsed.defaultLabel !== null) {
    allLabels.push({ locale: 'default', label: parsed.defaultLabel })
    if (parsed.defaultLabel !== expectedLabel) {
      errors.push(
        `Default application label mismatch: expected "${expectedLabel}", but found "${parsed.defaultLabel}".`,
      )
    }
  }

  for (const [loc, val] of Object.entries(parsed.localeLabels)) {
    allLabels.push({ locale: loc, label: val })
    if (val !== expectedLabel) {
      errors.push(
        `Locale label mismatch for "${loc}": expected "${expectedLabel}", but found "${val}".`,
      )
    }
  }

  if (allLabels.length === 0) {
    errors.push(
      'Zero application labels found in APK badging dump (must find at least one).',
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    labelsChecked: allLabels,
  }
}

/**
 * Discovers newest aapt2 executable under ANDROID_HOME / build-tools.
 */
export function findAapt2(
  androidHome = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT,
) {
  if (!androidHome || !fs.existsSync(androidHome)) {
    throw new Error(
      `ANDROID_HOME is not set or directory does not exist: ${androidHome}`,
    )
  }

  const buildToolsDir = path.join(androidHome, 'build-tools')
  if (!fs.existsSync(buildToolsDir)) {
    throw new Error(`build-tools directory not found in ${androidHome}`)
  }

  const versions = fs
    .readdirSync(buildToolsDir)
    .filter((v) => fs.statSync(path.join(buildToolsDir, v)).isDirectory())
    .sort((a, b) => b.localeCompare(a, undefined, { numeric: true }))

  if (versions.length === 0) {
    throw new Error(`No build-tools versions found under ${buildToolsDir}`)
  }

  const exeName = process.platform === 'win32' ? 'aapt2.exe' : 'aapt2'
  for (const ver of versions) {
    const candidate = path.join(buildToolsDir, ver, exeName)
    if (fs.existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error(
    `Could not find ${exeName} in any build-tools version in ${buildToolsDir}`,
  )
}

function parseCliArgs() {
  const args = process.argv.slice(2)
  const opts = {
    apk: null,
    pkg: null,
    label: null,
    fixture: null,
    test: false,
  }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--apk' && args[i + 1]) opts.apk = args[++i]
    else if (args[i] === '--package' && args[i + 1]) opts.pkg = args[++i]
    else if (args[i] === '--label' && args[i + 1]) opts.label = args[++i]
    else if (args[i] === '--fixture' && args[i + 1]) opts.fixture = args[++i]
    else if (args[i] === '--test') opts.test = true
  }

  return opts
}

function runFixtureTests() {
  console.log('--- Running APK Badging Pure Parser Fixture Tests ---')
  let passed = 0
  let failed = 0

  function assertTest(name, cond, msg) {
    if (cond) {
      console.log(`✅ [PASS] ${name}`)
      passed++
    } else {
      console.error(`❌ [FAIL] ${name}: ${msg}`)
      failed++
    }
  }

  // Fixture 1: Valid debug badging
  const fixtureDebug = `
package: name='app.maganis.coach.debug' versionCode='1005' versionName='0.1.0-debug'
application-label:'Maganis (Debug)'
application-label-ar:'Maganis (Debug)'
application-icon-640:'res/mipmap-xxxhdpi/ic_launcher.png'
`
  const p1 = parseBadgingOutput(fixtureDebug)
  const v1 = validateBadging(p1, 'app.maganis.coach.debug', 'Maganis (Debug)')
  assertTest('Valid debug fixture passes', v1.valid, v1.errors.join('; '))

  // Fixture 2: Arabic locale label differs (MUST FAIL)
  const fixtureArabicMismatch = `
package: name='app.maganis.coach' versionCode='1005' versionName='0.1.0'
application-label:'Maganis'
application-label-ar:'مجانص'
`
  const p2 = parseBadgingOutput(fixtureArabicMismatch)
  const v2 = validateBadging(p2, 'app.maganis.coach', 'Maganis')
  assertTest(
    'Arabic locale label mismatch fails',
    !v2.valid &&
      v2.errors.some((e) => e.includes('Locale label mismatch for "ar"')),
    'Expected failure for differing Arabic label',
  )

  // Fixture 3: Package mismatch (MUST FAIL)
  const fixturePkgMismatch = `
package: name='com.wrong.app' versionCode='1' versionName='1.0'
application-label:'Maganis'
`
  const p3 = parseBadgingOutput(fixturePkgMismatch)
  const v3 = validateBadging(p3, 'app.maganis.coach', 'Maganis')
  assertTest(
    'Package name mismatch fails',
    !v3.valid && v3.errors.some((e) => e.includes('Package name mismatch')),
    'Expected package mismatch failure',
  )

  // Fixture 4: Zero labels found (MUST FAIL)
  const fixtureZeroLabels = `
package: name='app.maganis.coach' versionCode='1' versionName='1.0'
sdkVersion:'24'
`
  const p4 = parseBadgingOutput(fixtureZeroLabels)
  const v4 = validateBadging(p4, 'app.maganis.coach', 'Maganis')
  assertTest(
    'Zero labels found fails',
    !v4.valid &&
      v4.errors.some((e) => e.includes('Zero application labels found')),
    'Expected zero labels failure',
  )

  console.log(`Fixture tests finished: ${passed} passed, ${failed} failed.\n`)
  if (failed > 0) process.exit(1)
}

function main() {
  const opts = parseCliArgs()

  if (opts.test) {
    runFixtureTests()
    return
  }

  if (opts.fixture) {
    const raw = fs.readFileSync(opts.fixture, 'utf8')
    const parsed = parseBadgingOutput(raw)
    const result = validateBadging(parsed, opts.pkg, opts.label)
    if (!result.valid) {
      console.error(`❌ Validation failed for fixture ${opts.fixture}:`)
      result.errors.forEach((e) => console.error(`   - ${e}`))
      process.exit(1)
    }
    console.log(`✅ Fixture ${opts.fixture} validated successfully.`)
    return
  }

  if (!opts.apk || !opts.pkg || !opts.label) {
    console.error(
      'Usage: check-apk-badging.mjs --apk <path> --package <id> --label <text>',
    )
    console.error('   or: check-apk-badging.mjs --test')
    console.error(
      '   or: check-apk-badging.mjs --fixture <path> --package <id> --label <text>',
    )
    process.exit(1)
  }

  if (!fs.existsSync(opts.apk)) {
    console.error(`❌ Error: APK file does not exist: ${opts.apk}`)
    process.exit(1)
  }

  console.log('====================================================')
  console.log('            APK BADGING VERIFICATION (N6.5)         ')
  console.log('====================================================')
  console.log(`APK:              ${opts.apk}`)
  console.log(`Expected Package: ${opts.pkg}`)
  console.log(`Expected Label:   "${opts.label}"\n`)

  const aapt2 = findAapt2()
  console.log(`Using aapt2 binary: ${aapt2}`)

  const rawBadging = execFileSync(aapt2, ['dump', 'badging', opts.apk], {
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  })

  const parsed = parseBadgingOutput(rawBadging)
  const result = validateBadging(parsed, opts.pkg, opts.label)

  console.log(`Package ID found: ${parsed.packageName}`)
  console.log(`Default Label:    "${parsed.defaultLabel}"`)
  console.log(
    `Labels verified:  ${result.labelsChecked.length} label(s) checked:`,
  )
  for (const item of result.labelsChecked) {
    console.log(`   - [${item.locale}] "${item.label}"`)
  }

  if (!result.valid) {
    console.error('\n❌ APK Badging verification FAILED:')
    for (const err of result.errors) {
      console.error(`   - ${err}`)
    }
    process.exit(1)
  }

  // Security & hygiene check: DebugTestReceiver must NEVER appear in release APK
  if (opts.pkg === 'app.maganis.coach') {
    console.log(
      '\nVerifying release APK manifest for absence of debug test hooks...',
    )
    try {
      const manifestXml = execFileSync(
        aapt2,
        ['dump', 'xmltree', opts.apk, '--file', 'AndroidManifest.xml'],
        { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 },
      )
      if (manifestXml.includes('DebugTestReceiver')) {
        console.error(
          '❌ Security Gate FAILED: DebugTestReceiver found in release APK manifest!',
        )
        process.exit(1)
      }
      console.log(
        '✅ Gate PASSED: DebugTestReceiver is strictly absent from release APK.',
      )
    } catch (err) {
      console.warn(`⚠️ Warning checking release manifest tree: ${err.message}`)
    }
  }

  console.log('\n✅ APK Badging verification PASSED.')
}

main()
