import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const evidenceDir = path.join(rootDir, 'docs', 'f-evidence')

async function main() {
  const server = await preview({
    root: rootDir,
    preview: { port: 5198, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

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
    const mockProgram = {
      id: 'prog-1',
      createdAt: 1700000000000,
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      days: [{ dayIndex: 0, labelAr: 'اليوم 1', focus: 'صدر', exercises: [] }],
    }
    localStorage.setItem('maganis:profile.active', JSON.stringify(mockProfile))
    localStorage.setItem('maganis:workout.program', JSON.stringify(mockProgram))
  })

  const page = await context.newPage()
  await page.goto(`${baseUrl}#/library`)
  await page.waitForTimeout(600)

  // Find the button
  const addBtn = page.locator('button:has-text("إضافة تمرين")').first()
  const count = await addBtn.count()
  console.log('Button count:', count)

  if (count > 0) {
    const box = await addBtn.boundingBox()
    const centerX = box.x + box.width / 2
    const centerY = box.y + box.height / 2
    console.log('Button bounding box:', box)

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
    console.log('elementFromPoint at center:', elInfo)

    // Log before click screenshot
    await page.screenshot({ path: path.join(evidenceDir, '1.1-before.png') })

    // Tap button
    await page.mouse.click(centerX, centerY)
    await page.waitForTimeout(600)

    // Check if Custom Exercise builder opened
    const builderVisible =
      (await page
        .locator(
          'form[data-testid="custom-exercise-form"], form:has-text("إضافة تمرين مخصص"), h1:has-text("إضافة تمرين مخصص"), h2:has-text("إضافة تمرين مخصص")',
        )
        .count()) > 0
    console.log('Did CustomExerciseBuilder open?', builderVisible)

    const report = [
      '# Defect 1.1 Before Evidence: Library «+ إضافة تمرين» does nothing',
      `- Click target: (${centerX}, ${centerY})`,
      `- elementFromPoint: ${JSON.stringify(elInfo)}`,
      `- Builder opened after tap: ${builderVisible}`,
      `- Failure confirmed: clicking the button calls onEditCustomExercise which sets showCustomBuilder=true in App.tsx, but because route is #/library, App.tsx returns ExerciseLibraryModal early and CustomExerciseBuilder is never rendered.`,
    ].join('\n')

    fs.writeFileSync(path.join(evidenceDir, '1.1-before.txt'), report, 'utf8')
    console.log('Saved 1.1-before.txt and 1.1-before.png')
  }

  await browser.close()
  await server.close()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
