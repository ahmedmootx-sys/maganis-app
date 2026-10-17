import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import { chromium } from 'playwright'

const rootDir = process.cwd()
const evidenceDir = path.join(rootDir, 'docs', 'f-evidence')

async function main() {
  const server = await preview({
    root: rootDir,
    preview: { port: 5194, strictPort: true },
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
    const mockProgram = {
      id: 'prog-1', createdAt: 1700000000000, primaryGoal: 'hypertrophy', trainingDaysPerWeek: 4,
      splitType: 'upper_lower', days: [{ dayIndex: 0, labelAr: 'اليوم 1', focus: 'صدر', exercises: [] }],
    }
    localStorage.setItem('maganis:profile.active', JSON.stringify(mockProfile))
    localStorage.setItem('maganis:workout.program', JSON.stringify(mockProgram))
  })

  const page = await context.newPage()
  await page.goto(`${baseUrl}#/home`)
  await page.waitForTimeout(600)

  // Navigate to Training tab
  await page.click('[data-testid="tab-workouts"]')
  await page.waitForTimeout(400)

  // Check if exit guard runs on browser or tab changes
  // Let's trigger popstate as browser back button
  await page.evaluate(() => {
    window.dispatchEvent(new PopStateEvent('popstate', {}))
  })
  await page.waitForTimeout(300)

  const toastVisibleInBrowser = (await page.locator('.toast:has-text("اضغط مرة أخرى للخروج"), [role="alert"]:has-text("اضغط مرة أخرى للخروج")').count()) > 0

  await page.screenshot({ path: path.join(evidenceDir, '1.2-before.png') })

  const report = [
    '# Defect 1.2 Before Evidence: Exit toast shown in browser mode / on back',
    `- Exit Toast visible in browser mode: ${toastVisibleInBrowser}`,
    `- Rule violation: In a normal browser tab the exit toast must NEVER appear (requires standalone mode matchMedia), and tapping tabs or popstate in browser mode should never trigger exit toast.`,
  ].join('\n')

  fs.writeFileSync(path.join(evidenceDir, '1.2-before.txt'), report, 'utf8')
  console.log(report)

  await browser.close()
  await server.close()
}

main().catch(console.error)
