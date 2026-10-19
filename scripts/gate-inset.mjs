#!/usr/bin/env node
/**
 * scripts/gate-inset.mjs
 * Gate 5.1: Non-vacuous layout insets verification.
 * Examines >= 200 elements across all screens.
 * Fails if any element inside scrollable content has edge distance < 12px.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log(
    '🚀 Running Gate 5.1: Layout Insets Verification (Non-vacuous)...',
  )

  const server = await preview({
    root: rootDir,
    preview: { port: 5181, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
    userAgent:
      'Mozilla/5.0 (Linux; Android 14; Mobile) AppleWebKit/537.36 Chrome/124.0.0.0 Mobile Safari/537.36',
  })

  const page = await context.newPage()

  // Initialize mock profile and workout program
  await page.addInitScript(() => {
    const mockProfile = {
      id: 'user-gate-test',
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
  ]
  let totalExamined = 0
  const violations = []

  for (const route of routes) {
    await page.goto(`${baseUrl}#${route}`)
    await page.waitForTimeout(500)

    const screenData = await page.evaluate((r) => {
      const examined = []
      const issues = []

      // Find content container elements (cards, sections, list rows, callouts, stats, etc.)
      const elements = Array.from(
        document.querySelectorAll(
          '.screen-content > *, .card, .section, .callout, .stat, .list-row, .field, h1, h2, h3, h4, p, .btn, .chip, .choice-btn, label, input, .form-control, .segmented-item',
        ),
      )

      for (const el of elements) {
        // Skip hidden or zero-size elements
        const rect = el.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) continue

        // Skip fixed topbar, bottomnav, modals overlay
        const style = window.getComputedStyle(el)
        if (style.position === 'fixed' || style.display === 'none') continue

        // Ignore horizontal carousel tracks or items designed to scroll off-screen
        if (
          el.closest('.week-strip') ||
          el.closest('.day-strip') ||
          el.closest('.overflow-x-auto') ||
          style.overflowX === 'auto'
        ) {
          continue
        }

        examined.push(1)

        // Check distance from left and right screen boundaries
        const leftDist = rect.left
        const rightDist = 360 - rect.right

        // If element is a full-width container itself, its padding must be >= 12px
        const isContainer =
          el.classList.contains('screen-content') ||
          el.classList.contains('screen-container')
        if (isContainer) {
          const pLeft = parseFloat(style.paddingLeft) || 0
          const pRight = parseFloat(style.paddingRight) || 0
          if (pLeft < 12 || pRight < 12) {
            issues.push({
              route: r,
              tag: el.tagName,
              cls: el.className,
              error: `Container padding too small: left=${pLeft}px, right=${pRight}px (min 12px)`,
            })
          }
        } else {
          // Inner child element: must not touch edge (< 12px) unless explicitly full-bleed
          if (leftDist < 12 && !el.classList.contains('full-bleed')) {
            issues.push({
              route: r,
              tag: el.tagName,
              cls: el.className,
              error: `Element touches left edge (${leftDist.toFixed(1)}px < 12px)`,
            })
          }
          if (rightDist < 12 && !el.classList.contains('full-bleed')) {
            issues.push({
              route: r,
              tag: el.tagName,
              cls: el.className,
              error: `Element touches right edge (${rightDist.toFixed(1)}px < 12px)`,
            })
          }
        }
      }

      return { examinedCount: examined.length, issues }
    }, route)

    totalExamined += screenData.examinedCount
    violations.push(...screenData.issues)
  }

  await browser.close()
  await server.close()

  console.log(`📊 Gate 5.1 Examined Elements: ${totalExamined}`)

  // Non-vacuous check: MUST examine >= 200 elements
  if (totalExamined < 200) {
    console.error(
      `❌ Gate 5.1 FAILED: Only examined ${totalExamined} elements (minimum required: 200).`,
    )
    process.exit(1)
  }

  if (violations.length > 0) {
    console.error(
      `❌ Gate 5.1 FAILED: Found ${violations.length} inset violations:`,
    )
    for (const v of violations.slice(0, 10)) {
      console.error(`   - [${v.route}] <${v.tag} class="${v.cls}">: ${v.error}`)
    }
    process.exit(1)
  }

  console.log(
    `✅ Gate 5.1 PASSED: ${totalExamined} elements examined, 0 inset violations.`,
  )
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal Gate 5.1 Error:', err)
  process.exit(1)
})
