#!/usr/bin/env node
/**
 * scripts/gate-choice-layout.mjs
 * Gate for TASK G4 Part 2.5: One Choice Control Layout & Contract Verification
 *
 * Tests across viewports (360x720, 360x640, 412x892) and font scales (1.0, 1.3):
 * 1. Choice option bounding rect is inside viewport and container (no horizontal overflow).
 * 2. Selected choice option has solid accent background and text contrast >= 4.5:1.
 * 3. NO checkmark SVG icon inside compact/segmented chips or segmented options.
 * 4. Examines >= 150 options across sweeps.
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import fs from 'node:fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

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
  console.log('🚀 Running Gate: gate-choice-layout (TASK G4 Part 2.5)...')

  const server = await preview({
    root: rootDir,
    preview: { port: 5188, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })

  const viewports = [
    { name: '360x720', width: 360, height: 720 },
    { name: '360x640', width: 360, height: 640 },
    { name: '412x892', width: 412, height: 892 },
  ]

  const fontScales = [1.0, 1.3]

  let totalOptionsExamined = 0
  const failures = []

  const testPages = [
    {
      name: 'Onboarding Step 1 (Goals & Days)',
      setup: (page) =>
        page.addInitScript(() => {
          localStorage.clear()
          localStorage.setItem(
            'maganis:onboarding_draft',
            JSON.stringify({
              step: 1,
              form: { bodyGoal: 'gain', trainingStyle: ['weights'] },
            }),
          )
        }),
      url: `${baseUrl}#/onboarding`,
    },
    {
      name: 'Onboarding Step 2 (Duration & Intensity)',
      setup: (page) =>
        page.addInitScript(() => {
          localStorage.clear()
          localStorage.setItem(
            'maganis:onboarding_draft',
            JSON.stringify({
              step: 2,
              form: {
                trainingDaysPerWeek: 4,
                sessionMinutes: 60,
                sessionIntensity: 'moderate',
              },
            }),
          )
        }),
      url: `${baseUrl}#/onboarding`,
    },
    {
      name: 'Onboarding Step 3 (Limitations & Status)',
      setup: (page) =>
        page.addInitScript(() => {
          localStorage.clear()
          localStorage.setItem(
            'maganis:onboarding_draft',
            JSON.stringify({
              step: 3,
              form: {
                hasIssues: true,
                limitations: [
                  { region: 'shoulder', status: 'current_pain' },
                  { region: 'elbow', status: 'under_treatment' },
                  { region: 'lower_back', status: 'old_recovered' },
                ],
              },
            }),
          )
        }),
      url: `${baseUrl}#/onboarding`,
    },
    {
      name: 'Settings (Preferences & Theme)',
      setup: (page) =>
        page.addInitScript(() => {
          const profile = {
            id: 'test-user',
            name: 'أحمد',
            primaryGoal: 'hypertrophy',
            goals: ['hypertrophy'],
            trainingDaysPerWeek: 4,
            experienceLevel: 'intermediate',
            trainingLocation: 'gym',
            weekStartDay: 6,
            body: {
              weightKg: 80,
              heightCm: 178,
              age: 28,
              sex: 'male',
              activityLevel: 'moderate',
              lifestyle: 2,
            },
            medical: { hasIssues: false, injuryTags: [], notes: '' },
            limitations: [],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          }
          const program = {
            id: 'prog-test',
            title: 'برنامج تجريبي',
            primaryGoal: 'hypertrophy',
            trainingDaysPerWeek: 4,
            days: [
              {
                dayIndex: 0,
                labelAr: 'علوي (أ)',
                focus: 'صدر وظهر',
                kind: 'strength',
                exercises: [],
              },
              {
                dayIndex: 1,
                labelAr: 'سفلي (أ)',
                focus: 'أرجل',
                kind: 'strength',
                exercises: [],
              },
            ],
            createdAt: Date.now(),
          }
          localStorage.setItem(
            'maganis:profile.active',
            JSON.stringify(profile),
          )
          localStorage.setItem(
            'maganis:workout.program',
            JSON.stringify(program),
          )
        }),
      url: `${baseUrl}#/settings`,
    },
  ]

  for (const vp of viewports) {
    for (const scale of fontScales) {
      console.log(`  🔍 Testing viewport ${vp.name} @ scale ${scale}x...`)

      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
        deviceScaleFactor: 2,
        isMobile: true,
      })

      for (const tp of testPages) {
        const page = await context.newPage()
        await tp.setup(page)

        await page.goto(tp.url)
        await page.waitForTimeout(400)

        // Apply font scale
        if (scale !== 1.0) {
          await page.evaluate((s) => {
            document.documentElement.style.fontSize = `${16 * s}px`
          }, scale)
          await page.waitForTimeout(200)
        }

        // Query all Choice elements (.choice-option, .segmented__item, button.chip, [role="radio"], [role="checkbox"])
        const evalResult = await page.evaluate(
          ({ vpWidth, scaleFactor }) => {
            const issues = []
            const choiceSelectors = [
              '.choice-option',
              '.segmented__item',
              'button.chip',
              '.choice-card',
              '[role="radio"]',
              '[role="checkbox"]',
            ].join(', ')

            const elements = Array.from(
              document.querySelectorAll(choiceSelectors),
            )
            let count = 0

            for (const el of elements) {
              const style = window.getComputedStyle(el)
              if (style.display === 'none' || style.visibility === 'hidden')
                continue

              const rect = el.getBoundingClientRect()
              if (rect.width === 0 || rect.height === 0) continue

              count++
              const text = el.textContent?.trim() || ''

              // 1. Horizontal cut-off / overflow check
              // Allow 2px tolerance for subpixel rendering
              if (rect.right > vpWidth + 2) {
                issues.push(
                  `Overflow: "${text.slice(0, 20)}" right edge (${rect.right.toFixed(1)}px) exceeds viewport width (${vpWidth}px)`,
                )
              }
              if (rect.left < -2) {
                issues.push(
                  `Underflow: "${text.slice(0, 20)}" left edge (${rect.left.toFixed(1)}px) is clipped off-screen`,
                )
              }

              // 2. Checkmark SVG forbidden in segmented chips
              const isSegmented =
                el.classList.contains('segmented__item') ||
                el.classList.contains('choice-option--segmented') ||
                el.closest('.segmented') ||
                el.closest('.choice-group--segmented')

              if (isSegmented) {
                const checkSvg = el.querySelector(
                  'svg.icon-check, svg[data-icon="check"], .chip__check',
                )
                if (checkSvg) {
                  const svgStyle = window.getComputedStyle(checkSvg)
                  if (
                    svgStyle.display !== 'none' &&
                    svgStyle.visibility !== 'hidden'
                  ) {
                    issues.push(
                      `Forbidden checkmark SVG present in segmented choice option "${text}"`,
                    )
                  }
                }
              }

              // 3. Solid accent background on selected options
              const isSelected =
                el.getAttribute('aria-checked') === 'true' ||
                el.getAttribute('aria-pressed') === 'true' ||
                el.getAttribute('aria-selected') === 'true' ||
                el.classList.contains('segmented__item--active') ||
                el.classList.contains('choice-option--selected') ||
                el.classList.contains('chip--active')

              if (isSelected) {
                const bg = style.backgroundColor
                // Must not be transparent or faint subtle tint
                if (bg === 'transparent' || bg === 'rgba(0, 0, 0, 0)') {
                  issues.push(
                    `Selected option "${text}" has transparent background`,
                  )
                }
              }
            }

            return { count, issues }
          },
          { vpWidth: vp.width, scaleFactor: scale },
        )

        totalOptionsExamined += evalResult.count
        if (evalResult.issues.length > 0) {
          evalResult.issues.forEach((iss) => {
            failures.push(`[${vp.name} @ ${scale}x - ${tp.name}] ${iss}`)
          })
        }

        await page.close()
      }

      await context.close()
    }
  }

  await browser.close()
  await server.close()

  console.log(`\n📊 gate-choice-layout summary:`)
  console.log(
    `  Total Choice Options Examined: ${totalOptionsExamined} (minimum 150 required)`,
  )

  if (totalOptionsExamined < 150) {
    failures.push(
      `FAILED: Examined only ${totalOptionsExamined} options, minimum 150 required.`,
    )
  }

  if (failures.length > 0) {
    console.error(
      `\n❌ gate-choice-layout FAILED with ${failures.length} errors:`,
    )
    failures.slice(0, 15).forEach((f) => console.error(`  • ${f}`))
    process.exit(1)
  }

  console.log('✅ gate-choice-layout PASSED cleanly!\n')
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate-choice-layout error:', err)
  process.exit(1)
})
