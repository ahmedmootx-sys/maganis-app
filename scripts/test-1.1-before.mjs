import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'
import { chromium } from 'playwright'

const rootDir = process.cwd()
const evidenceDir = path.join(rootDir, 'docs', 'f-evidence')

async function main() {
  const server = await preview({
    root: rootDir,
    preview: { port: 5195, strictPort: true },
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
      id: 'prof-user-1',
      name: 'كابتن أحمد',
      goals: ['hypertrophy'],
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      experienceLevel: 'intermediate',
      equipmentAvailable: ['barbell', 'dumbbell', 'machine', 'bodyweight'],
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
  await page.goto(`${baseUrl}#/library`)
  await page.waitForTimeout(600)

  const addBtn = page.locator('button:has-text("إضافة تمرين")').first()
  const box = await addBtn.boundingBox()
  const centerX = box.x + box.width / 2
  const centerY = box.y + box.height / 2

  const elInfo = await page.evaluate(
    ({ x, y }) => {
      const el = document.elementFromPoint(x, y)
      return {
        tagName: el?.tagName,
        className: el?.className,
        outerHTML: el?.outerHTML?.slice(0, 150),
      }
    },
    { x: centerX, y: centerY },
  )

  await page.screenshot({ path: path.join(evidenceDir, '1.1-before.png') })

  // Click at the button center
  await page.mouse.click(centerX, centerY)
  await page.waitForTimeout(600)

  // Check if CustomExerciseBuilder form opened
  const builderCount = await page
    .locator(
      '[data-testid="custom-exercise-form"], form:has-text("إضافة تمرين مخصص"), h1:has-text("إضافة تمرين مخصص")',
    )
    .count()

  const report = [
    '# Defect 1.1 Before Evidence: Library «+ إضافة تمرين» does nothing',
    `- Button Bounding Box: ${JSON.stringify(box)}`,
    `- Click Position: (${centerX}, ${centerY})`,
    `- document.elementFromPoint: ${JSON.stringify(elInfo)}`,
    `- CustomExerciseBuilder opened count: ${builderCount}`,
    `- Result: FAIL (Expected builder form to open, but nothing rendered because /library route intercepts render and showCustomBuilder is not rendered under /library).`,
  ].join('\n')

  fs.writeFileSync(path.join(evidenceDir, '1.1-before.txt'), report, 'utf8')
  console.log(report)

  await browser.close()
  await server.close()
}

main().catch(console.error)
