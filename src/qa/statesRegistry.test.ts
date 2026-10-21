import { describe, it, expect } from 'vitest'
import {
  ALL_STATES,
  ROUTE_STATES,
  SHEET_STATES,
  WIZARD_STEP_STATES,
  CHOICE_OPTION_STATES,
  REGISTRY_SIZE,
} from './states.ts'
import fs from 'node:fs'
import path from 'node:path'

describe('R19 State Registry Scanner Test', () => {
  it('has no duplicate state IDs', () => {
    const ids = new Set<string>()
    for (const state of ALL_STATES) {
      expect(ids.has(state.id)).toBe(false)
      ids.add(state.id)
    }
    expect(REGISTRY_SIZE).toBe(ALL_STATES.length)
    expect(REGISTRY_SIZE).toBeGreaterThanOrEqual(70)
  })

  it('scans router.ts and verifies every defined RoutePath has a corresponding registry state', () => {
    const routerPath = path.resolve(process.cwd(), 'src/shell/router.ts')
    const content = fs.readFileSync(routerPath, 'utf8')

    // Extract paths from RoutePath union
    const routeUnionMatch = content.match(
      /export type RoutePath =\s*([\s\S]*?)(?=\n\n|\nexport)/,
    )
    expect(routeUnionMatch).not.toBeNull()

    const rawUnion = routeUnionMatch![1]
    const routePaths = rawUnion
      .split('|')
      .map((s) => s.trim().replace(/['"]/g, ''))
      .filter(Boolean)

    expect(routePaths.length).toBeGreaterThan(0)

    for (const p of routePaths) {
      // Look for a matching route state in ROUTE_STATES
      // For param routes like /training/day/:id or /exercise/:id, match prefix or pattern
      const matched = ROUTE_STATES.some((s) => {
        if (!s.route) return false
        if (s.route === p) return true
        if (p.includes(':id')) {
          const prefix = p.split('/:id')[0]
          return s.route.startsWith(prefix)
        }
        return false
      })
      expect(matched, `Route ${p} must be registered in src/qa/states.ts`).toBe(
        true,
      )
    }
  })

  it('verifies all 6 OnboardingWizard steps are registered', () => {
    for (let step = 1; step <= 6; step++) {
      const found = WIZARD_STEP_STATES.some((s) => s.stepIndex === step)
      expect(found, `Wizard step ${step} must be in WIZARD_STEP_STATES`).toBe(
        true,
      )
    }
  })

  it('verifies essential sheets are registered in SHEET_STATES', () => {
    const requiredSheets = [
      'edit-profile',
      'limitations-editor',
      'diagnostics',
      'macro-guide',
      'quick-meal',
      'days-adjust',
      'ai-designer',
      'import-preview',
      'custom-exercise',
      'replace-exercise',
    ]

    for (const sheetId of requiredSheets) {
      const found = SHEET_STATES.some((s) => s.sheetId === sheetId)
      expect(found, `Sheet ${sheetId} must be in SHEET_STATES`).toBe(true)
    }
  })

  it('verifies choice options contain all finite choices (days, duration, intensity, experience, location, sex, condition status)', () => {
    const requiredChoiceKeys = [
      'trainingDays',
      'sessionDuration',
      'sessionIntensity',
      'experienceLevel',
      'trainingLocation',
      'sex',
      'status_shoulder',
      'status_elbow',
      'status_lower_back',
      'mealCategory',
    ]

    for (const key of requiredChoiceKeys) {
      const found = CHOICE_OPTION_STATES.some((s) => s.choiceKey === key)
      expect(
        found,
        `Choice key ${key} must have registered options in CHOICE_OPTION_STATES`,
      ).toBe(true)
    }
  })
})
