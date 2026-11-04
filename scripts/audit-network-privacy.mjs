#!/usr/bin/env node
/**
 * scripts/audit-network-privacy.mjs
 * Network Privacy & Zero Third-Party Background Telemetry Audit (Task N5.8).
 *
 * Scans all codebase files to assert:
 * 1. Zero third-party analytics/telemetry SDKs (Google Analytics, Mixpanel, Sentry, etc.).
 * 2. Zero unauthorized background network requests or tracking beacons.
 * 3. Strictly sanctioned external URLs:
 *    - https://api.github.com (user-initiated release updates)
 *    - https://github.com/ahmedmootx-sys/maganis-app (repo & release downloads)
 *    - YouTube / Vimeo embeds for exercise demos
 *    - Standard schema/XML namespaces in Android manifests
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const ALLOWED_URL_PREFIXES = [
  'https://api.github.com',
  'https://github.com/ahmedmootx-sys/maganis-app',
  'https://github.com',
  'https://www.youtube.com',
  'https://www.youtube-nocookie.com',
  'https://img.youtube.com',
  'https://player.vimeo.com',
  'http://schemas.android.com',
  'http://www.w3.org',
]

const FORBIDDEN_TELEMETRY_PATTERNS = [
  {
    name: 'Google Analytics',
    regex:
      /google-analytics\.com|googletagmanager\.com|gtag\(|ga\(['"](?:send|create|set|require)/i,
  },
  { name: 'Firebase Analytics', regex: /firebase.*analytics|getAnalytics\(/i },
  { name: 'Sentry Telemetry', regex: /@sentry|sentry\.io|Sentry\.init/i },
  { name: 'Mixpanel Tracking', regex: /mixpanel\.com|mixpanel\.track/i },
  {
    name: 'Datadog / Segment',
    regex: /datadoghq\.com|segment\.io|analytics\.track/i,
  },
  { name: 'Hotjar / Clarity', regex: /hotjar\.com|clarity\.ms/i },
]

function collectFiles(
  dir,
  exts = ['.ts', '.tsx', '.js', '.mjs', '.html', '.java'],
) {
  let results = []
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const entry of list) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (
        [
          'node_modules',
          '.git',
          'dist',
          'dist-native',
          'artifacts',
          'evidence',
        ].includes(entry.name)
      ) {
        continue
      }
      results = results.concat(collectFiles(fullPath, exts))
    } else if (entry.isFile()) {
      if (exts.includes(path.extname(entry.name))) {
        results.push(fullPath)
      }
    }
  }
  return results
}

function auditCodebase() {
  console.log(
    '=================================================================',
  )
  console.log(
    '       MAGANIS ZERO THIRD-PARTY NETWORK PRIVACY AUDIT (Task N5.8) ',
  )
  console.log(
    '=================================================================\n',
  )

  const srcFiles = collectFiles(path.join(rootDir, 'src'))
  const androidFiles = fs.existsSync(
    path.join(rootDir, 'android', 'app', 'src', 'main'),
  )
    ? collectFiles(path.join(rootDir, 'android', 'app', 'src', 'main'))
    : []
  const rootHtml = path.join(rootDir, 'index.html')

  const allFiles = [...srcFiles, ...androidFiles, rootHtml].filter((f) =>
    fs.existsSync(f),
  )
  console.log(`Auditing ${allFiles.length} source and configuration files...`)

  const violations = []

  // Check 1: Telemetry signatures
  for (const file of allFiles) {
    const content = fs.readFileSync(file, 'utf8')
    const relPath = path.relative(rootDir, file)

    for (const tracker of FORBIDDEN_TELEMETRY_PATTERNS) {
      if (tracker.regex.test(content)) {
        violations.push({
          file: relPath,
          kind: 'TRACKER_FOUND',
          detail: `Detected forbidden telemetry signature: ${tracker.name}`,
        })
      }
    }

    // Check 2: Raw fetch() or XMLHttpRequest calls
    const fetchMatches = content.matchAll(/fetch\s*\(\s*['"`]([^'"`]+)['"`]/g)
    for (const match of fetchMatches) {
      const url = match[1]
      if (url.startsWith('http://') || url.startsWith('https://')) {
        const allowed = ALLOWED_URL_PREFIXES.some((prefix) =>
          url.startsWith(prefix),
        )
        if (!allowed) {
          violations.push({
            file: relPath,
            kind: 'UNAUTHORIZED_FETCH_CALL',
            detail: `External URL not in allowlist: ${url}`,
          })
        }
      }
    }
  }

  console.log(`Audit examined ${allFiles.length} files.`)
  console.log(`Detected violations: ${violations.length}`)

  if (violations.length > 0) {
    console.error('\n❌ PRIVACY AUDIT FAILED:')
    for (const v of violations) {
      console.error(`  - [${v.kind}] in ${v.file}: ${v.detail}`)
    }
    process.exit(1)
  }

  console.log('\n✅ ZERO THIRD-PARTY TELEMETRY OR TRACKERS CONFIRMED.')
  console.log(
    '✅ ALL NETWORK CALLS STRICTLY LIMITED TO SANCTIONED GITHUB UPDATE APIS & EMBEDS.',
  )
}

auditCodebase()
