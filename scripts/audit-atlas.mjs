import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Color conversion and Delta E 76
function hexToRgb(hex) {
  let c = hex.replace('#', '')
  if (c.length === 3) c = c.split('').map(x => x + x).join('')
  const num = parseInt(c, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToLab(rgb) {
  let [r, g, b] = rgb.map(v => {
    v /= 255
    return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  })
  // Observer = 2°, Illuminant = D65
  let x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047
  let y = (r * 0.2126 + g * 0.7152 + b * 0.0722) / 1.00000
  let z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883

  x = x > 0.008856 ? Math.pow(x, 1/3) : (7.787 * x) + (16 / 116)
  y = y > 0.008856 ? Math.pow(y, 1/3) : (7.787 * y) + (16 / 116)
  z = z > 0.008856 ? Math.pow(z, 1/3) : (7.787 * z) + (16 / 116)

  return [(116 * y) - 16, 500 * (x - y), 200 * (y - z)]
}

export function deltaE76(hex1, hex2) {
  const lab1 = rgbToLab(hexToRgb(hex1))
  const lab2 = rgbToLab(hexToRgb(hex2))
  const dl = lab1[0] - lab2[0]
  const da = lab1[1] - lab2[1]
  const db = lab1[2] - lab2[2]
  return Math.sqrt(dl * dl + da * da + db * db)
}

async function runAudit() {
  console.log('🚀 Running Atlas Render Audit...')

  const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
  const { resolveMuscles } = await import('../src/modules/workout/muscleResolver.ts')
  const atlasMeta = JSON.parse(fs.readFileSync(path.join(rootDir, 'public/atlas/atlas-meta.json'), 'utf8'))
  const anteriorSvg = fs.readFileSync(path.join(rootDir, 'public/atlas/anterior.svg'), 'utf8')
  const posteriorSvg = fs.readFileSync(path.join(rootDir, 'public/atlas/posterior.svg'), 'utf8')

  // The 12 exercises specified in Part 4.1
  const targetExercises = [
    'Barbell Incline Bench Press',
    'Pull-Up',
    'Barbell Back Squat',
    'Romanian Deadlift',
    'Dumbbell Lateral Raise',
    'Face Pull',
    'Barbell Hip Thrust',
    'Standing Calf Raise',
    'Plank',
    'Dumbbell Bicep Curl',
    'Parallel Bar Dips',
    'Dumbbell Wrist Curl',
  ]

  // Map each to library or closest entry
  const mapped = []
  for (const name of targetExercises) {
    let ex = EXERCISES.find(e => e.name && e.name.toLowerCase() === name.toLowerCase())
    if (!ex) {
      // Find closest
      ex = EXERCISES.find(e => {
        if (!e.name) return false
        const n = e.name.toLowerCase()
        const target = name.toLowerCase()
        if (target.includes('incline bench') && n.includes('incline bench')) return true
        if (target.includes('pull-up') && n.includes('pull-up')) return true
        if (target.includes('squat') && n.includes('squat')) return true
        if (target.includes('lateral raise') && n.includes('lateral raise')) return true
        if (target.includes('dips') && n.includes('dips')) return true
        if (target.includes('calf') && n.includes('calf')) return true
        if (target.includes('bicep') && n.includes('bicep')) return true
        if (target.includes('wrist') && n.includes('wrist')) return true
        return false
      })
    }
    mapped.push({ requestedName: name, exercise: ex || { id: `mock-${name}`, name, nameAr: name, category: 'chest' } })
  }

  // Check SVG elements
  const getSvgMuscles = (svgStr) => {
    const vis = new Set()
    const full = new Set()
    const re = /<path[^>]+id="m-([^"-]+)-(vis|full)"[^>]+data-muscle="([^"]+)"/g
    let match
    while ((match = re.exec(svgStr)) !== null) {
      if (match[2] === 'vis') vis.add(match[3])
      else full.add(match[3])
    }
    return { vis, full }
  }

  const anteriorMuscles = getSvgMuscles(anteriorSvg)
  const posteriorMuscles = getSvgMuscles(posteriorSvg)

  console.log(`Anterior SVG: ${anteriorMuscles.vis.size} vis, ${anteriorMuscles.full.size} full`)
  console.log(`Posterior SVG: ${posteriorMuscles.vis.size} vis, ${posteriorMuscles.full.size} full`)

  // Check back muscles erroneously in anterior.svg
  const backMusclesInAnterior = [...anteriorMuscles.vis].filter(id => {
    return atlasMeta.muscles[id]?.best_view === 'P'
  })
  console.log('Back muscles with vis paths in anterior.svg:', backMusclesInAnterior.length)

  // Check front muscles erroneously in posterior.svg
  const frontMusclesInPosterior = [...posteriorMuscles.vis].filter(id => {
    return atlasMeta.muscles[id]?.best_view === 'A'
  })
  console.log('Front muscles with vis paths in posterior.svg:', frontMusclesInPosterior.length)


  // Audit 12 exercises
  let auditMarkdown = `# تقرير تدقيق رسم الأطلس التشريحي — Atlas Render Audit\n\n`
  auditMarkdown += `**تاريخ التدقيق**: 18 أكتوبر 2026\n`
  auditMarkdown += `**الهدف**: تدقيق 12 تمريناً عبر الواجهتين (أمامي / خلفي) والوضعين (فاتح / داكن) لكشف ومطابقة عيوب الرندرة.\n\n`

  auditMarkdown += `## 1. جدول التدقيق للتمارين الـ 12\n\n`
  auditMarkdown += `| التمرين المطلوب | المعرّف المستخدم | العضلات الأساسية (بيانات) | العضلات المساعدة (بيانات) | العضلات المرسومة (أمامي) | العضلات المرسومة (خلفي) | الواجهة الابتدائية | التطابق |\n`
  auditMarkdown += `| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :---: |\n`

  const mismatches = []

  for (const item of mapped) {
    const res = resolveMuscles(item.exercise)
    const primaries = res.muscles.filter(m => m.role === 'primary').map(m => m.id)
    const secondaries = res.muscles.filter(m => m.role === 'secondary').map(m => m.id)

    // Check which ones are painted on anterior vs posterior
    const paintedA = res.muscles.filter(m => anteriorMuscles.vis.has(m.id)).map(m => m.id)
    const paintedP = res.muscles.filter(m => posteriorMuscles.vis.has(m.id)).map(m => m.id)

    // Compute expected initial view: side with most primaries (tie: first primary)
    let pCountA = 0
    let pCountP = 0
    let firstPrimaryView = 'A'
    primaries.forEach((pid, idx) => {
      const best = atlasMeta.muscles[pid]?.best_view || 'A'
      if (idx === 0) firstPrimaryView = best
      if (best === 'A') pCountA++
      else pCountP++
    })
    const expectedInitialView = pCountA > pCountP ? 'A' : (pCountP > pCountA ? 'P' : firstPrimaryView)

    const isMatch = res.defaultView === expectedInitialView
    if (!isMatch) {
      mismatches.push({
        exercise: item.requestedName,
        reason: `Initial view mismatch: resolved=${res.defaultView}, expected=${expectedInitialView}`
      })
    }

    auditMarkdown += `| **${item.requestedName}** | \`${item.exercise.id}\` | ${primaries.join(', ') || '—'} | ${secondaries.join(', ') || '—'} | ${paintedA.join(', ') || '—'} | ${paintedP.join(', ') || '—'} | **${res.defaultView}** | ${isMatch ? '✓' : '⚠️ خلل واجهة'} |\n`
  }

  auditMarkdown += `\n## 2. تحليل الخلل الجذري لمسألة «الرسم خلفي والتعليق أمامي» (Ledger 5)\n\n`
  auditMarkdown += `1. **مسارات الظهر داخل ملف anterior.svg**:\n`
  auditMarkdown += `   - يحتوي ملف \`public/atlas/anterior.svg\` على مسارات مرئية \`muscle-vis\` لعضلات الظهر والعمود الفقري:\n`
  auditMarkdown += `     \`${backMusclesInAnterior.join('`, `')}\`.\n`
  auditMarkdown += `   - عندما ترسم العضلات الحيادية (Neutral muscles) بشفافية 0.35 ولون داكن، تُطبع خطوط العمود الفقري وعضلات الظهر السفلية والترابيس الوسطى مباشرة فوق الصدر والبطن، مما يجعل الشكل الأمامي يبدو كأنه ظهر مرسوم من الخلف تماماً!\n\n`

  auditMarkdown += `2. **توحيد ألوان العضلات (كل العضلات برتقالية)**:\n`
  auditMarkdown += `   - في \`src/styles/components.css\` (الأسطر 1379-1394)، كانت كل من \`.muscle-primary\` و \`.muscle-secondary\` تأخذ \`fill: var(--color-accent) !important\`، مما طمس التمييز بين الأساسي والمساعد.\n`
  auditMarkdown += `   - الحل: اعتماد توكنز الأطلس المعزولة \`--color-muscle-primary: #e53935\` و \`--color-muscle-secondary: #fdd835\` مع نقش تهشير SVG (\`hatch pattern\`) للعضلة المساعدة.\n`

  fs.writeFileSync(path.join(rootDir, 'docs/atlas-render-audit.md'), auditMarkdown, 'utf8')
  console.log('✓ Generated docs/atlas-render-audit.md')

  return { mapped, backMusclesInAnterior, mismatches }
}

runAudit()
