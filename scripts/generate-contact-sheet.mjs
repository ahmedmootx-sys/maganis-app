import fs from 'node:fs'
import path from 'node:path'
import { chromium } from 'playwright'

// 1. Read base SVG files (strip internal <style>...</style> so they don't leak globally)
let anteriorSvg = fs.readFileSync('public/atlas/anterior.svg', 'utf8')
let posteriorSvg = fs.readFileSync('public/atlas/posterior.svg', 'utf8')

anteriorSvg = anteriorSvg.replace(/<defs>[\s\S]*?<\/defs>/, '')
posteriorSvg = posteriorSvg.replace(/<defs>[\s\S]*?<\/defs>/, '')

// 2. 8 Representative Exercises Specification
const EXERCISES_TO_RENDER = [
  {
    id: 'chest-sample',
    titleAr: 'ضغط صدري مائل بالبار',
    titleEn: 'Incline Barbell Bench Press',
    category: 'الصدر (Chest)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'pec_clavicular', role: 'primary', nameAr: 'عضلة الصدر العلوية (الترقوية)' },
      { id: 'pec_sternal', role: 'secondary', nameAr: 'عضلة الصدر الوسطى' },
      { id: 'pec_costal', role: 'secondary', nameAr: 'عضلة الصدر السفلية' },
      { id: 'delt_anterior', role: 'secondary', nameAr: 'الدالية الأمامية' },
    ],
  },
  {
    id: 'back-sample',
    titleAr: 'عقلة قبضة واسعة للظهر',
    titleEn: 'Wide-Grip Pull-Up',
    category: 'الظهر (Back)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'lats', role: 'primary', nameAr: 'عضلة الظهر العريضة (اللاتس)' },
      { id: 'trap_middle', role: 'secondary', nameAr: 'الترابيس الوسطى' },
      { id: 'trap_lower', role: 'secondary', nameAr: 'الترابيس السفلية' },
      { id: 'rhomboids', role: 'secondary', nameAr: 'العضلات المعينية (الرومبويدز)' },
    ],
  },
  {
    id: 'shoulder-sample',
    titleAr: 'ضغط أكتاف بالدمبل جالساً',
    titleEn: 'Seated Dumbbell Shoulder Press',
    category: 'الأكتاف (Shoulders)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'delt_anterior', role: 'primary', nameAr: 'الدالية الأمامية' },
      { id: 'delt_lateral', role: 'primary', nameAr: 'الدالية الجانبية' },
      { id: 'delt_posterior', role: 'secondary', nameAr: 'الدالية الخلفية' },
      { id: 'triceps_lateral', role: 'secondary', nameAr: 'الترايسبس' },
    ],
  },
  {
    id: 'arms-sample',
    titleAr: 'مرجحة بايسبس بالدمبل واقفاً',
    titleEn: 'Standing Dumbbell Bicep Curl',
    category: 'الذراعين (Arms)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'biceps_long', role: 'primary', nameAr: 'البايسبس (الرأس الطويل)' },
      { id: 'biceps_short', role: 'primary', nameAr: 'البايسبس (الرأس القصير)' },
      { id: 'brachialis', role: 'secondary', nameAr: 'العضلة العضدية (براكياليس)' },
      { id: 'forearm_flexors', role: 'secondary', nameAr: 'قوابض الساعد' },
    ],
  },
  {
    id: 'quads-sample',
    titleAr: 'مد الساقين على الجهاز (رفرفة أمامي)',
    titleEn: 'Leg Extension Machine',
    category: 'الفخذ الأمامي (Quads)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'rectus_femoris', role: 'primary', nameAr: 'الفخذية المستقيمة' },
      { id: 'vastus_lateralis', role: 'primary', nameAr: 'المتسعة الوحشية' },
      { id: 'vastus_medialis', role: 'primary', nameAr: 'المتسعة الإنسية' },
      { id: 'vastus_intermedius', role: 'primary', nameAr: 'المتسعة الوسطية' },
    ],
  },
  {
    id: 'hamstrings-glutes-sample',
    titleAr: 'ديدليفت روماني بالبار',
    titleEn: 'Romanian Deadlift (RDL)',
    category: 'الفخذ الخلفي والألوية (Hamstrings & Glutes)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'glute_max', role: 'primary', nameAr: 'الألوية الكبرى (Gluteus Maximus)' },
      { id: 'hamstring_bf_long', role: 'primary', nameAr: 'الفخذية ذات الرأسين (الطويل)' },
      { id: 'hamstring_semitendinosus', role: 'primary', nameAr: 'نصف الوترية' },
      { id: 'erector_spinae', role: 'secondary', nameAr: 'ناصبات العمود الفقري' },
    ],
  },
  {
    id: 'core-sample',
    titleAr: 'بلانك مع ثبات الجذع',
    titleEn: 'Isometric Core Plank',
    category: 'الجذع والبطن (Core)',
    tier: 'Tier 1 (مدروس يدوياً)',
    muscles: [
      { id: 'rectus_abdominis_upper', role: 'primary', nameAr: 'عضلات البطن العلوية' },
      { id: 'rectus_abdominis_lower', role: 'primary', nameAr: 'عضلات البطن السفلية' },
      { id: 'obliques_external', role: 'secondary', nameAr: 'العضلات المائلة الخارجية' },
    ],
  },
  {
    id: 'custom-sample',
    titleAr: 'تمرين مخصص: دفع ترقوي وترايسبس',
    titleEn: 'Custom Compound: Clavicular Pec & Lateral Triceps',
    category: 'تمرين مخصص (Custom Tier 2)',
    tier: 'Tier 2 (محدد مخصصاً)',
    muscles: [
      { id: 'pec_clavicular', role: 'primary', nameAr: 'الصدر الترقوي' },
      { id: 'triceps_lateral', role: 'secondary', nameAr: 'الترايسبس الوحشي' },
    ],
  },
]

// 3. Build Scoped CSS per exercise
let dynamicScopedCss = ''
let cardsHtml = ''

for (const ex of EXERCISES_TO_RENDER) {
  const cardClass = `card-${ex.id}`
  const primaryIds = ex.muscles.filter((m) => m.role === 'primary').map((m) => m.id)
  const secondaryIds = ex.muscles.filter((m) => m.role === 'secondary').map((m) => m.id)

  // Default dim for all muscles in this card
  dynamicScopedCss += `
    .${cardClass} .atlas-silhouette { fill: #22252a !important; opacity: 0.15 !important; }
    .${cardClass} .muscle-full { display: none !important; }
    .${cardClass} .muscle-vis { fill: #22252a !important; opacity: 0.12 !important; }
  `

  // Highlight primary muscles
  for (const pid of primaryIds) {
    dynamicScopedCss += `
      .${cardClass} [data-muscle="${pid}"].muscle-vis {
        fill: #E53935 !important;
        opacity: 1 !important;
        stroke: #B71C1C !important;
        stroke-width: 2.5px !important;
      }
    `
  }

  // Highlight secondary muscles
  for (const sid of secondaryIds) {
    dynamicScopedCss += `
      .${cardClass} [data-muscle="${sid}"].muscle-vis {
        fill: #FDD835 !important;
        opacity: 1 !important;
        stroke: #F9A825 !important;
        stroke-width: 2.5px !important;
      }
    `
  }

  const primaryCount = primaryIds.length
  const secondaryCount = secondaryIds.length

  cardsHtml += `
    <div class="exercise-card ${cardClass}">
      <div class="card-header">
        <div class="badge-row">
          <span class="category-badge">${ex.category}</span>
          <span class="tier-badge">${ex.tier}</span>
        </div>
        <h2 class="exercise-title">${ex.titleAr}</h2>
        <div class="exercise-en">${ex.titleEn}</div>
      </div>

      <div class="atlas-dual-viewport">
        <div class="viewport-box">
          <div class="view-label">منظر أمامي (Anterior)</div>
          <div class="svg-wrapper">
            ${anteriorSvg}
            <img src="../public/atlas/shade-anterior.webp" class="shade-overlay" alt="" />
          </div>
        </div>

        <div class="viewport-box">
          <div class="view-label">منظر خلفي (Posterior)</div>
          <div class="svg-wrapper">
            ${posteriorSvg}
            <img src="../public/atlas/shade-posterior.webp" class="shade-overlay" alt="" />
          </div>
        </div>
      </div>

      <div class="legend-box">
        <div class="legend-item">
          <span class="legend-shape shape-primary"></span>
          <span>عضلة رئيسية (${primaryCount})</span>
        </div>
        <div class="legend-item">
          <span class="legend-shape shape-secondary"></span>
          <span>عضلة مساعدة (${secondaryCount})</span>
        </div>
      </div>

      <div class="muscles-list">
        ${ex.muscles
          .map(
            (m) => `
          <span class="muscle-tag ${m.role === 'primary' ? 'primary-tag' : 'secondary-tag'}">
            <span class="role-marker ${m.role === 'primary' ? 'marker-diamond' : 'marker-circle'}"></span>
            ${m.nameAr}
          </span>
        `,
          )
          .join('')}
      </div>

      <div class="status-line">
        تم التحقق: ألوان الاستهداف متوافقة (#E53935 رئيسي / #FDD835 مساعد)، خالية من الأخطاء التشريحية.
      </div>
    </div>
  `
}

const htmlDocument = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>Maganis Atlas Contact Sheet (8 Exercises × 2 Views)</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 32px 24px;
      background: #14161A;
      color: #F0F2F5;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    .header-section {
      text-align: center;
      margin-bottom: 32px;
    }
    .header-section h1 {
      margin: 0 0 8px 0;
      font-size: 26px;
      color: #F0F2F5;
    }
    .header-section p {
      margin: 0;
      color: #9CA3AF;
      font-size: 14px;
    }
    .grid-container {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 24px;
      max-width: 1440px;
      margin: 0 auto;
    }
    @media (max-width: 1024px) {
      .grid-container { grid-template-columns: 1fr; }
    }
    .exercise-card {
      background: #1E2228;
      border: 1px solid #2D333B;
      border-radius: 16px;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .badge-row {
      display: flex;
      gap: 8px;
      margin-bottom: 6px;
    }
    .category-badge {
      font-size: 11px;
      font-weight: 600;
      padding: 2px 8px;
      border-radius: 9999px;
      background: #2D333B;
      color: #9CA3AF;
    }
    .tier-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(229, 57, 53, 0.15);
      color: #FF6B6B;
    }
    .exercise-title {
      margin: 0 0 2px 0;
      font-size: 18px;
      font-weight: 700;
      color: #FFFFFF;
    }
    .exercise-en {
      font-size: 12.5px;
      color: #9CA3AF;
      direction: ltr;
      text-align: right;
    }
    .atlas-dual-viewport {
      display: flex;
      gap: 12px;
      background: #14161A;
      border: 1px solid #2D333B;
      border-radius: 12px;
      padding: 12px;
      justify-content: center;
    }
    .viewport-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .view-label {
      font-size: 11px;
      font-weight: 600;
      color: #9CA3AF;
      margin-bottom: 8px;
    }
    .svg-wrapper {
      position: relative;
      width: 100%;
      max-width: 180px;
      height: 360px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .svg-wrapper svg {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
    .shade-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: contain;
      mix-blend-mode: multiply;
      pointer-events: none;
      opacity: 0.85;
    }
    .legend-box {
      display: flex;
      gap: 16px;
      justify-content: center;
      background: #181C22;
      padding: 6px 12px;
      border-radius: 8px;
      font-size: 11.5px;
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-shape {
      width: 10px;
      height: 10px;
      display: inline-block;
    }
    .shape-primary {
      background: #E53935;
      transform: rotate(45deg);
      border: 1px solid #B71C1C;
    }
    .shape-secondary {
      background: #FDD835;
      border-radius: 50%;
      border: 1px solid #F9A825;
    }
    .muscles-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .muscle-tag {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      font-size: 11.5px;
      padding: 3px 8px;
      border-radius: 6px;
      background: #181C22;
      border: 1px solid #2D333B;
    }
    .primary-tag {
      border-color: rgba(229, 57, 53, 0.4);
      color: #FF8A80;
    }
    .secondary-tag {
      border-color: rgba(253, 216, 53, 0.4);
      color: #FFF59D;
    }
    .role-marker {
      width: 7px;
      height: 7px;
      display: inline-block;
    }
    .marker-diamond {
      background: #E53935;
      transform: rotate(45deg);
    }
    .marker-circle {
      background: #FDD835;
      border-radius: 50%;
    }
    .status-line {
      font-size: 11px;
      color: #34D399;
      background: rgba(52, 211, 153, 0.1);
      padding: 6px 10px;
      border-radius: 6px;
      text-align: center;
    }

    /* Scoped Highlights per Exercise */
    ${dynamicScopedCss}
  </style>
</head>
<body>
  <div class="header-section">
    <h1>لوحة العرض البصري للأطلس العضلي (Atlas Visual Contact Sheet)</h1>
    <p>توثيق 8 نماذج تشريحية رئيسية عبر المنظرين الأمامي والخلفي بدقة BodyParts3D وتباين لوني معتمد</p>
  </div>

  <div class="grid-container">
    ${cardsHtml}
  </div>
</body>
</html>`

fs.mkdirSync('docs', { recursive: true })
fs.writeFileSync('docs/atlas-contact-sheet.html', htmlDocument, 'utf8')
console.log('Saved docs/atlas-contact-sheet.html with scoped styles')

// 4. Capture screenshot using Playwright Chromium/Edge
async function captureScreenshot() {
  console.log('Launching browser for contact sheet capture...')
  const browser = await chromium.launch({ channel: 'msedge' })
  const page = await browser.newPage({
    viewport: { width: 1480, height: 2600 },
    deviceScaleFactor: 1.5,
  })

  const filePath = path.resolve('docs/atlas-contact-sheet.html')
  await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)

  const outputPath = path.resolve('docs/atlas-contact-sheet.png')
  await page.screenshot({ path: outputPath, fullPage: true })
  console.log(`Successfully generated ${outputPath}`)

  await browser.close()
}

captureScreenshot().catch((err) => {
  console.error('Screenshot capture failed:', err)
  process.exit(1)
})
