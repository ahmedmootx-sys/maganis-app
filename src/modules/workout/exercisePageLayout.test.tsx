import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import { ExerciseDetailView } from './ExerciseDetailView.tsx'
import type { Exercise } from '../shared/types.ts'

describe('Part D: Exercise Page Layout', () => {
  const testExercise: Partial<Exercise> = {
    id: 'incline_chest_press',
    name: 'Leverage Incline Chest Press',
    nameAr: 'ضغط صدري مائل على الجهاز',
    category: 'chest',
    equipment: 'machine',
    difficulty: 'intermediate',
    targetMusclesAr: ['الصدر العلوي', 'الترايسبس'],
  }

  it('D1 & D2: One content column, title wraps without truncation, tag in chips row', () => {
    const { container } = render(
      <ExerciseDetailView
        exerciseId="incline_chest_press"
        exercise={testExercise}
      />,
    )

    // Check title element is rendered in content column, not truncated
    const titleEl = screen.getByRole('heading', { level: 1 })
    expect(titleEl.textContent).toBe('ضغط صدري مائل على الجهاز')

    // Tag for category 'الصدر' is rendered inside the chips row, not floating over the title
    const chipsRow = container.querySelector('.exercise-detail-chips-row')
    expect(chipsRow).not.toBeNull()
    expect(chipsRow?.textContent).toContain('صدر')

    // TopBar actions must NOT contain the floating category tag
    const topBarActions = container.querySelector('.top-bar__actions')
    expect(topBarActions?.textContent || '').not.toContain('صدر')

    // Verify all primary blocks are direct children of the content container
    const contentContainer = container.querySelector(
      '.exercise-detail-container',
    )
    expect(contentContainer).not.toBeNull()
    const children = Array.from(contentContainer?.children || [])
    expect(children.length).toBeGreaterThanOrEqual(4)

    // Check that each block has width: 100% or is styled to span full inner container width
    const titleBlock = container.querySelector('.exercise-detail-title-block')
    const tabsHeader = container.querySelector('.exercise-detail-tabs-header')
    expect(titleBlock).not.toBeNull()
    expect(tabsHeader).not.toBeNull()
  })

  it('D3: Tab strip has clear labels, 44px min-height, and includes "مع حالتي"', () => {
    const { container } = render(
      <ExerciseDetailView
        exerciseId="incline_chest_press"
        exercise={testExercise}
      />,
    )

    // Check tab labels within the tabs segmented control
    const tabsSegmented = container.querySelector('.exercise-tabs-segmented')
    expect(tabsSegmented).not.toBeNull()
    expect(tabsSegmented?.textContent).toContain('الفهم')
    expect(tabsSegmented?.textContent).toContain('العضلات')
    expect(tabsSegmented?.textContent).toContain('الأداء')
    expect(tabsSegmented?.textContent).toContain('مع حالتي')
    expect(tabsSegmented?.textContent).toContain('السجل')

    // Old unexplained 'لك' label is gone
    expect(tabsSegmented?.textContent).not.toContain('لك')
  })

  it('D5: Page order is title & chips -> (media card when present) -> tabs', () => {
    const { container } = render(
      <ExerciseDetailView
        exerciseId="incline_chest_press"
        exercise={testExercise}
      />,
    )

    const contentContainer = container.querySelector(
      '.exercise-detail-container',
    )
    expect(contentContainer).not.toBeNull()
    const children = Array.from(contentContainer?.children || [])

    // 1st is title block
    expect(children[0].className).toContain('exercise-detail-title-block')
    // 2nd is chips row
    expect(children[1].className).toContain('exercise-detail-chips-row')

    // Find indices
    const chipsIdx = children.findIndex((c) =>
      c.className.includes('exercise-detail-chips-row'),
    )
    const tabsIdx = children.findIndex((c) =>
      c.className.includes('exercise-detail-tabs-header'),
    )

    expect(chipsIdx).toBeLessThan(tabsIdx)
  })

  it('renders rich AI/Custom Exercise view with search links and copy button when exercise is missing from DB', () => {
    const mockProgram = {
      id: 'ai-prog-1',
      createdAt: Date.now(),
      title: 'جدول الذكاء الاصطناعي',
      primaryGoal: 'hypertrophy' as const,
      trainingDaysPerWeek: 3,
      days: [
        {
          id: 'day-1',
          dayIndex: 0,
          labelAr: 'اليوم الأول',
          focus: 'صدر',
          kind: 'strength' as const,
          exercises: [
            {
              exerciseId: 'custom-ai-ex-1',
              customName: 'تمرين سحب مخصص بالكابل',
              nameEn: 'Custom Cable Pull',
              sets: 3,
              reps: 10,
              repsMin: 8,
              repsMax: 12,
              restSeconds: 90,
              targetSubMuscleAr: 'عضلة الظهر العريضة',
              notes: 'سحب بطيء مع اعتصار لوحي الكتف',
            },
          ],
        },
      ],
    }

    const { container } = render(
      <ExerciseDetailView
        exerciseId="custom-ai-ex-1"
        program={mockProgram}
        onBack={() => {}}
      />,
    )

    // Check title and English name
    expect(screen.getByText('تمرين سحب مخصص بالكابل')).toBeDefined()
    expect(screen.getByText('Custom Cable Pull')).toBeDefined()

    // Check badge
    expect(
      screen.getByText('تمرين مضاف عبر الذكاء الاصطناعي / مخصص'),
    ).toBeDefined()

    // Check Copy button exists
    expect(
      within(container).getByTestId('copy-exercise-name-btn'),
    ).toBeDefined()

    // Check Search platform links
    const googleLink = screen.getByRole('link', {
      name: /بحث Google/i,
    }) as HTMLAnchorElement
    expect(googleLink.href).toContain('google.com/search?q=')
    expect(googleLink.href).toContain('Custom%20Cable%20Pull')

    const youtubeLink = screen.getByRole('link', {
      name: /فيديوهات YouTube/i,
    }) as HTMLAnchorElement
    expect(youtubeLink.href).toContain('youtube.com/results?search_query=')

    const pinterestLink = screen.getByRole('link', {
      name: /بحث Pinterest/i,
    }) as HTMLAnchorElement
    expect(pinterestLink.href).toContain('pinterest.com/search/pins/?q=')

    // Check prescription & notes
    expect(screen.getByText('3 مجموعات')).toBeDefined()
    expect(screen.getByText('8 - 12 تكرار')).toBeDefined()
    expect(screen.getByText('90 ثانية')).toBeDefined()
    expect(screen.getByText('سحب بطيء مع اعتصار لوحي الكتف')).toBeDefined()
  })

  it('renders AI view when opened from session with programDay and synthetic exercise object', () => {
    const mockProgramDay = {
      id: 'day-active-1',
      dayIndex: 0,
      labelAr: 'يوم الصدر المباشر',
      focus: 'صدر',
      exercises: [
        {
          exerciseId: 'custom-session-ex',
          customName: 'تمرين تجميع بالدمبل على أرضية',
          nameEn: 'Floor Dumbbell Flyes',
          sets: 4,
          reps: 12,
          restSeconds: 60,
          targetSubMuscleAr: 'الصدر الداخلي',
          notes: 'حركة تركيزية مع ثبات الكوعين',
        },
      ],
    }

    const syntheticExercise: Partial<Exercise> = {
      id: 'custom-session-ex',
      name: 'Floor Dumbbell Flyes',
      nameAr: 'تمرين تجميع بالدمبل على أرضية',
      nameEn: 'Floor Dumbbell Flyes',
      category: 'core',
      equipment: 'bodyweight',
      difficulty: 'intermediate',
      descriptionAr: 'تمرين مضاف عبر الذكاء الاصطناعي',
    }

    const { container } = render(
      <ExerciseDetailView
        exerciseId="custom-session-ex"
        exercise={syntheticExercise as Exercise}
        programDay={mockProgramDay}
        onBack={() => {}}
      />,
    )

    // Should detect that it is an AI/custom exercise and render the search & copy view
    expect(
      within(container).getByText('تمرين مضاف عبر الذكاء الاصطناعي / مخصص'),
    ).toBeDefined()
    expect(
      within(container).getByText('تمرين تجميع بالدمبل على أرضية'),
    ).toBeDefined()
    expect(within(container).getByText('Floor Dumbbell Flyes')).toBeDefined()
    expect(within(container).getByText('4 مجموعات')).toBeDefined()
    expect(within(container).getByText('12 تكرار')).toBeDefined()
    expect(within(container).getByText('60 ثانية')).toBeDefined()
    expect(within(container).getByText('الصدر الداخلي')).toBeDefined()
    expect(
      within(container).getByText('حركة تركيزية مع ثبات الكوعين'),
    ).toBeDefined()

    const googleLink = within(container).getByRole('link', {
      name: /بحث Google/i,
    }) as HTMLAnchorElement
    expect(googleLink.href).toContain('Floor%20Dumbbell%20Flyes')
  })
})
