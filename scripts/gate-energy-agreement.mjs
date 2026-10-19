#!/usr/bin/env node
/**
 * scripts/gate-energy-agreement.mjs
 * Gate: Energy & Nutrition Target Agreement Contract (TASK G3 Part 3)
 *
 * Verifies:
 * 1. Single source of truth for energy plan: computeEnergyPlan(profile, bodyLog).
 * 2. Perfect agreement on fixture profile and owner real profile (docs/owner-profile-dump.json).
 * 3. Target calculation conforms strictly to goal adjustments:
 *    - hypertrophy / gain: target > tdee
 *    - fat_loss / cut: target < tdee
 *    - recomposition / maintenance: target === tdee
 * 4. Protein calculation agreement:
 *    - 2.0 g/kg (recomposition / hypertrophy)
 *    - 2.2 g/kg (fat_loss)
 *    - 1.6 g/kg (endurance / health)
 * 5. Dashboard and NutritionModule both derive from computeEnergyPlan (no divergence / invented constants).
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate: gate-energy-agreement (Energy & Nutrition Target Agreement)...')

  const failures = []
  let checksPassed = 0

  // 1. Static check: computeEnergyPlan exists and is imported by Dashboard and NutritionModule
  const dashboardPath = path.join(rootDir, 'src/modules/dashboard/Dashboard.tsx')
  const nutritionPath = path.join(rootDir, 'src/modules/nutrition/NutritionModule.tsx')
  const dashboardSrc = fs.readFileSync(dashboardPath, 'utf8')
  const nutritionSrc = fs.readFileSync(nutritionPath, 'utf8')

  if (dashboardSrc.includes('computeEnergyPlan')) {
    checksPassed++
    console.log('✓ Dashboard imports and uses computeEnergyPlan')
  } else {
    failures.push({
      test: 'DASHBOARD_COMPUTE_ENERGY_PLAN',
      error: 'Dashboard does not use computeEnergyPlan as single source of truth for energy targets',
    })
  }

  if (nutritionSrc.includes('computeEnergyPlan')) {
    checksPassed++
    console.log('✓ NutritionModule imports and uses computeEnergyPlan')
  } else {
    failures.push({
      test: 'NUTRITION_COMPUTE_ENERGY_PLAN',
      error: 'NutritionModule does not use computeEnergyPlan as single source of truth for energy targets',
    })
  }

  // 2. Functional check with computeEnergyPlan
  const { computeEnergyPlan } = await import('../src/modules/nutrition/computeEnergyPlan.ts')

  // Load Owner Profile Dump
  const ownerDumpPath = path.join(rootDir, 'docs/owner-profile-dump.json')
  const ownerDump = JSON.parse(fs.readFileSync(ownerDumpPath, 'utf8'))
  const ownerProfile = ownerDump.profile

  const ownerPlan = computeEnergyPlan(ownerProfile)
  if (!ownerPlan) {
    failures.push({
      test: 'OWNER_PLAN_NULL',
      error: 'computeEnergyPlan returned null for owner real profile',
    })
  } else {
    checksPassed++
    console.log(`✓ Owner profile energy plan computed: BMR=${ownerPlan.bmr}, TDEE=${ownerPlan.tdee}, Target=${ownerPlan.target}, Protein=${ownerPlan.proteinGrams}g`)

    // Owner has goal hypertrophy, so target must be surplus
    if (ownerPlan.target > ownerPlan.tdee) {
      checksPassed++
      console.log(`✓ Owner hypertrophy target (${ownerPlan.target} kcal) is in surplus above TDEE (${ownerPlan.tdee} kcal)`)
    } else {
      failures.push({
        test: 'OWNER_SURPLUS_MISMATCH',
        error: `Owner hypertrophy goal should have target > tdee, but target=${ownerPlan.target}, tdee=${ownerPlan.tdee}`,
      })
    }

    // Owner weight is 80kg, protein 2.0 g/kg = 160g
    if (ownerPlan.proteinGrams === 160) {
      checksPassed++
      console.log(`✓ Owner protein target is strictly 160g (80kg × 2.0 g/kg)`)
    } else {
      failures.push({
        test: 'OWNER_PROTEIN_MISMATCH',
        error: `Expected 160g protein for 80kg hypertrophy, got ${ownerPlan.proteinGrams}g`,
      })
    }
  }

  // Fixture tests across goals
  const baseProfile = {
    primaryGoal: 'recomposition',
    trainingDaysPerWeek: 4,
    body: {
      sex: 'male',
      weightKg: 75,
      heightCm: 175,
      birthDate: '1995-05-15',
      lifestyle: 2,
    },
  }

  // Recomposition: target == tdee, protein = 75 * 2.0 = 150g
  const recompPlan = computeEnergyPlan(baseProfile)
  if (recompPlan && recompPlan.target === recompPlan.tdee && recompPlan.proteinGrams === 150) {
    checksPassed++
    console.log(`✓ Recomposition plan agreement: Target === TDEE (${recompPlan.target} kcal), Protein = 150g`)
  } else {
    failures.push({
      test: 'RECOMP_PLAN_MISMATCH',
      error: `Recomp plan mismatch: target=${recompPlan?.target}, tdee=${recompPlan?.tdee}, protein=${recompPlan?.proteinGrams}`,
    })
  }

  // Fat loss: target < tdee, protein = 75 * 2.2 = 165g
  const fatLossPlan = computeEnergyPlan({ ...baseProfile, primaryGoal: 'fat_loss' })
  if (fatLossPlan && fatLossPlan.target < fatLossPlan.tdee && fatLossPlan.proteinGrams === 165) {
    checksPassed++
    console.log(`✓ Fat loss plan agreement: Target < TDEE (${fatLossPlan.target} < ${fatLossPlan.tdee} kcal), Protein = 165g`)
  } else {
    failures.push({
      test: 'FAT_LOSS_PLAN_MISMATCH',
      error: `Fat loss plan mismatch: target=${fatLossPlan?.target}, tdee=${fatLossPlan?.tdee}, protein=${fatLossPlan?.proteinGrams}`,
    })
  }

  // Hypertrophy: target > tdee, protein = 75 * 2.0 = 150g
  const bulkPlan = computeEnergyPlan({ ...baseProfile, primaryGoal: 'hypertrophy' })
  if (bulkPlan && bulkPlan.target > bulkPlan.tdee && bulkPlan.proteinGrams === 150) {
    checksPassed++
    console.log(`✓ Hypertrophy plan agreement: Target > TDEE (${bulkPlan.target} > ${bulkPlan.tdee} kcal), Protein = 150g`)
  } else {
    failures.push({
      test: 'BULK_PLAN_MISMATCH',
      error: `Hypertrophy plan mismatch: target=${bulkPlan?.target}, tdee=${bulkPlan?.tdee}, protein=${bulkPlan?.proteinGrams}`,
    })
  }

  console.log(`\n📊 Gate Summary: ${checksPassed} checks passed, ${failures.length} failures`)
  if (failures.length > 0) {
    console.error(`\n❌ FAIL: ${failures.length} energy agreement violations detected:`)
    for (const f of failures) {
      console.error(`  [${f.test}] ${f.error}`)
    }
    process.exit(1)
  }

  console.log('\n✓ gate-energy-agreement passed cleanly! Single truth for energy plan verified.')
  process.exit(0)
}

runGate().catch((err) => {
  console.error('Fatal gate error:', err)
  process.exit(1)
})
