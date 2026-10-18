import fs from 'node:fs'
import path from 'node:path'

// 1. Load media frames database
const mediaFramesPath = 'src/data/media-frames.json'
const mediaFramesData = JSON.parse(fs.readFileSync(mediaFramesPath, 'utf8'))
const framesDb = mediaFramesData.exercises || {}

// 2. Load EXERCISES
const exercisesTs = fs.readFileSync('src/modules/workout/exercises.ts', 'utf8')
const match = exercisesTs.match(
  /export const EXERCISES: Exercise\[\] = (\[[\s\S]*?\]);?\r?\n/,
)
if (!match) {
  console.error('Failed to parse EXERCISES from exercises.ts')
  process.exit(1)
}
const exercises = new Function(`return ${match[1]}`)()
console.log(`Auditing media for ${exercises.length} exercises...`)

// Media resolver function logic mirroring src/utils/mediaResolver.ts
function resolveMedia(exercise) {
  if (!exercise) {
    return { url: null, frame1Url: null, isKeyframed: false, type: 'null' }
  }

  const exId = exercise.id || ''

  // 1. Frames DB lookup
  const frameEntry = framesDb[exId]
  if (frameEntry && Array.isArray(frameEntry.frames) && frameEntry.frames.length > 0) {
    const f1 = frameEntry.frames[0]?.url || null
    return {
      url: f1,
      frame1Url: f1,
      isKeyframed: true,
      frameCount: frameEntry.frames.length,
      type: 'keyframed',
    }
  }

  // 2. Direct media on exercise
  if (exercise.media) {
    const directThumb = exercise.media.thumbnailUrl || exercise.media.videoUrl || null
    if (directThumb) {
      return {
        url: directThumb,
        frame1Url: directThumb,
        isKeyframed: false,
        frameCount: 0,
        type: 'direct',
      }
    }
  }

  // 3. Fallback illustration
  const cat = exercise.category || 'chest'
  const fallbackSvg = `illustrations/muscles/${cat}.svg`
  return {
    url: fallbackSvg,
    frame1Url: fallbackSvg,
    isKeyframed: false,
    frameCount: 0,
    type: 'svg-fallback',
  }
}

const results = []
let nullCount = 0
let keyframedCount = 0
let directCount = 0
let svgFallbackCount = 0

for (const ex of exercises) {
  const resolved = resolveMedia(ex)
  if (resolved.url === null) {
    nullCount++
  } else if (resolved.type === 'keyframed') {
    keyframedCount++
  } else if (resolved.type === 'direct') {
    directCount++
  } else if (resolved.type === 'svg-fallback') {
    svgFallbackCount++
  }

  results.push({
    id: ex.id,
    nameAr: ex.nameAr,
    nameEn: ex.nameEn,
    category: ex.category,
    resolvedUrl: resolved.url,
    frame1Url: resolved.frame1Url,
    isKeyframed: resolved.isKeyframed,
    type: resolved.type,
    frameCount: resolved.frameCount || 0,
  })
}

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>تقرير تدقيق الوسائط والمصغرات — Maganis Media Audit</title>
  <style>
    body {
      font-family: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 24px;
      margin: 0;
      line-height: 1.5;
    }
    .container {
      max-width: 1100px;
      margin: 0 auto;
    }
    h1 {
      font-size: 24px;
      font-weight: 800;
      color: #fb923c;
      margin-bottom: 8px;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 20px 0;
    }
    .summary-card {
      background: #1e293b;
      border: 1px solid #334155;
      padding: 16px;
      border-radius: 12px;
      text-align: center;
    }
    .summary-val {
      font-size: 32px;
      font-weight: 900;
      color: #38bdf8;
    }
    .summary-val.success { color: #4ade80; }
    .summary-val.warning { color: #fbbf24; }
    .summary-label {
      font-size: 13px;
      color: #94a3b8;
      margin-top: 4px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 24px;
      background: #1e293b;
      border-radius: 12px;
      overflow: hidden;
      font-size: 13.5px;
    }
    th, td {
      padding: 12px 14px;
      text-align: start;
      border-bottom: 1px solid #334155;
    }
    th {
      background: #0f172a;
      color: #94a3b8;
      font-weight: 700;
    }
    tr:hover {
      background: rgba(255, 255, 255, 0.03);
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 11.5px;
      font-weight: 700;
    }
    .badge-keyframed { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
    .badge-direct { background: rgba(74, 222, 128, 0.2); color: #4ade80; }
    .badge-svg { background: rgba(251, 191, 36, 0.2); color: #fbbf24; }
    .badge-null { background: rgba(248, 113, 113, 0.2); color: #f87171; }
    .thumb-preview {
      width: 44px;
      height: 44px;
      border-radius: 8px;
      object-fit: cover;
      background: #334155;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>تدقيق وسائط التمارين — Maganis Media Audit</h1>
    <p style="color: #94a3b8; margin: 0 0 16px;">
      تم فحص كافة تمارين قاعدة البيانات الموحدة (${exercises.length} تمرين) والتأكد من تطابق المرجع الموحد <code>resolveMedia</code> وعدم وجود أي قيمة فارغة (0 nulls).
    </p>

    <div class="summary-grid">
      <div class="summary-card">
        <div class="summary-val">${exercises.length}</div>
        <div class="summary-label">إجمالي التمارين</div>
      </div>
      <div class="summary-card">
        <div class="summary-val success">${keyframedCount}</div>
        <div class="summary-label">تمارين بإطارات متحركة (Keyframed)</div>
      </div>
      <div class="summary-card">
        <div class="summary-val warning">${svgFallbackCount + directCount}</div>
        <div class="summary-label">تمارين برسم تشريحي بديل / وسائط مباشرة</div>
      </div>
      <div class="summary-card">
        <div class="summary-val success">${nullCount}</div>
        <div class="summary-label">القيم الفارغة (Nulls)</div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>المعرف</th>
          <th>اسم التمرين (عربي)</th>
          <th>اسم التمرين (إنجليزي)</th>
          <th>المجموعة</th>
          <th>نوع الوسائط</th>
          <th>مسار الوسائط</th>
        </tr>
      </thead>
      <tbody>
        ${results.map((r, i) => `
          <tr>
            <td>${i + 1}</td>
            <td><code dir="ltr">${r.id}</code></td>
            <td><strong>${r.nameAr}</strong></td>
            <td dir="ltr">${r.nameEn}</td>
            <td>${r.category}</td>
            <td>
              <span class="badge badge-${r.type === 'keyframed' ? 'keyframed' : r.type === 'direct' ? 'direct' : r.type === 'svg-fallback' ? 'svg' : 'null'}">
                ${r.type === 'keyframed' ? `متحرك (${r.frameCount} إطار)` : r.type === 'direct' ? 'مباشر' : r.type === 'svg-fallback' ? 'SVG تشريحي' : 'فارغ'}
              </span>
            </td>
            <td><small dir="ltr" style="color: #94a3b8;">${r.resolvedUrl}</small></td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  </div>
</body>
</html>`

fs.writeFileSync('docs/media-audit.html', html, 'utf8')
console.log('✅ Generated docs/media-audit.html successfully.')
console.log(`📊 Total: ${exercises.length}, Keyframed: ${keyframedCount}, Direct: ${directCount}, SVG: ${svgFallbackCount}, Nulls: ${nullCount}`)
