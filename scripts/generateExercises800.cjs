const https = require('https')
const fs = require('fs')
const path = require('path')

function fetchJson(url) {
  return new Promise((resolve) => {
    https
      .get(url, { headers: { 'User-Agent': 'Node' } }, (res) => {
        let data = ''
        res.on('data', (chunk) => (data += chunk))
        res.on('end', () => {
          try {
            resolve(JSON.parse(data))
          } catch (e) {
            resolve(null)
          }
        })
      })
      .on('error', () => resolve(null))
  })
}

const CDN_BASE =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

const MUSCLE_MAP_AR = {
  abdominals: 'عضلات البطن والجذع',
  hamstrings: 'أوتار الركبة (الهمسترنج)',
  adductors: 'العضلات الضامة (الفخذ الداخلي)',
  quadriceps: 'العضلة الرباعية (الفخذ الأمامي)',
  biceps: 'عضلة البايسبس',
  shoulders: 'عضلات الكتف (الدالية)',
  chest: 'العضلة الصدرية الكبرى',
  'middle back': 'أعلى الظهر والمجنص',
  calves: 'عضلات السمانة (الكاحل)',
  glutes: 'عضلات الألوية (المقعدة)',
  'lower back': 'أسفل الظهر والفقرات القطنية',
  lats: 'عضلة الظهر العريضة (اللاتس)',
  triceps: 'عضلة الترايسبس',
  traps: 'عضلات الترابيس',
  forearms: 'عضلات الساعد والرسغ',
  neck: 'عضلات الرقبة',
  abductors: 'العضلات المبعدة (الفخذ الخارجي)',
}

const CATEGORY_MAP = {
  abdominals: 'core',
  hamstrings: 'legs',
  adductors: 'legs',
  quadriceps: 'legs',
  biceps: 'arms',
  shoulders: 'shoulders',
  chest: 'chest',
  'middle back': 'back',
  calves: 'legs',
  glutes: 'legs',
  'lower back': 'back',
  lats: 'back',
  triceps: 'arms',
  traps: 'back',
  forearms: 'arms',
  neck: 'shoulders',
  abductors: 'legs',
}

const EQUIPMENT_MAP = {
  'body only': 'bodyweight',
  'exercise ball': 'bodyweight',
  'foam roll': 'bodyweight',
  'medicine ball': 'bodyweight',
  other: 'bodyweight',
  barbell: 'barbell',
  'e-z curl bar': 'barbell',
  dumbbell: 'dumbbell',
  kettlebells: 'dumbbell',
  cable: 'machine',
  machine: 'machine',
  bands: 'band',
}

async function run() {
  console.log('Fetching free-exercise-db...')
  const list = await fetchJson(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json',
  )
  if (!list) {
    console.error('Failed to fetch list')
    return
  }

  console.log('Processing', list.length, 'exercises...')
  const exercises800 = list.map((item) => {
    const primaryMuscle =
      (item.primaryMuscles && item.primaryMuscles[0]) || 'chest'
    const category = CATEGORY_MAP[primaryMuscle] || 'chest'
    const equipment = EQUIPMENT_MAP[item.equipment] || 'bodyweight'

    const targetMusclesAr = (item.primaryMuscles || []).map(
      (m) => MUSCLE_MAP_AR[m] || m,
    )
    if (item.secondaryMuscles && item.secondaryMuscles.length > 0) {
      item.secondaryMuscles.forEach((m) => {
        const ar = MUSCLE_MAP_AR[m]
        if (ar && !targetMusclesAr.includes(ar)) targetMusclesAr.push(ar)
      })
    }

    const img0 = item.images && item.images[0] ? CDN_BASE + item.images[0] : ''
    const img1 =
      item.images && item.images[1] ? CDN_BASE + item.images[1] : img0

    return {
      id: 'ext-' + item.id,
      nameAr: item.name,
      descriptionAr:
        (item.instructions && item.instructions[0]) ||
        'تمرين ' +
          item.name +
          ' لتقوية ' +
          (MUSCLE_MAP_AR[primaryMuscle] || primaryMuscle),
      category: category,
      difficulty: item.level || 'intermediate',
      equipment: equipment,
      targetMusclesAr: targetMusclesAr,
      howToStepsAr:
        item.instructions && item.instructions.length > 0
          ? item.instructions
          : [
              'اتخذ وضعية البداية الصحيحة مع تثبيت الجسم',
              'قم بالحركة بمدى كامل وبتحكم تام',
              'اعصر العضلة المستهدفة في قمة الانقباض ثم انزل ببطء',
            ],
      benefitAr:
        'تمرين يستهدف ' +
        targetMusclesAr.join(' و ') +
        ' لتعزيز القوة العضلية والتحمل.',
      thumbnailUrl: img0,
      imageUrl: img0,
    }
  })

  const fileContent =
    "import type { Exercise } from '../shared/types.ts'\n\n" +
    'export const EXERCISES_800: Exercise[] = ' +
    JSON.stringify(exercises800, null, 2) +
    ';\n'

  fs.writeFileSync(
    path.join(__dirname, '..', 'src', 'modules', 'workout', 'exercises800.ts'),
    fileContent,
    'utf8',
  )
  console.log('Saved exercises800.ts successfully! Total:', exercises800.length)
}

run()
