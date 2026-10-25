#!/usr/bin/env node
/**
 * scripts/reproduce-g6a.mjs
 * Drives the production build (served through service worker) to the exact
 * states of defects D1 through D9 and captures red screenshots to evidence/g6-a/red/.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const redEvidenceDir = path.join(rootDir, 'evidence/g6-a/red')
fs.mkdirSync(redEvidenceDir, { recursive: true })

async function run() {
  console.log('====================================================')
  console.log('   P1: REPRODUCING DEFECTS D1-D9 (PRE-FIX BUILD)')
  console.log('====================================================\n')

  let server
  try {
    server = await preview({
      root: rootDir,
      preview: { port: 5198, strictPort: true },
      logLevel: 'error',
    })
  } catch (err) {
    console.error('Failed to start preview server on 5198:', err)
    process.exit(1)
  }

  const baseUrl = 'http://localhost:5198/'
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  // We import qa/drive.ts
  const { openState } = await import('../qa/drive.ts')

  const defects = [
    { id: 'd1-library-overlap', name: 'D1: Library Header Overlap' },
    { id: 'd2-set-propagation', name: 'D2: Set Propagation & Bidi Header' },
    { id: 'd3-video-play', name: 'D3: Video Playback & Facade Disappearing' },
    { id: 'd4-raw-tokens', name: 'D4: Raw Internal Identifiers' },
    { id: 'd5-cardio-runner', name: 'D5: Cardio Runner Layout' },
    { id: 'd6-edit-sheet', name: 'D6: Exercise Edit Sheet UX' },
    { id: 'd7-contrast', name: 'D7: Contrast & Legibility' },
    { id: 'd8-training-day-titles', name: 'D8: Truncated Day Titles' },
    { id: 'd9-exercise-page-header', name: 'D9: Exercise Page Header & Safe Area' },
  ]

  try {
    for (const defect of defects) {
      console.log(`\nReproducing ${defect.name}...`)
      const context = await browser.newContext({
        viewport: { width: 360, height: 720 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: 'light',
        locale: 'ar-EG',
      })
      const page = await context.newPage()

      // Track console errors and CSP violations for D3
      const consoleErrors = []
      const cspViolations = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      await page.addInitScript(() => {
        document.addEventListener('securitypolicyviolation', (e) => {
          window.__cspViolations = window.__cspViolations || []
          window.__cspViolations.push({
            blockedURI: e.blockedURI,
            violatedDirective: e.violatedDirective,
            effectiveDirective: e.effectiveDirective,
            originalPolicy: e.originalPolicy,
          })
        })
      })

      try {
        await openState(page, defect.id, {
          baseUrl,
          theme: 'light',
          fontScale: 1.0,
        })

        const shotPath = path.join(redEvidenceDir, `${defect.id}.png`)
        await page.screenshot({ path: shotPath, fullPage: false })
        console.log(`  ✓ Saved RED screenshot to ${shotPath}`)

        if (defect.id === 'd3-video-play') {
          const recordedViolations = await page.evaluate(() => window.__cspViolations || [])
          console.log(`  [D3 Diagnostics] Console errors:`, consoleErrors)
          console.log(`  [D3 Diagnostics] CSP violations:`, recordedViolations)
        }
      } catch (err) {
        console.error(`  ✗ Error in ${defect.id}:`, err.message)
      } finally {
        await context.close()
      }
    }
  } finally {
    await browser.close()
    if (server && server.httpServer) {
      await server.httpServer.close()
    }
  }

  console.log('\n✅ P1 Reproduction run complete.')
}

run().catch((err) => {
  console.error('Fatal error during reproduction:', err)
  process.exit(1)
})
