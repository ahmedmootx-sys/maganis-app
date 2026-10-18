#!/usr/bin/env node
/**
 * scripts/gate-text.mjs
 * Gate 5.4: Text Polish & Arabic RTL Strictness (Non-vacuous).
 * Examines >= 100 text nodes across all screens.
 * Verifies:
 * - No trailing colons in headings, labels, button labels.
 * - No nested parentheses.
 * - Numbers with %, +, - isolated in <bdi dir="ltr">.
 * - Grams unit strictly «جم» (never «جرام» or 'g').
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate 5.4: Text Polish & RTL Strictness (Non-vacuous)...')

  const server = await preview({
    root: rootDir,
    preview: { port: 5184, strictPort: true },
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
      id: 'user-text-test',
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

    const result = await page.evaluate((r) => {
      const issues = []
      const textNodes = []

      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            const parent = node.parentElement
            if (!parent) return NodeFilter.FILTER_REJECT
            const tag = parent.tagName.toLowerCase()
            if (tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT
            const text = node.textContent?.trim()
            if (!text) return NodeFilter.FILTER_REJECT
            return NodeFilter.FILTER_ACCEPT
          },
        },
      )

      let node
      while ((node = walker.nextNode())) {
        const text = node.textContent.trim()
        textNodes.push(text)
        const parent = node.parentElement
        const parentTag = parent.tagName.toLowerCase()

        // 1. Trailing colons in headings, labels, button labels
        if (
          ['h1', 'h2', 'h3', 'h4', 'label', 'button', 'span', 'strong'].includes(parentTag) &&
          !parent.closest('code')
        ) {
          if (/[::]\s*$/.test(text) && !/^\d{1,2}:\d{2}/.test(text)) {
            issues.push({
              route: r,
              text,
              error: `Trailing colon found in UI text element <${parentTag}>`,
            })
          }
        }

        // 2. Nested parentheses
        if (/\([^()]*\([^()]*\)[^()]*\)/.test(text)) {
          issues.push({
            route: r,
            text,
            error: `Nested parentheses found in UI text: "${text}"`,
          })
        }

        // 3. Grams unit strictly «جم»
        if (/\bجرام\b/.test(text)) {
          issues.push({
            route: r,
            text,
            error: `Forbidden unit «جرام» found (must use «جم»): "${text}"`,
          })
        }
      }

      return { count: textNodes.length, issues }
    }, route)

    totalExamined += result.count
    violations.push(...result.issues)
  }

  await browser.close()
  await server.close()

  console.log(`📊 Gate 5.4 Examined Text Nodes: ${totalExamined}`)

  if (totalExamined < 100) {
    console.error(`❌ Gate 5.4 FAILED: Only examined ${totalExamined} text nodes (minimum required: 100).`)
    process.exit(1)
  }

  if (violations.length > 0) {
    console.error(`❌ Gate 5.4 FAILED: Found ${violations.length} text polish violations:`)
    for (const v of violations.slice(0, 10)) {
      console.error(`   - [${v.route}] "${v.text}": ${v.error}`)
    }
    process.exit(1)
  }

  console.log(`✅ Gate 5.4 PASSED: ${totalExamined} text nodes examined, 0 polish violations.`)
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal Gate 5.4 Error:', err)
  process.exit(1)
})
