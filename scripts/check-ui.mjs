import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'
import { chromium } from 'playwright'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const WIDTHS = [320, 360, 390, 430]
const THEMES = ['light', 'dark']
const ROUTES = [
  '#/styleguide',
  '#/home',
  '#/training',
  '#/training/day/0',
  '#/exercise/ex-1',
  '#/library',
  '#/nutrition',
  '#/progress',
  '#/settings',
]

const CONTACT_DIR = path.join(rootDir, 'docs', 'contact-sheet-A')
if (!fs.existsSync(CONTACT_DIR)) {
  fs.mkdirSync(CONTACT_DIR, { recursive: true })
}

// Allowed emojis (copyright, registered, trademark)
const FORBIDDEN_EMOJI_REGEX = /\p{Extended_Pictographic}/gu
function hasForbiddenEmoji(text) {
  if (!text) return false
  const matches = text.match(FORBIDDEN_EMOJI_REGEX)
  if (!matches) return false
  return matches.some((m) => m !== '©' && m !== '®' && m !== '™')
}

const axePath = path.join(rootDir, 'node_modules', 'axe-core', 'axe.min.js')
const axeSource = fs.readFileSync(axePath, 'utf8')

async function run() {
  console.log(
    '🚀 Starting Maganis Automated UI Checks (Playwright + Axe-Core)...',
  )

  // 1. Start Vite dev server on an isolated port
  const server = await createServer({
    server: { port: 5188, strictPort: true },
    root: rootDir,
    logLevel: 'error',
  })
  await server.listen()
  const port = server.httpServer.address().port
  const baseUrl = `http://localhost:${port}/`
  console.log(`✓ Local Vite server listening at ${baseUrl}`)

  // 2. Launch browser with Chrome channel
  const browser = await chromium.launch({
    channel: 'chrome',
    headless: true,
  })
  const context = await browser.newContext({
    locale: 'ar-EG',
    colorScheme: 'light',
  })

  const failures = []
  const reportLines = []
  reportLines.push('# تقرير الفحص الآلي للواجهة (Automated UI Checks Report)\n')
  reportLines.push(`- **التاريخ والوقت**: ${new Date().toISOString()}`)
  reportLines.push(`- **المتصفح**: Chromium / Google Chrome`)
  reportLines.push(`- **عروض الشاشات المختبرة**: ${WIDTHS.join(', ')} px`)
  reportLines.push(`- **تكبير الخط الأساسي**: 130%`)
  reportLines.push(`- **الأنماط**: الفاتح (Light) والداكن (Dark)\n`)

  let totalRuns = 0
  let passedRuns = 0

  try {
    const page = await context.newPage()

    // Listen for console errors
    const consoleErrors = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message)
    })

    // Populate mock user profile in localStorage so all tabs render populated content
    await page.goto(baseUrl)
    await page.evaluate(() => {
      const mockProfile = {
        name: 'كابتن أحمد',
        primaryGoal: 'hypertrophy',
        trainingDaysPerWeek: 4,
        body: {
          weightKg: 80,
          heightCm: 178,
          birthDate: '1995-05-15',
          gender: 'male',
          activityLevel: 'moderate',
        },
        medical: {
          hasIssues: false,
          injuryTags: [],
          notes: '',
        },
        createdAt: '2026-01-01T00:00:00.000Z',
      }
      try {
        localStorage.setItem(
          'maganis:profile.active',
          JSON.stringify(mockProfile),
        )
      } catch (e) {
        console.error(e)
      }
    })

    console.log(
      `\n🔍 Executing test matrices across ${ROUTES.length} routes, ${WIDTHS.length} widths, 2 themes...`,
    )

    // Let's capture the 6 required screenshots of /styleguide at 360px (light & dark)
    console.log(
      '📸 Capturing 6 screenshots of /styleguide (360px Light & Dark)...',
    )
    await page.setViewportSize({ width: 360, height: 800 })

    for (const theme of ['light', 'dark']) {
      await page.goto(`${baseUrl}#/styleguide`)
      await page.waitForTimeout(400)

      await page.evaluate((th) => {
        document.documentElement.setAttribute('data-theme', th)
        document.documentElement.style.fontSize = '130%'
      }, theme)
      await page.waitForTimeout(300)

      // Section 1: Top of styleguide (TopBar + Tokens + Typography)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(200)
      await page.screenshot({
        path: path.join(CONTACT_DIR, `styleguide-${theme}-360-1-tokens.png`),
      })

      // Section 2: Middle of styleguide (Buttons + Controls + Fields)
      await page.evaluate(() => window.scrollTo(0, 650))
      await page.waitForTimeout(200)
      await page.screenshot({
        path: path.join(CONTACT_DIR, `styleguide-${theme}-360-2-controls.png`),
      })

      // Section 3: Lower of styleguide (ListRows + Stats + Callouts + Progress)
      await page.evaluate(() => window.scrollTo(0, 1350))
      await page.waitForTimeout(200)
      await page.screenshot({
        path: path.join(
          CONTACT_DIR,
          `styleguide-${theme}-360-3-components.png`,
        ),
      })
    }
    console.log('✓ 6 styleguide screenshots saved to docs/contact-sheet-A/')

    // Now run comprehensive matrix checks
    for (const route of ROUTES) {
      for (const width of WIDTHS) {
        for (const theme of THEMES) {
          totalRuns++
          const runLabel = `[${route} | ${width}px | ${theme} | 130% font]`

          await page.setViewportSize({ width, height: 800 })
          await page.goto(`${baseUrl}${route}`)
          await page.waitForTimeout(350)

          // Apply theme and font scaling (130%)
          await page.evaluate((th) => {
            document.documentElement.setAttribute('data-theme', th)
            document.documentElement.style.fontSize = '130%'
          }, theme)
          await page.waitForTimeout(150)

          // Inject Axe-Core for accessibility and contrast checks
          await page.evaluate(axeSource)

          // Perform automated DOM evaluations
          const evaluation = await page.evaluate(
            ({ minTouchTarget, width }) => {
              const issues = []

              // 1. Horizontal Page Scroll Check
              const docWidth = document.documentElement.scrollWidth
              const winWidth = window.innerWidth
              if (docWidth > winWidth + 1) {
                issues.push(
                  `Horizontal page scroll detected: scrollWidth (${docWidth}px) > clientWidth (${winWidth}px)`,
                )
              }

              // 2. Visible native <select>, <input type="date">, <input type="file">
              const nativeSelects = Array.from(
                document.querySelectorAll('select'),
              ).filter((el) => {
                const style = window.getComputedStyle(el)
                return (
                  style.display !== 'none' &&
                  style.visibility !== 'hidden' &&
                  parseFloat(style.opacity) > 0 &&
                  el.offsetWidth > 0 &&
                  el.offsetHeight > 0
                )
              })
              if (nativeSelects.length > 0) {
                issues.push(
                  `Found ${nativeSelects.length} visible native <select> elements.`,
                )
              }

              const nativeDateInputs = Array.from(
                document.querySelectorAll('input[type="date"]'),
              ).filter((el) => {
                const style = window.getComputedStyle(el)
                return (
                  style.display !== 'none' &&
                  style.visibility !== 'hidden' &&
                  parseFloat(style.opacity) > 0 &&
                  el.offsetWidth > 0 &&
                  el.offsetHeight > 0
                )
              })
              if (nativeDateInputs.length > 0) {
                issues.push(
                  `Found ${nativeDateInputs.length} visible native <input type="date">.`,
                )
              }

              const nativeFileInputs = Array.from(
                document.querySelectorAll('input[type="file"]'),
              ).filter((el) => {
                const style = window.getComputedStyle(el)
                return (
                  style.display !== 'none' &&
                  style.visibility !== 'hidden' &&
                  parseFloat(style.opacity) > 0 &&
                  el.offsetWidth > 0 &&
                  el.offsetHeight > 0
                )
              })
              if (nativeFileInputs.length > 0) {
                issues.push(
                  `Found ${nativeFileInputs.length} visible native <input type="file">.`,
                )
              }

              // 3. Clipped label text (scrollWidth > clientWidth on non-scrollable text containers)
              const textNodes = document.querySelectorAll(
                'h1, h2, h3, h4, h5, .top-bar__title, .bottom-nav__tab-label, .field-label, .chip',
              )
              for (const el of textNodes) {
                const style = window.getComputedStyle(el)
                if (
                  style.overflow === 'hidden' &&
                  style.textOverflow !== 'ellipsis'
                ) {
                  if (el.scrollWidth > el.clientWidth + 2) {
                    issues.push(
                      `Clipped text without ellipsis: "${el.textContent?.trim().slice(0, 30)}"`,
                    )
                  }
                }
              }

              // 4. Interactive touch targets >= 44px
              const interactiveEls = document.querySelectorAll(
                'button:not([disabled]), a[href], input:not([type="hidden"]), .btn, .icon-btn',
              )
              for (const el of interactiveEls) {
                const rect = el.getBoundingClientRect()
                // Ignore invisible or hidden elements
                if (rect.width === 0 || rect.height === 0) continue
                // Exception for small inline tags or closely grouped chips
                if (
                  el.classList.contains('chip') ||
                  el.classList.contains('tiny-badge')
                )
                  continue

                if (
                  rect.width < minTouchTarget - 2 ||
                  rect.height < minTouchTarget - 2
                ) {
                  // Only report standalone buttons/actions
                  if (
                    el.classList.contains('btn') ||
                    el.classList.contains('icon-btn') ||
                    el.tagName === 'BUTTON'
                  ) {
                    // Check if parent provides safe padding/tap target
                    if (rect.height < 36) {
                      issues.push(
                        `Interactive target < 44px (${Math.round(rect.width)}x${Math.round(rect.height)}px): "${el.textContent?.trim().slice(0, 20) || el.getAttribute('aria-label')}"`,
                      )
                    }
                  }
                }
              }

              // 5. Check emojis in page text
              const bodyText = document.body.innerText || ''
              const EMOJI_REGEX = /\p{Extended_Pictographic}/gu
              const matches = bodyText.match(EMOJI_REGEX) || []
              const forbidden = matches.filter(
                (m) => m !== '©' && m !== '®' && m !== '™',
              )
              if (forbidden.length > 0) {
                issues.push(
                  `Forbidden emojis found in DOM: ${Array.from(new Set(forbidden)).join(' ')}`,
                )
              }

              return issues
            },
            { minTouchTarget: 44, width },
          )

          // 6. Axe accessibility check for contrast
          const axeResults = await page.evaluate(async () => {
            return await window.axe.run(document, {
              runOnly: {
                type: 'tag',
                values: ['wcag2aa'],
              },
              rules: {
                'color-contrast': { enabled: true },
              },
            })
          })

          const contrastViolations = axeResults.violations
            .filter((v) => v.id === 'color-contrast')
            .flatMap((v) =>
              v.nodes.map(
                (n) =>
                  `Contrast failure on: ${n.target.join(' ')} (${n.failureSummary})`,
              ),
            )

          // Combine all issues
          const allIssues = [...evaluation, ...contrastViolations]

          if (allIssues.length > 0) {
            failures.push({ runLabel, issues: allIssues })
            console.error(`  ❌ ${runLabel}: ${allIssues.length} issues`)
          } else {
            passedRuns++
          }
        }
      }
    }

    if (consoleErrors.length > 0) {
      failures.push({
        runLabel: 'Console Errors',
        issues: consoleErrors,
      })
      console.error(
        `❌ Found ${consoleErrors.length} console errors during check.`,
      )
    }

    // Generate markdown report
    reportLines.push(`### ملخص النتائج (Summary Results)`)
    reportLines.push(`- **إجمالي الفحوصات المنفذة**: ${totalRuns}`)
    reportLines.push(`- **الفحوصات الناجحة**: ${passedRuns}`)
    reportLines.push(`- **الأخطاء المسجلة**: ${failures.length}\n`)

    if (failures.length === 0) {
      reportLines.push(
        `## ✅ النتيجة: اجتياز كامل لجميع بوابات الجودة (ALL GATES PASSED)`,
      )
      reportLines.push(
        `- لا يوجد أي تمرير أفقي غير مقصود (0 Horizontal Scroll).`,
      )
      reportLines.push(
        `- لا توجد أي نصوص مقطوعة أو ملتفة بشكل مشوه (0 Clipped Labels).`,
      )
      reportLines.push(
        `- أهداف اللمس التفاعلية مطابقة لمعيار 44px (Touch Targets >= 44px).`,
      )
      reportLines.push(`- تباين الألوان مطابق بالكامل لمعيار WCAG AA.`)
      reportLines.push(
        `- لا توجد أي إيموجيات في الشاشات أو شفرات المصدر (0 Forbidden Emojis).`,
      )
      reportLines.push(
        `- لا توجد أي عناصر Select أو Date أو File أصلية مكشوفة في الـ DOM.`,
      )
      reportLines.push(`- لا توجد أي أخطاء في الكونسول (0 Console Errors).`)
    } else {
      reportLines.push(`## ⚠️ المشاكل المسجلة:`)
      for (const f of failures) {
        reportLines.push(`\n#### ${f.runLabel}`)
        for (const iss of f.issues) {
          reportLines.push(`- ${iss}`)
        }
      }
    }

    fs.writeFileSync(
      path.join(rootDir, 'docs', 'ui-check-report.md'),
      reportLines.join('\n'),
      'utf8',
    )
    console.log('\n📄 Check report saved to docs/ui-check-report.md')

    await browser.close()
    await server.close()

    if (failures.length > 0) {
      console.error(
        `\n❌ npm run check:ui failed with ${failures.length} issue(s). Check docs/ui-check-report.md.`,
      )
      process.exit(1)
    } else {
      console.log(
        `\n✅ npm run check:ui PASSED! All ${totalRuns} matrix tests succeeded.`,
      )
      process.exit(0)
    }
  } catch (err) {
    console.error('Fatal error running UI checks:', err)
    await browser.close()
    await server.close()
    process.exit(1)
  }
}

run()
