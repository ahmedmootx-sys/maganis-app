#!/usr/bin/env node
/**
 * scripts/gate-contrast.mjs
 * Gate: WCAG AA Contrast Verification (TASK G3 Part 3)
 *
 * Verifies that all interactive controls across themes (light, dark) have contrast ratio >= 4.5:1.
 */

import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const ROUTES = [
  '#/home',
  '#/training',
  '#/training/day/0',
  '#/nutrition',
  '#/progress',
  '#/settings',
]

const THEMES = ['light', 'dark']

function parseRgb(colorStr) {
  if (!colorStr) return { r: 255, g: 255, b: 255, a: 1 }
  const match = colorStr.match(
    /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
  )
  if (!match) return { r: 255, g: 255, b: 255, a: 1 }
  return {
    r: Number(match[1]),
    g: Number(match[2]),
    b: Number(match[3]),
    a: match[4] !== undefined ? Number(match[4]) : 1,
  }
}

function channelLuminance(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relativeLuminance(rgb) {
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  )
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1)
  const l2 = relativeLuminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

async function run() {
  console.log(
    '🚀 Running Gate: gate-contrast (WCAG AA 4.5:1 Contrast Contract)...',
  )

  const server = await createServer({
    server: { port: 5199, strictPort: true },
    root: rootDir,
    logLevel: 'error',
  })
  await server.listen()
  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })

  let totalChecked = 0
  let failures = []

  try {
    for (const theme of THEMES) {
      const context = await browser.newContext({
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 2,
        colorScheme: theme,
        locale: 'ar-EG',
      })
      const page = await context.newPage()

      const ownerDump = JSON.parse(
        fs.readFileSync(
          path.join(rootDir, 'docs/owner-profile-dump.json'),
          'utf8',
        ),
      )
      await page.goto(`${baseUrl}#/home`, { waitUntil: 'domcontentloaded' })
      await page.evaluate((dump) => {
        localStorage.setItem(
          'maganis-dev:profile.active',
          JSON.stringify(dump.profile),
        )
        localStorage.setItem(
          'maganis:profile.active',
          JSON.stringify(dump.profile),
        )
        if (dump.program) {
          localStorage.setItem(
            'maganis-dev:workout.active',
            JSON.stringify(dump.program),
          )
          localStorage.setItem(
            'maganis:workout.active',
            JSON.stringify(dump.program),
          )
        }
      }, ownerDump)
      await page.reload({ waitUntil: 'domcontentloaded' })
      await page.waitForTimeout(400)

      for (const route of ROUTES) {
        await page.goto(`${baseUrl}${route}`, { waitUntil: 'domcontentloaded' })
        await page.evaluate((t) => {
          document.documentElement.setAttribute('data-theme', t)
          document.body.setAttribute('data-theme', t)
        }, theme)
        await page.waitForTimeout(300)

        const results = await page.evaluate(() => {
          function parseRgbInternal(colorStr) {
            if (!colorStr) return { r: 255, g: 255, b: 255, a: 1 }
            const match = colorStr.match(
              /rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/,
            )
            if (!match) return { r: 255, g: 255, b: 255, a: 1 }
            return {
              r: Number(match[1]),
              g: Number(match[2]),
              b: Number(match[3]),
              a: match[4] !== undefined ? Number(match[4]) : 1,
            }
          }

          function getEffectiveBg(el) {
            let curr = el
            const colors = []
            while (curr && curr !== document.documentElement) {
              const style = window.getComputedStyle(curr)
              const bg = parseRgbInternal(style.backgroundColor)
              if (bg.a > 0) {
                colors.push(bg)
                if (bg.a >= 0.99) break
              }
              curr = curr.parentElement
            }
            const isDark =
              document.documentElement.getAttribute('data-theme') === 'dark'
            let r = isDark ? 18 : 255
            let g = isDark ? 18 : 255
            let b = isDark ? 18 : 255

            for (let i = colors.length - 1; i >= 0; i--) {
              const c = colors[i]
              r = Math.round(c.r * c.a + r * (1 - c.a))
              g = Math.round(c.g * c.a + g * (1 - c.a))
              b = Math.round(c.b * c.a + b * (1 - c.a))
            }
            return { r, g, b }
          }

          const items = Array.from(
            document.querySelectorAll(
              'button, input, select, textarea, .chip, .segmented__btn, .tab-item, a',
            ),
          )

          const list = []
          for (const el of items) {
            const rect = el.getBoundingClientRect()
            if (rect.width === 0 || rect.height === 0) continue
            const style = window.getComputedStyle(el)
            if (style.display === 'none' || style.visibility === 'hidden')
              continue

            const textColor = parseRgbInternal(style.color)
            const effectiveBg = getEffectiveBg(el)
            const text = (
              el.innerText ||
              el.value ||
              el.placeholder ||
              el.getAttribute('aria-label') ||
              ''
            ).trim()

            list.push({
              tag: el.tagName.toLowerCase(),
              className: el.className,
              text: text.slice(0, 40),
              textColor,
              effectiveBg,
            })
          }
          return list
        })

        for (const item of results) {
          totalChecked++
          const ratio = contrastRatio(item.textColor, item.effectiveBg)
          if (item.text.length > 0 && ratio < 4.5) {
            failures.push({
              theme,
              route,
              tag: item.tag,
              text: item.text,
              className: item.className,
              ratio: ratio.toFixed(2),
              textColor: `rgb(${item.textColor.r},${item.textColor.g},${item.textColor.b})`,
              bgColor: `rgb(${item.effectiveBg.r},${item.effectiveBg.g},${item.effectiveBg.b})`,
            })
          }
        }
      }
      await context.close()
    }
  } finally {
    await browser.close()
    await server.close()
  }

  console.log(`\nChecked ${totalChecked} controls across routes and themes.`)
  if (failures.length > 0) {
    console.error(
      `❌ FAIL: Found ${failures.length} contrast issues below 4.5:1:`,
    )
    for (const f of failures.slice(0, 20)) {
      console.error(
        `  - [${f.theme.toUpperCase()}] ${f.route} <${f.tag}> "${f.text}" (${f.className}): ratio ${f.ratio}:1 (text ${f.textColor} on bg ${f.bgColor})`,
      )
    }
    if (failures.length > 20) {
      console.error(`  ... and ${failures.length - 20} more`)
    }
    process.exit(1)
  }

  console.log(
    '✓ gate-contrast passed cleanly! All controls pass WCAG AA contrast >= 4.5:1.',
  )
  process.exit(0)
}

run().catch((err) => {
  console.error('Contrast check failed with error:', err)
  process.exit(1)
})
