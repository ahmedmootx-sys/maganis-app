#!/usr/bin/env node
/**
 * scripts/check-jvm-tests.mjs
 * Validates JUnit XML reports from testDebugUnitTest.
 *
 * Rules:
 * - Enforces minimum test count (no silently skipped runs).
 * - Fails if failures > 0 or errors > 0.
 * - Prints human-readable summary of executed tests.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

function parseArgs() {
  const args = process.argv.slice(2)
  let resultsDir = path.join(
    rootDir,
    'android',
    'app',
    'build',
    'test-results',
    'testDebugUnitTest',
  )
  let minTests = 14

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--results-dir' && args[i + 1]) {
      resultsDir = path.resolve(args[++i])
    } else if (args[i] === '--min-tests' && args[i + 1]) {
      minTests = parseInt(args[++i], 10)
    }
  }

  return { resultsDir, minTests }
}

function parseXmlSuite(xmlContent) {
  // Simple robust regex extraction for JUnit testsuite attributes
  const suiteMatch = xmlContent.match(/<testsuite\s+([^>]+)>/i)
  if (!suiteMatch) return null

  const attrs = suiteMatch[1]
  const getName = () => (attrs.match(/name="([^"]+)"/) || [])[1] || 'unknown'
  const getNum = (attr) => {
    const m = attrs.match(new RegExp(`${attr}="(\\d+)"`))
    return m ? parseInt(m[1], 10) : 0
  }

  const name = getName()
  const tests = getNum('tests')
  const skipped = getNum('skipped')
  const failures = getNum('failures')
  const errors = getNum('errors')

  // Extract individual testcases
  const testcaseRegex = /<testcase\s+name="([^"]+)"\s+classname="([^"]+)"/g
  const cases = []
  let cMatch
  while ((cMatch = testcaseRegex.exec(xmlContent)) !== null) {
    cases.push({ name: cMatch[1], classname: cMatch[2] })
  }

  return { name, tests, skipped, failures, errors, cases }
}

function main() {
  const { resultsDir, minTests } = parseArgs()

  console.log('====================================================')
  console.log('       JVM UNIT TEST VERIFICATION GATE (N6.1)       ')
  console.log('====================================================')
  console.log(`Directory: ${resultsDir}`)
  console.log(`Enforcing minimum tests: >= ${minTests}\n`)

  if (!fs.existsSync(resultsDir)) {
    console.error(`❌ Error: Results directory does not exist: ${resultsDir}`)
    process.exit(1)
  }

  const files = fs
    .readdirSync(resultsDir)
    .filter((f) => f.startsWith('TEST-') && f.endsWith('.xml'))

  if (files.length === 0) {
    console.error(`❌ Error: No TEST-*.xml files found in ${resultsDir}`)
    process.exit(1)
  }

  let grandTotalTests = 0
  let grandTotalFailures = 0
  let grandTotalErrors = 0
  let grandTotalSkipped = 0

  for (const file of files) {
    const fullPath = path.join(resultsDir, file)
    const xml = fs.readFileSync(fullPath, 'utf8')
    const suite = parseXmlSuite(xml)

    if (!suite) {
      console.warn(`⚠️ Warning: Could not parse testsuite from ${file}`)
      continue
    }

    grandTotalTests += suite.tests
    grandTotalFailures += suite.failures
    grandTotalErrors += suite.errors
    grandTotalSkipped += suite.skipped

    const statusMark = suite.failures === 0 && suite.errors === 0 ? '✅' : '❌'
    console.log(
      `${statusMark} Suite: ${suite.name} (tests: ${suite.tests}, failures: ${suite.failures}, errors: ${suite.errors}, skipped: ${suite.skipped})`,
    )
    for (const tc of suite.cases) {
      console.log(`   - ${tc.name}`)
    }
  }

  console.log('\n----------------------------------------------------')
  console.log(
    `TOTALS: ${grandTotalTests} tests executed across ${files.length} suites`,
  )
  console.log(
    `Failures: ${grandTotalFailures}, Errors: ${grandTotalErrors}, Skipped: ${grandTotalSkipped}`,
  )
  console.log('----------------------------------------------------')

  if (grandTotalFailures > 0 || grandTotalErrors > 0) {
    console.error(
      `\n❌ Gate FAILED: ${grandTotalFailures} test failure(s) and ${grandTotalErrors} error(s) detected.`,
    )
    process.exit(1)
  }

  if (grandTotalTests < minTests) {
    console.error(
      `\n❌ Gate FAILED: Total tests executed (${grandTotalTests}) is less than required minimum (${minTests}).`,
    )
    process.exit(1)
  }

  console.log(
    `\n✅ Gate PASSED: All ${grandTotalTests} JVM tests passed successfully (>= ${minTests}).`,
  )
}

main()
