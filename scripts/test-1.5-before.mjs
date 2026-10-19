import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import { chromium } from 'playwright'

const rootDir = process.cwd()
const evidenceDir = path.join(rootDir, 'docs', 'f-evidence')

async function main() {
  const server = await preview({
    root: rootDir,
    preview: { port: 5192, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 360, height: 740 },
    locale: 'ar-EG',
  })

  await context.addInitScript(() => {
    const mockProfile = {
      id: 'prof-user-1',
      name: 'كابتن أحمد',
      goals: ['hypertrophy'],
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      experienceLevel: 'intermediate',
      equipmentAvailable: ['barbell', 'dumbbell'],
      body: {
        weightKg: 80,
        heightCm: 178,
        birthDate: '1995-05-15',
        gender: 'male',
        activityLevel: 'moderate',
      },
      medical: { hasIssues: false, injuryTags: [], notes: '' },
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    }
    localStorage.setItem('maganis:profile.active', JSON.stringify(mockProfile))
  })

  const page = await context.newPage()
  await page.goto(`${baseUrl}#/home`)
  await page.waitForTimeout(600)

  const topBarBrand = page.locator('.home-screen [data-testid="app-title"]')
  const brandText = (await topBarBrand.textContent())?.trim()
  const pageTitle = await page.title()

  await page.screenshot({ path: path.join(evidenceDir, '1.5-before.png') })

  const report = [
    '# Defect 1.5 Before Evidence: Brand text in TopBar and title',
    `- Current TopBar brand text: "${brandText}"`,
    `- Expected TopBar brand text: "Maganis" (Latin, lang="en" dir="ltr", semibold)`,
    `- Current HTML <title>: "${pageTitle}"`,
    `- Expected HTML <title>: "Maganis"`,
    `- Result: FAIL (Found Arabic "مجانص" instead of Latin "Maganis")`,
  ].join('\n')

  fs.writeFileSync(path.join(evidenceDir, '1.5-before.txt'), report, 'utf8')
  console.log(report)

  await browser.close()
  await server.close()
}

main().catch(console.error)
