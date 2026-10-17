import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import { chromium } from 'playwright'

const rootDir = process.cwd()
const evidenceDir = path.join(rootDir, 'docs', 'f-evidence')

async function main() {
  const server = await preview({
    root: rootDir,
    preview: { port: 5193, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    locale: 'ar-EG',
  })

  await context.addInitScript(() => {
    const mockProfile = {
      id: 'prof-user-1', name: 'كابتن أحمد', goals: ['hypertrophy'], primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4, splitType: 'upper_lower', experienceLevel: 'intermediate',
      equipmentAvailable: ['barbell', 'dumbbell'],
      body: { weightKg: 80, heightCm: 178, birthDate: '1995-05-15', gender: 'male', activityLevel: 'moderate' },
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      createdAt: 1700000000000, updatedAt: 1700000000000,
    }
    localStorage.setItem('maganis:profile.active', JSON.stringify(mockProfile))
  })

  const page = await context.newPage()
  await page.goto(`${baseUrl}#/exercise/chest-1`)
  await page.waitForTimeout(800)

  // Switch to "العضلات" tab
  const tabBtn = page.locator('.segmented button:has-text("العضلات")')
  if (await tabBtn.count() > 0) {
    await tabBtn.click()
    await page.waitForTimeout(500)
  }

  // Check SVG elements fill
  const svgData = await page.evaluate(() => {
    const svg = document.querySelector('.atlas-svg-container svg')
    if (!svg) return { error: 'SVG not found' }
    const visPaths = Array.from(svg.querySelectorAll('.muscle-vis'))
    const blackFills = []
    for (const p of visPaths) {
      const computed = window.getComputedStyle(p).fill
      if (computed === 'rgb(0, 0, 0)' || computed === '#000000' || computed === 'black') {
        blackFills.push({ id: p.id, dataMuscle: p.getAttribute('data-muscle'), fill: computed })
      }
    }
    const primaries = svg.querySelectorAll('.muscle-primary').length
    const secondaries = svg.querySelectorAll('.muscle-secondary').length
    return {
      totalVisPaths: visPaths.length,
      blackFillsCount: blackFills.length,
      sampleBlackFills: blackFills.slice(0, 5),
      primaries,
      secondaries,
    }
  })

  await page.screenshot({ path: path.join(evidenceDir, '1.3-before.png') })

  // Now click zoom in (+)
  const zoomIn = page.locator('button.atlas-zoom-btn:has-text("+")')
  if (await zoomIn.count() > 0) {
    await zoomIn.click()
    await page.waitForTimeout(300)
  }

  const svgDataAfterZoom = await page.evaluate(() => {
    const svg = document.querySelector('.atlas-svg-container svg')
    if (!svg) return { error: 'SVG not found' }
    const primaries = svg.querySelectorAll('.muscle-primary').length
    const secondaries = svg.querySelectorAll('.muscle-secondary').length
    return { primaries, secondaries }
  })

  const report = [
    '# Defect 1.3 Before Evidence: Muscle Atlas neutral fill & zoom',
    `- SVG Data before zoom: ${JSON.stringify(svgData, null, 2)}`,
    `- SVG Data after zoom: ${JSON.stringify(svgDataAfterZoom, null, 2)}`,
    `- Black neutral fill bug confirmed: ${svgData.blackFillsCount > 0 ? 'YES (' + svgData.blackFillsCount + ' elements have computed fill rgb(0,0,0))' : 'NO'}`,
    `- Zoom highlight persistence: Primaries ${svgData.primaries} -> ${svgDataAfterZoom.primaries}, Secondaries ${svgData.secondaries} -> ${svgDataAfterZoom.secondaries}`,
  ].join('\n')

  fs.writeFileSync(path.join(evidenceDir, '1.3-before.txt'), report, 'utf8')
  console.log(report)

  await browser.close()
  await server.close()
}

main().catch(console.error)
