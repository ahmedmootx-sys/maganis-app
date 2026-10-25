import { chromium } from 'playwright'
import fs from 'node:fs'

const BASE = process.env.BASE || 'http://localhost:4173/maganis-app/'
const EXERCISE = process.env.EXERCISE || 'bench'
const profile = JSON.parse(
  fs.readFileSync(
    new URL('../docs/owner-profile-dump.json', import.meta.url),
    'utf8',
  ),
)
const profileValue = profile.profile || profile

const browser = await chromium.launch({
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
    body: '<html><body style="margin:0;background:#222;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;">STUB PLAYER</body></html>',
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

// Screenshot 1: add-video sheet with focused input in view
await page.screenshot({ path: 'evidence/h1/add-video-sheet.png' })
console.log('Saved evidence/h1/add-video-sheet.png')

await page
  .locator('[data-testid="input-video-url"]')
  .fill('https://youtu.be/dQw4w9WgXcQ')
await page.locator('[data-testid="btn-save-edit"]').click()
await page.waitForTimeout(900)

const facade = page.locator('[data-testid="play-facade-btn"]')
await facade.scrollIntoViewIfNeeded()
await facade.click()
await page.waitForTimeout(1500)

// Screenshot 2: playing player
await page.screenshot({ path: 'evidence/h1/player-playing.png' })
console.log('Saved evidence/h1/player-playing.png')

await browser.close()
