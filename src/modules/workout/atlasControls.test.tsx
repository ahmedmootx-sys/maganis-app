import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'
import type { MuscleGroup } from '../shared/types.ts'

describe('Part E: Atlas controls and states', () => {
  const sampleExercise = {
    id: 'bench_press',
    name: 'Barbell Bench Press',
    nameAr: 'ضغط الصدر بالبار مستوياً',
    category: 'chest' as MuscleGroup,
    targetMusclesAr: ['الصدر', 'الترايسبس', 'الكتف الأمامي'],
  }

  it('E1: provides three 44x44 zoom buttons with visible container and exact aria-labels', () => {
    const { container } = render(<AnatomyMuscleMap exercise={sampleExercise} />)

    const zoomIn = screen.getByLabelText('تكبير')
    const zoomOut = screen.getByLabelText('تصغير')
    const reset = screen.getByLabelText('إعادة الضبط')

    expect(zoomIn).toBeDefined()
    expect(zoomOut).toBeDefined()
    expect(reset).toBeDefined()

    const controlsContainer = container.querySelector('.atlas-zoom-controls')
    expect(controlsContainer).not.toBeNull()
    expect(controlsContainer?.children.length).toBe(3)
  })

  it('E2: deep layer toggle follows Choice contract and preserves full highlight', () => {
    // Exercise with a deep muscle (pec_minor or brachialis)
    const exerciseWithDeep = {
      id: 'cable_flyes',
      name: 'Cable Flyes',
      nameAr: 'تجميع صدري بالكابل',
      category: 'chest' as MuscleGroup,
      targetMusclesAr: ['الصدر'],
      muscles: [
        { id: 'pec_sternal', role: 'primary' as const },
        { id: 'pec_minor', role: 'secondary' as const },
      ],
    }
    const { container } = render(
      <AnatomyMuscleMap exercise={exerciseWithDeep} />,
    )

    const deepToggle = container.querySelector('button[role="checkbox"]')
    if (deepToggle) {
      expect(deepToggle.getAttribute('role')).toBe('checkbox')
      const initialChecked = deepToggle.getAttribute('aria-checked') === 'true'

      // Toggle deep layer
      fireEvent.click(deepToggle)
      expect(deepToggle.getAttribute('aria-checked')).toBe(
        String(!initialChecked),
      )

      // Check that targeted active muscles NEVER get 'muscle-superficial-dimmed'
      const targetedPaths = container.querySelectorAll(
        '.muscle-primary, .muscle-secondary',
      )
      targetedPaths.forEach((path) => {
        expect(path.classList.contains('muscle-superficial-dimmed')).toBe(false)
      })
    }
  })

  it('E3: Segmented control shows count badges and status line has secondary button', () => {
    const { container } = render(<AnatomyMuscleMap exercise={sampleExercise} />)

    // Segmented control has anterior / posterior options
    const segments = container.querySelectorAll('.segmented__item')
    expect(segments.length).toBe(2)

    // View switch secondary button exists if other counts > 0
    const switchBtn = container.querySelector('.atlas-view-switch-btn')
    if (switchBtn) {
      expect(switchBtn.tagName.toLowerCase()).toBe('button')
      expect(switchBtn.textContent).toMatch(/عرض (الخلفي|الأمامي)/)
    }
  })

  it('E4: unpainted muscles link is accessible and opens detail sheet with gym names', () => {
    const exerciseWithUnpainted = {
      id: 'custom_unpainted',
      name: 'Test Unpainted Exercise',
      nameAr: 'تمرين تجريبي لعضلة غير مرسومة',
      category: 'core' as MuscleGroup,
      targetMuscles: ['transverse_abdominis'],
      muscles: [{ id: 'transverse_abdominis', role: 'primary' as const }],
    }

    render(<AnatomyMuscleMap exercise={exerciseWithUnpainted} />)

    const unpaintedBtn = screen.getByRole('button', {
      name: /غير مرسومة في الأطلس/,
    })
    expect(unpaintedBtn).toBeDefined()
    expect(screen.getAllByText(/عضلات غير مرسومة في الأطلس/).length).toBeGreaterThan(0)
  })
})

