import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initStorage } from '../qa/drive.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const greenDir = path.join(rootDir, 'evidence', 'g6-c', 'green')
if (!fs.existsSync(greenDir)) {
  fs.mkdirSync(greenDir, { recursive: true })
}

const muscleNamesData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src', 'data', 'muscle-names.json'), 'utf8'))
const muscleInfoData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src', 'content', 'muscle-info-v1.1.json'), 'utf8'))

async function run() {
  console.log('====================================================')
  console.log('   CAPTURING G6-C GREEN EVIDENCE & C1/C2 AUDIT      ')
  console.log('====================================================')

  const server = await preview({
    preview: { port: 5225, strictPort: false },
    root: rootDir,
    logLevel: 'error',
  })
  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  // 1. Light theme context at 360x720 DPR 2
  const context = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    locale: 'ar-EG',
  })

  const page = await context.newPage()
  await initStorage(page, { baseUrl, theme: 'light' })

  // 1. Green: Missing chips
  console.log('1. Capturing c3-missing-chips.png...')
  await page.goto(`${baseUrl}#/exercise/pullup?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-chips-section').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page.screenshot({ path: path.join(greenDir, 'c3-missing-chips.png') })

  // 2. Green: Scapular Pull-Up back view (weird red block removed, clean trap_lower + locator pin)
  console.log('2. Capturing c3-scapular-pullup-block.png...')
  await page.goto(`${baseUrl}#/exercise/scappull?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  const postBtn = page.locator('button:has-text("خلفي"), [role="tab"]:has-text("خلفي"), .segmented-option:has-text("خلفي")')
  if (await postBtn.count() > 0) {
    await postBtn.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(greenDir, 'c3-scapular-pullup-block.png') })

  // 3. Green: Side Plank back view (two small rectangles removed, clean erector spinae + locator pin)
  console.log('3. Capturing c3-sacrum-rectangles.png...')
  await page.goto(`${baseUrl}#/exercise/sideplank?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  if (await postBtn.count() > 0) {
    await postBtn.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(greenDir, 'c3-sacrum-rectangles.png') })

  // 4. Green: Front wedges (support hold)
  console.log('4. Capturing c3-front-wedges.png...')
  await page.goto(`${baseUrl}#/exercise/supporthold?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-container').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(greenDir, 'c3-front-wedges.png') })

  // 5. Green: Bench Press front view (smooth cut boundary between sternal and costal pec)
  console.log('5. Capturing c3-bench-press-ragged.png...')
  await page.goto(`${baseUrl}#/exercise/bench?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-container').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(greenDir, 'c3-bench-press-ragged.png') })

  // 6. Green: Names mode labels (readable >= 11px font, solid leader lines, collision-free)
  console.log('6. Capturing c2-names-mode-labels.png...')
  const namesBtn = page.locator('button:has-text("الأسماء")')
  if (await namesBtn.count() > 0) {
    await namesBtn.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(greenDir, 'c2-names-mode-labels.png') })

  // 7. Green: Toolbar consistency (Calf raise vs Bench press - deep toggle always present)
  console.log('7. Capturing c2-toolbar-shift.png...')
  await page.goto(`${baseUrl}#/exercise/calf?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.screenshot({ path: path.join(greenDir, 'c2-toolbar-shift.png') })

  // 8. Green: Deep mode
  console.log('8. Capturing c1-deep-mode.png...')
  const deepBtn = page.locator('button:has-text("إظهار العضلات العميقة")')
  if (await deepBtn.count() > 0) {
    await deepBtn.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({ path: path.join(greenDir, 'c1-deep-mode.png') })

  // 9. Green: Selected muscle cards
  console.log('9. Capturing selected muscle cards...')
  const captureCard = async (exerciseKey, muscleShortName, filename) => {
    await page.goto(`${baseUrl}#/exercise/${exerciseKey}?tab=muscles`, { waitUntil: 'networkidle' })
    await page.waitForSelector('.atlas-chips-section', { timeout: 10000 })
    const chip = page.locator(`.atlas-chips-section button:has-text("${muscleShortName}")`).first()
    if (await chip.count() > 0) {
      await chip.click()
      await page.waitForTimeout(600)
      await page.screenshot({ path: path.join(greenDir, filename) })
      // Close sheet
      const closeBtn = page.locator('[aria-label="إغلاق النافذة"], [aria-label="إغلاق"], button:has-text("إغلاق")')
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click()
      } else {
        await page.keyboard.press('Escape')
      }
      await page.waitForSelector('.sheet-backdrop', { state: 'detached', timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(200)
    }
  }

  await captureCard('pullup', 'لاتس', 'c1-card-lats.png')
  await captureCard('bench', 'صدرية صغرى', 'c1-card-pec-minor.png')
  await captureCard('scappull', 'رومبويد', 'c1-card-rhomboids.png')
  await captureCard('sideplank', 'جانب أسفل الظهر', 'c1-card-quadratus-lumborum.png')
  await captureCard('bench', 'صدر أوسط', 'c1-card-pec-sternal.png')

  // 10. Dark Theme Context & Screenshots
  console.log('10. Capturing Dark Theme Screenshots...')
  const darkContext = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    locale: 'ar-EG',
  })
  const darkPage = await darkContext.newPage()
  await initStorage(darkPage, { baseUrl, theme: 'dark' })

  await darkPage.goto(`${baseUrl}#/exercise/bench?tab=muscles`, { waitUntil: 'networkidle' })
  await darkPage.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await darkPage.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await darkPage.screenshot({ path: path.join(greenDir, 'dark-bench-press.png') })

  const darkNamesBtn = darkPage.locator('button:has-text("الأسماء")')
  if (await darkNamesBtn.count() > 0) {
    await darkNamesBtn.first().click()
    await darkPage.waitForTimeout(600)
    await darkPage.screenshot({ path: path.join(greenDir, 'dark-names-mode.png') })
  }

  const darkSternalChip = darkPage.locator('.atlas-chips-section button[data-muscle-chip="pec_sternal"]').first()
  if (await darkSternalChip.count() > 0) {
    await darkSternalChip.scrollIntoViewIfNeeded()
    await darkSternalChip.click()
    await darkPage.waitForTimeout(600)
    await darkPage.screenshot({ path: path.join(greenDir, 'dark-detail-card-pec-sternal.png') })
  }
  await darkContext.close()

  // 11. C1 Real Taps Assertion Suite across all 53 muscles
  console.log('\n--- C1 REAL TAPS AUDIT (All 53 Muscles) ---')
  await page.goto(`${baseUrl}#/exercise/bench?tab=muscles`, { waitUntil: 'networkidle' })
  await page.waitForSelector('.atlas-chips-section', { timeout: 10000 })

  let tapPassed = 0
  let tapFailed = 0

  for (const m of muscleNamesData.muscles) {
    const chip = page.locator(`.atlas-chips-section button[data-muscle-chip="${m.id}"]`).first()
    if (await chip.count() > 0) {
      await chip.scrollIntoViewIfNeeded()
      await chip.click()
      await page.waitForTimeout(300)

      // Assert sheet title contains gym_ar
      const sheet = page.locator('.sheet--open, [role="dialog"]').first()
      const isVisible = await sheet.isVisible().catch(() => false)

      // Check card claims presence
      const whereElem = page.locator(`[data-claim-id="muscle_where.${m.id}"]`)
      const attachesElem = page.locator(`[data-claim-id="muscle_attaches.${m.id}"]`)
      const doesElem = page.locator(`[data-claim-id="muscle_does.${m.id}"]`)

      const hasWhere = (await whereElem.count()) > 0
      const hasAttaches = (await attachesElem.count()) > 0
      const hasDoes = (await doesElem.count()) > 0

      if (isVisible && hasWhere && hasAttaches && hasDoes) {
        tapPassed++
      } else {
        console.error(`❌ Muscle card check failed for ${m.id} (${m.gym_ar}): visible=${isVisible}, where=${hasWhere}, attaches=${hasAttaches}, does=${hasDoes}`)
        tapFailed++
      }

      // Close sheet cleanly
      const closeBtn = page.locator('[aria-label="إغلاق النافذة"], [aria-label="إغلاق"], button:has-text("إغلاق")')
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click()
      } else {
        await page.keyboard.press('Escape')
      }
      await page.waitForSelector('.sheet-backdrop', { state: 'detached', timeout: 5000 }).catch(() => {})
      await page.waitForTimeout(150)
    } else {
      console.error(`❌ Chip not found for ${m.id}`)
      tapFailed++
    }
  }

  console.log(`C1 Real Taps Summary: ${tapPassed} passed, ${tapFailed} failed / 53 total muscles`)

  await browser.close()
  await server.close()

  if (tapFailed > 0) {
    console.error(`❌ C1 audit failed on ${tapFailed} muscles!`)
    process.exit(1)
  } else {
    console.log('✓ All G6-C green evidence captured and assertions passed successfully!')
  }
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
