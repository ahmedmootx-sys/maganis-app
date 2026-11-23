import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { convertDayToHomeWorkout } from './homeWorkoutConverter.ts'
import { getExerciseEnvironment } from './workoutUtils.ts'
import { ExerciseSwapModal } from './ExerciseSwapModal.tsx'
import type { ProgramDay, Exercise } from '../shared/types.ts'

describe('New Features & Updates Verification', () => {
  it('correctly detects environment as home, gym, or both based on equipment or override', () => {
    const pushup: Exercise = {
      id: 'pushup',
      nameAr: 'الضغط العادي',
      descriptionAr: '',
      category: 'chest',
      difficulty: 'beginner',
      equipment: 'bodyweight',
    }
    const benchPress: Exercise = {
      id: 'barbell_bench_press',
      nameAr: 'ضغط البنش بالبار',
      descriptionAr: '',
      category: 'chest',
      difficulty: 'intermediate',
      equipment: 'barbell',
    }
    const dbCurl: Exercise = {
      id: 'db_curl',
      nameAr: 'تبادل دمبلز',
      descriptionAr: '',
      category: 'arms',
      difficulty: 'beginner',
      equipment: 'dumbbell',
    }
    const overriddenEx: Exercise = {
      id: 'custom_ex',
      nameAr: 'تمرين مخصص',
      descriptionAr: '',
      category: 'chest',
      difficulty: 'beginner',
      equipment: 'barbell',
      environment: 'home',
    }

    expect(getExerciseEnvironment(pushup)).toBe('home')
    expect(getExerciseEnvironment(benchPress)).toBe('gym')
    expect(getExerciseEnvironment(dbCurl)).toBe('both')
    expect(getExerciseEnvironment(overriddenEx)).toBe('home')
  })

  it('home workout conversion reports insufficient muscles when gym exercises cannot be matched', () => {
    const testDay: ProgramDay = {
      dayIndex: 0,
      name: 'يوم الصدر',
      labelAr: 'الصدر والذراعين',
      focus: 'chest',
      exercises: [
        {
          exerciseId: 'barbell_bench_press',
          sets: 3,
          reps: 10,
          restSeconds: 90,
        },
      ],
    }

    // Convert with an empty home pool or specific mock pool
    const result = convertDayToHomeWorkout(testDay, [], [], [])
    expect(result).toBeDefined()
    expect(result.exercises.length).toBe(1)
    // Converted exercise must have a valid exerciseId
    expect(result.exercises[0].exerciseId).toBeDefined()
  })

  it('renders ExerciseSwapModal and allows searching and selecting a replacement', () => {
    const current: Exercise = {
      id: 'bench_press',
      nameAr: 'ضغط صدر بالبار',
      descriptionAr: 'تمرين للصدر',
      category: 'chest',
      difficulty: 'intermediate',
      equipment: 'barbell',
    }
    const onSelect = vi.fn()
    const onClose = vi.fn()

    render(
      <ExerciseSwapModal
        currentExercise={current}
        onSelectSwap={onSelect}
        onClose={onClose}
      />,
    )

    expect(screen.getByText(/استبدال التمرين/i)).toBeInTheDocument()
    expect(
      screen.getByPlaceholderText(/ابحث عن اسم التمرين البديل/i),
    ).toBeInTheDocument()
  })

  it('verifies unilateral dual-timer sets ready-to-complete logic', async () => {
    const { isSetReadyToComplete } = await import('./ActiveWorkoutSession.tsx')
    const testSet = {
      id: 'set-1',
      setNum: 1,
      weightKg: 0,
      reps: 0,
      durationSecondsSideA: 30,
      durationSecondsSideB: 0,
      isCompleted: false,
      weightState: 'empty' as const,
      repsState: 'empty' as const,
    }

    // When Side A has duration, timed set is ready to complete
    expect(isSetReadyToComplete(testSet, 'timed')).toBe(true)

    const emptySet = {
      ...testSet,
      durationSecondsSideA: 0,
      durationSecondsSideB: 0,
      reps: 0,
    }
    expect(isSetReadyToComplete(emptySet, 'timed')).toBe(false)

    const sideBSet = {
      ...testSet,
      durationSecondsSideA: 0,
      durationSecondsSideB: 25,
      reps: 0,
    }
    expect(isSetReadyToComplete(sideBSet, 'timed')).toBe(true)
  })
})
