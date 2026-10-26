/**
 * qa/reset-flow.mjs — Acceptance test for Task H2.4: Reset with keep-edits option.
 *
 * Drives the production build through Playwright:
 * 1. Seeds synthetic persona profile, 2-day workout program, and exercise edits (video link + custom image on 'deadhang').
 * 2. Asserts initial overrides exist in localStorage and IndexedDB (maganis_kv & maganis_media).
 * 3. Tests Choice 1: "احتفظ بتعديلات التمارين" (keep-edits) -> types "حذف" -> confirms.
 *    Verifies profile & program are cleared, but exercise edits & media survive in localStorage and IndexedDB.
 * 4. Tests Choice 2: "امسح كل حاجة" (delete-all) -> types "حذف" -> confirms.
 *    Verifies EVERYTHING is wiped: localStorage keys, IndexedDB maganis_kv, maganis_media.
 *
 * Usage:  BASE=http://localhost:5194/maganis-app/ node qa/reset-flow.mjs
 */

import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:5194/maganis-app/'

const persona = JSON.parse(
  fs.readFileSync(
    new URL('../fixtures/persona.synthetic.json', import.meta.url),
    'utf8',
  ),
)
const profileValue = persona.profile || persona

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
  serviceWorkers: 'block',
})

const page = await ctx.newPage()

// 1. Seed persona profile and overrides
console.log(
  '\n--- Step 1: Seeding app with video link and custom media on deadhang ---',
)

await page.goto(`${BASE}#/`, { waitUntil: 'domcontentloaded' })
await page.evaluate(
  async ({ p }) => {
    localStorage.setItem('maganis:profile.active', JSON.stringify(p))

    // Seed a 2-day workout program with deadhang
    const program = {
      id: 'prog-h2',
      title: 'برنامج تجريبي',
      days: [
        {
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'سحب',
          exercises: [
            { exerciseId: 'deadhang', sets: 3, reps: 30, restSeconds: 60 },
            { exerciseId: 'bench', sets: 3, reps: 10, restSeconds: 90 },
          ],
        },
        {
          dayIndex: 1,
          labelAr: 'اليوم الثاني',
          focus: 'دفع',
          exercises: [
            { exerciseId: 'bench', sets: 3, reps: 10, restSeconds: 90 },
          ],
        },
      ],
    }
    localStorage.setItem('maganis:workout.program', JSON.stringify(program))

    // Seed override with video and media
    const override = {
      exerciseId: 'deadhang',
      nameAr: 'تعلق حر معدل',
      videoUrl: 'https://youtu.be/dQw4w9WgXcQ',
      imageMode: 'custom',
      media: {
        kind: 'upload-image',
        blobKey: 'deadhang',
        updatedAt: Date.now(),
      },
    }
    const overridesMap = { deadhang: override }
    localStorage.setItem(
      'maganis:exercise_overrides',
      JSON.stringify(overridesMap),
    )

    // Seed IndexedDB maganis_kv and maganis_media
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
        const tx = db.transaction(['maganis_kv', 'maganis_media'], 'readwrite')
        tx.objectStore('maganis_kv').put(overridesMap, 'exercise_overrides')
        tx.objectStore('maganis_media').put(
          {
            dataUrl:
              'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
          },
          'deadhang',
        )
        tx.oncomplete = () => {
          db.close()
          resolve()
        }
      }
    })
  },
  { p: profileValue },
)

await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)

// Verify seeded state in storage
const initialKeys = await page.evaluate(async () => {
  const lsKeys = Object.keys(localStorage)
  const idbKv = await new Promise((resolve) => {
    const req = indexedDB.open('maganis_db', 2)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('maganis_kv', 'readonly')
      const getReq = tx.objectStore('maganis_kv').get('exercise_overrides')
      tx.oncomplete = () => {
        db.close()
        resolve(getReq.result || null)
      }
    }
    req.onerror = () => resolve(null)
  })
  const idbMedia = await new Promise((resolve) => {
    const req = indexedDB.open('maganis_db', 2)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('maganis_media', 'readonly')
      const getReq = tx.objectStore('maganis_media').get('deadhang')
      tx.oncomplete = () => {
        db.close()
        resolve(getReq.result || null)
      }
    }
    req.onerror = () => resolve(null)
  })
  return { lsKeys, idbKv, idbMedia }
})

check(
  Boolean(initialKeys.idbKv && initialKeys.idbKv.deadhang),
  'Initial IndexedDB maganis_kv contains deadhang override',
)
check(
  Boolean(initialKeys.idbMedia && initialKeys.idbMedia.dataUrl),
  'Initial IndexedDB maganis_media contains deadhang custom image',
)

// 2. Test Path 1: Reset with "احتفظ بتعديلات التمارين" (keep-edits)
console.log('\n--- Step 2: Testing Reset with "احتفظ بتعديلات التمارين" ---')
await page.goto(`${BASE}#/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(500)

// Click reset button in Settings
const resetTrigger = page.locator('[data-testid="btn-trigger-reset"]')
await resetTrigger.scrollIntoViewIfNeeded()
await resetTrigger.click()
await page.waitForTimeout(400)

// Verify ResetSheet options
const keepEditsOption = page.locator('[data-testid="reset-option-keep-edits"]')
const deleteAllOption = page.locator('[data-testid="reset-option-delete-all"]')
const confirmBtn = page.locator('[data-testid="btn-confirm-factory-reset"]')

check(
  (await keepEditsOption.count()) === 1,
  'ResetSheet has "احتفظ بتعديلات التمارين" option',
)
check(
  (await deleteAllOption.count()) === 1,
  'ResetSheet has "امسح كل حاجة" option',
)
check(
  await confirmBtn.isDisabled(),
  'Confirm button is initially disabled (no default selected)',
)

// Select keep-edits
await keepEditsOption.click()
check(
  await confirmBtn.isDisabled(),
  'Confirm button is still disabled before typing "حذف"',
)

// Type "حذف"
await page.locator('[data-testid="input-confirm-delete"]').fill('حذف')
check(
  !(await confirmBtn.isDisabled()),
  'Confirm button is enabled after selecting keep-edits and typing "حذف"',
)

// Take screenshot of Keep Edits choice
await page.screenshot({ path: 'evidence/h2/green/m3-keep-edits-sheet.png' })

// Click Confirm
await confirmBtn.click()
await page.waitForTimeout(1500)

// Verify storage after keep-edits reset
const postKeepState = await page.evaluate(async () => {
  const profile = localStorage.getItem('maganis:profile.active')
  const program = localStorage.getItem('maganis:workout.program')
  const overridesRaw = localStorage.getItem('maganis:exercise_overrides')
  const overrides = overridesRaw ? JSON.parse(overridesRaw) : null

  const idbKv = await new Promise((resolve) => {
    const req = indexedDB.open('maganis_db', 2)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('maganis_kv', 'readonly')
      const getReq = tx.objectStore('maganis_kv').get('exercise_overrides')
      tx.oncomplete = () => {
        db.close()
        resolve(getReq.result || null)
      }
    }
    req.onerror = () => resolve(null)
  })

  const idbMedia = await new Promise((resolve) => {
    const req = indexedDB.open('maganis_db', 2)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('maganis_media', 'readonly')
      const getReq = tx.objectStore('maganis_media').get('deadhang')
      tx.oncomplete = () => {
        db.close()
        resolve(getReq.result || null)
      }
    }
    req.onerror = () => resolve(null)
  })

  return { profile, program, overrides, idbKv, idbMedia }
})

check(!postKeepState.profile, 'Profile is deleted after keep-edits reset')
check(
  !postKeepState.program,
  'Workout program is deleted after keep-edits reset',
)
check(
  Boolean(postKeepState.overrides && postKeepState.overrides.deadhang),
  'localStorage exercise_overrides survives keep-edits reset',
)
check(
  Boolean(postKeepState.idbKv && postKeepState.idbKv.deadhang),
  'IndexedDB maganis_kv exercise_overrides survives keep-edits reset',
)
check(
  Boolean(postKeepState.idbMedia && postKeepState.idbMedia.dataUrl),
  'IndexedDB maganis_media deadhang image survives keep-edits reset',
)

// 3. Test Path 2: Reset with "امسح كل حاجة" (delete-all)
console.log('\n--- Step 3: Testing Reset with "امسح كل حاجة" ---')

// Seed profile back to access Settings
await page.evaluate(
  ({ p }) => {
    localStorage.setItem('maganis:profile.active', JSON.stringify(p))
  },
  { p: profileValue },
)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.goto(`${BASE}#/settings`, { waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)

const resetTrigger2 = page.locator('[data-testid="btn-trigger-reset"]')
await resetTrigger2.scrollIntoViewIfNeeded()
await resetTrigger2.click()
await page.waitForTimeout(400)

// Select delete-all
await page.locator('[data-testid="reset-option-delete-all"]').click()
await page.locator('[data-testid="input-confirm-delete"]').fill('حذف')

await page.screenshot({ path: 'evidence/h2/green/m3.png' })
await page.locator('[data-testid="btn-confirm-factory-reset"]').click()
await page.waitForTimeout(1500)

// Verify storage after delete-all reset
const postDeleteAllState = await page.evaluate(async () => {
  const profile = localStorage.getItem('maganis:profile.active')
  const overrides = localStorage.getItem('maganis:exercise_overrides')
  const lsKeys = Object.keys(localStorage)

  const idbKv = await new Promise((resolve) => {
    const req = indexedDB.open('maganis_db', 2)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('maganis_kv', 'readonly')
      const getReq = tx.objectStore('maganis_kv').get('exercise_overrides')
      tx.oncomplete = () => {
        db.close()
        resolve(getReq.result || null)
      }
    }
    req.onerror = () => resolve(null)
  })

  const idbMedia = await new Promise((resolve) => {
    const req = indexedDB.open('maganis_db', 2)
    req.onsuccess = () => {
      const db = req.result
      const tx = db.transaction('maganis_media', 'readonly')
      const getReq = tx.objectStore('maganis_media').get('deadhang')
      tx.oncomplete = () => {
        db.close()
        resolve(getReq.result || null)
      }
    }
    req.onerror = () => resolve(null)
  })

  return { profile, overrides, lsKeys, idbKv, idbMedia }
})

console.log('Post-delete-all localStorage keys:', postDeleteAllState.lsKeys)
check(!postDeleteAllState.profile, 'Profile is deleted after delete-all')
check(
  !postDeleteAllState.overrides,
  'Exercise overrides in localStorage are deleted after delete-all',
)
check(
  !postDeleteAllState.idbKv,
  'IndexedDB maganis_kv is cleared after delete-all',
)
check(
  !postDeleteAllState.idbMedia,
  'IndexedDB maganis_media is cleared after delete-all',
)

await browser.close()

if (failures.length > 0) {
  console.error(
    `\nFAILED (${failures.length} errors):\n` +
      failures.map((f) => ` - ${f}`).join('\n'),
  )
  process.exit(1)
}

console.log('\nALL RESET FLOW CHECKS PASSED!')
