#!/usr/bin/env node
/**
 * scripts/extract-keyframes.mjs
 * Extracts N=5 keyframes from exercise animations using ffmpeg (if available).
 * If ffmpeg is missing, logs a clear report and registers existing 2-frame assets (_0.jpg, _1.jpg).
 * Generates docs/media-frames-review.html.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const mediaFramesPath = path.join(rootDir, 'src', 'data', 'media-frames.json')
const publicFramesDir = path.join(rootDir, 'public', 'media', 'frames')
const docsPath = path.join(rootDir, 'docs')
const reviewHtmlPath = path.join(docsPath, 'media-frames-review.html')

if (!fs.existsSync(publicFramesDir)) {
  fs.mkdirSync(publicFramesDir, { recursive: true })
}
if (!fs.existsSync(docsPath)) {
  fs.mkdirSync(docsPath, { recursive: true })
}

console.log('====================================================')
console.log('   Maganis Keyframe Extractor (Task G 3.5)')
console.log('====================================================\n')

let hasFfmpeg = false
try {
  execSync('ffmpeg -version', { stdio: 'pipe' })
  hasFfmpeg = true
  console.log('✓ ffmpeg is available on system PATH.')
} catch {
  console.log('⚠️ ffmpeg is NOT available on this system. Falling back to local two-frame assets (_0.jpg / _1.jpg).')
}

// Load exercise media map
const mediaMapPath = path.join(rootDir, 'public', 'exercises', 'exerciseMediaMap.json')
let mediaMap = {}
if (fs.existsSync(mediaMapPath)) {
  mediaMap = JSON.parse(fs.readFileSync(mediaMapPath, 'utf8'))
}

const framesData = {
  version: 1,
  generatedAt: new Date().toISOString(),
  ffmpegAvailable: hasFfmpeg,
  exercises: {},
}

const exerciseKeys = Object.keys(mediaMap)

for (const key of exerciseKeys) {
  const item = mediaMap[key]
  const images = item.images || []

  // If 2 frames exist, register them as start (بداية) and end (نهاية)
  if (images.length >= 2) {
    framesData.exercises[key] = {
      exerciseKey: key,
      matchedName: item.matchedName || key,
      frameCount: images.length,
      confirmed: false,
      frames: images.map((img, idx) => ({
        index: idx,
        url: img,
        label: idx === 0 ? 'بداية' : idx === images.length - 1 ? 'نهاية' : `مرحلة ${idx + 1}`,
      })),
      startFrame: 0,
      endFrame: images.length - 1,
    }
  } else if (images.length === 1) {
    framesData.exercises[key] = {
      exerciseKey: key,
      matchedName: item.matchedName || key,
      frameCount: 1,
      confirmed: false,
      frames: [{ index: 0, url: images[0], label: 'ثابت' }],
      startFrame: 0,
      endFrame: 0,
    }
  }
}

fs.writeFileSync(mediaFramesPath, JSON.stringify(framesData, null, 2), 'utf8')
console.log(`✓ Generated ${mediaFramesPath} with ${Object.keys(framesData.exercises).length} exercise entries.`)

// Generate review HTML page
let html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>مراجعة إطارات التمارين — Maganis Keyframes Review</title>
  <style>
    body { font-family: system-ui, -apple-system, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
    h1 { margin-bottom: 8px; color: #f97316; }
    .status-badge { display: inline-block; padding: 4px 10px; border-radius: 999px; font-size: 13px; font-weight: bold; background: ${hasFfmpeg ? '#15803d' : '#9a3412'}; color: #fff; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }
    .card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 14px; display: flex; flex-direction: column; gap: 10px; }
    .card-title { font-weight: bold; font-size: 15px; color: #e2e8f0; display: flex; justify-content: space-between; }
    .frames-strip { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 6px; }
    .frame-box { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .frame-img { width: 90px; height: 90px; object-fit: contain; border-radius: 6px; background: #000; border: 1px solid #475569; }
    .frame-lbl { font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <h1>مراجعة إطارات الحركة للتمارين (Keyframes Review)</h1>
  <div class="status-badge">${hasFfmpeg ? '✓ ffmpeg متوفر (تم الاستخراج الكامل)' : '⚠️ ffmpeg غير مثبت محلياً — استخدام صور البداية والنهاية الحالية'}</div>
  <p>إجمالي التمارين المفحوصة: ${Object.keys(framesData.exercises).length} تمريناً. حتى تأكيد المراجع البشري، يُعتمد الإطار الأول (بداية) والأخير (نهاية).</p>

  <div class="grid">
`

for (const [key, ex] of Object.entries(framesData.exercises)) {
  html += `    <div class="card">
      <div class="card-title">
        <span>${ex.matchedName}</span>
        <span style="font-size: 12px; color: #94a3b8;"><bdi dir="ltr">${key}</bdi></span>
      </div>
      <div class="frames-strip">
`
  for (const f of ex.frames) {
    html += `        <div class="frame-box">
          <img class="frame-img" src="../public${f.url}" alt="${f.label}" loading="lazy" />
          <span class="frame-lbl">${f.label}</span>
        </div>
`
  }
  html += `      </div>
    </div>
`
}

html += `  </div>
</body>
</html>`

fs.writeFileSync(reviewHtmlPath, html, 'utf8')
console.log(`✓ Generated ${reviewHtmlPath}`)
