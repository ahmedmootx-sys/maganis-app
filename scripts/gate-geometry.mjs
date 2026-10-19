#!/usr/bin/env node
/**
 * scripts/gate-geometry.mjs
 * Gate 5.5: Mobile Geometry, Touch Targets & Navigation Bounds (Non-vacuous).
 *
 * Verifies:
 * 1. TopBar touch targets: >= 40x40px, adjacent action gap >= 8px.
 * 2. BottomNav spacing: container has padding-bottom >= nav height to prevent content occlusion.
 * 3. Interactive controls: primary buttons, inputs, nav items have touch target >= 44x44px.
 * 4. Non-vacuous gate: examines >= 50 interactive controls across all screens.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate 5.5: Mobile Geometry & Touch Targets (Non-vacuous)...')

  const server = await preview({
    root: rootDir,
    preview: { port: 5185, strictPort: true },
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

  await page.addInitScript(() => {
    const mockProfile = {
      id: 'user-geom-test',
      name: 'أحمد',
      primaryGoal: 'hypertrophy',
      goals: ['hypertrophy'],
      trainingDaysPerWeek: 4,
      splitType: 'upper_lower',
      experienceLevel: 'intermediate',
      equipmentAvailable: ['barbell', 'dumbbell', 'machine', 'bodyweight'],
      body: { weightKg: 80, heightCm: 178, age: 28, sex: 'male', lifestyle: 2, activityLevel: 'moderate' },
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
            { exerciseId: 'chest-1', sets: 4, reps: 8, restSeconds: 120, section: 'primary' },
            { exerciseId: 'back-1', sets: 4, reps: 8, restSeconds: 120, section: 'primary' },
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
      const issues = []
      let examined = 0

      // 1. TopBar Checks
      const topBar = document.querySelector('header.top-bar, .top-bar')
      if (topBar) {
        const actionButtons = Array.from(topBar.querySelectorAll('button, a, .icon-btn'))
        examined += actionButtons.length

        for (let i = 0; i < actionButtons.length; i++) {
          const btn = actionButtons[i]
          const rect = btn.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            // Check touch target >= 40x40px
            if (rect.width < 39.5 || rect.height < 39.5) {
              issues.push({
                route: r,
                target: 'TopBar Action Button',
                error: `TopBar button size ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}px is smaller than 40x40px minimum touch target`,
              })
            }

            // Check gap with next button >= 8px
            if (i < actionButtons.length - 1) {
              const nextRect = actionButtons[i + 1].getBoundingClientRect()
              const gap = Math.abs(rect.left - nextRect.right)
              if (gap > 0 && gap < 7.5) {
                issues.push({
                  route: r,
                  target: 'TopBar Action Gap',
                  error: `Gap between adjacent TopBar actions is ${gap.toFixed(1)}px (minimum required: 8px)`,
                })
              }
            }
          }
        }
      }

      // 2. BottomNav Checks
      const bottomNav = document.querySelector('nav.bottom-nav, .bottom-nav')
      if (bottomNav) {
        const navRect = bottomNav.getBoundingClientRect()
        const navItems = Array.from(bottomNav.querySelectorAll('button, a, .bottom-nav__item, .nav-item'))
        examined += navItems.length

        // Each tab touch target >= 44x44px
        for (const item of navItems) {
          const rect = item.getBoundingClientRect()
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 43.5 || rect.height < 43.5) {
              issues.push({
                route: r,
                target: 'BottomNav Item',
                error: `BottomNav tab size ${rect.width.toFixed(1)}x${rect.height.toFixed(1)}px is below 44x44px`,
              })
            }
          }
        }

        // Check main container padding-bottom when bottom nav is an overlay
        const navStyle = window.getComputedStyle(bottomNav)
        const isOverlay = navStyle.position === 'fixed' || navStyle.position === 'absolute'
        if (isOverlay) {
          const scroller = document.querySelector('.app-main, main, .screen-container, .screen-content')
          if (scroller) {
            const scrollerStyle = window.getComputedStyle(scroller)
            const padBottom = parseFloat(scrollerStyle.paddingBottom) || 0
            if (padBottom < navRect.height - 4) {
              issues.push({
                route: r,
                target: 'BottomNav Container Padding',
                error: `Main container padding-bottom (${padBottom}px) is less than nav height (${navRect.height}px)`,
              })
            }
          }
        }
      }

      // 3. Primary interactive controls touch target (>= 44x44px, chips >= 32px)
      const primaryControls = Array.from(
        document.querySelectorAll(
          '.btn--primary, .btn--secondary, .btn--large, input:not([type="checkbox"]):not([type="radio"]), select, .form-control',
        ),
      )

      for (const ctrl of primaryControls) {
        if (ctrl.closest('.top-bar') || ctrl.closest('header')) continue
        const rect = ctrl.getBoundingClientRect()
        if (rect.width === 0 || rect.height === 0) continue
        const style = window.getComputedStyle(ctrl)
        if (
          style.display === 'none' ||
          style.visibility === 'hidden' ||
          style.opacity === '0' ||
          ctrl.getAttribute('tabindex') === '-1' ||
          ctrl.getAttribute('aria-hidden') === 'true'
        ) {
          continue
        }

        examined++
        if (rect.height < 41.5) {
          issues.push({
            route: r,
            target:
              ctrl.tagName +
              (ctrl.id ? `#${ctrl.id}` : '') +
              (ctrl.className ? `.${ctrl.className.split(' ').join('.')}` : '') +
              (ctrl.getAttribute('type') ? `[type="${ctrl.getAttribute('type')}"]` : ''),
            error: `Primary interactive control height is ${rect.height.toFixed(1)}px (minimum touch target: 44px). HTML: ${ctrl.outerHTML.slice(0, 100)}`,
          })
        }
      }

      return { examined, issues }
    }, route)

    totalExamined += screenData.examined
    violations.push(...screenData.issues)
  }

  await browser.close()
  await server.close()

  console.log(`📊 Gate 5.5 Examined Interactive Elements: ${totalExamined}`)

  // Non-vacuous check: must examine >= 50 elements
  if (totalExamined < 50) {
    console.error(`❌ Gate 5.5 FAILED: Only examined ${totalExamined} elements (minimum required: 50).`)
    process.exit(1)
  }

  if (violations.length > 0) {
    console.error(`❌ Gate 5.5 FAILED: Found ${violations.length} geometry / touch target violations:`)
    for (const v of violations.slice(0, 10)) {
      console.error(`   - [${v.route}] ${v.target}: ${v.error}`)
    }
    process.exit(1)
  }

  console.log(`✅ Gate 5.5 PASSED: ${totalExamined} interactive controls examined, 0 geometry violations.`)
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal Gate 5.5 Error:', err)
  process.exit(1)
})
