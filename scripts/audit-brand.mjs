import fs from 'node:fs'
import path from 'node:path'

function walk(dir) {
  let results = []
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of list) {
    if (
      [
        'node_modules',
        'dist',
        '.git',
        '.cache',
        'coverage',
        'docs/brand-occurrences.md',
      ].includes(item.name)
    )
      continue
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      results = results.concat(walk(full))
    } else if (
      ['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.css', '.md'].some(
        (ext) => item.name.endsWith(ext),
      )
    ) {
      results.push(full)
    }
  }
  return results
}

const files = walk('.')
const occurrences = []
for (const f of files) {
  if (f.includes('docs\\brand-occurrences.md')) continue
  const content = fs.readFileSync(f, 'utf8')
  const lines = content.split('\n')
  lines.forEach((line, idx) => {
    if (line.includes('مجانص')) {
      occurrences.push({
        file: f.replace(/\\/g, '/'),
        line: idx + 1,
        text: line.trim(),
      })
    }
  })
}

let md = '# حصر مواضع ذكر «مجانص» في المشروع (Brand Occurrences Audit)\n\n'
md += '> **التاريخ**: 17 أكتوبر 2026\n'
md += `> **إجمالي المواضع**: ${occurrences.length}\n`
md +=
  '> **التوجيه في Task F**: في الشريط العلوي (TopBar) يكون الاسم «Maganis» باللاتينية، وتحديث `<title>` والمانيفست إلى «Maganis». مع الإبقاء على شخصية المسكوت «د. مجانص» داخل النصوص الإرشادية، وحصر باقي المواضع لقرار المالك.\n\n'
md += '| الملف والسطر | السياق والنص المستخرج |\n| :--- | :--- |\n'
for (const o of occurrences) {
  const safeText = o.text.replace(/\|/g, '\\|').slice(0, 120)
  md += `| \`${o.file}:${o.line}\` | \`${safeText}\` |\n`
}

fs.writeFileSync('docs/brand-occurrences.md', md, 'utf8')
console.log(
  `Wrote docs/brand-occurrences.md with ${occurrences.length} occurrences.`,
)
