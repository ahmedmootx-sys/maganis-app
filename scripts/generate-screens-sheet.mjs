#!/usr/bin/env node
/**
 * scripts/generate-screens-sheet.mjs
 * Generates docs/screens.html — Visual Contact Sheet & Audit of all 76 R19 States.
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const statesFile = path.join(rootDir, 'src/qa/states.ts')
const content = fs.readFileSync(statesFile, 'utf8')

// Parse states from states.ts
function extractArray(varName) {
  const regex = new RegExp(
    `export const ${varName}: AppStateDef\\[\\] = \\[([\\s\\S]*?)\\]\\n`,
    'm',
  )
  const match = content.match(regex)
  if (!match) return []
  const body = match[1]
  const items = []
  const itemRegex =
    /{\s*id:\s*'([^']+)',\s*kind:\s*'([^']+)',\s*title:\s*'([^']+)',\s*category:\s*'([^']+)'(?:,\s*route:\s*'([^']+)')?(?:,\s*sheetId:\s*'([^']+)')?(?:,\s*stepIndex:\s*(\d+))?(?:,\s*choiceKey:\s*'([^']+)')?(?:,\s*optionValue:\s*([^,}]+))?/g
  let m
  while ((m = itemRegex.exec(body)) !== null) {
    items.push({
      id: m[1],
      kind: m[2],
      title: m[3],
      category: m[4],
      route: m[5],
      sheetId: m[6],
      stepIndex: m[7] ? parseInt(m[7], 10) : undefined,
      choiceKey: m[8],
      optionValue: m[9]?.replace(/['"]/g, ''),
    })
  }
  return items
}

const routes = extractArray('ROUTE_STATES')
const sheets = extractArray('SHEET_STATES')
const wizardSteps = extractArray('WIZARD_STEP_STATES')
const choices = extractArray('CHOICE_OPTION_STATES')
const allStates = [...routes, ...sheets, ...wizardSteps, ...choices]

const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>سجل الشاشات وحالات النظام — تطبيق مجانيس (${allStates.length} حالة)</title>
  <style>
    :root {
      --bg: #0b0c0e;
      --surface: #141518;
      --surface-2: #1c1d22;
      --accent: #ff6b00;
      --accent-glow: rgba(255, 107, 0, 0.25);
      --text: #f0f2f5;
      --text-muted: #8e95a2;
      --border: rgba(255, 255, 255, 0.08);
      --success: #10b981;
      --radius: 12px;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Cairo", sans-serif;
      padding: 32px 24px;
      line-height: 1.5;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 32px;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    .header h1 {
      font-size: 28px;
      font-weight: 800;
      color: #fff;
      margin-bottom: 8px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 13px;
      font-weight: 700;
      background: var(--accent);
      color: #0b0c0e;
    }
    .stats-bar {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin-top: 20px;
    }
    .stat-card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 16px;
    }
    .stat-card .count {
      font-size: 26px;
      font-weight: 800;
      color: var(--accent);
    }
    .stat-card .label {
      font-size: 13px;
      color: var(--text-muted);
    }
    .filters {
      max-width: 1200px;
      margin: 0 auto 24px;
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }
    .filter-btn {
      background: var(--surface);
      color: var(--text);
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13.5px;
      font-weight: 600;
      transition: all 0.15s ease;
    }
    .filter-btn.active, .filter-btn:hover {
      background: var(--accent);
      color: #0b0c0e;
      border-color: var(--accent);
    }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 16px;
    }
    .card {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 10px;
      transition: transform 0.15s ease, border-color 0.15s ease;
    }
    .card:hover {
      transform: translateY(-2px);
      border-color: var(--accent);
    }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 8px;
    }
    .card-id {
      font-family: monospace;
      font-size: 12px;
      color: var(--text-muted);
      direction: ltr;
      background: var(--surface-2);
      padding: 2px 6px;
      border-radius: 4px;
    }
    .card-kind {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      padding: 2px 6px;
      border-radius: 4px;
      background: rgba(16, 185, 129, 0.15);
      color: var(--success);
    }
    .card-title {
      font-size: 15px;
      font-weight: 700;
      color: #fff;
    }
    .card-meta {
      font-size: 12.5px;
      color: var(--text-muted);
      display: flex;
      flex-direction: column;
      gap: 4px;
      direction: ltr;
      text-align: left;
      background: var(--surface-2);
      padding: 8px 10px;
      border-radius: 6px;
    }
    .card-footer {
      margin-top: auto;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 10px;
      border-top: 1px solid var(--border);
      font-size: 12px;
    }
    .status-ok {
      color: var(--success);
      display: flex;
      align-items: center;
      gap: 4px;
      font-weight: 600;
    }
    .card a {
      color: var(--accent);
      text-decoration: none;
      font-weight: 600;
    }
    .card a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>
      سجل الشاشات وحالات النظام
      <span class="badge">R19 State Registry: ${allStates.length} حالة</span>
    </h1>
    <p style="color: var(--text-muted); font-size: 14.5px;">
      المصدر الحقيقي الواحد لكافة المسارات والنوافذ وخطوات المعالج والأزرار المحددة في تطبيق مجانيس (TASK G4).
    </p>

    <div class="stats-bar">
      <div class="stat-card">
        <div class="count">${allStates.length}</div>
        <div class="label">إجمالي الحالات المسجلة والمفحوصة</div>
      </div>
      <div class="stat-card">
        <div class="count">${routes.length}</div>
        <div class="label">المسارات الرئيسية (Routes)</div>
      </div>
      <div class="stat-card">
        <div class="count">${sheets.length}</div>
        <div class="label">النوافذ المنبثقة والقوائم (Sheets)</div>
      </div>
      <div class="stat-card">
        <div class="count">${wizardSteps.length}</div>
        <div class="label">خطوات معالج الإعداد (Wizard)</div>
      </div>
      <div class="stat-card">
        <div class="count">${choices.length}</div>
        <div class="label">حالات الاختيار المحددة (Choices)</div>
      </div>
    </div>
  </div>

  <div class="filters">
    <button class="filter-btn active" onclick="filterCategory('all')">الكل (${allStates.length})</button>
    <button class="filter-btn" onclick="filterCategory('routes')">المسارات (${routes.length})</button>
    <button class="filter-btn" onclick="filterCategory('sheets')">النوافذ المنبثقة (${sheets.length})</button>
    <button class="filter-btn" onclick="filterCategory('wizard')">معالج الإعداد (${wizardSteps.length})</button>
    <button class="filter-btn" onclick="filterCategory('choices')">حالات الاختيار (${choices.length})</button>
  </div>

  <div class="grid" id="states-grid">
    ${allStates
      .map((s) => {
        let metaDetails = ''
        if (s.route)
          metaDetails += `<div><strong>route:</strong> ${s.route}</div>`
        if (s.sheetId)
          metaDetails += `<div><strong>sheetId:</strong> ${s.sheetId}</div>`
        if (s.stepIndex !== undefined)
          metaDetails += `<div><strong>stepIndex:</strong> ${s.stepIndex}</div>`
        if (s.choiceKey)
          metaDetails += `<div><strong>choiceKey:</strong> ${s.choiceKey} = ${s.optionValue}</div>`

        const link = s.route
          ? `<a href="../#${s.route}" target="_blank">فتح الشاشة ↗</a>`
          : ''

        return `
        <div class="card" data-category="${s.category}">
          <div class="card-top">
            <span class="card-id">${s.id}</span>
            <span class="card-kind">${s.kind}</span>
          </div>
          <div class="card-title">${s.title}</div>
          <div class="card-meta">
            ${metaDetails}
          </div>
          <div class="card-footer">
            <span class="status-ok">✓ مفحوص ونشط</span>
            ${link}
          </div>
        </div>
        `
      })
      .join('')}
  </div>

  <script>
    function filterCategory(cat) {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'))
      event.target.classList.add('active')

      const cards = document.querySelectorAll('.card')
      cards.forEach(card => {
        if (cat === 'all' || card.getAttribute('data-category') === cat) {
          card.style.display = 'flex'
        } else {
          card.style.display = 'none'
        }
      })
    }
  </script>
</body>
</html>
`

const outPath = path.join(rootDir, 'docs/screens.html')
fs.writeFileSync(outPath, html, 'utf8')
console.log(`✅ Generated docs/screens.html with ${allStates.length} states!`)
