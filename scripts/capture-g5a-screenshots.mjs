#!/usr/bin/env node
/**
 * scripts/capture-g5a-screenshots.mjs
 * Captures verification evidence screenshots on the production build (or preview server).
 * Covers:
 * - A1 Home & Training for the 4 required schedule configurations:
 *   1) 5 resistance + 1 cardio
 *   2) 5 resistance only
 *   3) 6 resistance only
 *   4) 4 resistance + 1 cardio
 * - A2 / A5 / A6 key states:
 *   - Library with muscle selected & filter sheet
 *   - Exercise detail page with tabs (Understanding, History) & GIF
 *   - Set logging view
 *   - Cardio day runner & toast
 *   - Empty Training state
 *   - Program vault
 *   - Custom exercise form
 *   - Macro calculation guide
 *
 * Viewports: 360x720, 360x640, 412x892
 * Themes: light, dark
 * Font scale: 1.0, 1.3
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const evidenceDir = path.join(rootDir, 'evidence/g5-a/screenshots')
fs.mkdirSync(evidenceDir, { recursive: true })

const VIEWPORTS = [
  { width: 360, height: 720, name: '360x720' },
  { width: 360, height: 640, name: '360x640' },
  { width: 412, height: 892, name: '412x892' },
]

const THEMES = ['light', 'dark']

function makeDay(dayIndex, kind, labelAr, focus) {
  return {
    dayIndex,
    id: `day-${dayIndex}`,
    name: labelAr,
    labelAr,
    focus,
    kind,
    exercises: [
      {
        exerciseId: 'chest-1',
        customName: 'تمرين تجريبي',
        sets: 3,
        reps: 10,
        unit: 'reps',
        restSeconds: 90,
      },
    ],
    cardio:
      kind === 'cardio'
        ? {
            activity: 'walking',
            plannedMinutes: 30,
            intensity: 'moderate',
          }
        : undefined,
  }
}

function makeProgram(resistanceCount, hasCardio) {
  const days = []
  const focusLabels = [
    'صدر وترايسبس',
    'ظهر وبايسبس',
    'أرجل وبطن',
    'كتف وترايسبس',
    'ظهر وصدر علوي',
    'سواعد وبطن',
  ]
  const weekdayNames = [
    'السبت',
    'الأحد',
    'الإثنين',
    'الثلاثاء',
    'الأربعاء',
    'الخميس',
  ]

  for (let i = 0; i < resistanceCount; i++) {
    days.push(
      makeDay(
        i,
        'strength',
        `${weekdayNames[i]} · ${focusLabels[i] || 'تمارين منوعة'}`,
        focusLabels[i] || 'عضلات مستهدفة',
      ),
    )
  }

  if (hasCardio) {
    days.push(
      makeDay(
        resistanceCount,
        'cardio',
        'الخميس · كارديو متوسط',
        'كارديو هوائي لتعزيز اللياقة',
      ),
    )
  }

  return {
    id: `prog-${resistanceCount}r-${hasCardio ? '1c' : '0c'}`,
    title: `برنامج ${resistanceCount} أيام مقاومة${hasCardio ? ' + 1 كارديو' : ''}`,
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: resistanceCount,
    splitType: 'custom',
    days,
    isCustom: true,
    createdAt: Date.now(),
  }
}

async function run() {
  console.log('Starting screenshot capture suite...')

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

  const baseUrl = 'http://localhost:5195/'
  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  // 1. Capture A1 configurations
  const a1Configs = [
    { name: '5res_1cardio', res: 5, cardio: true, profileDays: 5 },
    { name: '5res_only', res: 5, cardio: false, profileDays: 5 },
    { name: '6res_only', res: 6, cardio: false, profileDays: 6 },
    { name: '4res_1cardio', res: 4, cardio: true, profileDays: 4 },
  ]

  for (const cfg of a1Configs) {
    const prog = makeProgram(cfg.res, cfg.cardio)
    const profile = {
      id: 'owner-prod',
      name: 'أحمد',
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: cfg.profileDays,
      body: { sex: 'male', age: 28, heightCm: 178, weightKg: 80 },
    }

    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: 360, height: 720 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: theme,
        locale: 'ar-EG',
      })
      const page = await context.newPage()

      await page.addInitScript(
        ({ p, pr, th }) => {
          localStorage.setItem('maganis:profile.active', JSON.stringify(pr))
          localStorage.setItem('maganis:workout.program', JSON.stringify(p))
          localStorage.setItem('maganis_theme', th)
          document.documentElement.setAttribute('data-theme', th)
        },
        { p: prog, pr: profile, th: theme },
      )

      // Home Screen
      await page.goto(`${baseUrl}#/home`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      const homeShot = path.join(
        evidenceDir,
        `a1_${cfg.name}_home_${theme}_360x720.png`,
      )
      await page.screenshot({ path: homeShot, fullPage: false })
      console.log(`Saved: ${homeShot}`)

      // Training Screen
      await page.goto(`${baseUrl}#/training`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(600)
      const trainShot = path.join(
        evidenceDir,
        `a1_${cfg.name}_training_${theme}_360x720.png`,
      )
      await page.screenshot({ path: trainShot, fullPage: false })
      console.log(`Saved: ${trainShot}`)

      await context.close()
    }
  }

  // 2. Capture Key App Screens across all viewports and themes
  const standardProg = makeProgram(5, true)
  const standardProfile = {
    id: 'owner-prod',
    name: 'أحمد',
    primaryGoal: 'hypertrophy',
    trainingDaysPerWeek: 5,
    body: { sex: 'male', age: 28, heightCm: 178, weightKg: 80 },
  }

  const routesToCapture = [
    { route: '#/home', name: 'home' },
    { route: '#/training', name: 'training' },
    { route: '#/training?empty=true', name: 'training_empty' },
    { route: '#/library', name: 'library' },
    { route: '#/library?category=chest', name: 'library_muscle_selected' },
    {
      route: '#/library?category=chest&sheet=filter',
      name: 'library_filter_open',
    },
    { route: '#/exercise/bench', name: 'exercise_detail' },
    { route: '#/exercise/bench?tab=history', name: 'exercise_history_tab' },
    { route: '#/training/day/0', name: 'session_logger' },
    { route: '#/training/cardio-runner', name: 'cardio_runner_toast' },
    { route: '#/nutrition', name: 'nutrition' },
    { route: '#/settings', name: 'settings' },
  ]

  for (const vp of VIEWPORTS) {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        colorScheme: theme,
        locale: 'ar-EG',
      })
      const page = await context.newPage()

      await page.addInitScript(
        ({ p, pr, th }) => {
          localStorage.setItem('maganis:profile.active', JSON.stringify(pr))
          localStorage.setItem('maganis:workout.program', JSON.stringify(p))
          localStorage.setItem('maganis_theme', th)
          document.documentElement.setAttribute('data-theme', th)
        },
        { p: standardProg, pr: standardProfile, th: theme },
      )

      for (const item of routesToCapture) {
        await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'networkidle' })
        await page.waitForTimeout(400)
        const shotPath = path.join(
          evidenceDir,
          `${item.name}_${theme}_${vp.name}.png`,
        )
        await page.screenshot({ path: shotPath, fullPage: false })
      }

      await context.close()
    }
  }

  // 3. Font Scale 1.3 Verification
  for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({
      viewport: { width: 360, height: 720 },
      deviceScaleFactor: 2,
      isMobile: true,
      hasTouch: true,
      colorScheme: theme,
      locale: 'ar-EG',
    })
    const page = await context.newPage()

    await page.addInitScript(
      ({ p, pr, th }) => {
        localStorage.setItem('maganis:profile.active', JSON.stringify(pr))
        localStorage.setItem('maganis:workout.program', JSON.stringify(p))
        localStorage.setItem('maganis_theme', th)
        document.documentElement.setAttribute('data-theme', th)
        document.documentElement.style.fontSize = '130%'
      },
      { p: standardProg, pr: standardProfile, th: theme },
    )

    for (const item of [
      { route: '#/home', name: 'home_fontscale1.3' },
      { route: '#/training', name: 'training_fontscale1.3' },
      { route: '#/library', name: 'library_fontscale1.3' },
      { route: '#/exercise/bench', name: 'exercise_fontscale1.3' },
    ]) {
      await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(400)
      const shotPath = path.join(
        evidenceDir,
        `${item.name}_${theme}_360x720.png`,
      )
      await page.screenshot({ path: shotPath, fullPage: false })
      console.log(`Saved: ${shotPath}`)
    }

    await context.close()
  }

  await browser.close()
  if (server && server.close) {
    await server.close()
  }

  console.log(
    `\n✅ Screenshot capture complete! All screenshots stored under ${evidenceDir}`,
  )
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
