import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

function channelLuminance(c) {
  const s = c / 255
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
}

function relativeLuminance(rgb) {
  return (
    0.2126 * channelLuminance(rgb.r) +
    0.7152 * channelLuminance(rgb.g) +
    0.0722 * channelLuminance(rgb.b)
  )
}

function parseColor(str) {
  if (!str) return { r: 255, g: 255, b: 255, a: 1 }
  str = str.trim()
  if (str.startsWith('#')) {
    let hex = str.slice(1)
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('')
    }
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    const a = hex.length === 8 ? parseInt(hex.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (m) {
    return {
      r: Number(m[1]),
      g: Number(m[2]),
      b: Number(m[3]),
      a: m[4] !== undefined ? Number(m[4]) : 1,
    }
  }
  return { r: 255, g: 255, b: 255, a: 1 }
}

function blend(fg, bg) {
  return {
    r: Math.round(fg.r * fg.a + bg.r * (1 - fg.a)),
    g: Math.round(fg.g * fg.a + bg.g * (1 - fg.a)),
    b: Math.round(fg.b * fg.a + bg.b * (1 - fg.a)),
    a: 1,
  }
}

function contrastRatio(rgb1, rgb2) {
  const l1 = relativeLuminance(rgb1)
  const l2 = relativeLuminance(rgb2)
  const lighter = Math.max(l1, l2)
  const darker = Math.min(l1, l2)
  return (lighter + 0.05) / (darker + 0.05)
}

console.log('====================================================')
console.log('             GATE: ATLAS DEEP MODE AUDIT            ')
console.log('====================================================')

const tokensCss = fs.readFileSync(
  path.join(projectRoot, 'src', 'styles', 'tokens.css'),
  'utf8',
)
const componentsCss = fs.readFileSync(
  path.join(projectRoot, 'src', 'styles', 'components.css'),
  'utf8',
)
const anteriorSvg = fs.readFileSync(
  path.join(projectRoot, 'public', 'atlas', 'anterior.svg'),
  'utf8',
)

const errors = []
let checksCount = 0

// 1. Inspect anterior.svg for hardcoded dark silhouette fill
checksCount++
const hasHardcodedDarkSil =
  anteriorSvg.includes('id="body-silhouette"') &&
  anteriorSvg.includes('fill="#18181b"')
if (hasHardcodedDarkSil) {
  errors.push(
    'anterior.svg contains hardcoded dark fill="#18181b" on #body-silhouette causing black body appearance',
  )
}

// 2. Check silhouette interior luminance in Light theme
// Light page background
const lightBg = parseColor('#ffffff')
// Check silhouette fill token or computed fill
const silTokenMatch = tokensCss.match(/--atlas-silhouette-fill:\s*([^;]+);/)
const silFillStr = silTokenMatch
  ? silTokenMatch[1].trim()
  : hasHardcodedDarkSil
    ? '#18181b'
    : 'rgba(140, 145, 155, 0.08)'
const silColor = parseColor(silFillStr)
const blendedSilLight = blend(silColor, lightBg)

const lightBgLum = relativeLuminance(lightBg)
const silLightLum = relativeLuminance(blendedSilLight)
const lightLumDiffPercent =
  (Math.abs(silLightLum - lightBgLum) / lightBgLum) * 100

checksCount++
console.log(
  `[Light Theme] Page bg luminance: ${lightBgLum.toFixed(3)}, Silhouette interior luminance: ${silLightLum.toFixed(3)} (Diff: ${lightLumDiffPercent.toFixed(1)}%)`,
)

if (lightLumDiffPercent > 15) {
  errors.push(
    `[Light Theme] Silhouette interior luminance deviates by ${lightLumDiffPercent.toFixed(1)}% from page background (allowed <= 15%)`,
  )
}

// 3. Check silhouette interior luminance in Dark theme
const darkBg = parseColor('#14161a')
const darkSilTokenMatch = tokensCss.match(
  /\[data-theme='dark'\][^}]+--atlas-silhouette-fill:\s*([^;]+);/,
)
const darkSilFillStr = darkSilTokenMatch
  ? darkSilTokenMatch[1].trim()
  : hasHardcodedDarkSil
    ? '#18181b'
    : 'rgba(240, 243, 248, 0.06)'
const darkSilColor = parseColor(darkSilFillStr)
const blendedSilDark = blend(darkSilColor, darkBg)

const darkBgLum = relativeLuminance(darkBg)
const silDarkLum = relativeLuminance(blendedSilDark)
const darkLumDiffPercent =
  (Math.abs(silDarkLum - darkBgLum) / (darkBgLum + 0.001)) * 100

checksCount++
console.log(
  `[Dark Theme] Page bg luminance: ${darkBgLum.toFixed(4)}, Silhouette interior luminance: ${silDarkLum.toFixed(4)} (Diff: ${darkLumDiffPercent.toFixed(1)}%)`,
)

if (darkLumDiffPercent > 15) {
  errors.push(
    `[Dark Theme] Silhouette interior luminance deviates by ${darkLumDiffPercent.toFixed(1)}% from page background (allowed <= 15%)`,
  )
}

// 4. Contrast check: Deep muscles vs Surrounding Ghost surface muscles (must be >= 3:1)
// Ghost surface opacity in deep mode must be ~15%
checksCount++
const ghostMatch =
  componentsCss.match(/\.muscle-ghost[^{]*{[^}]*opacity:\s*([\d.]+)/) ||
  componentsCss.match(
    /\.muscle-superficial-dimmed[^{]*{[^}]*opacity:\s*([\d.]+)/,
  )
const ghostOpacity = ghostMatch ? parseFloat(ghostMatch[1]) : 0.25
console.log(`Surface muscle ghost opacity in deep mode: ${ghostOpacity}`)

// Test involved deep muscle (Primary: #E53935) vs ghost
const primaryRgb = parseColor('#E53935')
const ghostRgb = blend({ r: 200, g: 205, b: 215, a: ghostOpacity }, lightBg)
const primaryContrast = contrastRatio(primaryRgb, ghostRgb)
checksCount++
console.log(
  `Primary deep muscle contrast against ghost: ${primaryContrast.toFixed(2)}:1 (required >= 3:1)`,
)
if (primaryContrast < 3.0) {
  errors.push(
    `Primary deep muscle contrast against ghost (${primaryContrast.toFixed(2)}:1) is below 3:1`,
  )
}

// Test involved deep muscle (Secondary: #FDD835) vs ghost in dark mode
const secRgb = parseColor('#FDD835')
const darkGhostRgb = blend({ r: 60, g: 65, b: 75, a: ghostOpacity }, darkBg)
const secContrast = contrastRatio(secRgb, darkGhostRgb)
checksCount++
console.log(
  `Secondary deep muscle contrast against dark ghost: ${secContrast.toFixed(2)}:1 (required >= 3:1)`,
)
if (secContrast < 3.0) {
  errors.push(
    `Secondary deep muscle contrast against dark ghost (${secContrast.toFixed(2)}:1) is below 3:1`,
  )
}

// Check WebP shade layer in deep mode
checksCount++
const shadeHidesInDeep =
  componentsCss.includes('.atlas-deep-mode .atlas-shade-layer') &&
  componentsCss.includes('display: none')
if (!shadeHidesInDeep) {
  errors.push(
    'Shade WebP layer is not hidden in deep mode (.atlas-deep-mode .atlas-shade-layer { display: none }), risking multiply shade darkness',
  )
}

console.log(`\nTotal checks performed: ${checksCount}`)
console.log(`Errors found: ${errors.length}`)

if (errors.length > 0) {
  for (const err of errors) console.log(` ❌ ${err}`)
  process.exit(1)
} else {
  console.log('✓ All atlas deep mode criteria passed!')
  process.exit(0)
}
