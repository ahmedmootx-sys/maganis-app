#!/usr/bin/env node
/**
 * scripts/capture-g6a-green.mjs
 * Drives the production build (served through service worker) to the exact
 * states of defects D1 through D9 and captures green screenshots to evidence/g6-a/green/.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const greenEvidenceDir = path.join(rootDir, 'evidence/g6-a/green')
fs.mkdirSync(greenEvidenceDir, { recursive: true })

async function run() {
  console.log('====================================================')
  console.log('   P3: CAPTURING GREEN SCREENSHOTS (POST-FIX BUILD)')
  console.log('====================================================\n')

  let server
  try {
    server = await preview({
      root: rootDir,
      preview: { port: 5199, strictPort: false },
      logLevel: 'error',
    })
  } catch (err) {
    console.error('Failed to start preview server on 5199:', err)
    process.exit(1)
  }

  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`
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
    {
      id: 'd9-exercise-page-header',
      name: 'D9: Exercise Page Header & Safe Area',
    },
  ]

  try {
    for (const defect of defects) {
      console.log(`\nCapturing GREEN for ${defect.name}...`)
      const context = await browser.newContext({
        viewport: { width: 360, height: 720 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: 'light',
        locale: 'ar-EG',
      })
      const page = await context.newPage()

      try {
        await openState(page, defect.id, {
          baseUrl,
          theme: 'light',
          fontScale: 1.0,
        })

        const shotPath = path.join(greenEvidenceDir, `${defect.id}.png`)
        await page.screenshot({ path: shotPath, fullPage: false })
        console.log(`  ✓ Saved GREEN screenshot to ${shotPath}`)
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

  console.log('\n====================================================')
  console.log('   P3: GREEN SCREENSHOT CAPTURE COMPLETE')
  console.log('====================================================\n')
}

run().catch((err) => {
  console.error('Fatal error during green screenshot capture:', err)
  process.exit(1)
})
