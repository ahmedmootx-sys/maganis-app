import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

async function runGate() {
  console.log('🚀 Running Gate: gate-session-agreement (TASK G3 Part 6)...')

  // Check resolveSession existence
  const resolverPath = path.join(rootDir, 'src/modules/workout/sessionResolver.ts')
  if (!fs.existsSync(resolverPath)) {
    console.error('❌ FAIL: src/modules/workout/sessionResolver.ts does not exist!')
    process.exit(1)
  }

  // Load resolveSession
  let resolveSessionMod
  try {
    resolveSessionMod = await import('../src/modules/workout/sessionResolver.ts')
  } catch (err) {
    console.error('❌ FAIL: Could not import sessionResolver.ts:', err.message)
    process.exit(1)
  }

  const { resolveSession, formatPrescription, cleanDayName } = resolveSessionMod
  if (typeof resolveSession !== 'function') {
    console.error('❌ FAIL: resolveSession is not exported from sessionResolver.ts')
    process.exit(1)
  }
  if (typeof formatPrescription !== 'function') {
    console.error('❌ FAIL: formatPrescription is not exported from sessionResolver.ts')
    process.exit(1)
  }

  // 1. Static scan of consumer files
  const dashboardCode = fs.readFileSync(path.join(rootDir, 'src/modules/dashboard/Dashboard.tsx'), 'utf8')
  if (!dashboardCode.includes('resolveSession')) {
    console.error('❌ FAIL: Dashboard.tsx does not use resolveSession')
    process.exit(1)
  }
  if (!dashboardCode.includes('formatPrescription')) {
    console.error('❌ FAIL: Dashboard.tsx does not use formatPrescription')
    process.exit(1)
  }

  const weeklyPlanCode = fs.readFileSync(path.join(rootDir, 'src/modules/workout/WeeklyPlanView.tsx'), 'utf8')
  if (!weeklyPlanCode.includes('resolveSession')) {
    console.error('❌ FAIL: WeeklyPlanView.tsx does not use resolveSession')
    process.exit(1)
  }
  if (!weeklyPlanCode.includes('formatPrescription')) {
    console.error('❌ FAIL: WeeklyPlanView.tsx does not use formatPrescription')
    process.exit(1)
  }

  const activeCode = fs.readFileSync(path.join(rootDir, 'src/modules/workout/ActiveWorkoutSession.tsx'), 'utf8')
  if (!activeCode.includes('formatPrescription')) {
    console.error('❌ FAIL: ActiveWorkoutSession.tsx does not use formatPrescription')
    process.exit(1)
  }

  // 2. Load profiles
  const ownerDump = JSON.parse(fs.readFileSync(path.join(rootDir, 'docs/owner-profile-dump.json'), 'utf8'))
  const ownerProfile = ownerDump.profile

  const fixtureProfile = {
    id: 'fixture-n1',
    name: 'رياضي تجريبي',
    trainingDaysPerWeek: 4,
    splitType: 'upper_lower',
    weekStartDay: 6,
    experienceLevel: 'intermediate',
  }

  const { buildOwnerProgram } = await import('../src/modules/workout/ownerProgramImporter.ts')
  const ownerProgram = buildOwnerProgram()

  const fixtureProgram = {
    id: 'prog-fixture-4d',
    title: 'برنامج علوي / سفلي تجريبي',
    splitType: 'upper_lower',
    daysPerWeek: 4,
    days: [
      {
        dayIndex: 0,
        id: 'fix-day-1',
        name: 'علوي (أ)',
        labelAr: 'علوي (أ)',
        focus: 'صدر وظهر',
        exercises: [
          { exerciseId: 'chest-1', sets: 3, repsMin: 8, repsMax: 10 },
          { exerciseId: 'back-4', sets: 3, repsMin: 10, repsMax: 12 },
          { exerciseId: 'core-1', sets: 3, repsMin: 30, repsMax: 45, unit: 'seconds' },
          { exerciseId: 'arm-2', sets: 3, repsMin: 12, perSide: true },
        ],
      },
      {
        dayIndex: 1,
        id: 'fix-day-2',
        name: 'سفلي (أ)',
        labelAr: 'سفلي (أ)',
        focus: 'أرجل وجذع',
        exercises: [
          { exerciseId: 'leg-4', sets: 3, repsMin: 10 },
          { exerciseId: 'leg-6', sets: 3, repsMin: 8 },
        ],
      },
    ],
  }

  const testDatasets = [
    { name: 'Owner Profile + Owner Real Program', profile: ownerProfile, program: ownerProgram },
    { name: 'Fixture Profile + Fixture Program', profile: fixtureProfile, program: fixtureProgram },
  ]

  let totalAssertions = 0

  // Base reference date: a known Saturday (e.g., 2026-10-17 is Saturday)
  const baseSat = new Date('2026-10-17T10:00:00Z')

  for (const ds of testDatasets) {
    console.log(`\nTesting Dataset: ${ds.name}`)
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const testDate = new Date(baseSat.getTime() + dayOffset * 24 * 60 * 60 * 1000)
      const weekday = testDate.getDay()

      // Resolve session
      const resolved = resolveSession(testDate, { profile: ds.profile, program: ds.program })
      totalAssertions++

      // Validate resolveSession properties
      if (typeof resolved.dayTitle !== 'string' || !resolved.dayTitle) {
        console.error(`❌ FAIL: resolved.dayTitle missing for weekday ${weekday}`)
        process.exit(1)
      }

      // Check day.name never contains an auto-generated weekday word
      if (resolved.programDay) {
        const rawName = resolved.programDay.name || resolved.programDay.labelAr || ''
        const cleaned = cleanDayName(rawName)
        if (cleaned.startsWith('السبت') || cleaned.startsWith('الأحد') || cleaned.startsWith('الإثنين')) {
          console.error(`❌ FAIL: cleanDayName failed to strip weekday prefix from "${rawName}" -> "${cleaned}"`)
          process.exit(1)
        }
        totalAssertions++

        // Check prescription agreement for each exercise
        for (const pe of resolved.programDay.exercises) {
          const presc = formatPrescription(pe)
          if (!presc || typeof presc !== 'string') {
            console.error(`❌ FAIL: formatPrescription returned invalid string for exercise ${pe.exerciseId}: "${presc}"`)
            process.exit(1)
          }
          // Must not contain odd derived midpoints if min/max exists
          if (pe.repsMin && pe.repsMax && pe.repsMin !== pe.repsMax) {
            const expectedRange = `${pe.repsMin}–${pe.repsMax}`
            if (!presc.includes(expectedRange)) {
              console.error(`❌ FAIL: formatPrescription "${presc}" does not contain expected range "${expectedRange}"`)
              process.exit(1)
            }
          }
          totalAssertions++
        }
      }

      console.log(`  Weekday ${weekday} (${resolved.weekdayNameAr}): ${resolved.dayTitle} [ID: ${resolved.dayId || 'REST'}]`)
    }
  }

  // 3. Verify owner draft program import structure
  console.log('\nValidating Owner Draft Program structure...')
  if (ownerProgram.days.length !== 5) {
    console.error(`❌ FAIL: Owner program must have 5 days, found ${ownerProgram.days.length}`)
    process.exit(1)
  }
  totalAssertions++

  // Check week-2 note on program
  if (!ownerProgram.notes || !ownerProgram.notes.includes('الأسبوع 2')) {
    console.error('❌ FAIL: Owner program missing week-2 alternation note!')
    process.exit(1)
  }
  totalAssertions++

  // Check days A to E have cool-down sections
  for (const day of ownerProgram.days) {
    if (!Array.isArray(day.cooldown) || day.cooldown.length === 0) {
      console.error(`❌ FAIL: Day ${day.name} missing cooldown section!`)
      process.exit(1)
    }
    totalAssertions++
  }

  // Check upper days control block is empty
  const upperDays = [ownerProgram.days[0], ownerProgram.days[2], ownerProgram.days[4]]
  for (const day of upperDays) {
    if (day.controlBlock && day.controlBlock.length > 0) {
      console.error(`❌ FAIL: Upper day ${day.name} control block must be empty (undecided)!`)
      process.exit(1)
    }
    totalAssertions++
  }

  // Check lower days control block has 3 items
  const lowerDays = [ownerProgram.days[1], ownerProgram.days[3]]
  for (const day of lowerDays) {
    if (!day.controlBlock || day.controlBlock.length !== 3) {
      console.error(`❌ FAIL: Lower day ${day.name} control block must have 3 exercises!`)
      process.exit(1)
    }
    totalAssertions++
  }

  console.log(`\n✓ gate-session-agreement passed with ${totalAssertions} assertions checked across all 7 weekdays & 2 datasets!`)
}

runGate()
