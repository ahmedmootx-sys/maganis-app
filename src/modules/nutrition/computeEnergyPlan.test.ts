import { describe, it, expect } from 'vitest'
import { computeEnergyPlan, type ComputableProfile } from './computeEnergyPlan.ts'

describe('computeEnergyPlan Single Source of Truth & Fixtures', () => {
  it('Fixture N1: 59 kg, 169 cm, 20 y, male, lifestyle 2, resistance 5x75 min, gain', () => {
    const profile: ComputableProfile = {
      bodyGoal: 'gain',
      trainingDaysPerWeek: 5,
      body: {
        weightKg: 59,
        heightCm: 169,
        age: 20,
        sex: 'male',
        lifestyle: 2,
        workoutBlocks: [
          {
            type: 'resistance',
            sessionsPerWeek: 5,
            minutesPerSession: 75,
            intensity: 'moderate',
          },
        ],
      },
    }

    const plan = computeEnergyPlan(profile)
    expect(plan).not.toBeNull()
    if (!plan) return

    // BMR: 10*59 + 6.25*169 - 5*20 + 5 = 1551.25 -> 1551
    expect(plan.bmr).toBe(1551)

    // Baseline: 1551.25 * 1.35 = 2094.1875 -> 2094
    expect(plan.baseline).toBe(2094)

    // EAT: 4 * 59 * 1.25 * 1.1 * 5 / 7 = 231.7857 -> 232
    expect(plan.eat).toBe(232)

    // TDEE: 2094.19 + 231.79 = 2325.97 -> 2326
    expect(plan.tdee).toBe(2326)

    // Adjustment: 10% of 2325.97 = 232.6 -> 233
    expect(plan.adjustmentPct).toBe(0.10)
    expect(plan.adjustmentKcal).toBe(233)

    // Target: 2326 + 233 = 2559
    expect(plan.target).toBe(2559)

    // Banner equals Details equals target - tdee
    expect(plan.target - plan.tdee).toBe(plan.adjustmentKcal)

    // Protein: 1.8 * 59 = 106.2 -> 106 g
    expect(plan.proteinGrams).toBe(106)
  })

  it('Fixture N2: 56.5 kg, 171 cm, 20 y, male, lifestyle 2, resistance 5x60 min', () => {
    const profile: ComputableProfile = {
      bodyGoal: 'maintain',
      trainingDaysPerWeek: 5,
      body: {
        weightKg: 56.5,
        heightCm: 171,
        age: 20,
        sex: 'male',
        lifestyle: 2,
        workoutBlocks: [
          {
            type: 'resistance',
            sessionsPerWeek: 5,
            minutesPerSession: 60,
            intensity: 'moderate',
          },
        ],
      },
    }

    const plan = computeEnergyPlan(profile)
    expect(plan).not.toBeNull()
    if (!plan) return

    // BMR: 10*56.5 + 6.25*171 - 5*20 + 5 = 1538.75 -> 1539
    expect(plan.bmr).toBe(1539)

    // Baseline: 1538.75 * 1.35 = 2077.31 -> 2077
    expect(plan.baseline).toBe(2077)

    // EAT: 4 * 56.5 * 1.0 * 1.1 * 5 / 7 = 177.57 -> 178
    expect(plan.eat).toBe(178)

    // TDEE: 2077.31 + 177.57 = 2254.88 -> 2255
    expect(plan.tdee).toBe(2255)

    // Protein: 1.8 * 56.5 = 101.7 -> 102 g
    expect(plan.proteinGrams).toBe(102)
  })

  it('Fixture N3: Cut goal with floor bound preventing target below BMR', () => {
    const profile: ComputableProfile = {
      bodyGoal: 'cut',
      trainingDaysPerWeek: 2,
      body: {
        weightKg: 50,
        heightCm: 160,
        age: 25,
        sex: 'female',
        lifestyle: 1, // 1.2
        workoutBlocks: [
          {
            type: 'resistance',
            sessionsPerWeek: 1,
            minutesPerSession: 30,
            intensity: 'light',
          },
        ],
      },
    }

    const plan = computeEnergyPlan(profile)
    expect(plan).not.toBeNull()
    if (!plan) return

    expect(plan.target).toBeGreaterThanOrEqual(plan.bmr)
  })

  it('Fixture N4: Returns null when essential body metrics are missing', () => {
    const profile: ComputableProfile = {
      body: {
        weightKg: undefined,
        heightCm: 170,
        age: 20,
        sex: 'male',
      },
    }
    expect(computeEnergyPlan(profile)).toBeNull()
  })

  it('Fixture N5: Reads latest body log weight if present and updates plan', () => {
    const profile: ComputableProfile = {
      bodyGoal: 'maintain',
      body: {
        weightKg: 60,
        heightCm: 170,
        age: 25,
        sex: 'male',
        lifestyle: 2,
      },
    }
    const bodyLog = [{ date: '2026-10-18', weightKg: 65 }]
    const plan = computeEnergyPlan(profile, bodyLog)
    expect(plan).not.toBeNull()
    if (!plan) return

    expect(plan.proteinGrams).toBe(Math.round(65 * 1.8))
  })
})
