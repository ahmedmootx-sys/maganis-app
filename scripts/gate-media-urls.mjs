#!/usr/bin/env node
/**
 * scripts/gate-media-urls.mjs
 * Gate: Exercise Media URLs and Coverage Verification (TASK G3 Part 2)
 *
 * Verifies:
 * 1. Validates every URL produced by resolveMedia for every catalog exercise under `vite preview`:
 *    - Returns HTTP 200
 *    - Content-Type starts with image/
 *    - Byte size > 0
 *    - No 404, 3xx, or HTML fallback (SPA fallback)
 * 2. Case-sensitivity check on disk:
 *    - Verifies filename on disk matches URL exact casing to prevent Linux 404s.
 * 3. Media-frames.json integrity:
 *    - Keys must correspond to valid catalog exercises (no orphaned keys).
 *    - Every frame URL points to a valid file on disk with exact casing.
 */

import fs from 'node:fs'
import path from 'node:path'
import http from 'node:http'
import { fileURLToPath } from 'node:url'
import { preview } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, (res) => {
      const chunks = []
      res.on('data', (chunk) => chunks.push(chunk))
      res.on('end', () => {
        const buffer = Buffer.concat(chunks)
        resolve({
          status: res.statusCode,
          headers: res.headers,
          contentType: res.headers['content-type'] || '',
          size: buffer.length,
          bodyText: buffer.toString('utf8', 0, Math.min(200, buffer.length)),
        })
      })
    })
    req.on('error', (err) => reject(err))
    req.setTimeout(5000, () => {
      req.destroy(new Error('Timeout'))
    })
  })
}

function verifyDiskCasing(relPath, basePath = '') {
  // relPath is e.g. "/maganis-app/exercises/chest-1_0.jpg" or "/exercises/chest-1_0.jpg"
  let clean = relPath.replace(/^\//, '').replace(/\\/g, '/')
  const baseClean = basePath.replace(/^\/|\/$/g, '')
  if (baseClean && clean.startsWith(baseClean + '/')) {
    clean = clean.slice(baseClean.length + 1)
  }
  const parts = clean.split('/')
  let curDir = path.resolve(rootDir, 'public')

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    if (!fs.existsSync(curDir)) {
      return { ok: false, error: `Directory not found: ${curDir}` }
    }
    const entries = fs.readdirSync(curDir)
    const exactMatch = entries.find((e) => e === part)
    if (!exactMatch) {
      const caseInsensitiveMatch = entries.find(
        (e) => e.toLowerCase() === part.toLowerCase(),
      )
      if (caseInsensitiveMatch) {
        return {
          ok: false,
          error: `Case mismatch: URL references '${part}', but file on disk is named '${caseInsensitiveMatch}'`,
        }
      }
      return {
        ok: false,
        error: `File not found on disk: ${path.join(curDir, part)}`,
      }
    }
    curDir = path.join(curDir, exactMatch)
  }

  return { ok: true, diskPath: curDir }
}

async function runGate() {
  console.log('🚀 Running Gate: gate-media-urls (TASK G3 Part 2)...')

  // 1. Start vite preview server
  const previewPort = 5192
  let server
  try {
    server = await preview({
      root: rootDir,
      preview: { port: previewPort, strictPort: true },
      logLevel: 'error',
    })
  } catch (err) {
    console.error('❌ Failed to start Vite preview server:', err.message)
    process.exit(1)
  }

  const baseUrl = server.resolvedUrls.local[0].replace(/\/$/, '')
  console.log(
    `📡 Vite preview listening at ${baseUrl} (base: ${server.config.base})`,
  )

  const failures = []
  const testedUrls = new Set()
  let exercisesWithMediaCount = 0
  let exercisesNullMediaCount = 0
  let twoFrameCount = 0
  let singleFrameCount = 0

  try {
    // 2. Load EXERCISES and resolveMedia
    const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
    const { resolveMedia } = await import('../src/utils/mediaResolver.ts')

    console.log(
      `📋 Auditing media for all ${EXERCISES.length} catalog exercises...`,
    )

    // 3. Load and audit media-frames.json
    const mediaFramesPath = path.resolve(rootDir, 'src/data/media-frames.json')
    let mediaFrames = { exercises: {} }
    if (fs.existsSync(mediaFramesPath)) {
      mediaFrames = JSON.parse(fs.readFileSync(mediaFramesPath, 'utf8'))
    }

    const catalogIds = new Set(EXERCISES.map((e) => e.id))

    // Check orphaned keys in media-frames.json
    for (const key of Object.keys(mediaFrames.exercises || {})) {
      if (!catalogIds.has(key)) {
        failures.push({
          type: 'ORPHANED_FRAME_KEY',
          key,
          error: `Exercise key '${key}' in media-frames.json does not exist in catalog EXERCISES`,
        })
      }
    }

    // 4. Test every catalog exercise
    for (const ex of EXERCISES) {
      const res = resolveMedia(ex)
      const resById = resolveMedia(ex.id)

      if (res.url !== resById.url || res.frame1Url !== resById.frame1Url) {
        failures.push({
          type: 'RESOLVER_INCONSISTENCY',
          exerciseId: ex.id,
          error: `resolveMedia(exercise) does not match resolveMedia(exercise.id): url='${res.url}' vs '${resById.url}'`,
        })
      }

      if (!res.url) {
        exercisesNullMediaCount++
        continue
      }

      exercisesWithMediaCount++
      if (res.frame1Url && res.frame1Url !== res.url) {
        twoFrameCount++
      } else {
        singleFrameCount++
      }

      const urlsToCheck = [res.url]
      if (res.frame1Url && res.frame1Url !== res.url) {
        urlsToCheck.push(res.frame1Url)
      }

      for (const targetUrl of urlsToCheck) {
        if (testedUrls.has(targetUrl)) continue
        testedUrls.add(targetUrl)

        // Case A: Local asset URL
        if (targetUrl.startsWith('/') || !targetUrl.includes('://')) {
          let fetchPath = targetUrl.startsWith('/')
            ? targetUrl
            : `/${targetUrl}`
          const basePrefix = (server.config.base || '').replace(/\/$/, '')
          if (basePrefix && fetchPath.startsWith(basePrefix)) {
            fetchPath = fetchPath.slice(basePrefix.length)
          }
          const fetchTarget = `${baseUrl}${fetchPath.startsWith('/') ? '' : '/'}${fetchPath}`
          try {
            const resp = await fetchUrl(fetchTarget)

            if (resp.status !== 200) {
              failures.push({
                type: 'HTTP_STATUS_FAILURE',
                exerciseId: ex.id,
                url: targetUrl,
                status: resp.status,
                error: `HTTP status ${resp.status} (expected 200) at ${fetchTarget}`,
              })
              continue
            }

            // Check Content-Type
            if (!resp.contentType.startsWith('image/')) {
              failures.push({
                type: 'CONTENT_TYPE_FAILURE',
                exerciseId: ex.id,
                url: targetUrl,
                contentType: resp.contentType,
                error: `Invalid Content-Type '${resp.contentType}', expected image/* (likely HTML fallback)`,
              })
              continue
            }

            // Check byte length
            if (resp.size === 0) {
              failures.push({
                type: 'EMPTY_BODY',
                exerciseId: ex.id,
                url: targetUrl,
                error: `Zero byte payload returned`,
              })
              continue
            }

            // Disk casing check
            const diskCheck = verifyDiskCasing(targetUrl, server.config.base)
            if (!diskCheck.ok) {
              failures.push({
                type: 'DISK_CASING_OR_MISSING',
                exerciseId: ex.id,
                url: targetUrl,
                error: diskCheck.error,
              })
            }
          } catch (err) {
            failures.push({
              type: 'NETWORK_FETCH_ERROR',
              exerciseId: ex.id,
              url: targetUrl,
              error: err.message,
            })
          }
        } else {
          // External URL (e.g. CDN)
          // Under vite preview and offline-first PWA contract, exercises should have local assets.
          // Check whether external URL is used or if on-disk asset was expected.
          failures.push({
            type: 'EXTERNAL_URL_NON_OFFLINE',
            exerciseId: ex.id,
            url: targetUrl,
            error: `Exercise media points to external URL '${targetUrl}'. Offline PWA contract requires local assets or explicit null.`,
          })
        }
      }
    }

    // 5. Check owner's 41 exercises mapping
    const ownerMappingPath = path.resolve(
      rootDir,
      'docs/program-import-mapping.csv',
    )
    if (fs.existsSync(ownerMappingPath)) {
      const csvContent = fs.readFileSync(ownerMappingPath, 'utf8')
      const lines = csvContent.split(/\r?\n/).filter(Boolean).slice(1)
      let ownerMappedCount = 0
      let ownerCoveredCount = 0

      for (const line of lines) {
        const parts = line.split(',')
        const matchedKey = parts[1]?.replace(/"/g, '')
        if (matchedKey && matchedKey !== 'NONE') {
          ownerMappedCount++
          const res = resolveMedia(matchedKey)
          if (res.url) ownerCoveredCount++
        }
      }
      console.log(
        `👤 Owner's 41 exercises: ${ownerMappedCount} mapped in catalog, ${ownerCoveredCount} with verified media`,
      )
    }
  } finally {
    if (server) {
      server.httpServer.close()
    }
  }

  // Print results
  console.log('\n📊 Gate Summary:')
  console.log(`- Total unique URLs tested: ${testedUrls.size}`)
  console.log(
    `- Exercises with media: ${exercisesWithMediaCount} (${twoFrameCount} two-frame animated, ${singleFrameCount} static single-frame)`,
  )
  console.log(`- Exercises with null media: ${exercisesNullMediaCount}`)
  console.log(`- Total failures / violations: ${failures.length}`)

  if (failures.length > 0) {
    console.error(
      `\n❌ FAIL: ${failures.length} media URL violations detected:`,
    )
    for (const f of failures.slice(0, 30)) {
      console.error(
        `  [${f.type}] Exercise: ${f.exerciseId || f.key || 'N/A'} | URL: ${f.url || 'N/A'}`,
      )
      console.error(`    ↳ ${f.error}`)
    }
    if (failures.length > 30) {
      console.error(`  ... and ${failures.length - 30} more failures.`)
    }
    process.exit(1)
  }

  console.log(
    '\n✓ gate-media-urls passed cleanly! All exercise media URLs verified under Vite preview.',
  )
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
