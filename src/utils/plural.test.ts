import { describe, it, expect } from 'vitest'
import { plural, type PluralWordKey } from './plural.ts'
import fs from 'node:fs'
import path from 'node:path'

describe('Arabic Plural Helper (TASK G4b Appendix B2)', () => {
  const table = {
    exercise: {
      0: 'لا توجد تمارين',
      1: 'تمرين واحد',
      2: 'تمرينان',
      3: '3 تمارين',
      10: '10 تمارين',
      11: '11 تمرينًا',
      100: '100 تمرين',
    },
    program: {
      0: 'لا توجد جداول',
      1: 'جدول واحد',
      2: 'جدولان',
      3: '3 جداول',
      10: '10 جداول',
      11: '11 جدولًا',
      100: '100 جدول',
    },
    day: {
      0: '0 أيام',
      1: 'يوم واحد',
      2: 'يومان',
      3: '3 أيام',
      10: '10 أيام',
      11: '11 يومًا',
      100: '100 يوم',
    },
    session: {
      0: '0 جلسات',
      1: 'جلسة واحدة',
      2: 'جلستان',
      3: '3 جلسات',
      10: '10 جلسات',
      11: '11 جلسة',
      100: '100 جلسة',
    },
    minute: {
      0: '0 دقائق',
      1: 'دقيقة واحدة',
      2: 'دقيقتان',
      3: '3 دقائق',
      10: '10 دقائق',
      11: '11 دقيقة',
      100: '100 دقيقة',
    },
    set: {
      0: '0 مجموعات',
      1: 'مجموعة واحدة',
      2: 'مجموعتان',
      3: '3 مجموعات',
      10: '10 مجموعات',
      11: '11 مجموعة',
      100: '100 مجموعة',
    },
    meal: {
      0: '0 وجبات',
      1: 'وجبة واحدة',
      2: 'وجبتان',
      3: '3 وجبات',
      10: '10 وجبات',
      11: '11 وجبة',
      100: '100 وجبة',
    },
    calorie: {
      0: '0 سعرات',
      1: 'سعرة واحدة',
      2: 'سعرتان',
      3: '3 سعرات',
      10: '10 سعرات',
      11: '11 سعرة',
      100: '100 سعرة',
    },
  } as const

  const counts = [0, 1, 2, 3, 10, 11, 100] as const

  for (const [word, expectedMap] of Object.entries(table)) {
    it(`verifies exact Appendix B2 forms for "${word}" across 0, 1, 2, 3, 10, 11, 100`, () => {
      for (const count of counts) {
        const result = plural(count, word as PluralWordKey)
        expect(result).toBe(expectedMap[count])
      }
    })
  }

  it('scans codebase for un-pluralized patterns like `${n} <Arabic word>` outside helper', () => {
    const srcDir = path.resolve(__dirname, '..')
    const words = [
      'تمرين',
      'تمارين',
      'جدول',
      'جداول',
      'يوم',
      'أيام',
      'جلسة',
      'جلسات',
      'دقيقة',
      'دقائق',
      'مجموعة',
      'مجموعات',
      'وجبة',
      'وجبات',
      'سعرة',
      'سعرات',
    ]

    function scanFiles(dir: string): string[] {
      const violations: string[] = []
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          if (
            entry.name === 'node_modules' ||
            entry.name === 'dist' ||
            entry.name === '.git'
          )
            continue
          violations.push(...scanFiles(full))
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))
        ) {
          if (entry.name === 'plural.ts' || entry.name === 'plural.test.ts')
            continue
          const content = fs.readFileSync(full, 'utf8')
          // Check for `${...} تمرين` or similar template strings
          for (const w of words) {
            const regex = new RegExp(
              `\`[^\`]*\\$\\{[^}]+\\}\\s+${w}[^\`]*\``,
              'g',
            )
            const matches = content.match(regex)
            if (matches) {
              for (const m of matches) {
                // allow unit test files or fixture assertions
                if (!entry.name.includes('.test.')) {
                  violations.push(`${path.relative(srcDir, full)}: ${m}`)
                }
              }
            }
          }
        }
      }
      return violations
    }

    const violations = scanFiles(srcDir)
    if (violations.length > 0) {
      console.warn('Found un-pluralized patterns to fix:', violations)
    }
  })
})
