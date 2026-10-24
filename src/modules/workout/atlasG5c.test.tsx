import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'
import type { MuscleGroup } from '../shared/types.ts'

describe('G5-C Atlas Redesign & Interaction Verification', () => {
  afterEach(() => {
    cleanup()
  })

  const sampleExercise = {

    id: 'bench_press',
    key: 'bench',
    name: 'Barbell Bench Press',
    nameAr: 'ضغط الصدر بالبار',
    category: 'chest' as MuscleGroup,
    targetMusclesAr: ['الصدر'],
    muscles: [
      { id: 'pec_sternal', role: 'primary' as const },
      { id: 'pec_clavicular', role: 'secondary' as const },
      { id: 'pec_minor', role: 'secondary' as const },
    ],
  }

  it('C1.1: renders leader-line labels button ("الأسماء") and toggles labels layer', () => {
    const { container } = render(<AnatomyMuscleMap exercise={sampleExercise} />)

    const labelsBtn = screen.getByRole('button', { name: 'الأسماء' })
    expect(labelsBtn).toBeDefined()
    expect(labelsBtn.getAttribute('aria-pressed')).toBe('false')

    // Toggling ON renders leader-line labels overlay
    fireEvent.click(labelsBtn)
    expect(labelsBtn.getAttribute('aria-pressed')).toBe('true')
    const labelsOverlay = container.querySelector('.atlas-labels-layer')
    expect(labelsOverlay).not.toBeNull()

    const labelGroups = container.querySelectorAll('.atlas-label-group')
    expect(labelGroups.length).toBeGreaterThan(10)
  })

  it('C1.2: tapping a muscle selects it, applies highlight and dimming class', () => {
    const { container } = render(<AnatomyMuscleMap exercise={sampleExercise} />)

    // Select a chip in the chip list
    const pecChip = screen.getByRole('button', { name: /صدر أوسط/ })
    expect(pecChip).toBeDefined()
    fireEvent.click(pecChip)

    // Container gets selection class
    expect(container.querySelector('.atlas-wrapper')?.classList.contains('atlas-has-selection')).toBe(true)

    // Detail sheet opens with gym name, scientific name in <bdi dir="ltr">, and does_ar via <Claim>
    expect(screen.getAllByText(/صدر أوسط/).length).toBeGreaterThan(0)
    expect(screen.getAllByText(/Pectoralis major/).length).toBeGreaterThan(0)
    expect(screen.getByText(/الرسم تقريبي:/)).toBeDefined()
  })

  it('C1.3: deep-mode toggle activates transparent deep layer and adjusts muscle opacities', () => {
    const { container } = render(<AnatomyMuscleMap exercise={sampleExercise} />)

    const deepToggle = screen.getByRole('checkbox', { name: /إظهار العضلات العميقة/ })
    expect(deepToggle).toBeDefined()

    // Toggle deep mode ON
    fireEvent.click(deepToggle)
    expect(deepToggle.getAttribute('aria-checked')).toBe('true')

    const atlasContainer = container.querySelector('.atlas-container')
    expect(atlasContainer?.classList.contains('atlas-deep-mode')).toBe(true)
  })

  it('C1.2: searchable chip list handles no_mesh muscles with note and opens detail card', () => {
    render(<AnatomyMuscleMap />)

    // Search for a no_mesh muscle like 'بطن علوي'
    const searchInput = screen.getByPlaceholderText('ابحث عن عضلة...')
    fireEvent.change(searchInput, { target: { value: 'بطن علوي' } })

    const noMeshChip = screen.getByRole('button', { name: /بطن علوي/ })
    expect(noMeshChip).toBeDefined()
    expect(noMeshChip.textContent).toContain('مفيش رسم للعضلة دي')

    // Tapping it opens detail sheet
    fireEvent.click(noMeshChip)
    expect(screen.getAllByText(/بطن علوي/).length).toBeGreaterThan(0)
    expect(screen.getByText(/Rectus abdominis — upper/)).toBeDefined()
  })
})
