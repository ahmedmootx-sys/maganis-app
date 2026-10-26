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
    preview: { port: 5187, strictPort: true },
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

  // Load persona profile
  const personaProfilePath = path.resolve(
    rootDir,
    'fixtures/persona.synthetic.json',
  )
  let personaProfile = null
  if (fs.existsSync(personaProfilePath)) {
    personaProfile = JSON.parse(fs.readFileSync(personaProfilePath, 'utf8'))
  }

  await page.addInitScript((dump) => {
    if (dump) {
      const p = dump.profile || dump
      localStorage.setItem('maganis:profile.active', JSON.stringify(p))
      if (p.workoutProgram) {
        localStorage.setItem(
          'maganis:workout.program',
          JSON.stringify(p.workoutProgram),
        )
      }
    }
  }, personaProfile)

  await page.goto(baseUrl)
  await page.waitForLoadState('networkidle')
  await page.waitForTimeout(500)

  // Measure last 6 children of the main content/scroller
  const report = await page.evaluate(() => {
    const appMain =
      document.querySelector('.app-main') || document.querySelector('main')
    const scroller = document.querySelector('.screen-content') || appMain
    const bottomNav = document.querySelector('.bottom-nav')

    const scrollerRect = scroller ? scroller.getBoundingClientRect() : null
    const bottomNavRect = bottomNav ? bottomNav.getBoundingClientRect() : null

    // Scroll scroller to bottom
    if (scroller) {
      scroller.scrollTop = scroller.scrollHeight
    }
    window.scrollTo(0, document.body.scrollHeight)

    const children = Array.from(scroller.children)
    const last6 = children.slice(-6).map((el, i) => {
      const r = el.getBoundingClientRect()
      const computed = window.getComputedStyle(el)
      return {
        tag: el.tagName,
        className: el.className,
        rect: {
          top: r.top,
          bottom: r.bottom,
          height: r.height,
          left: r.left,
          right: r.right,
        },
        marginBottom: computed.marginBottom,
        paddingBottom: computed.paddingBottom,
        textSnippet: el.textContent?.trim().slice(0, 40),
      }
    })

    const scrollerComputed = window.getComputedStyle(scroller)
    const appMainComputed = appMain ? window.getComputedStyle(appMain) : null

    const lastChild = children[children.length - 1]
    const lastChildRect = lastChild ? lastChild.getBoundingClientRect() : null
    const gapToNav =
      bottomNavRect && lastChildRect
        ? bottomNavRect.top - lastChildRect.bottom
        : null

    return {
      windowHeight: window.innerHeight,
      scrollY: window.scrollY,
      bodyScrollHeight: document.body.scrollHeight,
      appMainPaddingBottom: appMainComputed
        ? appMainComputed.paddingBottom
        : null,
      scrollerPaddingBottom: scrollerComputed.paddingBottom,
      scrollerMarginBottom: scrollerComputed.marginBottom,
      bottomNavRect,
      lastChildRect,
      gapToNav,
      last6,
    }
  })

  console.log(JSON.stringify(report, null, 2))

  await browser.close()
  await server.httpServer.close()
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
