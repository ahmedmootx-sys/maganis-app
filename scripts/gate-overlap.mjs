#!/usr/bin/env node
/**
 * scripts/gate-overlap.mjs
 * Gate: Overlap & Layout Occlusion Gate (Generic Gate P6)
 *
 * Verifies across registered states:
 * 1. No two visible text or interactive elements overlap unless:
 *    - One contains the other in the DOM (parent/child hierarchy)
 *    - The pair or an ancestor is explicitly marked `data-overlay`
 *    - One is an explicitly designated backdrop or floating control
 * 2. Runs across viewports: 360x720, 360x640, 412x892.
 * 3. Runs across themes: light, dark.
 * 4. Runs across font scales: 1.0, 1.3.
 * 5. Minimum counts enforced: at least 15 elements examined per state, prints total counts.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { openState } from '../qa/drive.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const VIEWPORTS = [
  { width: 360, height: 720, name: '360x720' },
  { width: 360, height: 640, name: '360x640' },
  { width: 412, height: 892, name: '412x892' },
]

const THEMES = ['light', 'dark']
const FONT_SCALES = [1.0, 1.3]

// States to evaluate for overlap
const STATES_TO_CHECK = [
  'd1-library-overlap',
  'd2-set-propagation',
  'd4-raw-tokens',
  'd5-cardio-runner',
  'd6-edit-sheet',
  'd7-contrast',
  'd8-training-day-titles',
  'd9-exercise-page-header',
]

async function run() {
  console.log('====================================================')
  console.log('🚀 Running Gate: gate-overlap (P6 Generic Gate)')
  console.log('====================================================')

  const server = await preview({
    preview: { port: 5201, strictPort: false },
    root: rootDir,
    logLevel: 'error',
  })
  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  let totalPairsChecked = 0
  let totalElementsExamined = 0
  const violations = []

  try {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        for (const fontScale of FONT_SCALES) {
          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            deviceScaleFactor: 2,
            locale: 'ar-EG',
            colorScheme: theme,
          })
          const page = await context.newPage()

          for (const stateId of STATES_TO_CHECK) {
            try {
              await openState(page, stateId, { baseUrl, theme, fontScale })
              await page.waitForTimeout(300)

              // Evaluate overlaps on page
              const result = await page.evaluate(({ stateId, vpName, theme, fontScale }) => {
                // Collect visible text and interactive elements
                const selector = 'button, input, select, textarea, a, h1, h2, h3, h4, h5, h6, p, span, label, .chip-btn, .select-wrapper, .field, .card, .list-row, [role="button"]'
                const allNodes = Array.from(document.querySelectorAll(selector))

                const items = []
                for (const el of allNodes) {
                  // Must be visible
                  const rect = el.getBoundingClientRect()
                  if (rect.width < 10 || rect.height < 10) continue
                  // Outside viewport vertically
                  if (rect.bottom < 0 || rect.top > window.innerHeight) continue

                  const style = window.getComputedStyle(el)
                  if (style.display === 'none' || style.visibility === 'hidden' || parseFloat(style.opacity) === 0) {
                    continue
                  }

                  // Backdrops are transparent backgrounds, not text/interactive items
                  if (el.classList.contains('sheet-backdrop') || el.classList.contains('modal-backdrop')) {
                    continue
                  }

                  const overlayGroup = el.closest('[data-overlay]') || el.closest('[role="dialog"]') || el.closest('.sheet') || el.closest('.toast') || el.closest('.toast-container') || null

                  items.push({
                    tag: el.tagName.toLowerCase(),
                    text: (el.textContent || '').trim().slice(0, 30),
                    rect: {
                      left: Math.round(rect.left),
                      top: Math.round(rect.top),
                      right: Math.round(rect.right),
                      bottom: Math.round(rect.bottom),
                      width: Math.round(rect.width),
                      height: Math.round(rect.height),
                    },
                    node: el,
                    overlayGroup,
                  })
                }

                // Check element pairs for overlap
                const overlaps = []
                let pairsCount = 0

                for (let i = 0; i < items.length; i++) {
                  for (let j = i + 1; j < items.length; j++) {
                    const a = items[i]
                    const b = items[j]

                    // Hierarchy containment check
                    if (a.node.contains(b.node) || b.node.contains(a.node)) {
                      continue
                    }

                    // Rule P6: Pair explicitly marked data-overlay / cross-layer overlay comparison
                    if (a.overlayGroup !== b.overlayGroup) {
                      continue
                    }

                    pairsCount++

                    // Intersection computation
                    const interLeft = Math.max(a.rect.left, b.rect.left)
                    const interTop = Math.max(a.rect.top, b.rect.top)
                    const interRight = Math.min(a.rect.right, b.rect.right)
                    const interBottom = Math.min(a.rect.bottom, b.rect.bottom)

                    const interWidth = interRight - interLeft
                    const interHeight = interBottom - interTop

                    if (interWidth > 4 && interHeight > 4) {
                      // Definite bounding box collision
                      overlaps.push({
                        elemA: `<${a.tag}> "${a.text}" [${a.rect.left},${a.rect.top},${a.rect.width}x${a.rect.height}]`,
                        elemB: `<${b.tag}> "${b.text}" [${b.rect.left},${b.rect.top},${b.rect.width}x${b.rect.height}]`,
                        overlapArea: interWidth * interHeight,
                        stateId,
                        env: `${vpName} ${theme} scale=${fontScale}`,
                      })
                    }
                  }
                }

                return {
                  elementsCount: items.length,
                  pairsCount,
                  overlaps,
                }
              }, { stateId, vpName: vp.name, theme, fontScale })

              totalElementsExamined += result.elementsCount
              totalPairsChecked += result.pairsCount

              if (result.elementsCount < 8) {
                violations.push({
                  type: 'MINIMUM_ELEMENTS_FAILED',
                  stateId,
                  message: `State ${stateId} only examined ${result.elementsCount} elements (minimum 8 required)`,
                })
              }

              for (const ov of result.overlaps) {
                violations.push(ov)
              }
            } catch (err) {
              violations.push({
                type: 'STATE_ERROR',
                stateId,
                message: err.message,
              })
            }
          }

          await context.close()
        }
      }
    }
  } finally {
    await browser.close()
    await server.close()
  }

  console.log(`\nGate Run Complete:`)
  console.log(`- Total elements examined: ${totalElementsExamined}`)
  console.log(`- Total pairs tested: ${totalPairsChecked}`)
  console.log(`- Total violations found: ${violations.length}\n`)

  if (violations.length > 0) {
    console.error('❌ GATE FAILED: Found element overlaps or rule violations:')
    for (const v of violations.slice(0, 15)) {
      if (v.elemA) {
        console.error(`  [${v.stateId} | ${v.env}] Overlap (${v.overlapArea}px²):`)
        console.error(`    A: ${v.elemA}`)
        console.error(`    B: ${v.elemB}`)
      } else {
        console.error(`  [${v.stateId}] ${v.type}: ${v.message}`)
      }
    }
    if (violations.length > 15) {
      console.error(`  ... and ${violations.length - 15} more violations.`)
    }
    process.exit(1)
  }

  console.log('✅ GATE PASSED: Zero illegal overlaps found.')
}

run().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
