#!/usr/bin/env node
// Startup environment validator. Rules mirror src/config/appConfig.ts - keep both in sync.
// Usage: node scripts/check-env.mjs <development|production>
import net from 'node:net'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const APP_ENV_VALUES = ['development', 'production', 'test']
const LOG_LEVELS = ['debug', 'info', 'warn', 'error']
const PREFIX_PATTERN = /^[a-z0-9][a-z0-9-]{1,31}$/

function parseEnvFile(filePath, into) {
  if (!fs.existsSync(filePath)) return
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '')
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim()
    if (line === '' || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    let value = line.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"') && value.length >= 2) ||
      (value.startsWith("'") && value.endsWith("'") && value.length >= 2)
    ) {
      value = value.slice(1, -1)
    }
    into[key] = value
  }
}

function findPidForPortWindows(port) {
  try {
    const output = execSync('netstat -ano -p tcp', { encoding: 'utf8' })
    for (const line of output.split(/\r?\n/)) {
      if (!line.includes(':' + port + ' ')) continue
      if (!/LISTENING/i.test(line)) continue
      const parts = line.trim().split(/\s+/)
      const pid = parts[parts.length - 1]
      if (/^\d+$/.test(pid)) return pid
    }
  } catch {
    // best effort only
  }
  return null
}

function findPidForPortUnix(port) {
  try {
    const output = execSync('lsof -ti tcp:' + port, { encoding: 'utf8' })
    const pid = output.trim().split(/\s+/)[0]
    if (/^\d+$/.test(pid)) return pid
  } catch {
    // best effort only
  }
  return null
}

function isPortFree(port) {
  return new Promise((resolve) => {
    const probe = net.createServer()
    probe.once('error', () => resolve(false))
    probe.once('listening', () => probe.close(() => resolve(true)))
    probe.listen(port, '127.0.0.1')
  })
}

const mode = process.argv[2]
if (mode !== 'development' && mode !== 'production') {
  console.error('Usage: node scripts/check-env.mjs <development|production>')
  process.exit(2)
}

const root = path.resolve(fileURLToPath(new URL('..', import.meta.url)))
const values = {}
parseEnvFile(path.join(root, '.env.' + mode), values)
parseEnvFile(path.join(root, '.env.' + mode + '.local'), values)

const problems = []

const appEnv = values.VITE_APP_ENV
if (appEnv === undefined) {
  problems.push(
    '- VITE_APP_ENV: missing. Fix: set VITE_APP_ENV=' +
      mode +
      ' (file: .env.' +
      mode +
      ')',
  )
} else if (appEnv !== mode) {
  problems.push(
    '- VITE_APP_ENV: is "' +
      appEnv +
      '" but this run targets "' +
      mode +
      '". Fix: set VITE_APP_ENV=' +
      mode +
      ' (file: .env.' +
      mode +
      ')',
  )
}

const appName = values.VITE_APP_NAME
if (appName === undefined || appName === '') {
  problems.push(
    '- VITE_APP_NAME: missing or empty. Fix: set a non-empty name, e.g. VITE_APP_NAME=Maganis (file: .env.' +
      mode +
      ')',
  )
}

const storagePrefix = values.VITE_STORAGE_PREFIX
if (storagePrefix === undefined || storagePrefix === '') {
  problems.push(
    '- VITE_STORAGE_PREFIX: missing or empty. Fix: 2-32 chars of lowercase letters, digits or dashes, e.g. VITE_STORAGE_PREFIX=maganis (file: .env.' +
      mode +
      ')',
  )
} else if (!PREFIX_PATTERN.test(storagePrefix)) {
  problems.push(
    '- VITE_STORAGE_PREFIX: invalid value "' +
      storagePrefix +
      '". Fix: 2-32 chars of lowercase letters, digits or dashes, starting with a letter or digit (file: .env.' +
      mode +
      ')',
  )
}

const logLevel = values.VITE_LOG_LEVEL
if (logLevel !== undefined && !LOG_LEVELS.includes(logLevel)) {
  problems.push(
    '- VITE_LOG_LEVEL: invalid value "' +
      logLevel +
      '". Fix: use debug | info | warn | error, or remove the line (default: info) (file: .env.' +
      mode +
      ')',
  )
}

const devPortRaw = values.VITE_DEV_PORT
let devPort = 5173
if (devPortRaw !== undefined && devPortRaw !== '') {
  const parsed = Number(devPortRaw)
  if (!Number.isInteger(parsed) || parsed < 1 || parsed > 65535) {
    problems.push(
      '- VITE_DEV_PORT: invalid value "' +
        devPortRaw +
        '". Fix: use an integer between 1 and 65535, e.g. 5173 (file: .env.' +
        mode +
        ')',
    )
  } else {
    devPort = parsed
  }
}

if (problems.length > 0) {
  console.error('Environment validation FAILED (mode: ' + mode + ')')
  for (const problem of problems) console.error(problem)
  console.error('Edit the files above, then re-run: npm run check:env')
  process.exit(1)
}

if (mode === 'development') {
  const free = await isPortFree(devPort)
  if (!free) {
    console.error('Environment validation FAILED (mode: ' + mode + ')')
    console.error(
      '- Port ' +
        devPort +
        ' is already in use, so the dev server cannot start.',
    )
    const pid =
      process.platform === 'win32'
        ? findPidForPortWindows(devPort)
        : findPidForPortUnix(devPort)
    if (pid) {
      console.error('  It looks like PID ' + pid + ' is listening on it.')
      console.error(
        '  Fix option 1: stop that process (Windows: taskkill /PID ' +
          pid +
          ' /F, macOS/Linux: kill ' +
          pid +
          ').',
      )
    } else {
      console.error(
        '  Could not identify the process holding the port automatically.',
      )
    }
    console.error(
      '  Fix option 2: change VITE_DEV_PORT in .env.development to a free port (e.g. 5174).',
    )
    process.exit(1)
  }
}

console.log('Environment OK (mode=' + mode + ', 5 variables validated)')
