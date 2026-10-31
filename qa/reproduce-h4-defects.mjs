/**
 * qa/reproduce-h4-defects.mjs
 * Reproduces defects D4 (GIF thumbnail in day list), D6 (Home sessions hardcoded 0 of 4),
 * and D7 (Hostile backup import).
 */

import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'
import { preview } from 'vite'

const rootDir = process.cwd()

const persona = JSON.parse(
  fs.readFileSync(
    path.join(rootDir, 'fixtures/persona.synthetic.json'),
    'utf8',
  ),
)

async function main() {
  console.log('--- Starting Reproduction of H4 Defects ---')

  const server = await preview({
    root: rootDir,
    preview: { port: 5205, strictPort: true },
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
        if (!localStorage.getItem('maganis:profile.active')) {
          localStorage.setItem('maganis:profile.active', JSON.stringify(prof))
        }
      },
      { prof: p },
    )

    const page = await context.newPage()

    // 1. Reproduce D6: Home card sessions with 6-day profile and no program
    console.log('\n--- Checking D6: Home card sessions fallback ---')
    await page.goto(`${baseUrl}#/home`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(1000)

    const statCard = page.locator('text=الجلسات هذا الأسبوع').locator('..')
    const statText = await statCard.innerText()
    console.log('D6 Measured Stat Card Text:\n', statText)

    await page.screenshot({
      path: path.join(rootDir, 'evidence/h4/red/d6-home-sessions.png'),
    })
    console.log('📸 Saved evidence/h4/red/d6-home-sessions.png')

    // 2. Reproduce D7: Hostile backup import passes and corrupts state
    console.log('\n--- Checking D7: Shallow Backup Import ---')
    const hostilePayload = {
      exportVersion: 1,
      profile: { name: 42, body: 'x' },
      trackingSessions: [null, 5, 'x'],
    }
    const hostilePath = path.join(
      rootDir,
      'qa/fixtures/import-invalid-types.json',
    )
    if (!fs.existsSync(path.dirname(hostilePath))) {
      fs.mkdirSync(path.dirname(hostilePath), { recursive: true })
    }
    fs.writeFileSync(hostilePath, JSON.stringify(hostilePayload, null, 2))

    // Navigate to Settings
    await page.goto(`${baseUrl}#/settings`, { waitUntil: 'domcontentloaded' })
    await page.waitForTimeout(800)

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(hostilePath)
    await page.waitForTimeout(600)

    const confirmSheet = page.locator('.sheet')
    const sheetVisible = await confirmSheet.isVisible()
    console.log(
      'Hostile import accepted by BackupImportSchema? Sheet visible =',
      sheetVisible,
    )
    if (sheetVisible) {
      const sheetContent = await confirmSheet.innerText()
      console.log('Hostile import preview shown to user:\n', sheetContent)
      await page.screenshot({
        path: path.join(rootDir, 'evidence/h4/red/d7-hostile-import.png'),
      })
      console.log('📸 Saved evidence/h4/red/d7-hostile-import.png')
    }

    // 3. Reproduce D4: Uploaded GIF returns full animated GIF data URL for thumbnails
    console.log('\n--- Checking D4: Uploaded GIF in Day List ---')
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

        // Put in IndexedDB
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
    await page.screenshot({
      path: path.join(rootDir, 'evidence/h4/red/debug-training-day0.png'),
    })
    const dayHtml = await page.content()
    console.log(
      'Day page has thumb box?',
      dayHtml.includes('exercise-thumb-box'),
    )
    console.log(
      'Day page has deadhang?',
      dayHtml.includes('deadhang') || dayHtml.includes('تعلق حر'),
    )
    const imgLocator = page.locator('.exercise-thumb-box img').first()
    await imgLocator.waitFor({ state: 'visible', timeout: 8000 })
    const src = await imgLocator.getAttribute('src')
    console.log('Day list image src prefix:', src?.slice(0, 30))
    console.log(
      'Is day list image animated GIF?',
      src?.startsWith('data:image/gif'),
    )
    await page.screenshot({
      path: path.join(rootDir, 'evidence/h4/red/d4-gif-daylist.png'),
    })
    console.log('📸 Saved evidence/h4/red/d4-gif-daylist.png')
  } finally {
    await browser.close()
    await server.close()
  }
}

main().catch(console.error)
