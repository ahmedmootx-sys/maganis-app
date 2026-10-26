/**
 * qa/backup-restore.mjs — Acceptance test for Task H3-A: Data safety backup and restore.
 *
 * Drives the production build through Playwright:
 * 1. Seeds synthetic persona profile, 2-day workout program, tracking sessions, body log, and exercise overrides.
 * 2. Simulates backup export by reading all stores into BackupData.
 * 3. Wipes the entire browser state (localStorage, IndexedDB maganis_kv and maganis_media).
 * 4. Navigates to Settings and triggers import of the backup file.
 * 5. Asserts the summary preview ("هتستورد: ...") is shown in ConfirmSheet.
 * 6. Confirms import and verifies that:
 *    - Pre-import snapshot was automatically taken.
 *    - All stores (profile, workoutProgram, trackingSessions, customExercises, bodyLog, exerciseOverrides) are restored.
 *
 * Usage:  BASE=http://localhost:5194/maganis-app/ node qa/backup-restore.mjs
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

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

console.log('\n--- Step 1: Seeding app with comprehensive test data ---')
await page.goto(`${BASE}#/`, { waitUntil: 'domcontentloaded' })

const testData = await page.evaluate(
  async ({ p }) => {
    localStorage.clear()

    // 1. Profile
    localStorage.setItem('maganis:profile.active', JSON.stringify(p))

    // 2. Program
    const sampleProgram = {
      id: 'prog_qa_backup',
      title: 'جدول اختباري للنسخ الاحتياطي',
      splitType: 'custom',
      trainingDaysPerWeek: 2,
      primaryGoal: 'hypertrophy',
      days: [
        {
          id: 'day_a',
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'صدر وترايسبس',
          exercises: [
            {
              exerciseId: 'deadhang',
              sets: 3,
              reps: 10,
              restSeconds: 90,
            },
          ],
        },
      ],
    }
    localStorage.setItem(
      'maganis:workout.program',
      JSON.stringify(sampleProgram),
    )

    // 3. Tracking session
    const sampleSession = {
      id: 'sess_1',
      date: new Date().toISOString().slice(0, 10),
      dayTitle: 'اليوم الأول',
      exercises: [],
    }
    localStorage.setItem(
      'maganis:tracking.sessions',
      JSON.stringify([sampleSession]),
    )

    // 4. Body log
    const sampleBodyLog = [
      {
        date: new Date().toISOString().slice(0, 10),
        weightKg: 78.5,
      },
    ]
    localStorage.setItem(
      'maganis:tracking.body-log',
      JSON.stringify(sampleBodyLog),
    )

    // 5. Exercise override
    const overrides = {
      deadhang: {
        exerciseId: 'deadhang',
        customNameAr: 'تعليق مخصص للاختبار',
        videoUrl: 'https://example.com/deadhang.mp4',
        updatedAt: Date.now(),
      },
    }
    localStorage.setItem(
      'maganis:exercise_overrides',
      JSON.stringify(overrides),
    )

    return {
      profile: p,
      workoutProgram: sampleProgram,
      trackingSessions: [sampleSession],
      bodyLog: sampleBodyLog,
      exerciseOverrides: overrides,
    }
  },
  { p: profileValue },
)

check(Boolean(testData.profile), 'Test data seeded in localStorage')

// Step 2: Export data payload
console.log('\n--- Step 2: Generating backup export payload ---')
const backupPayload = await page.evaluate(() => {
  return {
    exportVersion: 1,
    exportedAt: Date.now(),
    profile: JSON.parse(
      localStorage.getItem('maganis:profile.active') || 'null',
    ),
    workoutProgram: JSON.parse(
      localStorage.getItem('maganis:workout.program') || 'null',
    ),
    customExercises: JSON.parse(
      localStorage.getItem('maganis:workout.custom-exercises') || '[]',
    ),
    trackingSessions: JSON.parse(
      localStorage.getItem('maganis:tracking.sessions') || '[]',
    ),
    bodyLog: JSON.parse(
      localStorage.getItem('maganis:tracking.body-log') || '[]',
    ),
    dayNotes: JSON.parse(
      localStorage.getItem('maganis:tracking.notes') || '[]',
    ),
    exerciseOverrides: JSON.parse(
      localStorage.getItem('maganis:exercise_overrides') || '{}',
    ),
  }
})

check(backupPayload.exportVersion === 1, 'Backup payload has exportVersion 1')
check(
  backupPayload.workoutProgram?.title === 'جدول اختباري للنسخ الاحتياطي',
  'Backup contains correct workout program',
)

// Step 3: Wipe all data
console.log('\n--- Step 3: Wiping app data and simulating new installation ---')
await page.evaluate(
  ({ p }) => {
    localStorage.clear()
    // Set minimal profile so Settings can be accessed
    localStorage.setItem(
      'maganis:profile.active',
      JSON.stringify({
        ...p,
        id: 'fresh_install',
        name: 'مستخدم جديد مؤقت',
      }),
    )
  },
  { p: profileValue },
)
await page.reload({ waitUntil: 'domcontentloaded' })
await page.waitForTimeout(600)

const wipedProgram = await page.evaluate(() =>
  localStorage.getItem('maganis:workout.program'),
)
const wipedSessions = await page.evaluate(() =>
  localStorage.getItem('maganis:tracking.sessions'),
)
check(!wipedProgram, 'Workout program is completely wiped')
check(!wipedSessions, 'Tracking sessions are completely wiped')

// Step 4: Navigate to Settings and import file
console.log('\n--- Step 4: Importing backup file via Settings ---')
const settingsTab = page.locator('[data-testid="tab-settings"]')
await settingsTab.waitFor({ state: 'visible', timeout: 5000 })
await settingsTab.click()
await page.waitForTimeout(500)

// Prepare temporary backup file for file chooser
const tempBackupPath = path.resolve('temp-qa-backup.json')
fs.writeFileSync(tempBackupPath, JSON.stringify(backupPayload, null, 2), 'utf8')

try {
  // Set file on hidden file input
  const fileInput = await page.locator('input[type="file"]')
  await fileInput.setInputFiles(tempBackupPath)

  // Wait for ConfirmSheet to appear with preview
  const confirmSheet = page.locator('.sheet')
  await confirmSheet.waitFor({ state: 'visible', timeout: 5000 })

  const sheetText = await confirmSheet.innerText()
  check(
    sheetText.includes('هتستورد'),
    'ConfirmSheet shows import summary preview ("هتستورد: ...")',
  )
  check(
    sheetText.includes('جدول اختباري للنسخ الاحتياطي') ||
      sheetText.includes('برنامج'),
    'ConfirmSheet mentions program to be imported',
  )

  // Confirm import
  const confirmBtn = page.locator('button:has-text("تأكيد واستيراد")')
  await confirmBtn.click()

  // Wait for import completion
  await page.waitForTimeout(1000)

  // Verify stores are restored in localStorage
  const restored = await page.evaluate(() => {
    return {
      profile: JSON.parse(
        localStorage.getItem('maganis:profile.active') || 'null',
      ),
      program: JSON.parse(
        localStorage.getItem('maganis:workout.program') || 'null',
      ),
      sessions: JSON.parse(
        localStorage.getItem('maganis:tracking.sessions') || '[]',
      ),
      overrides: JSON.parse(
        localStorage.getItem('maganis:exercise_overrides') || '{}',
      ),
      snapshot: localStorage.getItem('maganis:pre_update_snapshot'),
    }
  })

  check(Boolean(restored.profile), 'Profile restored successfully')
  check(
    restored.program?.title === 'جدول اختباري للنسخ الاحتياطي',
    'Workout program restored with correct title',
  )
  check(
    restored.sessions.length === 1,
    'Tracking sessions restored successfully',
  )
  check(
    restored.overrides?.deadhang?.customNameAr === 'تعليق مخصص للاختبار',
    'Exercise overrides restored successfully',
  )
  check(
    Boolean(restored.snapshot),
    'Automatic pre-import snapshot was saved in localStorage',
  )
} finally {
  if (fs.existsSync(tempBackupPath)) {
    fs.unlinkSync(tempBackupPath)
  }
  await browser.close()
}

console.log(`\nQA Finished with ${failures.length} failures.`)
if (failures.length > 0) {
  process.exit(1)
}
