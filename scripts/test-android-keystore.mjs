#!/usr/bin/env node
/**
 * scripts/test-android-keystore.mjs
 * Unit/integration test for scripts/android-keystore.mjs (including --debug flag).
 */

import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function runTest() {
  const testDir = path.join(os.tmpdir(), `maganis-keystore-test-${Date.now()}`)
  console.log(`Test directory: ${testDir}`)

  // Ensure keytool is available in PATH for child process
  const env = { ...process.env, TEST_KEYSTORE_DIR: testDir }
  if (process.env.JAVA_HOME) {
    const bin = path.join(process.env.JAVA_HOME, 'bin')
    env.PATH = `${bin}${path.delimiter}${env.PATH || ''}`
  }

  try {
    console.log('\n1. Testing android-keystore.mjs --debug...')
    const output = execFileSync(
      process.execPath,
      [path.join(rootDir, 'scripts', 'android-keystore.mjs'), '--debug'],
      { env, encoding: 'utf8' },
    )

    console.log(output)

    // Assertions for --debug
    const debugKeystore = path.join(testDir, 'maganis-debug.keystore')
    if (!fs.existsSync(debugKeystore)) {
      throw new Error(
        `maganis-debug.keystore was not created at ${debugKeystore}`,
      )
    }

    if (!output.includes('maganis-debug')) {
      throw new Error('Output must reference alias "maganis-debug"')
    }
    if (!output.includes('ANDROID_DEBUG_KEYSTORE_BASE64')) {
      throw new Error(
        'Output must print secret name ANDROID_DEBUG_KEYSTORE_BASE64',
      )
    }
    if (!output.includes('ANDROID_DEBUG_KEYSTORE_PASSWORD')) {
      throw new Error(
        'Output must print secret name ANDROID_DEBUG_KEYSTORE_PASSWORD',
      )
    }
    if (!output.includes('ANDROID_DEBUG_KEY_ALIAS')) {
      throw new Error('Output must print secret name ANDROID_DEBUG_KEY_ALIAS')
    }
    if (!output.includes('ANDROID_DEBUG_KEY_PASSWORD')) {
      throw new Error(
        'Output must print secret name ANDROID_DEBUG_KEY_PASSWORD',
      )
    }

    // Check Egyptian Arabic copy-paste instructions
    if (!output.includes('أسرار') && !output.includes('الخطوات')) {
      throw new Error('Output must include simple Egyptian Arabic instructions')
    }

    console.log('✅ Keystore --debug test passed!')
  } finally {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  }
}

runTest()
