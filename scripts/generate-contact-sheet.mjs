import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

const atlasMusclesData = JSON.parse(fs.readFileSync(path.join(rootDir, 'data/atlas_muscles.json'), 'utf8'))
const muscleNamesData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/muscle-names.json'), 'utf8'))
const anteriorSvgRaw = fs.readFileSync(path.join(rootDir, 'public/atlas/anterior.svg'), 'utf8')
const posteriorSvgRaw = fs.readFileSync(path.join(rootDir, 'public/atlas/posterior.svg'), 'utf8')

// Parse silhouette and paths from SVG
function extractSvgParts(svgStr) {
  const silMatch = svgStr.match(/<path[^>]+id="body-silhouette"[^>]*\/>/i) || svgStr.match(/<path[^>]+class="[^"]*body-silhouette[^"]*"[^>]*\/>/i)
  const silhouette = silMatch ? silMatch[0] : ''

  const paths = new Map()
  const pathRegex = /<path([^>]+)\/>/gi
  let m
  while ((m = pathRegex.exec(svgStr)) !== null) {
    const full = m[0]
    const muscleMatch = full.match(/data-muscle="([^"]+)"/)
    if (muscleMatch) {
      const id = muscleMatch[1]
      const isFull = full.includes('class="muscle-full"') || full.includes('id="m-' + id + '-full"')
      const isVis = full.includes('class="muscle-vis"') || full.includes('id="m-' + id + '-vis"')
      if (!paths.has(id)) paths.set(id, { full: [], vis: [] })
      if (isFull) paths.get(id).full.push(full)
      else if (isVis) paths.get(id).vis.push(full)
      else paths.get(id).vis.push(full)
    }
  }
  return { silhouette, paths }
}

const antParts = extractSvgParts(anteriorSvgRaw)
const postParts = extractSvgParts(posteriorSvgRaw)

const namesMap = new Map(muscleNamesData.muscles.map(m => [m.id, m]))

const outDir = path.join(rootDir, 'evidence/g6-c/contact-sheet')
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true })
}

// Build HTML content for contact sheet
let html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Maganis Anatomical Muscle Atlas Contact Sheet (53 Muscles)</title>
<style>
  body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 24px; }
  h1, h2 { color: #38bdf8; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px; margin-top: 20px; }
  .tile { background: #1e293b; border: 1px solid #334155; border-radius: 8px; padding: 10px; display: flex; flex-direction: column; align-items: center; }
  .tile-title { font-size: 12px; font-weight: bold; margin-top: 8px; text-align: center; color: #f1f5f9; }
  .tile-sub { font-size: 10px; color: #94a3b8; text-align: center; }
  .tile-badge { font-size: 9px; padding: 2px 6px; border-radius: 4px; margin-top: 4px; font-weight: 600; }
  .badge-mesh { background: #065f46; color: #34d399; }
  .badge-derived { background: #854d0e; color: #facc15; }
  .badge-nomesh { background: #7f1d1d; color: #f87171; }
  .svg-wrap { width: 160px; height: 240px; background: #090d16; border-radius: 4px; overflow: hidden; display: flex; align-items: center; justify-content: center; position: relative; }
  .svg-wrap svg { width: 100%; height: 100%; }
  .overview-container { display: flex; gap: 24px; margin-bottom: 32px; }
  .overview-card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; align-items: center; }
  .overview-svg { width: 240px; height: 360px; background: #090d16; border-radius: 6px; }
</style>
</head>
<body>
<h1>Maganis Anatomical Muscle Atlas — 53 Muscles Contact Sheet</h1>
<p style="color: #cbd5e1; font-size: 13px;">Full-body overviews in muscle tone and individual 160x240 px tiles for each of the 53 muscles in expected views.</p>

<div class="overview-container">
  <div class="overview-card" id="overview-card-A">
    <h2>Anterior Overview (All Muscles)</h2>
    <div class="overview-svg">
      <svg viewBox="0 0 1024 2048">
        <style>
          .body-silhouette { fill: rgba(255,255,255,0.06); stroke: rgba(255,255,255,0.2); stroke-width: 2px; }
          .muscle-vis, .muscle-full { fill: #e53935; stroke: #b71c1c; stroke-width: 1.5px; opacity: 0.85; }
        </style>
        ${antParts.silhouette}
        ${Array.from(antParts.paths.values()).flatMap(v => v.vis).join('\n')}
      </svg>
    </div>
  </div>
  <div class="overview-card" id="overview-card-P">
    <h2>Posterior Overview (All Muscles)</h2>
    <div class="overview-svg">
      <svg viewBox="0 0 1024 2048">
        <style>
          .body-silhouette { fill: rgba(255,255,255,0.06); stroke: rgba(255,255,255,0.2); stroke-width: 2px; }
          .muscle-vis, .muscle-full { fill: #e53935; stroke: #b71c1c; stroke-width: 1.5px; opacity: 0.85; }
        </style>
        ${postParts.silhouette}
        ${Array.from(postParts.paths.values()).flatMap(v => v.vis).join('\n')}
      </svg>
    </div>
  </div>
</div>

<h2>Individual Muscle Tiles (160x240 px)</h2>
<div class="grid">
`

const tileRecords = []

for (const m of atlasMusclesData.muscles) {
  const nameInfo = namesMap.get(m.id) || {}
  const atlasVal = nameInfo.atlas || 'mesh'
  const views = m.expected_views === 'A+P' ? ['A', 'P'] : [m.expected_views]

  for (const v of views) {
    const isAnt = v === 'A'
    const parts = isAnt ? antParts : postParts
    const mPaths = parts.paths.get(m.id)

    let pathContent = ''
    let hasGeometry = false

    if (mPaths && (mPaths.vis.length > 0 || mPaths.full.length > 0)) {
      hasGeometry = true
      // Render visible path in accent, full in semi-trans
      pathContent = (mPaths.full.length > 0 ? mPaths.full.join('\n') : mPaths.vis.join('\n'))
    }

    const badgeClass = atlasVal === 'mesh' ? 'badge-mesh' : atlasVal === 'derived_approx' ? 'badge-derived' : 'badge-nomesh'
    const badgeLabel = atlasVal === 'mesh' ? 'mesh (BP3D)' : atlasVal === 'derived_approx' ? 'derived_approx' : 'no_mesh (locator)'

    const tileId = `tile-${m.id}-${v}`
    tileRecords.push({
      id: m.id,
      view: v,
      gym_ar: nameInfo.gym_ar || m.ar,
      sci_en: nameInfo.sci_en || m.en,
      atlas: atlasVal,
      hasGeometry,
      tileId,
    })

    html += `
  <div class="tile" id="${tileId}">
    <div class="svg-wrap">
      <svg viewBox="0 0 1024 2048">
        <style>
          .body-silhouette { fill: rgba(255,255,255,0.06); stroke: rgba(255,255,255,0.22); stroke-width: 2px; }
          .target-muscle { fill: #f95700; stroke: #ff8a50; stroke-width: 2.5px; opacity: 0.95; }
        </style>
        ${parts.silhouette}
        ${hasGeometry ? `<g class="target-muscle">${pathContent.replace(/class="[^"]*"/g, 'class="target-muscle"')}</g>` : `
          <g>
            <circle cx="512" cy="700" r="16" fill="#ef4444" />
            <text x="512" y="740" text-anchor="middle" fill="#ef4444" font-size="28" font-family="sans-serif">No Mesh</text>
          </g>
        `}
      </svg>
    </div>
    <div class="tile-title">${m.id} (${v === 'A' ? 'أمامي' : 'خلفي'})</div>
    <div class="tile-sub">${nameInfo.gym_ar || m.ar} · ${m.en}</div>
    <div class="tile-badge ${badgeClass}">${badgeLabel}</div>
  </div>
`
  }
}

html += `
</div>
</body>
</html>`

const htmlPath = path.join(outDir, 'index.html')
fs.writeFileSync(htmlPath, html, 'utf8')
console.log('Generated contact sheet HTML at:', htmlPath)

// Use Playwright to capture images
async function captureImages() {
  const browser = await chromium.launch({ channel: 'chrome', headless: true })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await page.goto(`file://${htmlPath}`, { waitUntil: 'load' })
  await page.waitForTimeout(500)

  // 1. Capture anterior overview
  console.log('Capturing overview_anterior.png...')
  const elA = page.locator('#overview-card-A .overview-svg')
  await elA.screenshot({ path: path.join(outDir, 'overview_anterior.png') })

  // 2. Capture posterior overview
  console.log('Capturing overview_posterior.png...')
  const elP = page.locator('#overview-card-P .overview-svg')
  await elP.screenshot({ path: path.join(outDir, 'overview_posterior.png') })

  // 3. Capture individual tiles for key muscles and sample
  for (const r of tileRecords) {
    const tileLoc = page.locator(`#${r.tileId} .svg-wrap`)
    if (await tileLoc.count() > 0) {
      await tileLoc.screenshot({ path: path.join(outDir, `${r.tileId}.png`) })
    }
  }

  // 4. Capture full contact sheet view
  console.log('Capturing full contact_sheet.png...')
  await page.screenshot({ path: path.join(outDir, 'contact_sheet.png'), fullPage: true })

  await browser.close()
  console.log('Contact sheet images captured successfully!')
}

captureImages().catch(console.error)
