import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import fs from 'node:fs'
import path from 'node:path'
import { Select } from './Select'
import { DateField } from './DateField'
import { FileField } from './FileField'
import { ToggleChipRow } from './ToggleChipRow'
import { Toast } from './Toast'
import { navigationHistory } from '../utils/navigationHistory'

describe('Step 7 Design System Quality Gates', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  describe('Gate 1: Zero Native <select> in DOM & Components', () => {
    it('never renders a native <select> element in the DOM when using Select', () => {
      const { container } = render(
        <Select
          id="test-select"
          label="المجموعة العضلية"
          value="chest"
          onChange={() => {}}
          options={[
            { value: 'chest', labelAr: 'الصدر', labelEn: 'Chest' },
            { value: 'back', labelAr: 'الظهر', labelEn: 'Back' },
          ]}
        />,
      )

      // Strict Gate: NO native <select> in DOM
      expect(container.querySelector('select')).toBeNull()

      // Must be a Field-styled trigger with role="combobox"
      const trigger = screen.getByRole('combobox')
      expect(trigger).toBeDefined()
      expect(trigger.getAttribute('id')).toBe('test-select')
      expect(trigger.style.height).toBe('48px')
      expect(trigger.style.width).toBe('100%')
    })

    it('renders bidi-safe labels (Arabic primary + English secondary line, never "Arabic (English)" string)', () => {
      render(
        <Select
          id="bidi-select"
          value="biceps"
          onChange={() => {}}
          options={[
            {
              value: 'biceps',
              labelAr: 'عضلة البايسبس',
              labelEn: 'Biceps Brachii',
            },
          ]}
        />,
      )

      // Arabic is primary
      const arLabel = screen.getByText('عضلة البايسبس')
      expect(arLabel).toBeDefined()
      expect(arLabel.className).toContain('select-trigger-label-ar')

      // English is rendered separately with dir="ltr"
      const enLabel = screen.getByText('Biceps Brachii')
      expect(enLabel).toBeDefined()
      expect(enLabel.getAttribute('dir')).toBe('ltr')
      expect(enLabel.className).toContain('select-trigger-label-en')
    })

    it('opens bottom sheet on click, displays search field when options > 8, and registers back navigation', () => {
      const navPushSpy = vi.spyOn(navigationHistory, 'push')

      const options = Array.from({ length: 12 }, (_, i) => ({
        value: `opt_${i + 1}`,
        labelAr: `خيار ${i + 1}`,
        labelEn: `Option ${i + 1}`,
      }))

      render(
        <Select
          id="search-select"
          label="خيارات كثيرة"
          value="opt_1"
          onChange={() => {}}
          options={options}
        />,
      )

      const trigger = screen.getByRole('combobox', { name: 'خيارات كثيرة' })
      fireEvent.click(trigger)

      // Back navigation history registered
      expect(navPushSpy).toHaveBeenCalled()

      // Search field is present because options > 8
      const searchInput = screen.getByPlaceholderText('بحث في الخيارات...')
      expect(searchInput).toBeDefined()

      // Filter options
      fireEvent.change(searchInput, { target: { value: '12' } })
      expect(screen.getByText('خيار 12')).toBeDefined()
      expect(screen.queryByText('خيار 2')).toBeNull()

      navPushSpy.mockRestore()
    })

    it('strictly verifies that NO module or component uses a native lowercase <select> tag in code', () => {
      const srcDir = path.resolve(__dirname, '..')

      function scanDir(dir: string, fileList: string[] = []): string[] {
        const files = fs.readdirSync(dir)
        for (const f of files) {
          const fullPath = path.join(dir, f)
          const stat = fs.statSync(fullPath)
          if (stat.isDirectory()) {
            if (f !== 'node_modules' && f !== '.git') {
              scanDir(fullPath, fileList)
            }
          } else if (f.endsWith('.tsx') && !f.endsWith('.test.tsx')) {
            fileList.push(fullPath)
          }
        }
        return fileList
      }

      const allTsxFiles = scanDir(srcDir)
      const nativeSelectRegex = /<select[\s>]/

      const violations: string[] = []
      for (const filePath of allTsxFiles) {
        const content = fs.readFileSync(filePath, 'utf-8')
        if (nativeSelectRegex.test(content)) {
          // Exclude Select.tsx docstrings
          if (!filePath.endsWith('Select.tsx')) {
            violations.push(filePath)
          }
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Gate 2: Zero Unstyled <input type="date"> in DOM', () => {
    it('encapsulates native date input within DateField and displays formatted Arabic date', () => {
      const handleChange = vi.fn()
      const { container } = render(
        <DateField
          id="test-date"
          label="تاريخ اليوم"
          value="2026-10-15"
          onChange={handleChange}
        />,
      )

      // Trigger has 48px height and full width
      const trigger = container.querySelector(
        '.date-field-trigger',
      ) as HTMLElement
      expect(trigger).toBeDefined()
      expect(trigger.style.height).toBe('48px')
      expect(trigger.style.width).toBe('100%')

      // Arabic formatted date is displayed
      const dateText = container.querySelector('.date-field-trigger')
      expect(dateText?.textContent).toMatch(/أكتوبر|2026|15|١٥/)

      // The native date input MUST be styled with opacity 0 and date-field__native-input
      const nativeInput = container.querySelector(
        'input[type="date"]',
      ) as HTMLInputElement
      expect(nativeInput).toBeDefined()
      expect(nativeInput.className).toBe('date-field__native-input')
      expect(nativeInput.style.opacity).toBe('0')
    })

    it('strictly verifies that NO module or component outside DateField renders a raw type="date" input', () => {
      const srcDir = path.resolve(__dirname, '..')

      function scanDir(dir: string, fileList: string[] = []): string[] {
        const files = fs.readdirSync(dir)
        for (const f of files) {
          const fullPath = path.join(dir, f)
          const stat = fs.statSync(fullPath)
          if (stat.isDirectory()) {
            if (f !== 'node_modules' && f !== '.git') {
              scanDir(fullPath, fileList)
            }
          } else if (f.endsWith('.tsx') && !f.endsWith('.test.tsx')) {
            fileList.push(fullPath)
          }
        }
        return fileList
      }

      const allTsxFiles = scanDir(srcDir)
      const rawDateInputRegex = /type=["']date["']/

      const violations: string[] = []
      for (const filePath of allTsxFiles) {
        if (filePath.endsWith('DateField.tsx')) continue
        const content = fs.readFileSync(filePath, 'utf-8')
        if (rawDateInputRegex.test(content)) {
          violations.push(filePath)
        }
      }

      expect(violations).toEqual([])
    })
  })

  describe('Gate 3: Toast Placement & Interaction Rules', () => {
    it('renders toast strictly at bottom above BottomNav and safe-area, with max 2 lines and pointer-events: none', () => {
      const { container } = render(
        <Toast message="تم حفظ التغييرات بنجاح!" onDismiss={() => {}} />,
      )

      const portal = container.querySelector(
        '.maganis-toast-portal',
      ) as HTMLElement
      expect(portal).toBeDefined()

      // Positioned at bottom above BottomNav (64px) + safe-area
      expect(portal.style.position).toBe('fixed')
      expect(portal.style.bottom).toContain('var(--bottom-nav-height, 64px)')

      // Never overlaps interactive controls (pointer-events: none)
      expect(portal.style.pointerEvents).toBe('none')

      // Never positioned at top
      expect(portal.style.top).toBe('')

      // Max 2 lines clamp
      const textSpan = container.querySelector(
        '.maganis-toast-text',
      ) as HTMLElement
      expect(textSpan.style.webkitLineClamp).toBe('2')
    })

    it('auto-dismisses toast after exactly 3 seconds', () => {
      const handleDismiss = vi.fn()
      render(<Toast message="تنبيه سريع" onDismiss={handleDismiss} />)

      expect(handleDismiss).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(2999)
      })
      expect(handleDismiss).not.toHaveBeenCalled()

      act(() => {
        vi.advanceTimersByTime(2)
      })
      expect(handleDismiss).toHaveBeenCalledTimes(1)
    })
  })

  describe('Gate 4: ToggleChipRow Single-Row Equal-Width Enforcement', () => {
    it('renders all options in ONE single row with equal widths and no orphan rows', () => {
      const weekdays = [
        { value: 6, label: 'السبت' },
        { value: 0, label: 'الأحد' },
        { value: 1, label: 'الإثنين' },
        { value: 2, label: 'الثلاثاء' },
        { value: 3, label: 'الأربعاء' },
        { value: 4, label: 'الخميس' },
        { value: 5, label: 'الجمعة' },
      ]

      const { container } = render(
        <ToggleChipRow
          id="weekdays-gate"
          options={weekdays}
          selectedValues={[6, 0, 1]}
          onChange={() => {}}
        />,
      )

      const gridContainer = container.querySelector(
        '.toggle-chip-row-container',
      ) as HTMLElement
      expect(gridContainer).toBeDefined()

      // Single row equal-width grid
      expect(gridContainer.style.display).toBe('grid')
      expect(gridContainer.style.gridAutoFlow).toBe('column')
      expect(gridContainer.style.gridAutoColumns).toBe('1fr')
      expect(gridContainer.style.width).toBe('100%')

      // Exactly 7 chips
      const chips = container.querySelectorAll('.toggle-chip-button')
      expect(chips.length).toBe(7)
    })
  })

  describe('Gate 5: FileField Styling & Remove Button', () => {
    it('renders styled button when empty and file name with remove button when loaded', () => {
      const handleChange = vi.fn()
      const { rerender } = render(
        <FileField
          id="backup-file"
          buttonText="استيراد نسخة احتياطية"
          onChange={handleChange}
        />,
      )

      expect(screen.getByText('استيراد نسخة احتياطية')).toBeDefined()

      const fakeFile = new File(['{"version":1}'], 'backup-2026.json', {
        type: 'application/json',
      })

      rerender(
        <FileField
          id="backup-file"
          buttonText="استيراد نسخة احتياطية"
          currentFileName={fakeFile.name}
          onChange={handleChange}
        />,
      )

      expect(screen.getByText('backup-2026.json')).toBeDefined()
      const removeBtn = screen.getByRole('button', { name: 'إزالة الملف' })
      expect(removeBtn).toBeDefined()

      fireEvent.click(removeBtn)
      expect(handleChange).toHaveBeenCalledWith(null)
    })
  })
})
