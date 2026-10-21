#!/usr/bin/env node
/**
 * scripts/fetch-media.mjs
 * Downloads source URLs of every display === true item in catalog-v1.json into public/media/<key>/...
 * Verifies HTTP 200, image/* content type, non-zero size.
 * Writes public/media/media-manifest.json with sha256 and size.
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const catalogPath = path.join(rootDir, 'src', 'data', 'catalog-v1.json')
const publicMediaDir = path.join(rootDir, 'public', 'media')

if (!fs.existsSync(catalogPath)) {
  console.error(`Catalog file not found at ${catalogPath}`)
  process.exit(1)
}

const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8'))

async function downloadFile(url, destPath) {
  const dir = path.dirname(destPath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText} for URL: ${url}`)
  }

  const contentType = res.headers.get('content-type') || ''
  if (!contentType.startsWith('image/')) {
    throw new Error(
      `Expected image/* content-type, got "${contentType}" for ${url}`,
    )
  }

  const arrayBuffer = await res.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (buffer.length === 0) {
    throw new Error(`Zero-length response for URL: ${url}`)
  }

  fs.writeFileSync(destPath, buffer)

  const hash = crypto.createHash('sha256').update(buffer).digest('hex')
  return {
    sizeBytes: buffer.length,
    contentType,
    sha256: hash,
  }
}

async function main() {
  console.log('🚀 Running Maganis Media Pipeline (Part 1.5)...')
  const manifest = {
    version: '1.0.0',
    generatedAt: new Date().toISOString(),
    catalogVersion: catalog.version,
    totalFiles: 0,
    totalSizeBytes: 0,
    media: {},
  }

  let totalDownloaded = 0
  let totalErrors = 0

  for (const exercise of catalog.exercises) {
    const key = exercise.key.toLowerCase()
    const exMedia = exercise.media || {}

    // 1. Frames
    if (exMedia.frames && exMedia.frames.display === true) {
      const { start, peak } = exMedia.frames

      if (start) {
        const destStart = path.join(publicMediaDir, key, 'start.jpg')
        process.stdout.write(`Downloading ${key} frame start... `)
        try {
          const info = await downloadFile(start, destStart)
          manifest.media[`${key}/start.jpg`] = {
            exerciseKey: key,
            kind: 'frame-start',
            path: `media/${key}/start.jpg`,
            ...info,
          }
          manifest.totalSizeBytes += info.sizeBytes
          manifest.totalFiles++
          totalDownloaded++
          console.log(`✓ (${info.sizeBytes} bytes)`)
        } catch (err) {
          console.log(`❌ FAIL: ${err.message}`)
          totalErrors++
        }
      }

      if (peak) {
        const destPeak = path.join(publicMediaDir, key, 'peak.jpg')
        process.stdout.write(`Downloading ${key} frame peak... `)
        try {
          const info = await downloadFile(peak, destPeak)
          manifest.media[`${key}/peak.jpg`] = {
            exerciseKey: key,
            kind: 'frame-peak',
            path: `media/${key}/peak.jpg`,
            ...info,
          }
          manifest.totalSizeBytes += info.sizeBytes
          manifest.totalFiles++
          totalDownloaded++
          console.log(`✓ (${info.sizeBytes} bytes)`)
        } catch (err) {
          console.log(`❌ FAIL: ${err.message}`)
          totalErrors++
        }
      }
    }

    // 2. GIF
    if (exMedia.gif && exMedia.gif.display === true && exMedia.gif.url) {
      const destGif = path.join(publicMediaDir, key, 'animation.gif')
      process.stdout.write(`Downloading ${key} GIF... `)
      try {
        const info = await downloadFile(exMedia.gif.url, destGif)
        manifest.media[`${key}/animation.gif`] = {
          exerciseKey: key,
          kind: 'gif',
          path: `media/${key}/animation.gif`,
          ...info,
        }
        manifest.totalSizeBytes += info.sizeBytes
        manifest.totalFiles++
        totalDownloaded++
        console.log(`✓ (${info.sizeBytes} bytes)`)
      } catch (err) {
        console.log(`❌ FAIL: ${err.message}`)
        totalErrors++
      }
    }
  }

  // Write manifest
  const manifestPath = path.join(publicMediaDir, 'media-manifest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  // Also write to src/data/media-manifest.json for typed imports if needed
  fs.writeFileSync(
    path.join(rootDir, 'src', 'data', 'media-manifest.json'),
    JSON.stringify(manifest, null, 2),
    'utf8',
  )

  const totalMb = (manifest.totalSizeBytes / (1024 * 1024)).toFixed(2)
  console.log('\n====================================================')
  console.log(`✓ Media Pipeline Complete!`)
  console.log(`  Total files downloaded: ${manifest.totalFiles}`)
  console.log(`  Total size: ${totalMb} MB (${manifest.totalSizeBytes} bytes)`)
  console.log(`  Precache budget: 12.00 MB`)
  console.log(`  Budget headroom: ${(12 - parseFloat(totalMb)).toFixed(2)} MB`)
  console.log(`  Manifest saved to: public/media/media-manifest.json`)
  console.log('====================================================\n')

  if (totalErrors > 0) {
    console.error(`❌ Completed with ${totalErrors} errors.`)
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Fatal media pipeline error:', err)
  process.exit(1)
})
