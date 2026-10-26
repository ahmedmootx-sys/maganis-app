import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const redEvidenceDir = path.join(rootDir, 'evidence/h2/red')
fs.mkdirSync(redEvidenceDir, { recursive: true })

// 1x1 red PNG data URL for test custom image
const TEST_CUSTOM_IMAGE =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg=='

const TEST_PROFILE = {
  id: 'test-persona',
  name: 'سامي',
  primaryGoal: 'hypertrophy',
  goals: ['hypertrophy'],
  bodyGoal: 'gain',
  trainingStyle: ['weights'],
  trainingDaysPerWeek: 2,
  splitType: 'full_body',
  experienceLevel: 'intermediate',
  equipmentAvailable: [
    'barbell',
    'dumbbell',
    'machine',
    'cables',
    'bodyweight',
  ],
  body: {
    sex: 'male',
    age: 26,
    heightCm: 175,
    weightKg: 75,
    activityLevel: 'moderate',
    lifestyle: 2,
    pace: 'standard',
  },
  medical: {
    hasIssues: false,
    injuryTags: [],
    notes: '',
  },
  limitations: [],
  createdAt: 1700000000000,
  updatedAt: 1700000000000,
}

const TEST_2DAY_PROGRAM = {
  id: 'prog-2day',
  name: 'جدول تجريبي يومين',
  primaryGoal: 'hypertrophy',
  trainingDaysPerWeek: 2,
  splitType: 'full_body',
  days: [
    {
      dayIndex: 0,
      id: 'day-0',
      name: 'يوم ١',
      labelAr: 'السبت · يوم ١',
      focus: 'تعليق وقوة قبضة',
      focusAr: 'تعليق وقوة قبضة',
      kind: 'strength',
      exercises: [
        {
          exerciseId: 'deadhang',
          sets: 3,
          reps: 30,
          repsMin: 30,
          repsMax: 30,
          restSeconds: 60,
          section: 'primary',
        },
      ],
    },
    {
      dayIndex: 1,
      id: 'day-1',
      name: 'يوم ٢',
      labelAr: 'الاثنين · يوم ٢',
      focus: 'صدر',
      focusAr: 'صدر',
      kind: 'strength',
      exercises: [
        {
          exerciseId: 'bench',
          sets: 3,
          reps: 8,
          repsMin: 8,
          repsMax: 8,
          restSeconds: 90,
          section: 'primary',
        },
      ],
    },
  ],
}

async function run() {
  console.log('--- REPRODUCING H2 DEFECTS (M1, M3, M7) ON 7169a00 ---')
  const server = await preview({
    root: rootDir,
    preview: { port: 5194, strictPort: true },
    logLevel: 'error',
  })

  const baseUrl = 'http://localhost:5194/maganis-app/'
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  try {
    // ----------------------------------------------------
    // M1: Custom image on deadhang
    // ----------------------------------------------------
    console.log('\n[M1] Probing custom image for deadhang across surfaces...')
    const ctx1 = await browser.newContext({
      viewport: { width: 360, height: 720 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const page1 = await ctx1.newPage()

    // Seed storage with deadhang custom image override and 2-day program
    await page1.addInitScript(
      ({ profile, program, customImg }) => {
        localStorage.setItem('maganis:profile.active', JSON.stringify(profile))
        localStorage.setItem('maganis:workout.program', JSON.stringify(program))
        const overrides = {
          deadhang: {
            exerciseId: 'deadhang',
            imageMode: 'custom',
            customImageBlob: customImg,
            updatedAt: Date.now(),
          },
        }
        localStorage.setItem(
          'maganis:exercise_overrides',
          JSON.stringify(overrides),
        )
      },
      {
        profile: TEST_PROFILE,
        program: TEST_2DAY_PROGRAM,
        customImg: TEST_CUSTOM_IMAGE,
      },
    )

    // Check Exercise Detail
    await page1.goto(`${baseUrl}#/exercise/deadhang`, {
      waitUntil: 'networkidle',
    })
    await page1.waitForTimeout(600)
    const detailImgCount = await page1.evaluate((dataUrl) => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs.filter((img) => img.src === dataUrl).length
    }, TEST_CUSTOM_IMAGE)
    console.log(`  Exercise Page custom <img> count: ${detailImgCount}`)
    await page1.screenshot({
      path: path.join(redEvidenceDir, 'm1-exercise-detail.png'),
    })

    // Check Day List
    await page1.goto(`${baseUrl}#/training/day/0`, { waitUntil: 'networkidle' })
    await page1.waitForTimeout(600)
    const dayListImgCount = await page1.evaluate((dataUrl) => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs.filter((img) => img.src === dataUrl).length
    }, TEST_CUSTOM_IMAGE)
    console.log(
      `  Day List (#/training/day/0) custom <img> count: ${dayListImgCount}`,
    )
    await page1.screenshot({
      path: path.join(redEvidenceDir, 'm1-day-list.png'),
    })

    // Check Home
    await page1.goto(`${baseUrl}#/`, { waitUntil: 'networkidle' })
    await page1.waitForTimeout(600)
    const homeImgCount = await page1.evaluate((dataUrl) => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs.filter((img) => img.src === dataUrl).length
    }, TEST_CUSTOM_IMAGE)
    console.log(`  Home (#/) custom <img> count: ${homeImgCount}`)
    await page1.screenshot({ path: path.join(redEvidenceDir, 'm1-home.png') })

    // Check Library
    await page1.goto(`${baseUrl}#/library`, { waitUntil: 'networkidle' })
    await page1.waitForTimeout(600)
    const libraryImgCount = await page1.evaluate((dataUrl) => {
      const imgs = Array.from(document.querySelectorAll('img'))
      return imgs.filter((img) => img.src === dataUrl).length
    }, TEST_CUSTOM_IMAGE)
    console.log(`  Library (#/library) custom <img> count: ${libraryImgCount}`)
    await page1.screenshot({
      path: path.join(redEvidenceDir, 'm1-library.png'),
    })

    // Save primary m1 red screenshot from day list
    await page1.screenshot({ path: path.join(redEvidenceDir, 'm1.png') })
    await ctx1.close()

    // ----------------------------------------------------
    // M7: «معدّل» badge in ExerciseLibraryModal & ExerciseDetailView
    // ----------------------------------------------------
    console.log('\n[M7] Probing «معدّل» badges...')
    const ctx7 = await browser.newContext({
      viewport: { width: 360, height: 720 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const page7 = await ctx7.newPage()
    await page7.addInitScript(
      ({ profile, program }) => {
        localStorage.setItem('maganis:profile.active', JSON.stringify(profile))
        localStorage.setItem('maganis:workout.program', JSON.stringify(program))
        const overrides = {
          bench: {
            exerciseId: 'bench',
            videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
            updatedAt: Date.now(),
          },
        }
        localStorage.setItem(
          'maganis:exercise_overrides',
          JSON.stringify(overrides),
        )
      },
      { profile: TEST_PROFILE, program: TEST_2DAY_PROGRAM },
    )

    await page7.goto(`${baseUrl}#/library`, { waitUntil: 'networkidle' })
    await page7.waitForTimeout(600)
    const libraryBadgeCount = await page7
      .locator('[data-testid="badge-modified"]')
      .count()
    console.log(
      `  Library [data-testid="badge-modified"] count: ${libraryBadgeCount}`,
    )
    await page7.screenshot({
      path: path.join(redEvidenceDir, 'm7-library.png'),
    })

    await page7.goto(`${baseUrl}#/exercise/bench`, { waitUntil: 'networkidle' })
    await page7.waitForTimeout(600)
    const detailBadgeCount = await page7.evaluate(() => {
      const spans = Array.from(document.querySelectorAll('span'))
      return spans.filter((s) => s.textContent?.trim() === 'معدّل').length
    })
    console.log(
      `  Exercise Detail «معدّل» text badge count: ${detailBadgeCount}`,
    )
    await page7.screenshot({ path: path.join(redEvidenceDir, 'm7.png') })
    await ctx7.close()

    // ----------------------------------------------------
    // M3: Reset the app does not wipe IndexedDB overrides
    // ----------------------------------------------------
    console.log('\n[M3] Probing factory reset & IndexedDB persistence...')
    const ctx3 = await browser.newContext({
      viewport: { width: 360, height: 720 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
    })
    const page3 = await ctx3.newPage()
    await page3.addInitScript(
      ({ profile, program }) => {
        localStorage.setItem('maganis:profile.active', JSON.stringify(profile))
        localStorage.setItem('maganis:workout.program', JSON.stringify(program))
      },
      { profile: TEST_PROFILE, program: TEST_2DAY_PROGRAM },
    )
    await page3.goto(`${baseUrl}#/exercise/bench`, { waitUntil: 'networkidle' })
    await page3.waitForTimeout(600)

    // Save an override through the UI
    const addVideoBtn = page3.locator('[data-testid="add-video-btn"]')
    if (await addVideoBtn.isVisible()) {
      await addVideoBtn.click()
      await page3.waitForTimeout(500)
      await page3
        .locator('[data-testid="input-video-url"]')
        .fill('https://youtu.be/dQw4w9WgXcQ')
      await page3.locator('[data-testid="btn-save-edit"]').click()
      await page3.waitForTimeout(800)
    }

    // Now go to settings and perform reset
    await page3.goto(`${baseUrl}#/settings`, { waitUntil: 'networkidle' })
    await page3.waitForTimeout(600)

    // Find and click reset button
    const resetTrigger = page3.locator('text=إعادة ضبط التطبيق بالكامل')
    if (await resetTrigger.isVisible()) {
      await resetTrigger.scrollIntoViewIfNeeded()
      await resetTrigger.click()
      await page3.waitForTimeout(500)

      // ConfirmSheet: type «حذف»
      const wordInput = page3.locator('[data-testid="confirm-sheet-input"]')
      if (await wordInput.isVisible()) {
        await wordInput.fill('حذف')
        await page3.waitForTimeout(300)
        const confirmBtn = page3.locator(
          'button:has-text("حذف كل شيء والبدء من جديد")',
        )
        await confirmBtn.click()
        await page3.waitForTimeout(1000)
      }
    }

    // Now read localStorage and IndexedDB
    const storageState = await page3.evaluate(async () => {
      const lsOverride = localStorage.getItem('maganis:exercise_overrides')

      // Read IndexedDB maganis_db -> maganis_kv
      const idbData = await new Promise((resolve) => {
        const req = indexedDB.open('maganis_db')
        req.onerror = () => resolve(null)
        req.onsuccess = () => {
          const db = req.result
          if (!db.objectStoreNames.contains('maganis_kv')) {
            resolve({ error: 'no maganis_kv store' })
            return
          }
          const tx = db.transaction('maganis_kv', 'readonly')
          const store = tx.objectStore('maganis_kv')
          const getReq = store.get('exercise_overrides')
          getReq.onsuccess = () => resolve(getReq.result)
          getReq.onerror = () => resolve(null)
        }
      })

      return { lsOverride, idbData }
    })

    console.log(
      `  Storage state after reset:`,
      JSON.stringify(storageState, null, 2),
    )
    await page3.screenshot({ path: path.join(redEvidenceDir, 'm3.png') })
    await ctx3.close()

    console.log('\n--- H2 PRE-FIX REPRODUCTION COMPLETE ---')
  } finally {
    await browser.close()
    if (server && server.httpServer) {
      await server.httpServer.close()
    }
  }
}

run().catch((err) => {
  console.error('Fatal reproduction error:', err)
  process.exit(1)
})
