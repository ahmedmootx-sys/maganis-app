import { describe, it, expect } from 'vitest'
import {
  calculateCardioEnergy,
  calculateLiveEnergy,
  CARDIO_ACTIVITIES,
  type CardioActivityId,
  type CardioEffortLevel,
} from './cardioEngine.ts'

describe('cardioEngine (B1.1 Data and Formulas)', () => {
  it('1. reproduces the four worked examples from cardio-met-table.json to within 0.01 kcal', () => {
    // Example 1: run, light, 30 min, 70 kg
    const ex1 = calculateCardioEnergy('run', 'light', 30, 70)
    expect(ex1).not.toBeNull()
    expect(Math.abs(ex1!.grossSessionKcal - 220.5)).toBeLessThan(0.01)
    expect(Math.abs(ex1!.netSessionKcal - 183.75)).toBeLessThan(0.01)

    // Example 2: bike, moderate, 20 min, 70 kg
    const ex2 = calculateCardioEnergy('bike', 'moderate', 20, 70)
    expect(ex2).not.toBeNull()
    expect(Math.abs(ex2!.grossSessionKcal - 166.6)).toBeLessThan(0.01)
    expect(Math.abs(ex2!.netSessionKcal - 142.1)).toBeLessThan(0.01)

    // Example 3: walk, moderate, 45 min, 70 kg
    const ex3 = calculateCardioEnergy('walk', 'moderate', 45, 70)
    expect(ex3).not.toBeNull()
    expect(Math.abs(ex3!.grossSessionKcal - 292.16)).toBeLessThan(0.01)
    expect(Math.abs(ex3!.netSessionKcal - 237.04)).toBeLessThan(0.01)

    // Example 4: jumprope, high, 10 min, 70 kg
    const ex4 = calculateCardioEnergy('jumprope', 'high', 10, 70)
    expect(ex4).not.toBeNull()
    expect(Math.abs(ex4!.grossSessionKcal - 150.68)).toBeLessThan(0.01)
    expect(Math.abs(ex4!.netSessionKcal - 138.43)).toBeLessThan(0.01)
  })

  it('2. verifies every activity has exactly three levels with code, MET, and Arabic hint', () => {
    expect(CARDIO_ACTIVITIES.length).toBe(6)
    const requiredLevels: CardioEffortLevel[] = ['light', 'moderate', 'high']

    for (const act of CARDIO_ACTIVITIES) {
      expect(act.name_ar).toBeTruthy()
      for (const lvl of requiredLevels) {
        const info = act.levels[lvl]
        expect(info).toBeDefined()
        expect(info.compendium_code).toMatch(/^\d{5}$/)
        expect(info.met).toBeGreaterThan(0)
        expect(info.ui_hint_ar).toBeTruthy()
      }
    }
  })

  it('3. verifies energy is strictly monotonic in weight, minutes, and effort level', () => {
    const activities: CardioActivityId[] = [
      'run',
      'walk',
      'bike',
      'swim',
      'jumprope',
      'rowing',
    ]

    for (const act of activities) {
      // Monotonic in effort level (light < moderate < high)
      const light = calculateCardioEnergy(act, 'light', 30, 70)!
      const moderate = calculateCardioEnergy(act, 'moderate', 30, 70)!
      const high = calculateCardioEnergy(act, 'high', 30, 70)!

      expect(light.grossSessionKcal).toBeLessThan(moderate.grossSessionKcal)
      expect(moderate.grossSessionKcal).toBeLessThan(high.grossSessionKcal)
      expect(light.netSessionKcal).toBeLessThan(moderate.netSessionKcal)
      expect(moderate.netSessionKcal).toBeLessThan(high.netSessionKcal)

      // Monotonic in weight
      const weight60 = calculateCardioEnergy(act, 'moderate', 30, 60)!
      const weight80 = calculateCardioEnergy(act, 'moderate', 30, 80)!
      expect(weight60.grossSessionKcal).toBeLessThan(weight80.grossSessionKcal)
      expect(weight60.netSessionKcal).toBeLessThan(weight80.netSessionKcal)

      // Monotonic in minutes
      const min20 = calculateCardioEnergy(act, 'moderate', 20, 70)!
      const min40 = calculateCardioEnergy(act, 'moderate', 40, 70)!
      expect(min20.grossSessionKcal).toBeLessThan(min40.grossSessionKcal)
      expect(min20.netSessionKcal).toBeLessThan(min40.netSessionKcal)
    }
  })

  it('4. strictly does not compute, display or export fat grams anywhere', () => {
    const res = calculateCardioEnergy('run', 'moderate', 30, 75)
    expect(res).not.toBeNull()
    const keys = Object.keys(res!)
    expect(keys.some((k) => k.toLowerCase().includes('fat'))).toBe(false)

    const serialized = JSON.stringify(res)
    expect(serialized.toLowerCase()).not.toContain('fat')
    expect(serialized.toLowerCase()).not.toContain('دهن')
    expect(serialized.toLowerCase()).not.toContain('دهون')
  })

  it('5. returns null when weight or duration is missing or non-positive', () => {
    expect(calculateCardioEnergy('run', 'light', 0, 70)).toBeNull()
    expect(calculateCardioEnergy('run', 'light', -10, 70)).toBeNull()
    expect(calculateCardioEnergy('run', 'light', 30, 0)).toBeNull()
    expect(calculateCardioEnergy('run', 'light', 30, -5)).toBeNull()
    expect(calculateCardioEnergy('run', 'light', NaN, 70)).toBeNull()
  })

  it('6. calculates live energy using timestamp deltas', () => {
    const rate = 8.0 // kcal/min
    expect(calculateLiveEnergy(rate, 0)).toBe(0)
    expect(calculateLiveEnergy(rate, 60000)).toBe(8.0) // 1 minute
    expect(calculateLiveEnergy(rate, 150000)).toBe(20.0) // 2.5 minutes
  })
})
