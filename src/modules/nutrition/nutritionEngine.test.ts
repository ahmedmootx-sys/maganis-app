import { describe, it, expect } from 'vitest'
import {
  calculateNutritionTargets,
  calibrateTDEE,
  validateNutritionInput,
  type NutritionEngineInput,
  type WeightLogEntry,
} from './nutritionEngine.ts'

describe('nutritionEngine - Evidence-Based Nutrition & Macro Engine', () => {
  // Test Vector A
  it('Case A: Male, 20y, 58kg, 169cm, no bf, lifestyle 2, resistance 5x60min moderate, gain/fast', () => {
    const input: NutritionEngineInput = {
      sex: 'male',
      age: 20,
      weightKg: 58,
      heightCm: 169,
      lifestyle: 2,
      workoutBlocks: [
        {
          type: 'resistance',
          sessionsPerWeek: 5,
          minutesPerSession: 60,
          intensity: 'moderate',
        },
      ],
      goal: 'gain',
      pace: 'fast',
    }

    const res = calculateNutritionTargets(input)

    // Tolerance +/-5 kcal, +/-2 g
    expect(res.formulaUsed).toBe('mifflin')
    expect(Math.abs(res.bmr - 1541)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.eatDailyKcal - 182)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.tdee - 2263)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.adjustmentKcal - 383)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.targetCalories - 2646)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.displayCalories - 2650)).toBeLessThanOrEqual(10)

    // Protein: 104 g (range 93-116)
    expect(Math.abs(res.protein.grams - 104)).toBeLessThanOrEqual(2)
    expect(Math.abs(res.protein.rangeMin - 93)).toBeLessThanOrEqual(2)
    expect(Math.abs(res.protein.rangeMax - 116)).toBeLessThanOrEqual(2)

    // Fat: 74 g
    expect(Math.abs(res.fat.grams - 74)).toBeLessThanOrEqual(2)

    // Carbs: ~392 g (tolerance +/-2)
    expect(Math.abs(res.carbs.grams - 392)).toBeLessThanOrEqual(3)

    // Reconciled display calories = 4P + 4C + 9F
    expect(res.displayCalories).toBe(
      res.protein.grams * 4 + res.carbs.grams * 4 + res.fat.grams * 9,
    )
  })

  // Test Vector B
  it('Case B: Female, 30y, 65kg, 165cm, bf 28%, lifestyle 1, resistance 3x45min moderate, lose/standard', () => {
    const input: NutritionEngineInput = {
      sex: 'female',
      age: 30,
      weightKg: 65,
      heightCm: 165,
      bodyFatPercent: 28,
      lifestyle: 1,
      workoutBlocks: [
        {
          type: 'resistance',
          sessionsPerWeek: 3,
          minutesPerSession: 45,
          intensity: 'moderate',
        },
      ],
      goal: 'lose',
      pace: 'standard',
    }

    const res = calculateNutritionTargets(input)

    expect(res.formulaUsed).toBe('katch')
    expect(Math.abs(res.bmr - 1381)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.tdee - 1749)).toBeLessThanOrEqual(5)

    // Floor binds -> target is floor (1381 ~ 1380) with warning
    expect(res.floorBound).toBe(true)
    expect(Math.abs(res.targetCalories - 1381)).toBeLessThanOrEqual(5)
    expect(res.warningsAr.length).toBeGreaterThan(0)

    // Protein 121 (35% cap applied)
    expect(Math.abs(res.protein.grams - 121)).toBeLessThanOrEqual(2)
    expect(res.protein.isCapApplied).toBe(true)

    // Fat 52 (0.8 g/kg floor applied)
    expect(Math.abs(res.fat.grams - 52)).toBeLessThanOrEqual(2)
    expect(res.fat.isFloorApplied).toBe(true)

    // Carbs 107
    expect(Math.abs(res.carbs.grams - 107)).toBeLessThanOrEqual(2)

    // Reconciled
    expect(Math.abs(res.displayCalories - 1380)).toBeLessThanOrEqual(5)
    expect(res.displayCalories).toBe(
      res.protein.grams * 4 + res.carbs.grams * 4 + res.fat.grams * 9,
    )
  })

  // Test Vector C
  it('Case C: Male, 35y, 95kg, 180cm, bf 25%, lifestyle 2, resistance 4x60min hard, lose/standard', () => {
    const input: NutritionEngineInput = {
      sex: 'male',
      age: 35,
      weightKg: 95,
      heightCm: 180,
      bodyFatPercent: 25,
      lifestyle: 2,
      workoutBlocks: [
        {
          type: 'resistance',
          sessionsPerWeek: 4,
          minutesPerSession: 60,
          intensity: 'hard',
        },
      ],
      goal: 'lose',
      pace: 'standard',
    }

    const res = calculateNutritionTargets(input)

    expect(res.formulaUsed).toBe('katch')
    expect(Math.abs(res.bmr - 1909)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.eatDailyKcal - 299)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.tdee - 2876)).toBeLessThanOrEqual(5)

    // Deficit capped to 25% of TDEE = ~719
    expect(Math.abs(Math.abs(res.adjustmentKcal) - 719)).toBeLessThanOrEqual(5)
    expect(Math.abs(res.targetCalories - 2157)).toBeLessThanOrEqual(5)

    // Protein: 171 g (2.4 g/kg LBM, LBM = 71.25)
    expect(res.protein.basis).toBe('lean_mass')
    expect(Math.abs(res.protein.grams - 171)).toBeLessThanOrEqual(2)

    // Fat: 60 g
    expect(Math.abs(res.fat.grams - 60)).toBeLessThanOrEqual(2)

    // Carbs: ~234 g
    expect(Math.abs(res.carbs.grams - 234)).toBeLessThanOrEqual(2)

    // Reconciled calories: ~2160
    expect(Math.abs(res.displayCalories - 2160)).toBeLessThanOrEqual(5)
    expect(res.displayCalories).toBe(
      res.protein.grams * 4 + res.carbs.grams * 4 + res.fat.grams * 9,
    )
  })

  // Test Vector D (Calibration)
  it('Case D: Calibration loop with slope +0.10 kg/week', () => {
    const currentTDEE = 2263
    const plannedSurplus = 383
    const currentTarget = 2650

    // Construct 15 days of weight entries with slope +0.10 kg/week (+0.01428 kg/day)
    const weightLogs: WeightLogEntry[] = []
    const baseWeight = 70.0
    for (let day = 0; day <= 14; day++) {
      const dateStr = `2026-09-${String(day + 1).padStart(2, '0')}`
      const weight = baseWeight + (day / 7) * 0.1
      weightLogs.push({ date: dateStr, weightKg: Number(weight.toFixed(3)) })
    }

    const cal = calibrateTDEE({
      currentTDEE,
      currentTarget,
      plannedAdjustment: plannedSurplus,
      weightLogs,
      intakeLogs: [], // assuming intake = current target
    })

    expect(cal.canCalibrate).toBe(true)
    expect(cal.slopeKgPerWeek).toBeCloseTo(0.1, 1)

    // TDEE_obs = 2650 - (0.10 * 1100) = 2540
    expect(Math.abs((cal.tdeeObserved ?? 0) - 2540)).toBeLessThanOrEqual(5)

    // TDEE_new = 0.6 * 2540 + 0.4 * 2263 = 2429.2 -> 2429
    expect(Math.abs((cal.tdeeNew ?? 0) - 2429)).toBeLessThanOrEqual(5)

    // new target = 2429 + 383 = 2812 (~2810)
    expect(Math.abs((cal.newTargetCalories ?? 0) - 2810)).toBeLessThanOrEqual(5)
  })

  // Edge Tests
  describe('Edge and Safety Tests', () => {
    it('under-18 + lose is blocked with descriptive Arabic message', () => {
      const v = validateNutritionInput({
        sex: 'male',
        age: 17,
        weightKg: 75,
        heightCm: 175,
        lifestyle: 2,
        goal: 'lose',
      })
      expect(v.isValid).toBe(false)
      expect(v.errorsAr.goal).toContain('18')
    })

    it('BMI < 18.5 + lose is blocked with descriptive Arabic message', () => {
      const v = validateNutritionInput({
        sex: 'female',
        age: 22,
        weightKg: 42,
        heightCm: 165, // BMI = 15.4
        lifestyle: 1,
        goal: 'lose',
      })
      expect(v.isValid).toBe(false)
      expect(v.errorsAr.goal).toContain('18.5')
    })

    it('absurd values (500 kg, age 0) are blocked', () => {
      const v = validateNutritionInput({
        sex: 'male',
        age: 0,
        weightKg: 500,
        heightCm: 170,
        lifestyle: 2,
        goal: 'gain',
      })
      expect(v.isValid).toBe(false)
      expect(v.errorsAr.age).toBeDefined()
      expect(v.errorsAr.weightKg).toBeDefined()
    })

    it('calibration rejects |slope| > 1.5 kg/week', () => {
      const weightLogs: WeightLogEntry[] = [
        { date: '2026-09-01', weightKg: 70 },
        { date: '2026-09-03', weightKg: 71 },
        { date: '2026-09-05', weightKg: 72 },
        { date: '2026-09-07', weightKg: 73 },
        { date: '2026-09-09', weightKg: 74 },
        { date: '2026-09-11', weightKg: 75 },
        { date: '2026-09-13', weightKg: 76 },
        { date: '2026-09-15', weightKg: 77 },
      ]

      const cal = calibrateTDEE({
        currentTDEE: 2000,
        currentTarget: 2000,
        plannedAdjustment: 0,
        weightLogs,
      })

      expect(cal.canCalibrate).toBe(false)
      expect(cal.reasonAr).toContain('1.5')
    })

    it('calibration requires >= 8 logs and >= 14 days span', () => {
      const fewLogs: WeightLogEntry[] = [
        { date: '2026-09-01', weightKg: 70 },
        { date: '2026-09-05', weightKg: 70.2 },
      ]

      const cal = calibrateTDEE({
        currentTDEE: 2000,
        currentTarget: 2000,
        plannedAdjustment: 0,
        weightLogs: fewLogs,
      })

      expect(cal.canCalibrate).toBe(false)
      expect(cal.reasonAr).toContain('8')
    })
  })
})
