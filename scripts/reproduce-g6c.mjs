import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { initStorage } from '../qa/drive.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function run() {
  console.log('Capturing G6-C RED reproduction screenshots at 360x720 DPR 2...')

  const server = await preview({
    preview: { port: 5220, strictPort: false },
    root: rootDir,
    logLevel: 'error',
  })
  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  const context = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    locale: 'ar-EG',
  })

  const page = await context.newPage()
  await initStorage(page, { baseUrl, theme: 'light' })

  // 1. Missing chips ("مفيش رسم للعضلة دي" for lats, etc.)
  console.log('1. Capturing c3-missing-chips.png...')
  await page.goto(`${baseUrl}#/exercise/pullup?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-chips-section').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c3-missing-chips.png'),
  })

  // 2. Scapular pull-up back view: large red rounded block (dashed outline) on lower back
  console.log('2. Capturing c3-scapular-pullup-block.png...')
  await page.goto(`${baseUrl}#/exercise/scappull?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  // Switch to Posterior (خلفي)
  const postBtn = page.locator(
    'button:has-text("خلفي"), [role="tab"]:has-text("خلفي"), .segmented-option:has-text("خلفي")',
  )
  if ((await postBtn.count()) > 0) {
    await postBtn.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c3-scapular-pullup-block.png'),
  })

  // 3. Side plank back view: two small red rectangles at sacrum between yellow arcs
  console.log('3. Capturing c3-sacrum-rectangles.png...')
  await page.goto(`${baseUrl}#/exercise/sideplank?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  const postBtnSp = page.locator(
    'button:has-text("خلفي"), [role="tab"]:has-text("خلفي"), .segmented-option:has-text("خلفي")',
  )
  if ((await postBtnSp.count()) > 0) {
    await postBtnSp.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c3-sacrum-rectangles.png'),
  })

  // 4. Front view of small targets (Support hold: tiny wedges at sternum and thin yellow curves at sides)
  console.log('4. Capturing c3-front-wedges.png...')
  await page.goto(`${baseUrl}#/exercise/supporthold?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-container').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c3-front-wedges.png'),
  })

  // 5. Bench press front view: red chest with ragged yellow lower edge (ragged 65/35 split)
  console.log('5. Capturing c3-bench-press-ragged.png...')
  await page.goto(`${baseUrl}#/exercise/bench?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-container').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c3-bench-press-ragged.png'),
  })

  // 6. Names mode with 7px tiny unreadable grey labels and long dashed leader lines
  console.log('6. Capturing c2-names-mode-labels.png...')
  await page.goto(`${baseUrl}#/exercise/bench?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  const namesBtn = page.locator('button:has-text("الأسماء")')
  if ((await namesBtn.count()) > 0) {
    await namesBtn.first().click()
    await page.waitForTimeout(600)
  }
  await page.locator('.atlas-wrapper').first().scrollIntoViewIfNeeded()
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c2-names-mode-labels.png'),
  })

  // 7. Toolbar shift: show the toolbar when deep muscles toggle is omitted
  console.log('7. Capturing c2-toolbar-shift.png...')
  await page.goto(`${baseUrl}#/exercise/calf?tab=muscles`, {
    waitUntil: 'networkidle',
  })
  await page.waitForSelector('.atlas-toolbar', { timeout: 10000 })
  await page.locator('.atlas-toolbar').first().scrollIntoViewIfNeeded()
  await page.waitForTimeout(600)
  await page.screenshot({
    path: path.join(rootDir, 'evidence/g6-c/red/c2-toolbar-shift.png'),
  })

  console.log('All 7 red reproduction screenshots captured successfully!')

  await browser.close()
  await server.close()
}

run().catch((err) => {
  console.error('Error capturing red reproduction screenshots:', err)
  process.exit(1)
})
