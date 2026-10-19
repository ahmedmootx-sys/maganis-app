import { chromium } from 'playwright'
import { preview } from 'vite'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function run() {
  const server = await preview({
    root: rootDir,
    preview: { port: 5189, strictPort: true },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]

  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const context = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })
  const page = await context.newPage()

  const ownerProfilePath = path.resolve(rootDir, 'docs/owner-profile-dump.json')
  let ownerDump = JSON.parse(fs.readFileSync(ownerProfilePath, 'utf8'))
  const ownerProfile = ownerDump.profile || ownerDump

  await page.addInitScript((profile) => {
    localStorage.setItem('maganis:profile.active', JSON.stringify(profile))
    localStorage.setItem(
      'maganis:workout.program',
      JSON.stringify({
        id: 'test-prog',
        primaryGoal: 'hypertrophy',
        trainingDaysPerWeek: 4,
        splitType: 'upper_lower',
        days: [
          {
            dayIndex: 6,
            labelAr: 'يوم السبت: علوي',
            focus: 'صدر، ظهر، ذراعين',
            exercises: [
              {
                exerciseId: 'barbell-bench-press',
                sets: 4,
                reps: 8,
                restSeconds: 90,
                section: 'primary',
              },
            ],
          },
          {
            dayIndex: 0,
            labelAr: 'يوم الأحد: سفلي',
            focus: 'أرجل وبطن',
            exercises: [
              {
                exerciseId: 'squat',
                sets: 4,
                reps: 8,
                restSeconds: 120,
                section: 'primary',
              },
            ],
          },
        ],
      }),
    )
  }, ownerProfile)

  for (const r of ['/training', '/exercise/barbell-bench-press', '/library']) {
    console.log(`\n=== Testing ${r} ===`)
    await page.goto(`${baseUrl}#${r}`)
    await page.waitForTimeout(500)

    const res = await page.evaluate(() => {
      // Find all scrollers
      const scrollers = Array.from(
        document.querySelectorAll(
          '.screen-content, .wizard-step-body, .app-main',
        ),
      )
      const bottomNav = document.querySelector('.bottom-nav')
      const bottomNavRect = bottomNav ? bottomNav.getBoundingClientRect() : null

      return scrollers.map((s, idx) => {
        s.scrollTop = s.scrollHeight
        const children = Array.from(s.children).filter((el) => {
          const st = window.getComputedStyle(el)
          return (
            st.display !== 'none' &&
            st.visibility !== 'hidden' &&
            st.position !== 'fixed'
          )
        })
        const last = children[children.length - 1]
        const lastRect = last ? last.getBoundingClientRect() : null
        const sRect = s.getBoundingClientRect()
        return {
          idx,
          tagName: s.tagName,
          className: s.className,
          parent: s.parentElement?.className,
          rect: { top: sRect.top, bottom: sRect.bottom, height: sRect.height },
          scrollHeight: s.scrollHeight,
          clientHeight: s.clientHeight,
          scrollTop: s.scrollTop,
          lastTag: last ? `${last.tagName}.${last.className}` : null,
          lastRect: lastRect
            ? {
                top: lastRect.top,
                bottom: lastRect.bottom,
                height: lastRect.height,
              }
            : null,
          gapToNav:
            bottomNavRect && lastRect
              ? bottomNavRect.top - lastRect.bottom
              : null,
        }
      })
    })
    console.log(JSON.stringify(res, null, 2))
  }

  await browser.close()
  await server.httpServer.close()
}

run().catch(console.error)
