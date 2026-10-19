import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

// Dynamic import EXERCISES
async function run() {
  const { EXERCISES } = await import('../src/modules/workout/exercises.ts')
  const contentData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/exercise-content.json'), 'utf8'))
  const flagsData = JSON.parse(fs.readFileSync(path.join(rootDir, 'src/data/exercise-flags.json'), 'utf8'))
  const flags = flagsData.exercises || flagsData

  console.log(`Loaded ${EXERCISES.length} exercises from library.`)

  // Appendix C exercises with day and prescription
  const appendixExercises = [
    // Warm-up
    { name: 'Arm Circles', section: 'warmup', sets: 1, reps: 10, perDirection: true },
    { name: 'Leg Swings', section: 'warmup', sets: 1, reps: 10, perSide: true },
    { name: 'Hip Circles', section: 'warmup', sets: 1, reps: 10, perDirection: true },
    { name: 'Cat-Cow', section: 'warmup', sets: 1, reps: 10 },
    { name: 'Standing Spinal Rotation', section: 'warmup', sets: 1, reps: 10 },

    // Pull prep (Upper days A, C, E)
    { name: 'Dead Hang', section: 'pull_prep', sets: 3, repsMin: 20, repsMax: 30, unit: 'seconds' },
    { name: 'Scapular Pull-up', section: 'pull_prep', sets: 3, repsMin: 8, repsMax: 10 },

    // Day A (Upper)
    { name: 'Barbell Bench Press', day: 'A', sets: 3, repsMin: 8, rpe: 7 },
    { name: 'Pull-Up', day: 'A', sets: 3, repsMin: 3, repsMax: 5, rpe: 7.5, notes: 'نزول بطيء حتى اكتمال أول تكرار كامل' },
    { name: 'Bent-Over Barbell Row', day: 'A', sets: 3, repsMin: 10, rpe: 7 },
    { name: 'Overhead Press', day: 'A', sets: 3, repsMin: 8, rpe: 7 },
    { name: 'Face Pull', day: 'A', sets: 3, repsMin: 15, rpe: 6 },
    { name: 'Dumbbell Bicep Curl', day: 'A', sets: 3, repsMin: 12, rpe: 6 },

    // Day B (Lower)
    { name: 'Barbell Back Squat', day: 'B', sets: 3, repsMin: 8, rpe: 7 },
    { name: 'Romanian Deadlift', day: 'B', sets: 3, repsMin: 8, rpe: 7 },
    { name: 'Bulgarian Split Squat', day: 'B', sets: 3, repsMin: 10, perSide: true, rpe: 7 },
    { name: 'Barbell Hip Thrust', day: 'B', sets: 3, repsMin: 10, rpe: 7 },
    { name: 'Standing Calf Raise', day: 'B', sets: 3, repsMin: 15, rpe: 6 },
    { name: 'Plank', day: 'B', sets: 3, repsMin: 30, repsMax: 45, unit: 'seconds' },

    // Day C (Upper)
    { name: 'Incline Dumbbell Press', day: 'C', sets: 3, repsMin: 10, rpe: 7 },
    { name: 'Pull-Up', day: 'C', sets: 3, amrap: true, rpe: 7.5 },
    { name: 'Seated Cable Row', day: 'C', sets: 3, repsMin: 10, rpe: 7 },
    { name: 'Parallel Bar Dips', day: 'C', sets: 3, repsMin: 8, repsMax: 10, rpe: 7 },
    { name: 'Dumbbell Lateral Raise', day: 'C', sets: 3, repsMin: 12, repsMax: 15, rpe: 6 },
    { name: 'Dumbbell Wrist Curl', day: 'C', sets: 3, repsMin: 15, rpe: 6 },

    // Day D (Lower)
    { name: 'Leg Press', day: 'D', sets: 3, repsMin: 10, rpe: 7, notes: 'أو Front Squat' },
    { name: 'Lying Leg Curl Machine', day: 'D', sets: 3, repsMin: 10, repsMax: 12, rpe: 7 },
    { name: 'Leg Extension', day: 'D', sets: 3, repsMin: 12, rpe: 6 },
    { name: 'Standing Calf Raise', day: 'D', sets: 3, repsMin: 15, rpe: 6 },
    { name: 'Dumbbell Shrug', day: 'D', sets: 3, repsMin: 15, rpe: 6 },
    { name: 'Side Plank', day: 'D', sets: 3, repsMin: 20, repsMax: 30, unit: 'seconds', perSide: true },

    // Day E (Upper)
    { name: 'Close-Grip Bench Press', day: 'E', sets: 3, repsMin: 8, rpe: 7 },
    { name: 'Pull-Up', day: 'E', sets: 3, amrap: true, rpe: 7.5, notes: 'اختبار أقصى مجهود (maximum-effort test)' },
    { name: 'Chest-Supported Row', day: 'E', sets: 3, repsMin: 10, rpe: 7 },
    { name: 'Reverse Pec Deck', day: 'E', sets: 3, repsMin: 15, rpe: 6 },
    { name: 'Dumbbell Bicep Curl', day: 'E', sets: 3, repsMin: 12, rpe: 6 },
    { name: 'Dumbbell Triceps Extension', day: 'E', sets: 3, repsMin: 12, rpe: 6 },

    // Control block (Lower days B and D)
    { name: 'Single-Leg Balance', section: 'control', sets: 3, repsMin: 20, repsMax: 30, unit: 'seconds', perSide: true, notes: 'عيون مفتوحة ثم مغلقة' },
    { name: 'Isometric Wall Sit', section: 'control', sets: 3, repsMin: 30, repsMax: 45, unit: 'seconds' },
    { name: 'L-sit Progression', section: 'control', sets: 3, repsMin: 10, repsMax: 15, unit: 'seconds' },

    // Cool-down (after every day)
    { name: 'Doorway Chest Stretch', section: 'cooldown', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
    { name: 'Standing Split-Stance Hip Flexor Stretch', section: 'cooldown', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
    { name: 'Standing Thoracic Extension', section: 'cooldown', sets: 1, repsMin: 5, repsMax: 6 },
    { name: 'Cross-Body Shoulder Stretch', section: 'cooldown', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
    { name: 'Standing Overhead Lat Stretch', section: 'cooldown', sets: 1, repsMin: 30, unit: 'seconds', perSide: true },
  ]

  function cleanExerciseName(s) {
    return s.toLowerCase()
      .replace(/\s*-\s*medium\s+grip/i, '')
      .replace(/\bbarbell\b/gi, '')
      .replace(/\bdumbbell\b/gi, '')
      .replace(/\bmachine\b/gi, '')
      .replace(/s$/i, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim()
  }

  const BANNED_EQUIPMENT_KEYWORDS = ['band', 'bands', 'assisted pull-up', 'seated leg curl', 'standing leg curl', 'standing hip abduction']

  const mappingRows = []
  const uniqueNames = Array.from(new Set(appendixExercises.map(e => e.name)))

  for (const name of uniqueNames) {
    let matchedEx = null
    let matchType = 'none'

    // 1. Exact match by name
    matchedEx = EXERCISES.find(e => e.name && e.name.toLowerCase() === name.toLowerCase())
    if (matchedEx) {
      matchType = 'exact'
    } else {
      // 2. Normalized match (without Barbell/Dumbbell, grip suffixes, machine suffixes, plural, hyphens, case)
      const normName = cleanExerciseName(name)
      // Prioritize same equipment if specified in name
      const wantsBarbell = /barbell/i.test(name)
      const wantsDumbbell = /dumbbell/i.test(name)

      matchedEx = EXERCISES.find(e => {
        if (!e.name) return false
        const nameLower = e.name.toLowerCase()
        if (BANNED_EQUIPMENT_KEYWORDS.some(k => nameLower.includes(k))) return false
        if (e.equipment === 'band') return false
        if (wantsBarbell && e.equipment !== 'barbell' && !/barbell/i.test(e.name)) return false
        if (wantsDumbbell && e.equipment !== 'dumbbell' && !/dumbbell/i.test(e.name)) return false

        const normE = cleanExerciseName(e.name)
        return normE === normName
      })
      if (matchedEx) {
        matchType = 'normalized'
      }
    }

    const matchedKey = matchedEx ? matchedEx.id : 'NONE'
    let contentStatus = 'none'
    if (matchedEx) {
      if (contentData[matchedEx.id] || (matchedEx.howToStepsAr && matchedEx.howToStepsAr.length > 0)) {
        contentStatus = contentData[matchedEx.id] ? 'complete' : 'partial'
      }
    }

    mappingRows.push({
      appendix_name: name,
      matched_key: matchedKey,
      matched_name: matchedEx ? matchedEx.name : '—',
      match_type: matchType,
      content_status: contentStatus
    })
  }

  // Write docs/program-import-mapping.csv
  const csvHeader = 'appendix_name,matched_key,matched_name,match_type,content_status\n'
  const csvBody = mappingRows.map(r => `"${r.appendix_name}","${r.matched_key}","${r.matched_name}","${r.match_type}","${r.content_status}"`).join('\n')
  fs.writeFileSync(path.join(rootDir, 'docs/program-import-mapping.csv'), csvHeader + csvBody, 'utf8')
  console.log('✓ Generated docs/program-import-mapping.csv with', mappingRows.length, 'unique appendix items.')

  console.log('\n--- Mapping Summary ---')
  for (const r of mappingRows) {
    console.log(`[${r.match_type.toUpperCase()}] ${r.appendix_name} -> ${r.matched_key} (${r.matched_name}) [${r.content_status}]`)
  }
}

run()
