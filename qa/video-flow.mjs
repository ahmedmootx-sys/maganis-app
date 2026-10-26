/**
 * qa/video-flow.mjs — regression check for the in-app exercise video.
 *
 * Drives the PRODUCTION build (vite build + a static server, or the deployed URL) through the real UI:
 *   open exercise -> "add video link" -> the link field must be visible and focused ->
 *   type a YouTube URL -> save -> tap play -> the player must have a real height.
 *
 * It stubs www.youtube-nocookie.com so it runs offline; it proves layout and wiring, NOT that YouTube
 * accepts the embed (that needs a real device).
 *
 * Usage:  BASE=http://localhost:4173/maganis-app/ node qa/video-flow.mjs
 * Exit code 1 on any failed assertion.
 */
import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4173/maganis-app/'
const EXERCISE = process.env.EXERCISE || 'bench'
const profile = JSON.parse(
  fs.readFileSync(
    new URL('../fixtures/persona.synthetic.json', import.meta.url),
    'utf8',
  ),
)
const profileValue = profile.profile || profile

const failures = []
const check = (ok, msg) => {
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${msg}`)
  if (!ok) failures.push(msg)
}

const browser = await chromium.launch({
  channel: 'chrome',
  executablePath: process.env.CHROME || undefined,
  args: ['--no-sandbox'],
})
const ctx = await browser.newContext({
  viewport: { width: 360, height: 720 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
  serviceWorkers: 'block',
})
await ctx.route('https://www.youtube-nocookie.com/**', (r) =>
  r.fulfill({
    status: 200,
    contentType: 'text/html',
    body: '<html><body style="margin:0;background:#222;color:#fff">STUB PLAYER</body></html>',
  }),
)
const page = await ctx.newPage()
await page.addInitScript(
  ({ p }) => {
    if (!localStorage.getItem('maganis:profile.active'))
      localStorage.setItem('maganis:profile.active', JSON.stringify(p))
  },
  { p: profileValue },
)

await page.goto(`${BASE}#/exercise/${EXERCISE}`, {
  waitUntil: 'domcontentloaded',
})
await page.locator('[data-testid="add-video-btn"]').waitFor({ timeout: 15000 })
await page.locator('[data-testid="add-video-btn"]').click()
await page.waitForTimeout(900)

const field = await page.evaluate(() => {
  const el = document.querySelector('[data-testid="input-video-url"]')
  if (!el) return null
  const r = el.getBoundingClientRect()
  return {
    inViewport: r.top >= 0 && r.bottom <= innerHeight,
    focused: document.activeElement === el,
  }
})
check(
  !!field && field.inViewport,
  'video link field is visible right after tapping "add video link"',
)
check(!!field && field.focused, 'video link field is focused')

await page
  .locator('[data-testid="input-video-url"]')
  .fill('https://youtu.be/dQw4w9WgXcQ')
await page.locator('[data-testid="btn-save-edit"]').click()
await page.waitForTimeout(900)

const facade = page.locator('[data-testid="play-facade-btn"]')
check((await facade.count()) === 1, 'play facade appears after saving the link')
await facade.scrollIntoViewIfNeeded()
await facade.click()
await page.waitForTimeout(1500)

const player = await page.evaluate(() => {
  const f = document.querySelector('iframe')
  if (!f) return null
  f.scrollIntoView({ block: 'center' })
  // Visible box of the iframe = its own box clipped by every ancestor that clips (overflow != visible).
  // A collapsed card (the original bug) keeps the iframe's own size but clips it to ~2px.
  let r = f.getBoundingClientRect()
  let box = { top: r.top, bottom: r.bottom }
  for (
    let a = f.parentElement;
    a && a !== document.documentElement;
    a = a.parentElement
  ) {
    const cs = getComputedStyle(a)
    if (cs.overflowY !== 'visible' || cs.overflowX !== 'visible') {
      const ar = a.getBoundingClientRect()
      box = {
        top: Math.max(box.top, ar.top),
        bottom: Math.min(box.bottom, ar.bottom),
      }
    }
  }
  return {
    ownH: Math.round(r.height),
    visibleH: Math.max(0, Math.round(box.bottom - box.top)),
    src: f.src,
  }
})
check(!!player, 'iframe is mounted after tapping play')
check(
  !!player && player.ownH >= 150,
  `iframe has its own size (got ${player?.ownH}px)`,
)
check(
  !!player && player.visibleH >= 150,
  `iframe is actually visible, not clipped by a collapsed container (visible ${player?.visibleH}px; the bug gave ~2px)`,
)
check(
  !!player &&
    player.src.startsWith('https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ'),
  'iframe src is the nocookie embed of the right video',
)

await browser.close()
if (failures.length) {
  console.error(`\n${failures.length} check(s) failed`)
  process.exit(1)
}
console.log('\nall checks passed')
