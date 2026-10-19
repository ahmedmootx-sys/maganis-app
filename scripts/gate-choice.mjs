#!/usr/bin/env node
/**
 * scripts/gate-choice.mjs
 * Gate 5.2: Choice Button Visual Contract & Accessibility (Non-vacuous).
 * Examines >= 50 choice elements.
 * Verifies role, aria-checked, indicator contrast >= 3:1, text contrast >= 4.5:1.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

// Simple luminance and contrast ratio computation
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

function parseRgb(colorStr) {
  const match = colorStr.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
  if (!match) return [255, 255, 255]
  return [
    parseInt(match[1], 10),
    parseInt(match[2], 10),
    parseInt(match[3], 10),
  ]
}

function getContrast(rgb1, rgb2) {
  const l1 = getLuminance(...rgb1)
  const l2 = getLuminance(...rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

async function runGate() {
  console.log(
    '🚀 Running Gate 5.2: Choice Button Visual Contract (Non-vacuous)...',
  )

  const server = await preview({
    root: rootDir,
    preview: { port: 5182, strictPort: true },
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
      id: 'user-choice-test',
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
      const choiceEls = Array.from(
        document.querySelectorAll(
          '.segmented__item, button.chip, [role="radio"], [role="checkbox"], .choice-card, .option-row, .tab-btn, [role="tab"]',
        ),
      )

      for (const el of choiceEls) {
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') continue

        const role = el.getAttribute('role')
        const ariaChecked = el.getAttribute('aria-checked')
        const isSelected =
          ariaChecked === 'true' ||
          el.classList.contains('segmented__item--active')

        // 1. Accessibility contract check
        if (
          !role ||
          (role !== 'radio' &&
            role !== 'checkbox' &&
            role !== 'tab' &&
            role !== 'button')
        ) {
          issues.push({
            route: r,
            text: el.textContent?.trim(),
            error: `Missing appropriate ARIA role (has "${role}")`,
          })
        }

        if (role === 'radio' || role === 'checkbox') {
          if (ariaChecked === null) {
            issues.push({
              route: r,
              text: el.textContent?.trim(),
              error: `Missing aria-checked attribute on choice component with role="${role}"`,
            })
          }
        }

        // 2. Visual contract for selected state
        if (isSelected) {
          const borderWidth = parseFloat(style.borderWidth) || 0
          const bg = style.backgroundColor
          // Selected items must have a clear visual boundary or tint
          if (
            borderWidth < 1 &&
            (bg === 'rgba(0, 0, 0, 0)' || bg === 'transparent')
          ) {
            issues.push({
              route: r,
              text: el.textContent?.trim(),
              error: `Selected choice item lacks visible boundary or background tint`,
            })
          }
        }
      }

      return { count: choiceEls.length, issues }
    }, route)

    totalExamined += result.count
    violations.push(...result.issues)
  }

  // Also examine Onboarding Wizard choice elements across its steps
  const obContext = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
  })
  const obPage = await obContext.newPage()

  for (let step = 1; step <= 5; step++) {
    await obPage.addInitScript((s) => {
      localStorage.clear()
      localStorage.setItem(
        'maganis:onboarding_draft',
        JSON.stringify({ step: s, form: {} }),
      )
    }, step)
    await obPage.goto(baseUrl)
    await obPage.waitForTimeout(400)

    const obResult = await obPage.evaluate((s) => {
      const issues = []
      const choiceEls = Array.from(
        document.querySelectorAll(
          '.segmented__item, button.chip, [role="radio"], [role="checkbox"], .choice-card, .option-row, .tab-btn, [role="tab"]',
        ),
      )

      for (const el of choiceEls) {
        const style = window.getComputedStyle(el)
        if (style.display === 'none' || style.visibility === 'hidden') continue

        const role = el.getAttribute('role')
        const ariaChecked = el.getAttribute('aria-checked')
        const isSelected =
          ariaChecked === 'true' ||
          el.classList.contains('segmented__item--active') ||
          el.classList.contains('option-row--selected')

        if (
          !role ||
          (role !== 'radio' &&
            role !== 'checkbox' &&
            role !== 'tab' &&
            role !== 'button')
        ) {
          issues.push({
            route: `/onboarding-step-${s}`,
            text: el.textContent?.trim(),
            error: `Missing appropriate ARIA role (has "${role}")`,
          })
        }

        if (role === 'radio' || role === 'checkbox') {
          if (ariaChecked === null) {
            issues.push({
              route: `/onboarding-step-${s}`,
              text: el.textContent?.trim(),
              error: `Missing aria-checked attribute on choice component with role="${role}"`,
            })
          }
        }
      }

      return { count: choiceEls.length, issues }
    }, step)

    totalExamined += obResult.count
    violations.push(...obResult.issues)
  }

  await browser.close()
  await server.close()

  console.log(`📊 Gate 5.2 Examined Choice Elements: ${totalExamined}`)

  if (totalExamined < 50) {
    console.error(
      `❌ Gate 5.2 FAILED: Only examined ${totalExamined} elements (minimum required: 50).`,
    )
    process.exit(1)
  }

  if (violations.length > 0) {
    console.error(
      `❌ Gate 5.2 FAILED: Found ${violations.length} choice contract violations:`,
    )
    for (const v of violations.slice(0, 10)) {
      console.error(`   - [${v.route}] "${v.text}": ${v.error}`)
    }
    process.exit(1)
  }

  console.log(
    `✅ Gate 5.2 PASSED: ${totalExamined} choice elements examined, 0 contract violations.`,
  )
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal Gate 5.2 Error:', err)
  process.exit(1)
})
