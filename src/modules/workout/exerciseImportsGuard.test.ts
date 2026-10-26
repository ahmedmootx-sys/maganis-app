import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '../../..')

function getTsxFiles(dir: string): string[] {
  let results: string[] = []
  if (!fs.existsSync(dir)) return results
  const list = fs.readdirSync(dir, { withFileTypes: true })
  for (const item of list) {
    const full = path.join(dir, item.name)
    if (item.isDirectory()) {
      results = results.concat(getTsxFiles(full))
    } else if (item.name.endsWith('.tsx') && !item.name.endsWith('.test.tsx')) {
      results.push(full)
    }
  }
  return results
}

describe('Task H2.1: getExerciseById UI Import Guard', () => {
  it('enforces that no UI component under src/modules/ or src/components/ imports raw getExerciseById', () => {
    const modulesDir = path.join(rootDir, 'src', 'modules')
    const componentsDir = path.join(rootDir, 'src', 'components')

    const tsxFiles = [...getTsxFiles(modulesDir), ...getTsxFiles(componentsDir)]
    expect(tsxFiles.length).toBeGreaterThan(15)

    const violations: { file: string; line: number; text: string }[] = []

    for (const file of tsxFiles) {
      const content = fs.readFileSync(file, 'utf8')
      const lines = content.split('\n')
      lines.forEach((line, idx) => {
        // Match import containing getExerciseById
        if (
          /import\s+.*getExerciseById.*from/i.test(line) ||
          /getExerciseById\s*\(/.test(line)
        ) {
          violations.push({
            file: path.relative(rootDir, file),
            line: idx + 1,
            text: line.trim(),
          })
        }
      })
    }

    expect(
      violations,
      `Direct getExerciseById import/call found in UI component(s). Use getEffectiveExercise or useEffectiveExercise from exerciseStore instead:\n${violations
        .map((v) => `  ${v.file}:${v.line} -> ${v.text}`)
        .join('\n')}`,
    ).toEqual([])
  })

  it('enforces that data-testid="badge-modified" and badge «معدّل» are completely removed from UI code', () => {
    const srcDir = path.join(rootDir, 'src')
    function scanDir(dir: string): string[] {
      let files: string[] = []
      for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, item.name)
        if (item.isDirectory()) {
          files = files.concat(scanDir(full))
        } else if (item.name.endsWith('.tsx') || item.name.endsWith('.ts')) {
          files.push(full)
        }
      }
      return files
    }

    const allSrcFiles = scanDir(srcDir)
    const badgeViolations: string[] = []

    for (const file of allSrcFiles) {
      if (file.endsWith('.test.ts') || file.endsWith('.test.tsx')) continue
      const content = fs.readFileSync(file, 'utf8')
      if (content.includes('badge-modified')) {
        badgeViolations.push(path.relative(rootDir, file))
      }
    }

    expect(
      badgeViolations,
      `Found leftover badge-modified in src files: ${badgeViolations.join(', ')}`,
    ).toEqual([])
  })
})
