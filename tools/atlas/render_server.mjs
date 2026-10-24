import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const potraceDir = path.dirname(require.resolve('potrace'))
const Bitmap = require(path.join(potraceDir, 'types', 'Bitmap.js'))
const potracePkg = require('potrace')
const utils = require(path.join(potraceDir, 'utils'))

const projectRoot = process.cwd()
const atlasDir = path.join(projectRoot, 'public', 'atlas')
if (!fs.existsSync(atlasDir)) {
  fs.mkdirSync(atlasDir, { recursive: true })
}

const atlasMusclesPath = path.join(projectRoot, 'data', 'atlas_muscles.json')
const atlasMusclesData = JSON.parse(fs.readFileSync(atlasMusclesPath, 'utf8'))

function decodeRLE(rleObj, length) {
  const data = new Uint8Array(length)
  let val = rleObj.firstVal
  let idx = 0
  for (const count of rleObj.rle) {
    if (val === 1) data.fill(1, idx, idx + count)
    idx += count
    val = 1 - val
  }
  return data
}

function traceMask(mask, width, height, params = {}) {
  let count = 0
  for (let i = 0; i < mask.length; i++) {
    if (mask[i] === 1) count++
  }
  if (count === 0) return ''

  const bm = new Bitmap(width, height)
  for (let i = 0; i < mask.length; i++) {
    bm.data[i] = mask[i] === 1 ? 0 : 255
  }

  // Increased path precision: turdSize 3, optTolerance 0.25 (C1.4)
  const potrace = new potracePkg.Potrace({
    turdSize: 3,
    optTolerance: 0.25,
    ...params
  })
  potrace._luminanceData = bm
  potrace._imageLoaded = true

  if (!potrace._processed) {
    potrace._bmToPathlist()
    potrace._processPath()
    potrace._processed = true
  }

  return potrace._pathlist
    .map(function (p) {
      return utils.renderCurve(p.curve)
    })
    .join(' ')
}


function findLabelAnchor(mask, width, height) {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  let count = 0
  for (let y = 0; y < height; y++) {
    const row = y * width
    for (let x = 0; x < width; x++) {
      if (mask[row + x] === 1) {
        count++
        if (x < minX) minX = x
        if (x > maxX) maxX = x
        if (y < minY) minY = y
        if (y > maxY) maxY = y
      }
    }
  }

  if (count === 0 || minX > maxX) return null

  const bw = maxX - minX + 1
  const bh = maxY - minY + 1
  const dist = new Int32Array(bw * bh)

  for (let y = 0; y < bh; y++) {
    const gy = minY + y
    for (let x = 0; x < bw; x++) {
      const gx = minX + x
      if (mask[gy * width + gx] === 0) {
        dist[y * bw + x] = 0
      } else {
        let d = Infinity
        if (x > 0) d = Math.min(d, dist[y * bw + (x - 1)] + 1)
        else d = 1
        if (y > 0) d = Math.min(d, dist[(y - 1) * bw + x] + 1)
        else d = 1
        dist[y * bw + x] = d
      }
    }
  }

  let maxD = 0
  let bestX = Math.round((minX + maxX) / 2)
  let bestY = Math.round((minY + maxY) / 2)

  for (let y = bh - 1; y >= 0; y--) {
    const gy = minY + y
    for (let x = bw - 1; x >= 0; x--) {
      const gx = minX + x
      if (dist[y * bw + x] > 0) {
        let d = dist[y * bw + x]
        if (x < bw - 1) d = Math.min(d, dist[y * bw + (x + 1)] + 1)
        else d = 1
        if (y < bh - 1) d = Math.min(d, dist[(y + 1) * bw + x] + 1)
        else d = 1
        dist[y * bw + x] = d

        if (d > maxD) {
          maxD = d
          bestX = gx
          bestY = gy
        }
      }
    }
  }

  return [bestX, bestY]
}

const PORT = 4892
let chromeProc = null

const server = http.createServer((req, res) => {
  const url = req.url
  console.log(`[HTTP ${req.method}] ${url}`)

  if (url === '/api/log' && req.method === 'POST') {
    let msg = ''
    req.on('data', chunk => msg += chunk)
    req.on('end', () => {
      console.log(`[BROWSER LOG] ${msg}`)
      res.writeHead(200)
      res.end('OK')
    })
    return
  }

  if (url === '/' || url === '/index.html') {
    const htmlPath = path.join(projectRoot, 'tools', 'atlas', 'render_page.html')
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(fs.readFileSync(htmlPath))
  } else if (url.startsWith('/three.') || url.endsWith('.js')) {
    const fileName = path.basename(url)
    const filePath = path.join(projectRoot, 'node_modules', 'three', 'build', fileName)
    if (fs.existsSync(filePath)) {
      res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' })
      res.end(fs.readFileSync(filePath))
    } else {
      res.writeHead(404)
      res.end('File Not Found')
    }
  } else if (url === '/geometry_meta.json') {
    const metaPath = path.join(projectRoot, 'tools', 'atlas', 'geometry_meta.json')
    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(fs.readFileSync(metaPath))
  } else if (url === '/geometry_bundle.bin') {
    const binPath = path.join(projectRoot, 'tools', 'atlas', 'geometry_bundle.bin')
    const stat = fs.statSync(binPath)
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size
    })
    fs.createReadStream(binPath).pipe(res)
  } else if (url === '/api/upload_results' && req.method === 'POST') {
    let body = ''
    req.on('data', chunk => (body += chunk))
    req.on('end', async () => {
      console.log('Received render results from Headless Chrome. Processing...')
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'OK' }))

      try {
        const payload = JSON.parse(body)
        await processRenderResults(payload)
      } catch (err) {
        console.error('Error processing render results:', err)
      } finally {
        if (chromeProc) chromeProc.kill()
        server.close()
        console.log('Render Server and Chrome stopped.')
      }
    })
  } else {
    res.writeHead(404)
    res.end('Not Found')
  }
})

async function processRenderResults(payload) {
  const { width, height, shadeAnterior, shadePosterior, silhouetteA, silhouetteP, muscles } = payload
  const N_PIXELS = width * height

  console.log(`Canvas dimensions: ${width}x${height}`)

  // 1. Save shade WebP files
  console.log('Saving shade WebP rasters...')
  const anteriorWebpBase64 = shadeAnterior.replace(/^data:image\/webp;base64,/, '')
  const posteriorWebpBase64 = shadePosterior.replace(/^data:image\/webp;base64,/, '')

  const anteriorWebpPath = path.join(atlasDir, 'shade-anterior.webp')
  const posteriorWebpPath = path.join(atlasDir, 'shade-posterior.webp')

  fs.writeFileSync(anteriorWebpPath, Buffer.from(anteriorWebpBase64, 'base64'))
  fs.writeFileSync(posteriorWebpPath, Buffer.from(posteriorWebpBase64, 'base64'))

  const antSize = fs.statSync(anteriorWebpPath).size
  const postSize = fs.statSync(posteriorWebpPath).size

  console.log(`shade-anterior.webp size: ${(antSize / 1024).toFixed(1)} KB (limit <= 300 KB)`)
  console.log(`shade-posterior.webp size: ${(postSize / 1024).toFixed(1)} KB (limit <= 300 KB)`)

  // 2. Decode Silhouettes and Trace
  console.log('Vectorizing body silhouettes...')
  const silMaskA = decodeRLE(silhouetteA, N_PIXELS)
  const silMaskP = decodeRLE(silhouetteP, N_PIXELS)

  const silPathA = traceMask(silMaskA, width, height, { turdSize: 8, optTolerance: 0.5 })
  const silPathP = traceMask(silMaskP, width, height, { turdSize: 8, optTolerance: 0.5 })

  // 3. Map muscle results by ID
  const renderedMap = new Map()
  for (const m of muscles) {
    renderedMap.set(m.id, m)
  }

  // 4. Process each of the 53 atlas muscles
  const metaMuscles = {}
  const svgPathsA = []
  const svgPathsP = []

  // Add silhouette paths first with non-scaling stroke and token fills
  svgPathsA.push(`  <path id="body-silhouette" class="atlas-silhouette" d="${silPathA}" fill="var(--atlas-silhouette-fill)" stroke="var(--atlas-silhouette-stroke)" stroke-width="1.5" vector-effect="non-scaling-stroke" />`)
  svgPathsP.push(`  <path id="body-silhouette" class="atlas-silhouette" d="${silPathP}" fill="var(--atlas-silhouette-fill)" stroke="var(--atlas-silhouette-stroke)" stroke-width="1.5" vector-effect="non-scaling-stroke" />`)

  console.log('Vectorizing individual muscle masks and computing metadata...')
  const geometryMeta = JSON.parse(fs.readFileSync(path.join(projectRoot, 'tools', 'atlas', 'geometry_meta.json'), 'utf8'))
  const geomMap = new Map()
  for (const g of geometryMeta) geomMap.set(g.id, g)

  // Orientation sanity values
  let rightPecCentroidX = null
  let leftPecCentroidX = null

  const hitTargetsA = []
  const hitTargetsP = []

  for (const def of atlasMusclesData.muscles) {
    const id = def.id
    const rendered = renderedMap.get(id)
    const geom = geomMap.get(id)

    if (!rendered || !geom) {
      // Muscle without mesh (e.g. rectus abdominis, lats, transversus, quadratus lumborum)
      metaMuscles[id] = {
        id,
        ar: def.ar,
        en: def.en,
        expected_views: def.expected_views,
        best_view: def.expected_views.includes('A') ? 'A' : 'P',
        best_layer: 'D',
        visible_ratio: 0,
        area_px: 0,
        derived: !!def.derive,
        parts_used: [],
        missing: true,
        anchors: { A: null, P: null },
        views: {
          A: { visible_pixels: 0, full_pixels: 0, visible_ratio: 0, layer: 'D', anchor: null },
          P: { visible_pixels: 0, full_pixels: 0, visible_ratio: 0, layer: 'D', anchor: null }
        }
      }
      svgPathsA.push(`  <path id="m-${id}-full" class="muscle-full" data-muscle="${id}" d="" />`)
      svgPathsA.push(`  <path id="m-${id}-vis" class="muscle-vis" data-muscle="${id}" d="" />`)
      svgPathsP.push(`  <path id="m-${id}-full" class="muscle-full" data-muscle="${id}" d="" />`)
      svgPathsP.push(`  <path id="m-${id}-vis" class="muscle-vis" data-muscle="${id}" d="" />`)
      continue
    }

    // Decode masks
    const maskVisA = decodeRLE(rendered.rleVisA, N_PIXELS)
    const maskFullA = decodeRLE(rendered.rleFullA, N_PIXELS)
    const maskVisP = decodeRLE(rendered.rleVisP, N_PIXELS)
    const maskFullP = decodeRLE(rendered.rleFullP, N_PIXELS)

    // Vectorize paths with higher precision
    const dVisA = traceMask(maskVisA, width, height)
    const dFullA = traceMask(maskFullA, width, height)
    const dVisP = traceMask(maskVisP, width, height)
    const dFullP = traceMask(maskFullP, width, height)

    // Compute label anchors
    let anchorA = findLabelAnchor(maskVisA, width, height)
    let anchorP = findLabelAnchor(maskVisP, width, height)

    if (!def.expected_views.includes('A') || rendered.visCountA === 0) {
      anchorA = null
    }
    if (!def.expected_views.includes('P') || rendered.visCountP === 0) {
      anchorP = null
    }

    // Hit targets for small muscles (< 2500 px area in 1024x2048)
    if (anchorA && rendered.visCountA > 0 && rendered.visCountA < 3500) {
      hitTargetsA.push({ id, anchor: anchorA, area: rendered.visCountA })
    }
    if (anchorP && rendered.visCountP > 0 && rendered.visCountP < 3500) {
      hitTargetsP.push({ id, anchor: anchorP, area: rendered.visCountP })
    }

    // Orientation check check on pec_clavicular
    if (id === 'pec_clavicular') {
      let rightSumX = 0, rightCnt = 0
      let leftSumX = 0, leftCnt = 0
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          if (maskVisA[y * width + x] === 1) {
            if (x < width / 2) {
              rightSumX += x
              rightCnt++
            } else {
              leftSumX += x
              leftCnt++
            }
          }
        }
      }
      if (rightCnt > 0) rightPecCentroidX = rightSumX / rightCnt
      if (leftCnt > 0) leftPecCentroidX = leftSumX / leftCnt
    }

    // Statistics & layers
    const ratioA = rendered.fullCountA > 0 ? rendered.visCountA / rendered.fullCountA : 0
    const ratioP = rendered.fullCountP > 0 ? rendered.visCountP / rendered.fullCountP : 0

    const layerA = ratioA >= 0.35 ? 'S' : 'D'
    const layerP = ratioP >= 0.35 ? 'S' : 'D'

    // Determine best view based on expected_views and visible pixels
    let bestView = 'A'
    if (def.expected_views === 'P') {
      bestView = 'P'
    } else if (def.expected_views === 'A') {
      bestView = 'A'
    } else {
      bestView = rendered.visCountP > rendered.visCountA ? 'P' : 'A'
    }

    const bestRatio = bestView === 'A' ? ratioA : ratioP
    const bestLayer = bestView === 'A' ? layerA : layerP
    const bestArea = bestView === 'A' ? rendered.visCountA : rendered.visCountP

    metaMuscles[id] = {
      id,
      ar: def.ar,
      en: def.en,
      expected_views: def.expected_views,
      best_view: bestView,
      best_layer: bestLayer,
      visible_ratio: Math.round(bestRatio * 1000) / 1000,
      area_px: bestArea,
      derived: !!def.derive,
      parts_used: geom.parts_used || [],
      missing: false,
      anchors: {
        A: anchorA,
        P: anchorP
      },
      views: {
        A: {
          visible_pixels: rendered.visCountA,
          full_pixels: rendered.fullCountA,
          visible_ratio: Math.round(ratioA * 1000) / 1000,
          layer: layerA,
          anchor: anchorA
        },
        P: {
          visible_pixels: rendered.visCountP,
          full_pixels: rendered.fullCountP,
          visible_ratio: Math.round(ratioP * 1000) / 1000,
          layer: layerP,
          anchor: anchorP
        }
      }
    }

    // Append to SVG paths
    svgPathsA.push(`  <path id="m-${id}-full" class="muscle-full" data-muscle="${id}" d="${dFullA}" />`)
    svgPathsA.push(`  <path id="m-${id}-vis" class="muscle-vis" data-muscle="${id}" d="${dVisA}" />`)

    svgPathsP.push(`  <path id="m-${id}-full" class="muscle-full" data-muscle="${id}" d="${dFullP}" />`)
    svgPathsP.push(`  <path id="m-${id}-vis" class="muscle-vis" data-muscle="${id}" d="${dVisP}" />`)
  }

  // Hit target circles: larger first, smaller last so smaller/specific muscle wins on overlap
  hitTargetsA.sort((a, b) => b.area - a.area)
  for (const h of hitTargetsA) {
    svgPathsA.push(`  <circle id="hit-${h.id}-A" class="muscle-hit-target" data-muscle="${h.id}" cx="${h.anchor[0]}" cy="${h.anchor[1]}" r="35" />`)
  }
  hitTargetsP.sort((a, b) => b.area - a.area)
  for (const h of hitTargetsP) {
    svgPathsP.push(`  <circle id="hit-${h.id}-P" class="muscle-hit-target" data-muscle="${h.id}" cx="${h.anchor[0]}" cy="${h.anchor[1]}" r="35" />`)
  }

  // 5. Assemble SVG Files
  console.log('Writing SVG files...')
  const svgHeader = (title) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <title>${title}</title>
  <defs>
    <style>
      .atlas-silhouette { fill: var(--atlas-silhouette-fill); stroke: var(--atlas-silhouette-stroke); stroke-width: 1.5px; vector-effect: non-scaling-stroke; }
      .muscle-full { fill: none; stroke: none; display: none; vector-effect: non-scaling-stroke; }
      .muscle-vis { fill: currentColor; stroke: var(--atlas-line); stroke-width: 1px; vector-effect: non-scaling-stroke; }
      .muscle-hit-target { fill: transparent; stroke: transparent; pointer-events: all; cursor: pointer; }
    </style>
    <!-- Static subtle depth cue linear gradients (C1.1) -->
    <linearGradient id="grad-muscle-depth" x1="0%" y1="0%" x2="25%" y2="100%">
      <stop offset="0%" stop-color="var(--atlas-muscle-highlight)" />
      <stop offset="45%" stop-color="var(--atlas-muscle)" />
      <stop offset="100%" stop-color="var(--atlas-muscle-shadow)" />
    </linearGradient>
    <linearGradient id="grad-primary-depth" x1="0%" y1="0%" x2="25%" y2="100%">
      <stop offset="0%" stop-color="#ef5350" />
      <stop offset="100%" stop-color="#c62828" />
    </linearGradient>
    <linearGradient id="grad-secondary-depth" x1="0%" y1="0%" x2="25%" y2="100%">
      <stop offset="0%" stop-color="#ffee58" />
      <stop offset="100%" stop-color="#fbc02d" />
    </linearGradient>
  </defs>
`
  const svgFooter = `</svg>\n`

  const anteriorSvg = svgHeader('Maganis Muscle Atlas - Anterior View') + svgPathsA.join('\n') + '\n' + svgFooter
  const posteriorSvg = svgHeader('Maganis Muscle Atlas - Posterior View') + svgPathsP.join('\n') + '\n' + svgFooter


  const antSvgPath = path.join(atlasDir, 'anterior.svg')
  const postSvgPath = path.join(atlasDir, 'posterior.svg')

  fs.writeFileSync(antSvgPath, anteriorSvg, 'utf8')
  fs.writeFileSync(postSvgPath, posteriorSvg, 'utf8')

  console.log(`anterior.svg size: ${(fs.statSync(antSvgPath).size / 1024).toFixed(1)} KB`)
  console.log(`posterior.svg size: ${(fs.statSync(postSvgPath).size / 1024).toFixed(1)} KB`)

  // 6. Write atlas-meta.json
  console.log('Writing atlas-meta.json...')
  const metaJson = {
    version: 1,
    generated_at: new Date().toISOString(),
    source: 'BodyParts3D Release 4.0',
    license: 'Creative Commons Attribution-ShareAlike 2.1 Japan (CC BY-SA 2.1 JP) / CC BY 4.0',
    viewBox: `0 0 ${width} ${height}`,
    width,
    height,
    total_muscles: atlasMusclesData.muscles.length,
    muscles_with_mesh: Object.values(metaMuscles).filter(m => !m.missing).length,
    muscles_missing: Object.values(metaMuscles).filter(m => m.missing).length,
    muscles: metaMuscles
  }

  const metaPath = path.join(atlasDir, 'atlas-meta.json')
  fs.writeFileSync(metaPath, JSON.stringify(metaJson, null, 2), 'utf8')
  console.log(`Saved ${metaPath}`)

  // 7. Orientation Sanity Check Verification
  console.log('\n--- ORIENTATION SANITY CHECK ---')
  if (rightPecCentroidX !== null && leftPecCentroidX !== null) {
    console.log(`Right Pec Major Centroid X (screen): ${rightPecCentroidX.toFixed(1)} px`)
    console.log(`Left Pec Major Centroid X (screen):  ${leftPecCentroidX.toFixed(1)} px`)
    const passed = rightPecCentroidX < leftPecCentroidX
    console.log(`Test rightPecCentroidX < leftPecCentroidX: ${passed ? 'PASSED (Body right side is on viewer left)' : 'FAILED'}`)
    if (!passed) {
      console.error('CRITICAL ERROR: Orientation sanity test failed!')
      process.exit(1)
    }
  } else {
    console.warn('Warning: Could not measure pec_clavicular centroids.')
  }
  console.log('--------------------------------\n')
  console.log('Atlas static assets generated successfully!')
}

server.listen(PORT, () => {
  console.log(`Atlas Render Server listening at http://localhost:${PORT}`)
  console.log('Launching Headless Chrome...')
  const profileDir = path.join(projectRoot, '.cache', 'chrome_profile')
  if (!fs.existsSync(profileDir)) fs.mkdirSync(profileDir, { recursive: true })

  chromeProc = spawn('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', [
    '--headless=new',
    '--disable-gpu',
    '--use-gl=angle',
    '--no-sandbox',
    `--user-data-dir=${profileDir}`,
    `http://localhost:${PORT}`
  ])

  chromeProc.stdout?.on('data', d => console.log('[CHROME STDOUT]', d.toString().trim()))
  chromeProc.stderr?.on('data', d => console.log('[CHROME STDERR]', d.toString().trim()))

  chromeProc.on('error', err => {
    console.error('Failed to spawn Chrome:', err)
    server.close()
  })
})
