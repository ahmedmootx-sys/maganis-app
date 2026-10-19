#!/usr/bin/env node
/**
 * scripts/gate-overflow.mjs
 * Gate: Zero Horizontal Overflow Verification on Mobile Viewport 360x640 (TASK G3 Part 3)
 *
 * Verifies across core screens:
 * - document.documentElement.scrollWidth <= 360
 * - Zero overflowing elements where boundingClientRect.right > 360
 * - Core screens tested: #/home, #/training, #/training/day/0, #/nutrition, #/progress, #/settings
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const ROUTES = [
  '#/home',
  '#/training',
  '#/training/day/0',
  '#/nutrition',
  '#/progress',
  '#/settings',
]

async function runGate() {
  console.log('🚀 Running Gate: gate-overflow (Zero Horizontal Overflow on 360x640)...')

  const failures = []
  let checksPassed = 0

  let server
  let browser
  try {
    server = await createServer({
      server: { port: 5198, strictPort: true },
      root: rootDir,
      logLevel: 'error',
    })
    await server.listen()
    const port = server.httpServer.address().port
    const baseUrl = `http://localhost:${port}/`

    browser = await chromium.launch({ channel: 'chrome', headless: true })
    const context = await browser.newContext({
      viewport: { width: 360, height: 640 },
      deviceScaleFactor: 2,
    })
    const page = await context.newPage()

    // Seed mock profile and program from owner dump
    const ownerDump = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/owner-profile-dump.json'), 'utf8'))
    await page.goto(`${baseUrl}#/home`, { waitUntil: 'domcontentloaded' })
    await page.evaluate((dump) => {
      localStorage.setItem('maganis-dev:profile.active', JSON.stringify(dump.profile))
      localStorage.setItem('maganis:profile.active', JSON.stringify(dump.profile))
      if (dump.program) {
        localStorage.setItem('maganis-dev:workout.active', JSON.stringify(dump.program))
        localStorage.setItem('maganis:workout.active', JSON.stringify(dump.program))
      }
    }, ownerDump)
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(600)

    for (const route of ROUTES) {
      await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(500)

      const overflowInfo = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth
        const winWidth = window.innerWidth
        const bodyWidth = document.body.scrollWidth

        const offenders = []
        const allElements = Array.from(document.querySelectorAll('*'))
        for (const el of allElements) {
          const rect = el.getBoundingClientRect()
          // Only check visible elements
          if (rect.width > 0 && rect.height > 0) {
            // Tolerant to sub-pixel rounding up to 0.5px
            if (rect.right > winWidth + 1 || rect.left < -1) {
              offenders.push({
                tag: el.tagName.toLowerCase(),
                className: el.className ? String(el.className).slice(0, 40) : '',
                left: Math.round(rect.left),
                right: Math.round(rect.right),
                width: Math.round(rect.width),
              })
            }
          }
        }

        return {
          docWidth,
          winWidth,
          bodyWidth,
          offenders: offenders.slice(0, 5),
          totalOffenders: offenders.length,
        }
      })

      if (overflowInfo.docWidth <= 360 && overflowInfo.totalOffenders === 0) {
        checksPassed++
        console.log(`✓ ${route}: No horizontal overflow (scrollWidth = ${overflowInfo.docWidth}px <= 360px)`)
      } else {
        failures.push({
          test: 'HORIZONTAL_OVERFLOW',
          route,
          error: `scrollWidth = ${overflowInfo.docWidth}px (window = ${overflowInfo.winWidth}px), ${overflowInfo.totalOffenders} overflowing elements`,
          offenders: overflowInfo.offenders,
        })
      }
    }

    await context.close()
  } catch (err) {
    failures.push({
      test: 'OVERFLOW_BROWSER_ERROR',
      error: `Browser error: ${err.message}`,
    })
  } finally {
    if (browser) await browser.close()
    if (server) await server.close()
  }

  console.log(`\n📊 Gate Summary: ${checksPassed} checks passed, ${failures.length} failures`)
  if (failures.length > 0) {
    console.error(`\n❌ FAIL: ${failures.length} overflow violations detected:`)
    for (const f of failures) {
      console.error(`  [${f.test}] ${f.route}: ${f.error}`)
      if (f.offenders) {
        for (const o of f.offenders) {
          console.error(`     <${o.tag} class="${o.className}"> left:${o.left} right:${o.right} width:${o.width}`)
        }
      }
    }
    process.exit(1)
  }

  console.log('\n✓ gate-overflow passed cleanly! Zero horizontal overflow on 360x640.')
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
