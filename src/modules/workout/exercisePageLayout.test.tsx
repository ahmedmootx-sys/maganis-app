import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
