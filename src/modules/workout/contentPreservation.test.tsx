import { describe, it, expect, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import {
  ExerciseDetailView,
  cleanExerciseNames,
} from './ExerciseDetailView.tsx'
import type { TrackingSession } from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'

describe('Content Preservation & Verbatim Rendering', () => {
  afterEach(() => {
    cleanup()
  })

  it('1. cleanExerciseNames correctly splits legacy "(English Name)" and removes bullet characters', () => {
    const rawExercise = {
      id: 'legacy-bench',
      name_ar: 'ضغط صدري بالبار (Barbell Bench Press)',
      name_en: 'Barbell Bench Press',
    }
    const { nameAr, nameEn } = cleanExerciseNames(rawExercise)
    expect(nameAr).toBe('ضغط صدري بالبار')
    expect(nameEn).toBe('Barbell Bench Press')

    const rawWithBullet = {
      name_ar: 'ضغط صدري • مستوى أول',
      name_en: 'Bench Press • Tier 1',
    }
    const cleaned = cleanExerciseNames(rawWithBullet)
    expect(cleaned.nameAr).toBe('ضغط صدري مستوى أول')
    expect(cleaned.nameEn).toBe('Bench Press Tier 1')
  })

  it('2. Renders all rich fields verbatim in their designated tabs without shortening or omitting', () => {
    const richExercise = {
      id: 'test-rich-exercise',
      name: 'Overhead Barbell Military Press',
      nameAr: 'ضغط عسكري بالبار فوق الرأس',
      category: 'shoulders' as const,
      equipment: 'barbell' as const,
      difficulty: 'intermediate' as const,
      descriptionAr: 'تمرين دفع رأسي للأكتاف',
      benefitAr:
        'بناء قوة الكتف الأمامي وتطوير استقرار الحزام الكتفي بالكامل مع تعزيز الثبات الجذعي تحت الحمل الرأسي المباشر.',
      mechanicsAr:
        'دفع عمودي صارم يبدأ من عظم الترقوة حتى الامتداد الكامل للذراعين مع ثبات انقباضي في لوحي الكتف دون تقويس الفقرات القطنية.',
      targetMusclesAr: [
        'الدالية الأمامية (Anterior Deltoid)',
        'الدالية الجانبية (Lateral Deltoid)',
        'الترايسبس (Triceps)',
      ],
      howToStepsAr: [
        'قف بثبات مع مباعدة القدمين بعرض الكتفين وشد عضلات البطن والألوية بقوة.',
        'ادفع البار عمودياً للأعلى بمسار مستقيم مع إرجاع الرأس قليلاً للخلف لإفساح المجال للبار.',
        'اقفل المرفقين بتحكم في قمة الحركة مع تثبيت لوحي الكتف.',
        'أنزل البار ببطء على مدى 3 ثوانٍ حتى يصل لمستوى أعلى الصدر.',
      ],
      avoidForInjuries: ['الكتف'],
      medicalSource:
        'National Strength and Conditioning Association (NSCA 2024)',
      tempo: '3-0-1-0',
      breathing: 'شهيق عند النزول، زفير عند الدفع للأعلى',
    }

    render(
      <ExerciseDetailView
        exerciseId="test-rich-exercise"
        exercise={richExercise}
      />,
    )

    // Check Header & Arabic/English titles
    expect(
      screen.getAllByText('ضغط عسكري بالبار فوق الرأس').length,
    ).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Overhead Barbell Military Press')).toBeDefined()

    // 1. Tab "الفهم" (Default active tab)
    expect(
      screen.getByText(
        'بناء قوة الكتف الأمامي وتطوير استقرار الحزام الكتفي بالكامل مع تعزيز الثبات الجذعي تحت الحمل الرأسي المباشر.',
      ),
    ).toBeDefined()
    expect(
      screen.getByText(
        'دفع عمودي صارم يبدأ من عظم الترقوة حتى الامتداد الكامل للذراعين مع ثبات انقباضي في لوحي الكتف دون تقويس الفقرات القطنية.',
      ),
    ).toBeDefined()
    expect(
      screen.getByText('الدالية الأمامية (Anterior Deltoid)'),
    ).toBeDefined()
    expect(screen.getByText('الدالية الجانبية (Lateral Deltoid)')).toBeDefined()
    expect(
      screen.getByText(
        'National Strength and Conditioning Association (NSCA 2024)',
      ),
    ).toBeDefined()

    // 2. Tab "الأداء"
    const perfTabButton = screen.getByRole('button', { name: 'الأداء' })
    fireEvent.click(perfTabButton)

    // Verify all 4 steps are rendered verbatim
    expect(
      screen.getByText(
        'قف بثبات مع مباعدة القدمين بعرض الكتفين وشد عضلات البطن والألوية بقوة.',
      ),
    ).toBeDefined()
    expect(
      screen.getByText(
        'ادفع البار عمودياً للأعلى بمسار مستقيم مع إرجاع الرأس قليلاً للخلف لإفساح المجال للبار.',
      ),
    ).toBeDefined()
    expect(
      screen.getByText(
        'اقفل المرفقين بتحكم في قمة الحركة مع تثبيت لوحي الكتف.',
      ),
    ).toBeDefined()
    expect(
      screen.getByText(
        'أنزل البار ببطء على مدى 3 ثوانٍ حتى يصل لمستوى أعلى الصدر.',
      ),
    ).toBeDefined()

    // Verify Tempo, Breathing, and Safety
    expect(screen.getByText('3-0-1-0')).toBeDefined()
    expect(
      screen.getByText('شهيق عند النزول، زفير عند الدفع للأعلى'),
    ).toBeDefined()
    expect(screen.getByText('الكتف')).toBeDefined()
  })

  it('3. 5th Tab "السجل" appears ONLY when the exercise has logged history, and is hidden otherwise', () => {
    const sampleExercise = {
      id: 'bench-history-test',
      name: 'Bench Press',
      nameAr: 'ضغط صدري',
      category: 'chest' as const,
      equipment: 'barbell' as const,
      difficulty: 'beginner' as const,
      descriptionAr: 'تمرين ضغط صدري بالبار',
    }

    // CASE A: No session history
    const { unmount } = render(
      <ExerciseDetailView
        exerciseId="bench-history-test"
        exercise={sampleExercise}
        sessions={[]}
      />,
    )

    expect(screen.queryByRole('button', { name: 'السجل' })).toBeNull()
    unmount()

    // CASE B: Has logged history for this exercise
    const mockSessions: TrackingSession[] = [
      {
        id: 'sess-1',
        date: '2026-10-10',
        programDayIndex: 1,
        notes: '',
        createdAt: 1728518400000,
        exercises: [
          {
            exerciseId: 'bench-history-test',
            completed: true,
            sets: [
              { reps: 10, weightKg: 80 },
              { reps: 8, weightKg: 85 },
            ],
          },
        ],
      },
    ]

    render(
      <ExerciseDetailView
        exerciseId="bench-history-test"
        exercise={sampleExercise}
        sessions={mockSessions}
      />,
    )

    // The 5th tab must be in the document
    const historyTab = screen.getByRole('button', { name: 'السجل' })
    expect(historyTab).toBeDefined()

    // Click history tab and verify PR calculations
    fireEvent.click(historyTab)
    expect(screen.getByText('أفضل أداء مسجل')).toBeDefined()
    // Best set was 85kg x 8 reps -> Epley 1RM: 85 * (1 + 8/30) = 107.7 kg
    expect(screen.getAllByText(/107\.7/).length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText(/85\s*كجم\s*×\s*8/)).toBeDefined()
  })

  it('4. Tab "لك" correctly adapts to user profile, experience RIR, and flags medical injury alerts', () => {
    const sampleExercise = {
      id: 'squat-user-test',
      name: 'Barbell Squat',
      nameAr: 'سكوات بالبار',
      category: 'legs' as const,
      equipment: 'barbell' as const,
      difficulty: 'intermediate' as const,
      descriptionAr: 'تمرين سكوات بالبار',
    }

    const mockProfile: UserProfile = {
      id: 'user-1',
      name: 'أحمد',
      experienceLevel: 'intermediate',
      goals: ['hypertrophy'],
      primaryGoal: 'hypertrophy',
      trainingDaysPerWeek: 4,
      trainingLocation: 'gym',
      body: {
        sex: 'male',
        age: 28,
        heightCm: 178,
        weightKg: 82,
        activityLevel: 'moderate',
        bodyFatPercent: 16,
      },
      medical: {
        hasIssues: true,
        injuryTags: ['الركبة'],
        notes: 'خشونة خفيفة في الركبة',
      },
      createdAt: 1727740800000,
      updatedAt: 1727740800000,
    }

    render(
      <ExerciseDetailView
        exerciseId="squat-user-test"
        exercise={sampleExercise}
        profile={mockProfile}
      />,
    )

    // Click Tab "لك"
    const forYouTab = screen.getByRole('button', { name: 'لك' })
    fireEvent.click(forYouTab)

    // Medical warning callout rendered
    expect(screen.getByText('تنبيه صحي')).toBeDefined()

    // RIR guidance for intermediate
    expect(screen.getByText(/المستهدف لمستواك \(متوسط\)/)).toBeDefined()

    // Double progression advice for lower body (legs: 2.5 - 5 kg)
    expect(screen.getAllByText(/2\.5 إلى 5 كجم/).length).toBeGreaterThanOrEqual(
      1,
    )
  })
})
