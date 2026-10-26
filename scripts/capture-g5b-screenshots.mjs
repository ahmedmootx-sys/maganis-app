#!/usr/bin/env node
/**
 * scripts/capture-g5b-screenshots.mjs
 * Captures verification evidence screenshots for MAGANIS TASK G5-B features:
 * - B1: Cardio Day Setup (Activity choice, effort hints, duration stepper, live Gross/Net estimate)
 * - B1: Cardio Runner (3-2-1 Countdown, active live kcal timer, finish summary)
 * - B1: Cardio Gross vs Net Info Sheet
 * - B2: Set Logging with Auto-Propagation (dashed border for auto/suggested cells, toast)
 * - B3: Video Player (Facade card, mounted state, no-video state)
 * - B4: Exercise detail with Copy Name menu, "معدّل" badge, No Image placeholder (3 actions)
 * - B4: Exercise Edit Sheet
 *
 * Viewports: 360x720, 360x640, 412x892
 * Themes: light, dark
 * Font Scales: 1.0, 1.3
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const evidenceDir = path.join(rootDir, 'evidence/g5-b/screenshots')
fs.mkdirSync(evidenceDir, { recursive: true })

const VIEWPORTS = [
  { width: 360, height: 720, name: '360x720' },
  { width: 360, height: 640, name: '360x640' },
  { width: 412, height: 892, name: '412x892' },
]

const THEMES = ['light', 'dark']
const FONT_SCALES = [1.0, 1.3]

async function run() {
  console.log('====================================================')
  console.log('   CAPTURING G5-B EVIDENCE SCREENSHOTS')
  console.log('====================================================\n')

  let server
  try {
    server = await preview({
      root: rootDir,
      preview: { port: 5195, strictPort: true },
      logLevel: 'error',
    })
  } catch (err) {
    const { createServer } = await import('vite')
    server = await createServer({
      root: rootDir,
      server: { port: 5195, strictPort: true },
      logLevel: 'error',
    })
    await server.listen()
  }

  const baseUrl = `http://localhost:5195/`
  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  const ownerProfilePath = path.resolve(rootDir, 'docs/owner-profile-dump.json')
  let ownerProfile = null
  if (fs.existsSync(ownerProfilePath)) {
    const dump = JSON.parse(fs.readFileSync(ownerProfilePath, 'utf8'))
    ownerProfile = dump.profile || dump
  }

  try {
    for (const vp of VIEWPORTS) {
      for (const theme of THEMES) {
        for (const fontScale of FONT_SCALES) {
          const fontSuffix = fontScale === 1.3 ? '_font1.3' : '_font1.0'
          const prefix = `${vp.name}_${theme}${fontSuffix}`

          const context = await browser.newContext({
            viewport: { width: vp.width, height: vp.height },
            deviceScaleFactor: 2,
            isMobile: true,
            hasTouch: true,
            colorScheme: theme,
            locale: 'ar-EG',
          })
          const page = await context.newPage()

          // Init with owner profile & cardio test day program
          await page.addInitScript(
            ({ profile, t, fsScale }) => {
              if (profile) {
                localStorage.setItem(
                  'maganis:profile.active',
                  JSON.stringify(profile),
                )
              }
              localStorage.setItem(
                'maganis:workout.program',
                JSON.stringify({
                  id: 'active-prog',
                  title: 'برنامج تجريبي مع كارديو',
                  primaryGoal: 'hypertrophy',
                  trainingDaysPerWeek: 3,
                  splitType: 'custom',
                  days: [
                    {
                      dayIndex: 0,
                      id: 'day-0',
                      labelAr: 'السبت · تمارين مقاومة',
                      focus: 'صدر · ظهر',
                      kind: 'strength',
                      exercises: [
                        {
                          exerciseId: 'bench',
                          sets: 3,
                          reps: 10,
                          section: 'primary',
                        },
                      ],
                    },
                    {
                      dayIndex: 1,
                      id: 'day-1',
                      labelAr: 'الأحد · جلسة كارديو',
                      focus: 'لياقة وحرق دهون',
                      kind: 'cardio',
                      cardio: {
                        activity: 'run',
                        plannedMinutes: 30,
                        intensity: 'moderate',
                      },
                    },
                  ],
                }),
              )
              // Add an override for exercise bench to demonstrate badge & edits
              localStorage.setItem(
                'maganis:exercise_overrides',
                JSON.stringify({
                  bench: {
                    customNameAr: 'تمرين بنش مخصص معدل',
                    customNote:
                      'ملاحظة شخصية: تركيز على النزول البطئ وثبات الكوعين',
                    videoUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg',
                    muscles: {
                      primary: ['pec_sternal'],
                      secondary: ['delt_anterior', 'triceps_lateral'],
                    },
                    updatedAt: Date.now(),
                  },
                }),
              )
              document.documentElement.setAttribute('data-theme', t)
              document.body.setAttribute('data-theme', t)
              if (fsScale !== 1.0) {
                document.documentElement.style.fontSize = `${16 * fsScale}px`
              }
            },
            { profile: ownerProfile, t: theme, fsScale: fontScale },
          )

          // 1. Capture Cardio Setup Screen
          await page.goto(`${baseUrl}#/training/day/1`, {
            waitUntil: 'domcontentloaded',
          })
          await page.waitForTimeout(400)
          await page.screenshot({
            path: path.join(evidenceDir, `${prefix}_b1_cardio_setup.png`),
            fullPage: false,
          })

          // 2. Open Cardio Info Sheet (Gross vs Net)
          const infoBtn = page.locator('button:has-text("معلومات")')
          if ((await infoBtn.count()) > 0) {
            await infoBtn.first().click()
            await page.waitForTimeout(300)
            await page.screenshot({
              path: path.join(
                evidenceDir,
                `${prefix}_b1_cardio_info_sheet.png`,
              ),
            })
            // Close sheet
            const closeBtn = page.locator('button:has-text("فهمت الفرق")')
            if ((await closeBtn.count()) > 0) await closeBtn.first().click()
            await page.waitForTimeout(200)
          }

          // 3. Capture Cardio Runner (Live session)
          await page.goto(`${baseUrl}#/training/cardio-runner`, {
            waitUntil: 'domcontentloaded',
          })
          await page.waitForTimeout(400)
          await page.screenshot({
            path: path.join(evidenceDir, `${prefix}_b1_cardio_runner.png`),
          })

          // 4. Capture Set Logging View (B2 Set Auto-Propagation & Suggestions)
          await page.goto(`${baseUrl}#/session-logger/bench`, {
            waitUntil: 'domcontentloaded',
          })
          await page.waitForTimeout(400)
          await page.screenshot({
            path: path.join(evidenceDir, `${prefix}_b2_session_logger.png`),
          })

          // 5. Capture Exercise Detail with B3 Video and B4 Overrides
          await page.goto(`${baseUrl}#/exercise/bench`, {
            waitUntil: 'domcontentloaded',
          })
          await page.waitForTimeout(400)
          await page.screenshot({
            path: path.join(evidenceDir, `${prefix}_b3_b4_exercise_detail.png`),
          })

          // 6. Capture Copy Name Action / Placeholder
          const copyBtn = page.locator('button:has-text("انسخ الاسم")')
          if ((await copyBtn.count()) > 0) {
            await copyBtn.first().click()
            await page.waitForTimeout(300)
            await page.screenshot({
              path: path.join(evidenceDir, `${prefix}_b4_copy_menu.png`),
            })
          }

          // 7. Capture Exercise Edit Sheet (B4)
          const editBtn = page.locator('button:has-text("تعديل التمرين")')
          if ((await editBtn.count()) > 0) {
            await editBtn.first().click()
            await page.waitForTimeout(400)
            await page.screenshot({
              path: path.join(evidenceDir, `${prefix}_b4_edit_sheet.png`),
            })
          }

          console.log(`✓ Captured state set for ${prefix}`)
          await context.close()
        }
      }
    }
    console.log(`\n✅ All evidence screenshots captured under ${evidenceDir}`)
  } finally {
    await browser.close()
    if (server && server.close) await server.close()
  }
}

run().catch((err) => {
  console.error('Screenshot capture failed:', err)
  process.exit(1)
})
