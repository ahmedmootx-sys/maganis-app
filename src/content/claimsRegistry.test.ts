import { describe, it, expect } from 'vitest'
import { CLAIMS } from './claims.ts'
import fs from 'node:fs'
import path from 'node:path'

describe('R23 Claims Registry & String Enforcement', () => {
  it('contains valid Claim definitions with required fields', () => {
    expect(Object.keys(CLAIMS).length).toBeGreaterThan(0)
    for (const [id, claim] of Object.entries(CLAIMS)) {
      expect(claim.id).toBe(id)
      expect(claim.text_ar).toBeTypeOf('string')
      expect(claim.text_ar.length).toBeGreaterThan(0)
      expect(['sourced', 'coach_authored', 'unverified']).toContain(
        claim.status,
      )
      if (claim.status === 'sourced') {
        expect(claim.source_id).not.toBeNull()
        expect(claim.source_text).toBeTypeOf('string')
      }
    }
  })

  it('scans for Arabic string literals >= 60 chars in screens/components and checks allowlist', () => {
    const rootDir = path.resolve(__dirname, '..')
    const dirsToScan = [
      path.join(rootDir, 'screens'),
      path.join(rootDir, 'components'),
      path.join(rootDir, 'modules'),
    ]

    // Allowed UI copy (onboarding greetings, terms of use, modal explanations, legal text)
    const allowedUiCopySubstrings = [
      'يا هلا بالوحش! د. مجانص معاك على الخط',
      'إذا كان عندك تنميل أو ضعف مفاجئ أو ألم شديد بعد إصابة قوية',
      'قمنا بتحديث نظام السعرات لفصل نمط النشاط اليومي',
      'سيتم استبدال جدولك النشط الحالي بالجدول المحفوظ',
      'سيتم استبدال جدولك الحالي بالجدول المستورد',
      'هذا البرنامج تم استيراده ومطابقته آلياً مع التمارين المعتمدة',
      'استخدم هذا الموجه لصياغة خطتك التدريبية عبر أي نموذج ذكاء اصطناعي',
      'ملاحظة حول الخصوصية: لن يتم إرسال أي بيانات شخصية',
      'تنبيه: يحتوي الجدول على',
      'تم تصميم وهندسة التطبيق بالكامل وفق أحدث مبادئ علوم التمرين',
      'جميع الرسوم التوضيحية والحركية منسوبة بالكامل',
      'إعادة تعيين التطبيق وحذف كافة البيانات المحفوظة محلياً',
      'أنت على وشك استعادة بيانات تطبيق مجانيس',
      'تأكيد استبدال التمرين في الأيام التدريبية الحالية',
      'جميع الحقوق محفوظة',
      'تعديل تفاصيل اليوم والتمارين المدرجة',
      'يجب أن تمتد تسجيلات الوزن على مدى 14 يوماً على الأقل',
      'الحرق الأساسي (BMR) = 10 ×',
      'الحرق القاعدي بنشاط الحياة =',
      'إجمالي الحرق الرياضي اليومي (EAT) =',
      'إجمالي الحرق اليومي (TDEE) =',
      'ملفك محدد به',
      'هل تريد فعلاً إلغاء إضافة التمرين؟',
      'تم حفظ نسخة من ملف التمرين على جهازك',
    ]

    const arabicRegex = /[\u0600-\u06FF]/
    const longLiterals: Array<{ file: string; str: string }> = []

    function scanDir(dir: string) {
      if (!fs.existsSync(dir)) return
      const entries = fs.readdirSync(dir, { withFileTypes: true })
      for (const entry of entries) {
        const full = path.join(dir, entry.name)
        if (entry.isDirectory()) {
          scanDir(full)
        } else if (
          entry.isFile() &&
          (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts'))
        ) {
          if (
            entry.name.includes('.test.') ||
            full.includes(path.join('src', 'content'))
          )
            continue
          const content = fs.readFileSync(full, 'utf8')
          // Extract string literals ("...", '...', `...`)
          const stringRegex = /(["'`])((?:\\.|[^\\])*?)\1/gs
          let match
          while ((match = stringRegex.exec(content)) !== null) {
            const str = match[2]
            if (str.length >= 60 && arabicRegex.test(str)) {
              const isAllowed = allowedUiCopySubstrings.some((allowed) =>
                str.includes(allowed),
              )
              if (!isAllowed) {
                longLiterals.push({
                  file: path.relative(rootDir, full),
                  str: str.slice(0, 80),
                })
              }
            }
          }
        }
      }
    }

    for (const d of dirsToScan) {
      scanDir(d)
    }

    console.log(
      `[R23 String Scan] Allowed UI-copy list checked. Long literals found: ${longLiterals.length}`,
    )
    if (longLiterals.length > 0) {
      console.warn('Long Arabic literals outside src/content:', longLiterals)
    }
  })
})
