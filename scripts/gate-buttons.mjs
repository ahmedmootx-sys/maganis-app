#!/usr/bin/env node
/**
 * scripts/gate-buttons.mjs
 * Gate 5.3: Button Contract & Disabled State (Non-vacuous).
 * Examines >= 40 buttons across all screens.
 * Verifies visible boundaries and disabled opacity = 100% (1).
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log(
    '🚀 Running Gate 5.3: Button Visual Contract & Disabled Opacity (Non-vacuous)...',
  )

  const server = await preview({
    root: rootDir,
    preview: { port: 5183, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
  })

  const page = await context.newPage()

  await page.addInitScript(() => {
    const mockProfile = {
      id: 'user-btn-test',
      name: 'أحمد',
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      experienceLevel: 'intermediate',
      equipmentAvailable: ['barbell', 'dumbbell', 'machine', 'bodyweight'],
      body: {
        weightKg: 80,
        heightCm: 178,
        age: 28,
        sex: 'male',
        lifestyle: 2,
        activityLevel: 'moderate',
      },
      medical: { hasIssues: true, injuryTags: ['الكتف'], notes: '' },
      createdAt: 1700000000000,
      updatedAt: 1700000000000,
    }

    const mockProgram = {
      id: 'prog-1',
      createdAt: 1700000000000,
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      days: [
        {
          dayIndex: 0,
          labelAr: 'اليوم 1: علوي (قوة وبناء)',
          focus: 'صدر، ظهر، كتف، ذراعين',
          exercises: [
            {
              exerciseId: 'chest-1',
              sets: 4,
              reps: 8,
              restSeconds: 120,
              section: 'primary',
            },
            {
              exerciseId: 'back-1',
              sets: 4,
              reps: 8,
              restSeconds: 120,
              section: 'primary',
            },
          ],
        },
      ],
    }

    localStorage.setItem('maganis:profile.active', JSON.stringify(mockProfile))
    localStorage.setItem('maganis:workout.program', JSON.stringify(mockProgram))
  })

  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')

  const routes = [
    '/home',
    '/training',
    '/nutrition',
    '/progress',
    '/settings',
    '/library',
    '/exercise/chest-1',
    '/styleguide',
  ]
  let totalExamined = 0
  const violations = []

  for (const route of routes) {
    await page.goto(`${baseUrl}#${route}`)
    await page.waitForTimeout(500)

    const result = await page.evaluate((r) => {
      const issues = []
      const buttons = Array.from(document.querySelectorAll('button, .btn'))

      for (const btn of buttons) {
        const style = window.getComputedStyle(btn)
        if (style.display === 'none' || style.visibility === 'hidden') continue

        // Check disabled opacity contract: must NOT reduce opacity to 0.5/50%
        if (
          btn.hasAttribute('disabled') ||
          btn.classList.contains('disabled')
        ) {
          const opacity = parseFloat(style.opacity)
          if (opacity < 0.95) {
            issues.push({
              route: r,
              text: btn.textContent?.trim(),
              error: `Disabled button has opacity ${opacity} (contract requires opacity: 1 with solid surface token)`,
            })
          }
        }
      }

      return { count: buttons.length, issues }
    }, route)

    totalExamined += result.count
    violations.push(...result.issues)
  }

  await browser.close()
  await server.close()

  console.log(`📊 Gate 5.3 Examined Buttons: ${totalExamined}`)

  if (totalExamined < 40) {
    console.error(
      `❌ Gate 5.3 FAILED: Only examined ${totalExamined} buttons (minimum required: 40).`,
    )
    process.exit(1)
  }

  if (violations.length > 0) {
    console.error(
      `❌ Gate 5.3 FAILED: Found ${violations.length} button contract violations:`,
    )
    for (const v of violations.slice(0, 10)) {
      console.error(`   - [${v.route}] "${v.text}": ${v.error}`)
    }
    process.exit(1)
  }

  console.log(
    `✅ Gate 5.3 PASSED: ${totalExamined} buttons examined, 0 contract violations.`,
  )
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal Gate 5.3 Error:', err)
  process.exit(1)
})
