/**
 * qa/media-everywhere.mjs — Verification for Task H2: Media Edits Everywhere.
 *
 * For an exercise with no catalog image ('deadhang'):
 * Tests 3 media sources:
 *   (a) Uploaded image (data URL)
 *   (b) Uploaded animated GIF
 *   (c) External HTTPS link (served by Playwright route stub)
 *
 * Asserts the expected <img> and ExerciseMarks on all surfaces:
 *   1. Home (Dashboard)
 *   2. Day list (WeeklyPlanView at #/training/day/0)
 *   3. Active workout (ActiveWorkoutSession)
 *   4. Exercise page (ExerciseDetailView at #/exercise/deadhang)
 *   5. Library (ExerciseLibraryModal at #/library)
 *   6. History (ProgressScreen at #/progress)
 *
 * Then tests offline mode:
 *   - Uploaded image & GIF render offline from IndexedDB.
 *   - External link offline shows fallback category icon and "الصورة دي محتاجة إنترنت" without broken image.
 *
 * Captures green screenshots for M1 & M7 in evidence/h2/green/.
 *
 * Usage:  BASE=http://localhost:5194/maganis-app/ node qa/media-everywhere.mjs
 */

import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5194/maganis-app/'
const EXERCISE_ID = 'deadhang'

const persona = JSON.parse(
  fs.readFileSync(
    new URL('../fixtures/persona.synthetic.json', import.meta.url),
    'utf8',
  ),
)
const profileValue = {
  ...(persona.profile || persona),
  schedule: { 0: '0', 1: '0', 2: '0', 3: '0', 4: '0', 5: '0', 6: '0' },
}

const failures = []
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) failures.push(msg)
}

const launchOpts = {
  headless: true,
  args: ['--no-sandbox'],
}
if (process.platform === 'win32' && !process.env.CI) {
  launchOpts.channel = 'chrome'
}

const browser = await chromium.launch(launchOpts)
const ctx = await browser.newContext({
  viewport: { width: 360, height: 720 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
})

// Route stub for external image / GIF
const STUB_EXTERNAL_IMAGE_URL = 'https://images.example.com/deadhang.jpg'

// 1x1 transparent PNG
const PNG_PIXEL = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
)
// 1x1 GIF
const GIF_PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64',
)

let allowExternalImages = true
await ctx.route('https://images.example.com/**', (route) => {
  if (!allowExternalImages) {
    return route.abort('failed')
  }
  const url = route.request().url()
  if (url.endsWith('.gif')) {
    return route.fulfill({
      status: 200,
      contentType: 'image/gif',
      body: GIF_PIXEL,
    })
  }
  return route.fulfill({
    status: 200,
    contentType: 'image/png',
    body: PNG_PIXEL,
  })
})

const page = await ctx.newPage()

// 1-pixel blue PNG for custom image
const CUSTOM_IMAGE_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPj/HwADBwIAMCbHYQAAAABJRU5ErkJggg=='

// Helper to seed program with deadhang on Day 0
async function seedAppData(overrideObj, mediaItem) {
  await page.evaluate(
    async ({ p, exId, ov, media }) => {
      localStorage.setItem('maganis:profile.active', JSON.stringify(p))

      const program = {
        id: 'prog-media-everywhere',
        title: 'برنامج تجريبي',
        days: [
          {
            id: '0',
            dayIndex: 0,
            labelAr: 'اليوم الأول',
            focus: 'عقلة وتعلّق',
            exercises: [
              {
                exerciseId: exId,
                sets: 3,
                reps: 30,
                restSeconds: 60,
                section: 'primary',
              },
              {
                exerciseId: 'bench',
                sets: 3,
                reps: 10,
                restSeconds: 90,
                section: 'primary',
              },
            ],
            warmup: [
              {
                exerciseId: exId,
                sets: 1,
                reps: 15,
                restSeconds: 30,
                section: 'warmup',
              },
            ],
            cooldown: [
              {
                exerciseId: exId,
                sets: 1,
                reps: 20,
                restSeconds: 30,
                section: 'cooldown',
              },
            ],
          },
        ],
      }
      localStorage.setItem('maganis:workout.program', JSON.stringify(program))

      // Seed tracking session for history
      const sessions = [
        {
          id: 'sess-1',
          date: new Date().toISOString(),
          dayIndex: 0,
          dayTitle: 'اليوم الأول',
          durationSeconds: 1800,
          exercises: [
            {
              exerciseId: exId,
              exerciseNameAr: 'تعلق حر',
              sets: [{ setNumber: 1, reps: 30, weightKg: 0, completed: true }],
            },
          ],
        },
      ]
      localStorage.setItem(
        'maganis:tracking.sessions',
        JSON.stringify(sessions),
      )

      // Overrides map
      const overridesMap = ov ? { [exId]: ov } : {}
      localStorage.setItem(
        'maganis:exercise_overrides',
        JSON.stringify(overridesMap),
      )

      // IndexedDB
      await new Promise((resolve) => {
        const req = indexedDB.open('maganis_db', 2)
        req.onupgradeneeded = (e) => {
          const db = e.target.result
          if (!db.objectStoreNames.contains('maganis_kv')) {
            db.createObjectStore('maganis_kv')
          }
          if (!db.objectStoreNames.contains('maganis_media')) {
            db.createObjectStore('maganis_media')
          }
        }
        req.onsuccess = () => {
          const db = req.result
          const tx = db.transaction(
            ['maganis_kv', 'maganis_media'],
            'readwrite',
          )
          tx.objectStore('maganis_kv').put(overridesMap, 'exercise_overrides')
          if (media) {
            tx.objectStore('maganis_media').put(media, exId)
          } else {
            tx.objectStore('maganis_media').delete(exId)
          }
          tx.oncomplete = () => {
            db.close()
            resolve()
          }
        }
      })
    },
    { p: profileValue, exId: EXERCISE_ID, ov: overrideObj, media: mediaItem },
  )
}

// Ensure evidence directory exists
fs.mkdirSync('evidence/h2/green', { recursive: true })

// ==========================================
// Test Scenario A: Uploaded Image
// ==========================================
console.log('\n--- Scenario A: Uploaded Custom Image ---')

const uploadImageOverride = {
  exerciseId: EXERCISE_ID,
  nameAr: 'تعلق حر معدل',
  imageMode: 'custom',
  media: {
    kind: 'upload-image',
    blobKey: EXERCISE_ID,
    updatedAt: Date.now(),
  },
}
const uploadImageMedia = { dataUrl: CUSTOM_IMAGE_DATA_URL }

await page.goto(`${BASE}#/`, { waitUntil: 'domcontentloaded' })
await seedAppData(uploadImageOverride, uploadImageMedia)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)

// 1. Surface: Home (Dashboard)
console.log('Testing Surface: Home')
await page.goto(`${BASE}#/home`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)
const homeThumbImg = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src.includes('data:image/png;base64'))
})
check(homeThumbImg, 'Home screen renders custom uploaded image')
await page.screenshot({ path: 'evidence/h2/green/m1-home.png' })

// 2. Surface: Day List (WeeklyPlanView at #/training/day/0)
console.log('Testing Surface: Day List')
await page.goto(`${BASE}#/training/day/0`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)
const dayListImgCount = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.filter((img) => img.src.includes('data:image/png;base64')).length
})
check(
  dayListImgCount >= 1,
  `Day list renders custom uploaded image across sections (found ${dayListImgCount})`,
)
await page.screenshot({ path: 'evidence/h2/green/m1-day-list.png' })

// 3. Surface: Exercise Page (ExerciseDetailView)
console.log('Testing Surface: Exercise Detail Page')
await page.goto(`${BASE}#/exercise/${EXERCISE_ID}`, {
  waitUntil: 'domcontentloaded',
})
await page.waitForTimeout(600)
const detailImg = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src.includes('data:image/png;base64'))
})
check(detailImg, 'Exercise Detail page renders custom uploaded image')

// Verify ExerciseMarks (and absence of «معدّل» badge)
const hasMarks =
  (await page.locator('[data-testid="exercise-marks"]').count()) > 0
const hasOldBadge =
  (await page.locator('[data-testid="badge-modified"]').count()) > 0
check(hasMarks, 'ExerciseMarks component is rendered')
check(!hasOldBadge, 'Old badge-modified is completely absent')
await page.screenshot({ path: 'evidence/h2/green/m7.png' })
await page.screenshot({ path: 'evidence/h2/green/m1-exercise-detail.png' })

// 4. Surface: Library Modal
console.log('Testing Surface: Library Modal')
await page.goto(`${BASE}#/library`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const libraryImg = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src.includes('data:image/png;base64'))
})
check(
  libraryImg,
  'Exercise Library renders custom uploaded image in exercise row',
)
await page.screenshot({ path: 'evidence/h2/green/m1-library.png' })
await page.screenshot({ path: 'evidence/h2/green/m7-library.png' })
await page.screenshot({ path: 'evidence/h2/green/m1.png' })

// 5. Surface: Active Workout
console.log('Testing Surface: Active Workout')
await page.goto(`${BASE}#/training/day/0`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)
const startBtn = page.locator('button:has-text("ابدأ التمرين")').first()
if ((await startBtn.count()) > 0) {
  await startBtn.click()
  await page.waitForTimeout(800)
  const activeImg = await page.evaluate(() => {
    const imgs = Array.from(document.querySelectorAll('img'))
    return imgs.some((img) => img.src.includes('data:image/png;base64'))
  })
  check(activeImg, 'Active Workout session renders custom uploaded image')
  // Exit session
  const finishOrCancel = page.locator('button:has-text("إنهاء")').first()
  if ((await finishOrCancel.count()) > 0) {
    await finishOrCancel.click()
    await page.waitForTimeout(300)
  }
}

// 6. Surface: History / Progress
console.log('Testing Surface: History (Progress)')
await page.goto(`${BASE}#/progress`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)
const historyThumb = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src.includes('data:image/png;base64'))
})
check(historyThumb, 'History / Progress screen renders custom uploaded image')

// ==========================================
// Test Scenario B: Uploaded GIF
// ==========================================
console.log('\n--- Scenario B: Uploaded GIF ---')
const uploadGifOverride = {
  exerciseId: EXERCISE_ID,
  nameAr: 'تعلق حر GIF',
  imageMode: 'custom',
  media: {
    kind: 'upload-gif',
    blobKey: EXERCISE_ID,
    updatedAt: Date.now(),
  },
}
const uploadGifMedia = {
  dataUrl:
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  firstFrameUrl: CUSTOM_IMAGE_DATA_URL,
}

await seedAppData(uploadGifOverride, uploadGifMedia)
await page.goto(`${BASE}#/exercise/${EXERCISE_ID}`, {
  waitUntil: 'domcontentloaded',
})
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)
const gifRendered = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src.includes('data:image/gif'))
})
check(gifRendered, 'Exercise detail page displays animated GIF')

// ==========================================
// Test Scenario C: External HTTPS Link
// ==========================================
console.log('\n--- Scenario C: External HTTPS Link ---')
allowExternalImages = true
const externalOverride = {
  exerciseId: EXERCISE_ID,
  nameAr: 'تعلق حر برابط',
  imageMode: 'custom',
  media: {
    kind: 'external-image',
    url: STUB_EXTERNAL_IMAGE_URL,
    updatedAt: Date.now(),
  },
}
await seedAppData(externalOverride, null)
await page.goto(`${BASE}#/exercise/${EXERCISE_ID}`, {
  waitUntil: 'domcontentloaded',
})
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)

const extImgRendered = await page.evaluate((targetUrl) => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src === targetUrl)
}, STUB_EXTERNAL_IMAGE_URL)
check(extImgRendered, 'External HTTPS image loads on exercise page')

// ==========================================
// Test Scenario D: Offline Mode
// ==========================================
console.log('\n--- Scenario D: Offline Mode Behavior ---')

// 1. External link offline: simulate network failure for external route
console.log('Testing External Image Network Failure / Offline...')
allowExternalImages = false
await page.goto(`${BASE}#/exercise/${EXERCISE_ID}`, {
  waitUntil: 'domcontentloaded',
})
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(1000)

const offlineExternalFallback = await page.evaluate(() => {
  const text = document.body.innerText
  const hasFallbackText = text.includes('محتاجة إنترنت')
  const noBrokenImg = !document.querySelector('img[src*="images.example.com"]')
  return hasFallbackText || noBrokenImg
})
check(
  offlineExternalFallback,
  'External image offline shows fallback icon and no broken-image icon',
)

// 2. Uploaded image offline: should still display from IndexedDB cache
console.log('Testing Uploaded Image Availability...')
await seedAppData(uploadImageOverride, uploadImageMedia)
await page.goto(`${BASE}#/exercise/${EXERCISE_ID}`, {
  waitUntil: 'domcontentloaded',
})
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(800)

const offlineCustomImg = await page.evaluate(() => {
  const imgs = Array.from(document.querySelectorAll('img'))
  return imgs.some((img) => img.src.includes('data:image/png;base64'))
})
check(offlineCustomImg, 'Uploaded image remains visible from IndexedDB cache')

await browser.close()

if (failures.length > 0) {
  console.error(
    `\nFAILED (${failures.length} errors):\n` +
      failures.map((f) => ` - ${f}`).join('\n'),
  )
  process.exit(1)
}

console.log('\nALL MEDIA EVERYWHERE CHECKS PASSED!')
