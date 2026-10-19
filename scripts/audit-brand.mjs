import fs from 'node:fs'
import path from 'node:path'

function walk(dir) {
  let results = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of list) {
    if (['node_modules', '.git', '.cache', 'coverage'].includes(item.name))
      continue
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      results = results.concat(walk(full))
    } else if (
      [
        '.ts',
        '.tsx',
        '.js',
        '.jsx',
        '.json',
        '.html',
        '.css',
        '.webmanifest',
      ].some((ext) => item.name.endsWith(ext))
    ) {
      results.push(full)
    }
  }
  return results
}

const targetDirs = ['src', 'public', 'dist']
let files = ['index.html']
for (const d of targetDirs) {
  files = files.concat(walk(d))
}

const occurrences = []

function classifyOccurrence(filePath, lineText) {
  const normPath = filePath.replace(/\\/g, '/')
  const t = lineText.trim()

  // 1. Comments
  if (
    t.startsWith('//') ||
    t.startsWith('/*') ||
    t.startsWith('*') ||
    t.startsWith('<!--')
  ) {
    return 'comment'
  }

  // 2. Asset images (wordmark or mascot filenames or alt attributes)
  if (
    normPath.includes('branding') ||
    t.includes('.png') ||
    t.includes('.jpg') ||
    t.includes('.webp') ||
    t.includes('.svg') ||
    (t.includes('alt=') && t.includes('مجانص'))
  ) {
    return 'asset-image'
  }

  // 3. Mascot Name (د. مجانص / نصائح د. مجانص)
  if (
    t.includes('د. مجانص') ||
    t.includes('دكتور مجانص') ||
    t.includes('mascot')
  ) {
    return 'mascot-name'
  }

  // 4. Search alias (search synonym dictionaries)
  if (
    normPath.includes('muscleResolver') ||
    normPath.includes('muscle-names') ||
    t.includes('gym_ar_alt')
  ) {
    return 'search-alias'
  }

  // 5. UI Brand (Any standalone brand usage)
  return 'UI-brand'
}

for (const f of files) {
  if (!fs.existsSync(f)) continue
  const normPath = f.replace(/\\/g, '/')
  if (normPath.includes('brand-occurrences.md')) continue

  const content = fs.readFileSync(f, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    if (line.includes('مجانص')) {
      const category = classifyOccurrence(normPath, line)
      occurrences.push({
        file: normPath,
        line: idx + 1,
        text: line.trim(),
        category,
      })
    }
  })
}

const counts = {
  'UI-brand': occurrences.filter((o) => o.category === 'UI-brand').length,
  'mascot-name': occurrences.filter((o) => o.category === 'mascot-name').length,
  'asset-image': occurrences.filter((o) => o.category === 'asset-image').length,
  comment: occurrences.filter((o) => o.category === 'comment').length,
}

let md = '# حصر وتصنيف مواضع ذكر «مجانص» (Brand Occurrences Audit — Task G)\n\n'
md += `> **تاريخ التوليد**: ${new Date().toISOString().split('T')[0]}\n`
md += `> **إجمالي المواضع**: ${occurrences.length}\n`
md += `> **حالة العلامة التجارية UI-brand**: ${counts['UI-brand'] === 0 ? '✓ ZERO VIOLATIONS (PASS)' : `❌ ${counts['UI-brand']} VIOLATIONS (FAIL)`}\n\n`

md += '## ملخص التصنيف (Classification Summary)\n\n'
md += '| التصنيف (Category) | العدد | المعيار والقاعدة |\n'
md += '| :--- | :---: | :--- |\n'
md += `| **UI-brand** | **${counts['UI-brand']}** | **يجب أن يكون 0 تماماً**. اسم التطبيق في الواجهات والشريط العلوي والمانيفست هو \`Maganis\` باللاتينية. |\n`
md += `| **mascot-name** | **${counts['mascot-name']}** | مسموح ومقصود لشخصية الطبيب الرياضي «د. مجانص» (نصائح وإرشادات). |\n`
md += `| **asset-image** | **${counts['asset-image']}** | صور وأيقونات وشعارات تحوي الشعار البصري الأصلي أو نصوص الـ alt. |\n`
md += `| **comment** | **${counts.comment}** | تعليقات برمجية داخل الكود. |\n\n`

md += '## جدول المواضع التفصيلي\n\n'
md += '| الملف والسطر | التصنيف | النص المستخرج |\n'
md += '| :--- | :---: | :--- |\n'

for (const o of occurrences) {
  const safeText = o.text.replace(/\|/g, '\\|').slice(0, 140)
  md += `| \`${o.file}:${o.line}\` | \`${o.category}\` | \`${safeText}\` |\n`
}

fs.writeFileSync('docs/brand-occurrences.md', md, 'utf8')

console.log('----------------------------------------------------')
console.log('   Brand Occurrences Audit Summary')
console.log('----------------------------------------------------')
console.log(`UI-brand:    ${counts['UI-brand']} (Must be 0)`)
console.log(`mascot-name: ${counts['mascot-name']}`)
console.log(`asset-image: ${counts['asset-image']}`)
console.log(`comment:     ${counts.comment}`)
console.log('----------------------------------------------------')

if (counts['UI-brand'] > 0) {
  console.error(
    `❌ FAILED: Found ${counts['UI-brand']} UI-brand occurrences of «مجانص»!`,
  )
  process.exit(1)
} else {
  console.log('✓ PASSED: UI-brand occurrences of «مجانص» is exactly 0.')
  process.exit(0)
}
