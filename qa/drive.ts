/**
 * qa/drive.ts
 * Playwright state driver for MAGANIS Task G6-A.
 * Exposes openState(page, stateId, options) to drive the production build
 * (served through the service worker) to the exact states of defects D1 through D9.
 */

import type { Page } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

export interface DriveOptions {
  theme?: 'light' | 'dark'
  fontScale?: number
  baseUrl?: string
}

export async function initStorage(page: Page, options: DriveOptions = {}) {
  const theme = options.theme || 'light'
  const fontScale = options.fontScale || 1.0

  const ownerProfilePath = path.resolve(rootDir, 'docs/owner-profile-dump.json')
  let ownerProfile = null
  if (fs.existsSync(ownerProfilePath)) {
    const dump = JSON.parse(fs.readFileSync(ownerProfilePath, 'utf8'))
    ownerProfile = dump.profile || dump
  }

  // Load standard owner program with bench press on day 0
  const ownerProgram = {
    id: 'owner-prog-g6',
    name: 'جدول الكابتن أحمد — علوي وسفلي',
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: 4,
    splitType: 'upper_lower',
    days: [
      {
        dayIndex: 0,
        id: 'day-0',
        name: 'علوي (أ) — قوة وبناء',
        labelAr: 'السبت · علوي (أ) — قوة وبناء',
        focus: 'صدر · ظهر · كتف · بايسبس',
        focusAr: 'صدر · ظهر · كتف · بايسبس',
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
          {
            exerciseId: 'pullup',
            sets: 3,
            reps: 6,
            repsMin: 6,
            repsMax: 8,
            restSeconds: 90,
            section: 'primary',
          },
        ],
      },
      {
        dayIndex: 1,
        id: 'day-1',
        name: 'سفلي (أ) — أرجل وبطن',
        labelAr: 'الأحد · سفلي (أ) — أرجل وبطن',
        focus: 'أرجل · بطن',
        focusAr: 'أرجل · بطن',
        kind: 'strength',
        exercises: [
          {
            exerciseId: 'squat',
            sets: 3,
            reps: 8,
            repsMin: 8,
            repsMax: 8,
            restSeconds: 90,
            section: 'primary',
          },
        ],
      },
      {
        dayIndex: 2,
        id: 'day-2',
        name: 'كارديو خارجي',
        labelAr: 'الثلاثاء · كارديو خارجي',
        focus: 'لياقة وحرق دهون',
        focusAr: 'لياقة وحرق دهون',
        kind: 'cardio',
        cardio: {
          activity: 'run',
          plannedMinutes: 30,
          intensity: 'moderate',
        },
      },
    ],
  }

  await page.addInitScript(
    ({ profile, prog, t, fsScale }) => {
      if (profile) {
        localStorage.setItem('maganis:profile.active', JSON.stringify(profile))
      }
      if (prog) {
        localStorage.setItem('maganis:workout.program', JSON.stringify(prog))
      }
      localStorage.setItem('maganis:theme', t)
      document.documentElement.setAttribute('data-theme', t)
      document.body.setAttribute('data-theme', t)
      if (fsScale !== 1.0) {
        document.documentElement.style.fontSize = `${16 * fsScale}px`
      }
    },
    { profile: ownerProfile, prog: ownerProgram, t: theme, fsScale: fontScale },
  )
}

/**
 * Drives page to exact state for D1 through D9.
 */
export async function openState(
  page: Page,
  stateId: string,
  options: DriveOptions = {},
) {
  const baseUrl = options.baseUrl || 'http://localhost:5193/'
  await initStorage(page, options)

  switch (stateId) {
    case 'd1':
    case 'd1-library-overlap': {
      await page.goto(`${baseUrl}#/library`, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.exercise-library-content', { timeout: 10000 })
      await page.waitForTimeout(500)
      break
    }

    case 'd2':
    case 'd2-set-propagation': {
      await page.goto(`${baseUrl}#/training/day/0`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(400)

      // Click "ابدأ التمرين" on the day detail screen
      const startBtn = page.locator('button:has-text("ابدأ التمرين"), button:has-text("بدء التمرين"), button:has-text("بدء الجلسة")')
      await startBtn.first().click()

      await page.waitForSelector('.active-workout-session', { timeout: 10000 })
      await page.waitForTimeout(500)

      // Set 1: fill weight 15 and reps 8
      const firstRow = page.locator('tr.set-row').first()
      const firstInputs = firstRow.locator('input[type="number"]')
      if ((await firstInputs.count()) >= 2) {
        await firstInputs.nth(0).fill('15')
        await firstInputs.nth(1).fill('8')
      } else {
        const allNumInputs = page.locator('tr.set-row input')
        await allNumInputs.nth(0).fill('15')
        await allNumInputs.nth(1).fill('8')
      }

      // Tick set 1
      const firstCheckBtn = firstRow.locator('button.set-check-btn')
      await firstCheckBtn.click()
      await page.waitForTimeout(400)

      // Tick set 2 (which is empty) to trigger validation error
      const secondRow = page.locator('tr.set-row').nth(1)
      const secondCheckBtn = secondRow.locator('button.set-check-btn')
      await secondCheckBtn.click()
      await page.waitForTimeout(400)
      break
    }

    case 'd3':
    case 'd3-video-play': {
      await page.goto(`${baseUrl}#/training`, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => {
        localStorage.setItem(
          'maganis:exercise_overrides',
          JSON.stringify({
            bench: {
              exerciseId: 'bench',
              videoUrl: 'https://youtube.com/shorts/dQw4w9WgXcQ?feature=share',
              updatedAt: Date.now(),
            },
          }),
        )
      })

      await page.goto(`${baseUrl}#/exercise/bench`, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="video-facade"]', { timeout: 10000 })
      await page.waitForTimeout(400)

      // Tap play on the facade video card
      const playBtn = page.locator('[data-testid="play-facade-btn"]')
      await playBtn.click()
      await page.waitForTimeout(1000)
      break
    }

    case 'd4':
    case 'd4-raw-tokens': {
      await page.goto(`${baseUrl}#/exercise/bench`, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.exercise-route-page', { timeout: 10000 })
      await page.waitForTimeout(500)
      break
    }

    case 'd5':
    case 'd5-cardio-runner': {
      // Direct setup: persist running session in localStorage so CardioRunner opens in running state immediately
      await page.goto(`${baseUrl}#/training`, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => {
        const sessionData = {
          id: `cardio-${Date.now()}`,
          activityId: 'run',
          level: 'moderate',
          durationMinutes: 30,
          weightKg: 80,
          startTime: Date.now() - 30000,
          pausedTotalMs: 0,
          isPaused: false,
          pausedAt: null,
          estimate: {
            activityId: 'run',
            activityNameAr: 'جري خارجي',
            level: 'moderate',
            met: 8.3,
            compendiumCode: '12030',
            durationMinutes: 30,
            weightKg: 80,
            grossRateKcalPerMin: 11.62,
            netRateKcalPerMin: 10.22,
            grossSessionKcal: 349,
            netSessionKcal: 307,
            uiHintAr: 'جري متوسط',
          },
        }
        localStorage.setItem('maganis:cardio_session_running', JSON.stringify(sessionData))
      })

      // Go to day 2 (cardio day) and click start cardio session
      await page.goto(`${baseUrl}#/training/day/2`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(400)
      const startCardioBtn = page.locator('button:has-text("ابدأ جلسة الكارديو")')
      if ((await startCardioBtn.count()) > 0) {
        await startCardioBtn.first().click()
      }
      await page.waitForSelector('.cardio-runner-screen', { timeout: 10000 })
      await page.waitForTimeout(3500)
      break
    }

    case 'd6':
    case 'd6-edit-sheet': {
      await page.goto(`${baseUrl}#/exercise/bench`, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('[data-testid="edit-exercise-btn"]', { timeout: 10000 })
      await page.waitForTimeout(300)

      const editBtn = page.locator('[data-testid="edit-exercise-btn"]')
      await editBtn.first().click()
      await page.waitForSelector('[data-testid="exercise-edit-sheet-content"]', { timeout: 10000 })
      await page.waitForTimeout(500)
      break
    }

    case 'd7':
    case 'd7-contrast': {
      await page.goto(`${baseUrl}#/training/day/0`, { waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(400)
      const startBtn = page.locator('button:has-text("ابدأ التمرين"), button:has-text("بدء التمرين"), button:has-text("بدء الجلسة")')
      await startBtn.first().click()
      await page.waitForSelector('.active-workout-session', { timeout: 10000 })
      // Complete set 1 to trigger rest timer
      const firstRow = page.locator('tr.set-row').first()
      const firstInputs = firstRow.locator('input[type="number"]')
      await firstInputs.nth(0).fill('15')
      await firstInputs.nth(1).fill('8')
      const firstCheckBtn = firstRow.locator('button.set-check-btn')
      await firstCheckBtn.click()
      await page.waitForTimeout(500)
      break
    }

    case 'd8':
    case 'd8-training-day-titles': {
      await page.goto(`${baseUrl}#/training`, { waitUntil: 'domcontentloaded' })
      await page.evaluate(() => {
        const prog = JSON.parse(localStorage.getItem('maganis:workout.program') || '{}')
        if (prog && prog.days && prog.days[0]) {
          prog.days[0].labelAr = 'السبت · علوي (أ) — تركيز صدر وتراي وبنش ثقيل للمستوى المتقدم'
          prog.days[0].name = 'علوي (أ) — تركيز صدر وتراي وبنش ثقيل للمستوى المتقدم'
          localStorage.setItem('maganis:workout.program', JSON.stringify(prog))
        }
      })
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.training-screen', { timeout: 10000 })
      await page.waitForTimeout(500)
      break
    }

    case 'd9':
    case 'd9-exercise-page-header': {
      await page.goto(`${baseUrl}#/exercise/bench`, { waitUntil: 'domcontentloaded' })
      await page.waitForSelector('.exercise-route-page', { timeout: 10000 })
      await page.waitForTimeout(500)
      break
    }

    default: {
      // Fallback for route/sheet state id from states.ts
      await page.goto(`${baseUrl}#${stateId.startsWith('/') ? stateId : '/' + stateId}`, {
        waitUntil: 'domcontentloaded',
      })
      await page.waitForTimeout(500)
    }
  }
}
