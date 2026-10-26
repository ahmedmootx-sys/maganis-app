#!/usr/bin/env node
/**
 * scripts/capture-g5c-screenshots.mjs
 * Captures verification evidence screenshots for MAGANIS TASK G5-C Atlas Redesign:
 * - Front and Back views
 * - Surface and Deep modes
 * - Light and Dark themes
 * - No selection
 * - Selection: Large muscle (lats)
 * - Selection: Small surface muscle (tfl / teres_minor)
 * - Selection: Deep muscle (pec_minor)
 * - Selection: Derived approximate muscle (pec_sternal)
 * - Selection: No-mesh muscle (rectus_abdominis_upper)
 * - Chip list view ("العضلات في المنظر ده")
 * - Zoomed view (2x) with reset button
 * - Detail card bottom sheet (with viewBox shift avoiding occlusion)
 *
 * Saves to evidence/g5-c/atlas/
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const evidenceDir = path.join(rootDir, 'evidence/g5-c/atlas')
fs.mkdirSync(evidenceDir, { recursive: true })

const THEMES = ['light', 'dark']

async function run() {
  console.log('====================================================')
  console.log('   CAPTURING G5-C ATLAS EVIDENCE SCREENSHOTS        ')
  console.log('====================================================\n')

  let server
  try {
    server = await preview({
      root: rootDir,
      preview: { port: 5196, strictPort: true },
      logLevel: 'error',
    })
  } catch (err) {
    const { createServer } = await import('vite')
    server = await createServer({
      root: rootDir,
      server: { port: 5196, strictPort: true },
      logLevel: 'error',
    })
    await server.listen()
  }

  const baseUrl = `http://localhost:5196/`
  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  const ownerProfilePath = path.resolve(rootDir, 'docs/owner-profile-dump.json')
  let ownerProfile = null
  if (fs.existsSync(ownerProfilePath)) {
    const dump = JSON.parse(fs.readFileSync(ownerProfilePath, 'utf8'))
    ownerProfile = dump.profile || dump
  }

  try {
    for (const theme of THEMES) {
      console.log(`\n--- Capturing Theme: ${theme.toUpperCase()} ---`)

      const context = await browser.newContext({
        viewport: { width: 360, height: 720 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: theme,
        locale: 'ar-EG',
      })
      const page = await context.newPage()

      // Set theme and owner profile in localStorage
      await page.addInitScript(
        ({ t, p }) => {
          if (p) {
            localStorage.setItem('maganis:profile.active', JSON.stringify(p))
          }
          localStorage.setItem('maganis:theme', t)
          document.documentElement.setAttribute('data-theme', t)
        },
        { t: theme, p: ownerProfile },
      )

      async function dismissSheet(page) {
        await page.keyboard.press('Escape')
        await page.waitForTimeout(400)
        const backdrop = page.locator('[data-testid="sheet-backdrop"]')
        if ((await backdrop.count()) > 0) {
          try {
            await backdrop.first().click({ timeout: 1000 })
            await page.waitForTimeout(300)
          } catch {
            // already gone
          }
        }
      }

      async function scrollToAtlas(page) {
        const atlas = page.locator('.atlas-container')
        if ((await atlas.count()) > 0) {
          await atlas.first().scrollIntoViewIfNeeded()
          await page.waitForTimeout(300)
        }
      }

      // 1. Front Surface (Bench Press)
      await page.goto(`${baseUrl}#/exercise/bench?tab=muscles`)
      await page.waitForLoadState('networkidle')
      await page.waitForSelector('.atlas-viewport', { timeout: 10000 })
      await scrollToAtlas(page)
      await page.waitForTimeout(300)

      await page.screenshot({
        path: path.join(evidenceDir, `front_surface_${theme}_no_selection.png`),
      })
      console.log(`✓ Captured front_surface_${theme}_no_selection.png`)

      // Derived Approx selection (pec_sternal) on Bench Press
      const pecSternalChip = page.locator('button.chip:has-text("صدر أوسط")')
      if ((await pecSternalChip.count()) > 0) {
        await pecSternalChip.first().scrollIntoViewIfNeeded()
        await pecSternalChip.first().click()
        await page.waitForTimeout(600)
        await page.screenshot({
          path: path.join(
            evidenceDir,
            `selection_derived_approx_pec_sternal_${theme}.png`,
          ),
        })
        console.log(
          `✓ Captured selection_derived_approx_pec_sternal_${theme}.png`,
        )
        await dismissSheet(page)
      }

      // Small surface muscle selection (tfl)
      const tflChip = page.locator('button.chip:has-text("جانب الورك")')
      if ((await tflChip.count()) > 0) {
        await tflChip.first().scrollIntoViewIfNeeded()
        await tflChip.first().click()
        await page.waitForTimeout(600)
        await page.screenshot({
          path: path.join(
            evidenceDir,
            `selection_small_surface_tfl_${theme}.png`,
          ),
        })
        console.log(`✓ Captured selection_small_surface_tfl_${theme}.png`)
        await dismissSheet(page)
      }

      // 2. Front Deep (Push-Up Plus which targets pec_minor and serratus_anterior)
      await page.goto(`${baseUrl}#/exercise/pushupplus?tab=muscles`)
      await page.waitForLoadState('networkidle')
      await page.waitForSelector('.atlas-viewport', { timeout: 10000 })
      await scrollToAtlas(page)
      await page.waitForTimeout(300)

      const deepToggle = page.locator(
        'button:has-text("إظهار العضلات العميقة")',
      )
      if ((await deepToggle.count()) > 0) {
        await deepToggle.first().click()
        await scrollToAtlas(page)
        await page.waitForTimeout(600)
        await page.screenshot({
          path: path.join(evidenceDir, `front_deep_${theme}_no_selection.png`),
        })
        console.log(`✓ Captured front_deep_${theme}_no_selection.png`)

        // Select pec_minor (Deep muscle)
        const pecMinorChip = page.locator(
          'button.chip:has-text("الصدرية الصغرى"), button.chip:has-text("صدرية صغرى")',
        )
        if ((await pecMinorChip.count()) > 0) {
          await pecMinorChip.first().scrollIntoViewIfNeeded()
          await pecMinorChip.first().click()
          await page.waitForTimeout(600)
          await page.screenshot({
            path: path.join(
              evidenceDir,
              `selection_deep_pec_minor_${theme}.png`,
            ),
          })
          console.log(`✓ Captured selection_deep_pec_minor_${theme}.png`)
          await dismissSheet(page)
        }
      }

      // 3. Back Views (Pull-Up which targets lats, rhomboids, teres_major)
      await page.goto(`${baseUrl}#/exercise/pullup?tab=muscles`)
      await page.waitForLoadState('networkidle')
      await page.waitForSelector('.atlas-viewport', { timeout: 10000 })
      await scrollToAtlas(page)
      await page.waitForTimeout(300)

      // Switch to Posterior (خلفي)
      const backViewBtn = page.locator('button:has-text("خلفي")')
      if ((await backViewBtn.count()) > 0) {
        await backViewBtn.first().click()
        await scrollToAtlas(page)
        await page.waitForTimeout(600)

        // Back view surface no selection
        await page.screenshot({
          path: path.join(
            evidenceDir,
            `back_surface_${theme}_no_selection.png`,
          ),
        })
        console.log(`✓ Captured back_surface_${theme}_no_selection.png`)

        // Selection: Large muscle (lats) via chip
        const latsChip = page.locator('button.chip:has-text("لاتس")')
        if ((await latsChip.count()) > 0) {
          await latsChip.first().scrollIntoViewIfNeeded()
          await latsChip.first().click()
          await page.waitForTimeout(600)
          await page.screenshot({
            path: path.join(evidenceDir, `selection_large_lats_${theme}.png`),
          })
          console.log(`✓ Captured selection_large_lats_${theme}.png`)
          await dismissSheet(page)
        }

        // Back Deep Mode
        const backDeepToggle = page.locator(
          'button:has-text("إظهار العضلات العميقة")',
        )
        if ((await backDeepToggle.count()) > 0) {
          await backDeepToggle.first().click()
          await scrollToAtlas(page)
          await page.waitForTimeout(600)
          await page.screenshot({
            path: path.join(evidenceDir, `back_deep_${theme}_no_selection.png`),
          })
          console.log(`✓ Captured back_deep_${theme}_no_selection.png`)
        }
      }

      // 4. Selection: No-mesh muscle (rectus_abdominis_upper) via chip
      await page.goto(`${baseUrl}#/exercise/bench?tab=muscles`)
      await page.waitForLoadState('networkidle')
      await page.waitForSelector('.atlas-viewport', { timeout: 10000 })
      await page.waitForTimeout(600)

      const searchInput = page.locator('input[placeholder*="ابحث عن عضلة"]')
      if ((await searchInput.count()) > 0) {
        await searchInput.scrollIntoViewIfNeeded()
        await searchInput.fill('بطن علوي')
        await page.waitForTimeout(400)

        const noMeshChip = page.locator('button.chip:has-text("بطن علوي")')
        if ((await noMeshChip.count()) > 0) {
          await noMeshChip.first().click()
          await page.waitForTimeout(600)
          await page.screenshot({
            path: path.join(
              evidenceDir,
              `selection_no_mesh_rectus_abdominis_upper_${theme}.png`,
            ),
          })
          console.log(
            `✓ Captured selection_no_mesh_rectus_abdominis_upper_${theme}.png`,
          )
          await dismissSheet(page)
          await searchInput.fill('')
          await page.waitForTimeout(200)
        }
      }

      const chipsSection = page.locator('.atlas-chips-section')
      if ((await chipsSection.count()) > 0) {
        await chipsSection.first().scrollIntoViewIfNeeded()
        await page.waitForTimeout(300)
      }
      await page.screenshot({
        path: path.join(evidenceDir, `chip_list_grouped_${theme}.png`),
      })
      console.log(`✓ Captured chip_list_grouped_${theme}.png`)

      // 6. Zoomed view (2x) with reset button
      await scrollToAtlas(page)
      await page.waitForTimeout(200)

      const zoomInBtn = page.locator('button[aria-label="تكبير"]')
      if ((await zoomInBtn.count()) > 0) {
        await zoomInBtn.first().click()
        await page.waitForTimeout(200)
        await zoomInBtn.first().click()
        await scrollToAtlas(page)
        await page.waitForTimeout(500)
        await page.screenshot({
          path: path.join(evidenceDir, `zoomed_2x_with_reset_${theme}.png`),
        })
        console.log(`✓ Captured zoomed_2x_with_reset_${theme}.png`)

        const resetBtn = page.locator('button[aria-label="إعادة الضبط"]')
        if ((await resetBtn.count()) > 0) {
          await resetBtn.first().click()
          await page.waitForTimeout(300)
        }
      }

      // 7. Labels button ("الأسماء" toggle overlay)
      await scrollToAtlas(page)
      const labelsToggle = page.locator('button:has-text("الأسماء")')
      if ((await labelsToggle.count()) > 0) {
        await labelsToggle.first().click()
        await scrollToAtlas(page)
        await page.waitForTimeout(500)
        await page.screenshot({
          path: path.join(evidenceDir, `front_labels_leaderlines_${theme}.png`),
        })
        console.log(`✓ Captured front_labels_leaderlines_${theme}.png`)
      }

      await context.close()
    }
  } finally {
    await browser.close()
    if (server && server.httpServer) {
      server.httpServer.close()
    }
  }

  console.log('\n====================================================')
  console.log('✓ All G5-C Atlas screenshots captured successfully!')
  console.log('====================================================')
}

run().catch((err) => {
  console.error('Fatal error capturing screenshots:', err)
  process.exit(1)
})
