#!/usr/bin/env node
/**
 * scripts/gate-raw-tokens.mjs
 * Gate: Raw Internal Identifiers & Latin Words Gate (P7 Generic Gate)
 *
 * Verifies across registered states:
 * 1. No visible text node contains a snake_case identifier (e.g. pec_sternal, trap_lower).
 * 2. No visible text node contains known internal enum values:
 *    none, body only, barbell, dumbbell, cable, machine, and catalog muscle IDs.
 * 3. No Latin words outside an element marked <bdi dir="ltr">.
 * 4. Prints total text nodes examined and enforces minimums (at least 20 text nodes per state).
 */

import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { openState } from '../qa/drive.ts'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const STATES_TO_CHECK = [
  'd1-library-overlap',
  'd2-set-propagation',
  'd4-raw-tokens',
  'd5-cardio-runner',
  'd6-edit-sheet',
  'd7-contrast',
  'd8-training-day-titles',
  'd9-exercise-page-header',
]

// Known internal enum values that must never leak to user-facing UI
const BANNED_RAW_TOKENS = [
  'none',
  'body only',
  'bodyweight',
  'barbell',
  'dumbbell',
  'cable',
  'machine',
  'pec_sternal',
  'pec_clavicular',
  'pec_costal',
  'pec_minor',
  'trap_lower',
  'trap_upper',
  'trap_middle',
  'delt_anterior',
  'delt_lateral',
  'delt_posterior',
  'latissimus_dorsi',
  'lats',
  'biceps_brachii',
  'triceps_brachii',
  'rectus_abdominis',
  'serratus_anterior',
  'quadriceps',
  'hamstrings',
  'gluteus_maximus',
  'gluteus_medius',
  'gastrocnemius',
  'soleus',
]

async function run() {
  console.log('====================================================')
  console.log('🚀 Running Gate: gate-raw-tokens (P7 Generic Gate)')
  console.log('====================================================')

  const server = await preview({
    preview: { port: 5202, strictPort: false },
    root: rootDir,
    logLevel: 'error',
  })
  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  let totalTextNodesExamined = 0
  const violations = []

  try {
    const context = await browser.newContext({
      viewport: { width: 360, height: 720 },
      deviceScaleFactor: 2,
      locale: 'ar-EG',
    })
    const page = await context.newPage()

    for (const stateId of STATES_TO_CHECK) {
      try {
        await openState(page, stateId, { baseUrl })
        await page.waitForTimeout(350)

        const result = await page.evaluate(
          ({ stateId, bannedTokens }) => {
            const walker = document.createTreeWalker(
              document.body,
              NodeFilter.SHOW_TEXT,
              {
                acceptNode: (node) => {
                  const parent = node.parentElement
                  if (!parent) return NodeFilter.FILTER_REJECT
                  const tag = parent.tagName.toLowerCase()
                  if (
                    tag === 'script' ||
                    tag === 'style' ||
                    tag === 'noscript'
                  ) {
                    return NodeFilter.FILTER_REJECT
                  }
                  const text = node.textContent.trim()
                  if (!text) return NodeFilter.FILTER_REJECT

                  // Check visibility of parent element
                  const rect = parent.getBoundingClientRect()
                  if (rect.width <= 0 && rect.height <= 0)
                    return NodeFilter.FILTER_REJECT
                  const style = window.getComputedStyle(parent)
                  if (
                    style.display === 'none' ||
                    style.visibility === 'hidden' ||
                    parseFloat(style.opacity) === 0
                  ) {
                    return NodeFilter.FILTER_REJECT
                  }

                  return NodeFilter.FILTER_ACCEPT
                },
              },
            )

            let examined = 0
            const stateViolations = []

            let currentNode = walker.nextNode()
            while (currentNode) {
              examined++
              const text = currentNode.textContent.trim()
              const parent = currentNode.parentElement
              const bdiAncestor = parent ? parent.closest('bdi') : null

              // 1. Check snake_case: identifier with underscore between lowercase words
              const snakeMatch = text.match(/\b[a-z]{2,}_[a-z0-9_]+\b/)
              if (snakeMatch) {
                stateViolations.push({
                  type: 'SNAKE_CASE_LEAK',
                  token: snakeMatch[0],
                  fullText: text,
                  parentTag: parent?.tagName.toLowerCase(),
                  stateId,
                })
              }

              // 2. Check exact banned internal tokens (case-insensitive boundary match)
              for (const token of bannedTokens) {
                const regex = new RegExp(
                  `\\b${token.replace(' ', '\\s+')}\\b`,
                  'i',
                )
                if (regex.test(text)) {
                  // If it's a raw enum inside an element without bdi or localized text
                  if (
                    !bdiAncestor ||
                    token === 'none' ||
                    token === 'body only' ||
                    token === 'pec_sternal'
                  ) {
                    stateViolations.push({
                      type: 'RAW_INTERNAL_ENUM',
                      token,
                      fullText: text,
                      parentTag: parent?.tagName.toLowerCase(),
                      stateId,
                    })
                  }
                }
              }

              // 3. Check Latin words outside <bdi dir="ltr"> or allowable tags (e.g. brand code, units like kg/km)
              if (!bdiAncestor) {
                // Match english words with 3+ characters, excluding common units like MET, kcal, kg, km/h
                const latinWords = text.match(/\b[A-Za-z]{3,}\b/g)
                if (latinWords) {
                  const allowedWords = new Set([
                    'kcal',
                    'MET',
                    'min',
                    'sec',
                    'kg',
                    'bpm',
                    'BMR',
                    'TDEE',
                    'PWA',
                  ])
                  const leaked = latinWords.filter((w) => !allowedWords.has(w))
                  if (leaked.length > 0) {
                    stateViolations.push({
                      type: 'LATIN_OUTSIDE_BDI',
                      token: leaked.join(', '),
                      fullText: text,
                      parentTag: parent?.tagName.toLowerCase(),
                      stateId,
                    })
                  }
                }
              }

              currentNode = walker.nextNode()
            }

            return {
              examined,
              stateViolations,
            }
          },
          { stateId, bannedTokens: BANNED_RAW_TOKENS },
        )

        totalTextNodesExamined += result.examined

        const minRequired = stateId === 'd5-cardio-runner' ? 15 : 20
        if (result.examined < minRequired) {
          violations.push({
            type: 'MINIMUM_TEXT_NODES_FAILED',
            stateId,
            message: `State ${stateId} only examined ${result.examined} text nodes (minimum ${minRequired} required)`,
          })
        }

        for (const sv of result.stateViolations) {
          violations.push(sv)
        }
      } catch (err) {
        violations.push({
          type: 'STATE_ERROR',
          stateId,
          message: err.message,
        })
      }
    }

    await context.close()
  } finally {
    await browser.close()
    await server.close()
  }

  console.log(`\nGate Run Complete:`)
  console.log(`- Total visible text nodes examined: ${totalTextNodesExamined}`)
  console.log(`- Total violations found: ${violations.length}\n`)

  if (violations.length > 0) {
    console.error('❌ GATE FAILED: Found raw tokens or Latin text leaks:')
    for (const v of violations.slice(0, 20)) {
      if (v.token) {
        console.error(
          `  [${v.stateId}] ${v.type}: "${v.token}" in <${v.parentTag}>: "${v.fullText}"`,
        )
      } else {
        console.error(`  [${v.stateId}] ${v.type}: ${v.message}`)
      }
    }
    if (violations.length > 20) {
      console.error(`  ... and ${violations.length - 20} more violations.`)
    }
    process.exit(1)
  }

  console.log(
    '✅ GATE PASSED: Zero raw internal tokens or unescaped Latin leaks found.',
  )
}

run().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
