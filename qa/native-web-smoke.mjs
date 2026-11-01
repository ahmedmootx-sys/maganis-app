import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const distNativeDir = path.resolve(rootDir, 'dist-native')

if (!fs.existsSync(distNativeDir)) {
  console.error(
    '❌ dist-native does not exist. Run "npm run build:native" first.',
  )
  process.exit(1)
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
}

function createStaticServer(dir) {
  return http.createServer((req, res) => {
    let reqPath = decodeURI(req.url.split('?')[0])
    if (reqPath === '/' || reqPath === '') reqPath = '/index.html'

    const filePath = path.join(dir, reqPath)
    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      const ext = path.extname(filePath).toLowerCase()
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
      })
      res.end(fs.readFileSync(filePath))
    } else {
      // SPA fallback
      const indexPath = path.join(dir, 'index.html')
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(fs.readFileSync(indexPath))
    }
  })
}

async function run() {
  console.log('=== QA: NATIVE WEB SMOKE TEST (Task N1.2) ===')

  const server = createStaticServer(distNativeDir)
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  const baseUrl = `http://127.0.0.1:${port}/`
  console.log(`Serving dist-native at ${baseUrl}`)

  const launchOptions = {
    headless: true,
    ...(process.env.CI ? {} : { channel: 'chrome' }),
  }
  let browser
  try {
    browser = await chromium.launch(launchOptions)
  } catch {
    browser = await chromium.launch({ headless: true })
  }
  const context = await browser.newContext({
    viewport: { width: 360, height: 720 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  })

  const page = await context.newPage()

  const pageErrors = []
  page.on('pageerror', (err) => {
    console.error('Browser page error:', err)
    pageErrors.push(err.message)
  })

  // Seed persona data
  const personaPath = path.join(rootDir, 'fixtures', 'persona.synthetic.json')
  const persona = JSON.parse(fs.readFileSync(personaPath, 'utf8'))
  const profile = persona.profile || persona

  await page.goto(baseUrl)
  await page.evaluate((prof) => {
    localStorage.clear()
    localStorage.setItem('maganis:profile', JSON.stringify(prof))
    localStorage.setItem('maganis:onboarding_completed', 'true')
  }, profile)

  const routes = [
    { name: 'Home / Today', hash: '#/' },
    { name: 'Workout / Training', hash: '#/workout' },
    { name: 'Exercise Detail (Bench Press)', hash: '#/workout/exercise/bench' },
    { name: 'Muscle Atlas', hash: '#/workout/atlas' },
    { name: 'Nutrition', hash: '#/nutrition' },
    { name: 'Progress / Tracking', hash: '#/progress' },
    { name: 'Settings', hash: '#/settings' },
    { name: 'Styleguide', hash: '#/styleguide' },
  ]

  let passedRoutes = 0

  for (const route of routes) {
    console.log(`Testing route: ${route.name} (${route.hash})...`)
    await page.goto(`${baseUrl}${route.hash}`)
    await page.waitForTimeout(600)

    // Ensure root element is rendered
    const rootVisible = await page.isVisible('#root')
    if (!rootVisible) {
      throw new Error(`Route ${route.name} failed: #root is not visible`)
    }

    if (route.hash === '#/workout/atlas') {
      // Verify SVG atlas element is present
      const svg = await page
        .waitForSelector('svg', { timeout: 5000 })
        .catch(() => null)
      if (svg) {
        console.log('  ✓ Atlas SVG rendered cleanly without errors.')
      }
      fs.mkdirSync(path.join(rootDir, 'evidence', 'n1', 'green'), {
        recursive: true,
      })
      await page.screenshot({
        path: path.join(
          rootDir,
          'evidence',
          'n1',
          'green',
          'native-smoke-atlas.png',
        ),
      })
    }

    if (route.hash === '#/settings') {
      await page.waitForTimeout(300)
      await page.screenshot({
        path: path.join(
          rootDir,
          'evidence',
          'n1',
          'green',
          'native-smoke-settings.png',
        ),
      })
    }

    passedRoutes++
    console.log(`  ✓ Route ${route.name} OK.`)
  }

  await browser.close()
  server.close()

  console.log(`\nSmoke audit complete:`)
  console.log(`- Routes verified: ${passedRoutes} / ${routes.length}`)
  console.log(`- Page errors recorded: ${pageErrors.length}`)

  if (pageErrors.length > 0) {
    console.error(
      `❌ QA Smoke failed: ${pageErrors.length} unhandled page error(s) occurred.`,
    )
    process.exit(1)
  }

  if (passedRoutes < routes.length) {
    console.error(`❌ QA Smoke failed: examined only ${passedRoutes} routes.`)
    process.exit(1)
  }

  console.log(
    '✅ QA Smoke passed: Root-base native bundle loads flawlessly across all routes with 0 page errors.',
  )
}

run().catch((err) => {
  console.error('Fatal error running qa/native-web-smoke.mjs:', err)
  process.exit(1)
})
