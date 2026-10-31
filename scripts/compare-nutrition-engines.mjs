#!/usr/bin/env node
/**
 * scripts/compare-nutrition-engines.mjs
 * Generates comparison table between computeEnergyPlan and calculateCalorieMacroTargets.
 *
 * Parameters tested:
 * - sex: 'male', 'female'
 * - age: 18, 30, 50
 * - weight: 55, 80, 100 kg
 * - height: 165, 180 cm
 * - lifestyle: 1, 2, 3, 4, 5
 * - goal: 'gain', 'maintain', 'lose'
 * - pace: 'slow', 'standard', 'fast'
 *
 * Emits docs/nutrition-engine-comparison.md
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { computeEnergyPlan } from '../src/modules/nutrition/computeEnergyPlan.ts'
import { calculateCalorieMacroTargets } from '../src/modules/nutrition/calorieCalculator.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')

const SEXES = ['male', 'female']
const AGES = [18, 30, 50]
const WEIGHTS = [55, 80, 100]
const HEIGHTS = [165, 180]
const LIFESTYLES = [1, 2, 3, 4, 5]
const GOALS = ['gain', 'maintain', 'lose']
const PACES = ['slow', 'standard', 'fast']

function run() {
  console.log('--- Running Nutrition Engine Grid Comparison (H4.8 B8) ---')

  let totalCombinations = 0
  let mismatchCount = 0
  const rows = []

  for (const sex of SEXES) {
    for (const age of AGES) {
      for (const weightKg of WEIGHTS) {
        for (const heightCm of HEIGHTS) {
          for (const lifestyle of LIFESTYLES) {
            for (const goal of GOALS) {
              const pacesToTest = goal === 'maintain' ? ['standard'] : PACES
              for (const pace of pacesToTest) {
                totalCombinations++

                const primaryGoal =
                  goal === 'gain'
                    ? 'hypertrophy'
                    : goal === 'lose'
                      ? 'cut'
                      : 'maintain'
                const bodyGoal =
                  goal === 'gain'
                    ? 'gain'
                    : goal === 'lose'
                      ? 'cut'
                      : 'maintain'

                const mockProfile = {
                  id: 'grid-test-persona',
                  name: 'اختبار مقارنة',
                  primaryGoal,
                  goals: [primaryGoal],
                  bodyGoal,
                  trainingStyle: ['weights'],
                  trainingDaysPerWeek: 4,
                  splitType: 'upper_lower',
                  experienceLevel: 'intermediate',
                  equipmentAvailable: ['barbell'],
                  body: {
                    sex,
                    age,
                    heightCm,
                    weightKg,
                    activityLevel: 'moderate',
                    lifestyle,
                    pace,
                  },
                  medical: {
                    hasIssues: false,
                    injuryTags: [],
                    notes: '',
                  },
                  limitations: [],
                  createdAt: 1700000000000,
                  updatedAt: 1700000000000,
                }

                const res1 = computeEnergyPlan(mockProfile)
                const res2 = calculateCalorieMacroTargets(mockProfile)

                if (!res1 || !res2) {
                  console.error('Null result for profile:', mockProfile)
                  continue
                }

                const target1 = res1.target
                const target2 = res2.targetCalories
                const protein1 = res1.proteinGrams
                const protein2 = res2.proteinGrams

                const diffKcal = Math.abs(target1 - target2)
                const diffProtein = Math.abs(protein1 - protein2)

                if (diffKcal > 25 || diffProtein > 5) {
                  mismatchCount++
                  rows.push({
                    sex: sex === 'male' ? 'M' : 'F',
                    age,
                    weight: weightKg,
                    height: heightCm,
                    lifestyle,
                    goal,
                    pace,
                    tdee1: res1.tdee,
                    tdee2: res2.tdee,
                    target1,
                    target2,
                    diffKcal: target1 - target2,
                    protein1,
                    protein2,
                    diffProtein: protein1 - protein2,
                  })
                }
              }
            }
          }
        }
      }
    }
  }

  console.log(`Total Grid Combinations Evaluated: ${totalCombinations}`)
  console.log(
    `Mismatches Found (|Δkcal| > 25 or |Δprotein| > 5g): ${mismatchCount}`,
  )

  // Generate markdown documentation
  let md = `# Nutrition Engine Discrepancy Analysis (Task H4.8 Deliverable B8)\n\n`
  md += `**Date**: ${new Date().toISOString().slice(0, 10)}\n`
  md += `**Method**: Evaluated grid of all combinations over Sex (M/F), Age (18, 30, 50), Weight (55, 80, 100 kg), Height (165, 180 cm), Lifestyle (1-5), Goal (gain, maintain, lose), and Pace (slow, standard, fast).\n\n`
  md += `### Summary\n\n`
  md += `- **Total parameter combinations evaluated**: ${totalCombinations}\n`
  md += `- **Discrepant combinations** (|Δtarget| > 25 kcal or |Δprotein| > 5g): **${mismatchCount}** (${((mismatchCount / totalCombinations) * 100).toFixed(1)}% of all cases)\n\n`
  md += `### Root Causes of Discrepancies\n\n`
  md += `1. **Target Caloric Surpluses and Deficits**:\n`
  md += `   - **\`computeEnergyPlan\` (Home/Dashboard)** uses a flat percentage of TDEE: \`+10%\` for gain and \`-15%\` for cut/fat loss.\n`
  md += `   - **\`calculateCalorieMacroTargets\` (Nutrition / Reports)** uses fixed goal/pace kcal offsets from Helms / ACSM standards: standard gain = +352 kcal, standard loss = -651 kcal (slow: -325, fast: -977).\n`
  md += `2. **Protein Multipliers**:\n`
  md += `   - **\`computeEnergyPlan\`** sets protein per kg BW to \`2.0 g/kg\` for hypertrophy/recomp, \`2.2 g/kg\` for cut, \`1.8 g/kg\` baseline (Morton et al. 2018).\n`
  md += `   - **\`calculateCalorieMacroTargets\`** sets protein to \`1.8 g/kg\` baseline for maintenance/gain, and up to \`2.14 g/kg\` for deficit.\n\n`
  md += `### Discrepancy Matrix (Sample & Critical Cases)\n\n`
  md += `| Sex | Age | Wt(kg) | Ht(cm) | PAL | Goal | Pace | TDEE(Home) | TDEE(Nutr) | Target(Home) | Target(Nutr) | Δ Kcal | Prot(Home) | Prot(Nutr) | Δ Prot |\n`
  md += `|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|:---|\n`

  for (const r of rows) {
    md += `| ${r.sex} | ${r.age} | ${r.weight} | ${r.height} | ${r.lifestyle} | ${r.goal} | ${r.pace} | ${r.tdee1} | ${r.tdee2} | ${r.target1} | ${r.target2} | ${r.diffKcal > 0 ? '+' + r.diffKcal : r.diffKcal} | ${r.protein1}g | ${r.protein2}g | ${r.diffProtein > 0 ? '+' + r.diffProtein : r.diffProtein}g |\n`
  }

  const outputPath = path.join(
    rootDir,
    'docs',
    'nutrition-engine-comparison.md',
  )
  fs.writeFileSync(outputPath, md, 'utf8')
  console.log(`✓ Report written to ${outputPath}`)
}

run()
