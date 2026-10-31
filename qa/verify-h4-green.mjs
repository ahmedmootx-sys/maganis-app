/**
 * qa/verify-h4-green.mjs
 * Captures green evidence for defects D4, D6, and D7 on the production build.
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'

const rootDir = process.cwd()

const greenDir = path.join(rootDir, 'evidence/h4/green')
if (!fs.existsSync(greenDir)) {
  fs.mkdirSync(greenDir, { recursive: true })
}

const persona = JSON.parse(
  fs.readFileSync(
    path.join(rootDir, 'fixtures/persona.synthetic.json'),
    'utf8',
  ),
)

async function main() {
  console.log('--- Starting Verification of H4 Green Fixes ---')

  const server = await preview({
    root: rootDir,
    preview: { port: 5206, strictPort: false },
    logLevel: 'error',
  })
  const baseUrl = server.resolvedUrls.local[0]
  console.log(`Server running at ${baseUrl}`)

  const launchOpts = {
    headless: true,
    args: ['--no-sandbox'],
  }
  if (process.platform === 'win32' && !process.env.CI) {
    launchOpts.channel = 'chrome'
  }
  const browser = await chromium.launch(launchOpts)

  try {
    const context = await browser.newContext({
      viewport: { width: 360, height: 720 },
      deviceScaleFactor: 2,
      locale: 'ar-EG',
      serviceWorkers: 'block',
    })

    const p = {
      ...persona.profile,
      trainingDaysPerWeek: 6,
    }

    await context.addInitScript(
      ({ prof }) => {
        localStorage.setItem('maganis:profile.active', JSON.stringify(prof))
      },
      { prof: p },
    )

    const page = await context.newPage()

    // 1. Verify D6: Home card sessions shows "0 من 6"
    console.log('\n--- Verifying D6: Home card sessions planned count ---')
    await page.goto(`${baseUrl}#/home`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)
    console.log('Page URL:', page.url())
    console.log('Page Title:', await page.title())
    const bodyText = await page.innerText('body')
    console.log('Body Text snippet:', bodyText.slice(0, 300))

    const statCard = page.locator('.stat-box', {
      hasText: 'الجلسات هذا الأسبوع',
    })
    const statText = await statCard.innerText()
    console.log('D6 Green Stat Card Text:\n', statText)

    if (!statText.includes('0 من 6')) {
      throw new Error(`Expected "0 من 6" but got: ${statText}`)
    }

    await page.screenshot({
      path: path.join(greenDir, 'd6-home-sessions.png'),
    })
    console.log('📸 Saved evidence/h4/green/d6-home-sessions.png')

    // 2. Verify D7: Hostile backup import is rejected and does not corrupt state
    console.log('\n--- Verifying D7: Strict Backup Import Rejection ---')
    const hostilePayload = {
      exportVersion: 1,
      profile: { name: 42, body: 'x' },
      trackingSessions: [null, 5, 'x'],
    }
    const hostilePath = path.join(
      rootDir,
      'qa/fixtures/import-invalid-types.json',
    )
    fs.writeFileSync(hostilePath, JSON.stringify(hostilePayload, null, 2))

    await page.goto(`${baseUrl}#/settings`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(hostilePath)
    await page.waitForTimeout(600)

    const confirmSheet = page.locator('.sheet')
    const sheetVisible = await confirmSheet.isVisible()
    console.log('Hostile import opened ConfirmSheet? =', sheetVisible)

    if (sheetVisible) {
      throw new Error('Hostile import incorrectly opened ConfirmSheet!')
    }

    // Verify toast or alert with rejection message
    const toast = page.locator('[role="status"], .toast')
    const toastVisible = await toast.isVisible()
    console.log('Error toast visible? =', toastVisible)
    if (toastVisible) {
      console.log('Toast message:', await toast.innerText())
    }

    await page.screenshot({
      path: path.join(greenDir, 'd7-hostile-import.png'),
    })
    console.log('📸 Saved evidence/h4/green/d7-hostile-import.png')

    // 3. Verify D4: Uploaded GIF renders static first frame in day list
    console.log('\n--- Verifying D4: First Frame Thumbnail in Day List ---')
    const minimalGif =
      'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
    const firstFrameJpeg =
      'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA='

    const prog = {
      id: 'prog-gif-test',
      title: 'برنامج تجريبي',
      days: [
        {
          id: '0',
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'عقلة وتعلّق',
          exercises: [
            {
              exerciseId: 'deadhang',
              sets: 3,
              reps: 30,
              restSeconds: 60,
              section: 'primary',
            },
          ],
        },
      ],
    }

    const override = {
      exerciseId: 'deadhang',
      nameAr: 'تعلق حر GIF',
      imageMode: 'custom',
      media: {
        kind: 'upload-gif',
        blobKey: 'deadhang',
        updatedAt: Date.now(),
      },
    }

    await page.evaluate(
      async ({ p, prog, ov, gif, jpeg }) => {
        localStorage.setItem('maganis:profile.active', JSON.stringify(p))
        localStorage.setItem('maganis:workout.program', JSON.stringify(prog))
        localStorage.setItem(
          'maganis:exercise_overrides',
          JSON.stringify({ deadhang: ov }),
        )

        await new Promise((resolve) => {
          const req = indexedDB.open('maganis_db', 2)
          req.onsuccess = () => {
            const db = req.result
            const tx = db.transaction('maganis_media', 'readwrite')
            const store = tx.objectStore('maganis_media')
            store.put(
              {
                dataUrl: gif,
                firstFrameUrl: jpeg,
              },
              'deadhang',
            )
            tx.oncomplete = () => resolve(true)
          }
        })
      },
      { p, prog, ov: override, gif: minimalGif, jpeg: firstFrameJpeg },
    )

    await page.goto(`${baseUrl}#/training/day/0`, {
      waitUntil: 'domcontentloaded',
    })
    await page.reload({ waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const imgLocator = page.locator('.exercise-thumb-box img').first()
    await imgLocator.waitFor({ state: 'visible', timeout: 8000 })
    const src = await imgLocator.getAttribute('src')
    console.log('Day list image src prefix:', src?.slice(0, 30))
    console.log(
      'Is day list image static JPEG?',
      src?.startsWith('data:image/jpeg'),
    )

    if (!src?.startsWith('data:image/jpeg')) {
      throw new Error(
        `Expected static JPEG for thumbnail, but got: ${src?.slice(0, 50)}`,
      )
    }

    await page.screenshot({
      path: path.join(greenDir, 'd4-gif-daylist.png'),
    })
    console.log('📸 Saved evidence/h4/green/d4-gif-daylist.png')

    console.log('\n✅ All H4 Green verifications passed!')
  } finally {
    await browser.close()
    await server.close()
  }
}

main().catch((err) => {
  console.error('❌ Verification failed:', err)
  process.exit(1)
})
