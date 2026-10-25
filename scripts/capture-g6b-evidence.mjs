import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function run() {
  console.log('Capturing G6-B evidence screenshots at 360x720 DPR 2...')

  const server = await preview({
    preview: { port: 5210, strictPort: false },
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

  const ownerProfilePath = path.resolve(rootDir, 'docs/owner-profile-dump.json')
  let ownerDump = null
  if (fs.existsSync(ownerProfilePath)) {
    ownerDump = JSON.parse(fs.readFileSync(ownerProfilePath, 'utf8'))
  }
  const baseProfile = ownerDump ? ownerDump.profile || ownerDump : {
    id: 'user_1',
    name: 'أحمد',
    sex: 'male',
    age: 28,
    weightKg: 80,
    heightCm: 178,
    activityLevel: 'moderate',
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: 4,
    trainingLocation: 'gym',
    trainingStyle: 'weights',
    experienceLevel: 'intermediate',
  }

  const standardProgram = {
    id: 'prog-g6b',
    title: 'جدول الكابتن أحمد',
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: 4,
    splitType: 'upper_lower',
    days: [
      {
        dayIndex: 0,
        id: 'day-0',
        labelAr: 'السبت · علوي (أ)',
        name: 'علوي (أ)',
        focus: 'صدر · ظهر',
        focusAr: 'صدر · ظهر',
        kind: 'strength',
        exercises: [
          { exerciseId: 'bench', sets: 3, reps: 8, section: 'primary' },
          { exerciseId: 'pullup', sets: 3, reps: 8, section: 'primary' },
        ],
      },
      {
        dayIndex: 1,
        id: 'day-1',
        labelAr: 'الأحد · سفلي (أ)',
        name: 'سفلي (أ)',
        focus: 'أرجل · بطن',
        focusAr: 'أرجل · بطن',
        kind: 'strength',
        exercises: [
          { exerciseId: 'squat', sets: 3, reps: 8, section: 'primary' },
        ],
      },
      {
        dayIndex: 2,
        id: 'day-2',
        labelAr: 'الثلاثاء · كارديو خارجي',
        name: 'كارديو خارجي',
        focus: 'جري ولياقة',
        focusAr: 'جري ولياقة',
        kind: 'cardio',
        cardio: {
          activity: 'run',
          plannedMinutes: 30,
          intensity: 'moderate',
        },
      },
    ],
  }

  // Helper to init storage
  async function setupStorage(customProfile, customProg) {
    await page.addInitScript(({ p, prog }) => {
      localStorage.setItem('maganis:profile.active', JSON.stringify(p))
      localStorage.setItem('maganis:workout.program', JSON.stringify(prog))
      localStorage.setItem('maganis:theme', 'light')
      document.documentElement.setAttribute('data-theme', 'light')
      document.body.setAttribute('data-theme', 'light')
    }, { p: customProfile, prog: customProg })
  }

  try {
    // -------------------------------------------------------------------------
    // B1: Calisthenics Library with "مناسب لمعداتي" filter active
    // -------------------------------------------------------------------------
    console.log('1. Capturing B1 Calisthenics Library filter...')
    const calisthenicsProfile = {
      ...baseProfile,
      trainingStyle: 'calisthenics',
      trainingLocation: 'home',
    }
    await setupStorage(calisthenicsProfile, standardProgram)
    await page.goto(`${baseUrl}#/library`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b1-calisthenics-library.png') })

    // -------------------------------------------------------------------------
    // B1: Disallowed Exercises Callout on Training screen
    // -------------------------------------------------------------------------
    console.log('2. Capturing B1 Disallowed Exercises Callout...')
    await page.goto(`${baseUrl}#/training`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b1-disallowed-callout.png') })

    // -------------------------------------------------------------------------
    // B2: Add Day Sheet (3 options: resistance, cardio, duplicate existing)
    // -------------------------------------------------------------------------
    console.log('3. Capturing B2 Add Day Sheet with 3 options...')
    await setupStorage(baseProfile, standardProgram)
    await page.goto(`${baseUrl}#/training`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)
    const addDayBtn = page.locator('button:has-text("إضافة يوم")')
    if (await addDayBtn.count() > 0) {
      await addDayBtn.first().click({ force: true })
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b2-add-day-sheet.png') })

    // -------------------------------------------------------------------------
    // B2: Duplicate Picker Sheet (listing existing days)
    // -------------------------------------------------------------------------
    console.log('4. Capturing B2 Duplicate Picker Sheet...')
    const dupOption = page.locator('button:has-text("تكرار يوم موجود")')
    if (await dupOption.count() > 0) {
      await dupOption.first().click({ force: true })
    }
    await page.waitForTimeout(500)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b2-duplicate-picker.png') })

    // -------------------------------------------------------------------------
    // B3.1: Cardio Runner Leave Sheet (كمّل الجلسة / صغّر الجلسة / إنهاء الجلسة)
    // -------------------------------------------------------------------------
    console.log('5. Capturing B3.1 Cardio Runner Leave Sheet...')
    await page.goto(`${baseUrl}#/training/day/2`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(400)
    const startCardioBtn = page.locator('button:has-text("ابدأ جلسة الكارديو")')
    if (await startCardioBtn.count() > 0) {
      await startCardioBtn.first().click({ force: true })
    }
    // Wait for countdown
    await page.waitForTimeout(3500)
    await page.waitForSelector('.cardio-runner-screen', { timeout: 6000 })
    await page.waitForTimeout(400)
    // Click "إنهاء الجلسة" inside CardioRunner
    const endRunnerBtn = page.locator('.cardio-runner-screen button:has-text("إنهاء الجلسة")')
    await endRunnerBtn.first().click({ force: true })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b3-cardio-leave-sheet.png') })

    // -------------------------------------------------------------------------
    // B3.1: Cardio Mini Bar on Training Screen
    // -------------------------------------------------------------------------
    console.log('6. Capturing B3.1 Cardio Mini Bar on screen...')
    await page.goto(`${baseUrl}#/training`, { waitUntil: 'domcontentloaded' })
    await page.evaluate(() => {
      const s = {
        activityId: 'run',
        level: 'moderate',
        startTime: Date.now() - 60000,
        durationMinutes: 30,
        weightKg: 80,
        pausedTotalMs: 0,
        isPaused: false,
        pausedAt: null,
        minimized: true,
      }
      localStorage.setItem('maganis:cardio_active_session', JSON.stringify(s))
      window.dispatchEvent(new Event('cardio-session-sync'))
    })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b3-cardio-mini-bar.png') })

    // -------------------------------------------------------------------------
    // B3.2: Cardio Finisher Card on Resistance Day Screen
    // -------------------------------------------------------------------------
    console.log('7. Capturing B3.2 Cardio Finisher Card...')
    await page.evaluate(() => {
      localStorage.removeItem('maganis:cardio_active_session')
      window.dispatchEvent(new Event('cardio-session-sync'))
    })
    await page.goto(`${baseUrl}#/training/day/0`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(600)
    await page.evaluate(() => {
      const el = document.querySelector('.day-screen .screen-content')
      if (el) el.scrollTop = el.scrollHeight
    })
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b3-cardio-finisher-card.png') })

    // -------------------------------------------------------------------------
    // B3.2: Cardio Finisher Modal with Bulk Apply Switch
    // -------------------------------------------------------------------------
    console.log('8. Capturing B3.2 Cardio Finisher Modal...')
    const finisherAddBtn = page.locator('button:has-text("إضافة كارديو بعد التمرين")')
    await finisherAddBtn.scrollIntoViewIfNeeded()
    await finisherAddBtn.click({ force: true })
    await page.waitForTimeout(600)
    await page.screenshot({ path: path.join(rootDir, 'evidence/g6-b/green/b3-cardio-finisher-modal.png') })

    console.log('All G6-B evidence screenshots successfully captured in evidence/g6-b/green/')
  } finally {
    await browser.close()
    await server.close()
  }
}

run().catch((err) => {
  console.error('Evidence capture failed:', err)
  process.exit(1)
})
