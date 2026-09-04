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

function download(url, dest) {
  return new Promise((resolve) => {
    https
      .get(url, (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          return resolve(download(res.headers.location, dest))
        }
        if (res.statusCode !== 200) return resolve(false)
        const file = fs.createWriteStream(dest)
        res.pipe(file)
        file.on('finish', () => {
          file.close()
          resolve(true)
        })
      })
      .on('error', () => resolve(false))
  })
}

const exercisesDir = path.join(__dirname, '..', 'public', 'exercises')
if (!fs.existsSync(exercisesDir))
  fs.mkdirSync(exercisesDir, { recursive: true })

const CDN_BASE =
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/'

// Direct mapping dictionary for all 122 exercises in exercises.ts
const ID_TO_FREEDB = {
  // Chest
  'chest-1': 'Barbell_Bench_Press_-_Medium_Grip',
  'chest-2': 'Dumbbell_Bench_Press',
  'chest-3': 'Pushups',
  'chest-4': 'Incline_Barbell_Bench_Press',
  'chest-5': 'Incline_Dumbbell_Press',
  'chest-6': 'Dumbbell_Flyes',
  'chest-7': 'Cable_Crossover',
  'chest-8': 'Cable_Chest_Press',
  'chest-9': 'Incline_Dumbbell_Press',
  'chest-10': 'Leverage_Chest_Press',
  'chest-11': 'Dips_-_Chest_Version',
  'chest-12': 'Decline_Dumbbell_Flyes',
  'chest-13': 'Decline_Barbell_Bench_Press',
  'chest-14': 'Pushups',
  'chest-15': 'Incline_Push-Up',
  'chest-16': 'Decline_Push-Up',
  'chest-17': 'Chest_Dip',
  'chest-18': 'Dumbbell_Flyes',
  'chest-19': 'Smith_Machine_Bench_Press',
  'chest-20': 'Butterfly',

  // Back
  'back-1': 'Bent_Over_Barbell_Row',
  'back-2': 'Bent_Over_Two-Dumbbell_Row',
  'back-3': 'Pullups',
  'back-4': 'Chin-Up',
  'back-5': 'Wide-Grip_Lat_Pulldown',
  'back-6': 'V-bar_Pulldown',
  'back-7': 'Seated_Cable_Rows',
  'back-8': 'One-Arm_Dumbbell_Row',
  'back-9': 'Barbell_Deadlift',
  'back-10': 'Hyperextensions_Back_Extensions',
  'back-11': 'T-Bar_Row_with_Handle',
  'back-12': 'Reverse_Flyes',
  'back-13': 'Straight-Arm_Pulldown',
  'back-14': 'Inverted_Row',
  'back-15': 'Close-Grip_Front_Lat_Pulldown',
  'back-16': 'Rope_Climb',
  'back-17': 'Smith_Machine_Bent_Over_Row',
  'back-18': 'Underhand_Cable_Pulldowns',
  'back-19': 'Good_Morning',
  'back-20': 'Barbell_Shrug',

  // Legs
  'leg-1': 'Barbell_Full_Squat',
  'leg-2': 'Dumbbell_Squat',
  'leg-3': 'Front_Barbell_Squat',
  'leg-4': 'Leg_Press',
  'leg-5': 'Leg_Extensions',
  'leg-6': 'Lying_Leg_Curls',
  'leg-7': 'Romanian_Deadlift',
  'leg-8': 'Barbell_Lunge',
  'leg-9': 'Dumbbell_Lunges',
  'leg-10': 'Standing_Calf_Raises',
  'leg-11': 'Seated_Calf_Raise',
  'leg-12': 'Bulgarian_Split_Squat',
  'leg-13': 'Glute_Ham_Raise',
  'leg-14': 'Barbell_Hip_Thrust',
  'leg-15': 'Hack_Squat',
  'leg-16': 'Goblet_Squat',
  'leg-17': 'Step-up_with_Knee_Raise',
  'leg-18': 'Sumo_Deadlift',
  'leg-19': 'Bodyweight_Squat',
  'leg-20': 'Calf-Machine_Shoulder_Shrug',

  // Shoulders
  'shoulder-1': 'Standing_Military_Press',
  'shoulder-2': 'Dumbbell_Shoulder_Press',
  'shoulder-3': 'Side_Lateral_Raise',
  'shoulder-4': 'Front_Dumbbell_Raise',
  'shoulder-5': 'Face_Pull',
  'shoulder-6': 'Arnold_Dumbbell_Press',
  'shoulder-7': 'Rear_Delt_Flyes',
  'shoulder-8': 'Upright_Barbell_Row',
  'shoulder-9': 'Cable_Lateral_Raise',
  'shoulder-10': 'Front_Barbell_Raise',
  'shoulder-11': 'Smith_Machine_Shoulder_Press',
  'shoulder-12': 'Band_Lateral_Raise',
  'shoulder-13': 'Pike_Push_up',
  'shoulder-14': 'Handstand_Push-Ups',
  'shoulder-15': 'Reverse_Pec_Deck',
  'shoulder-16': 'Seated_Dumbbell_Press',
  'shoulder-17': 'Car_Drivers',
  'shoulder-18': 'Barbell_Rear_Delt_Row',
  'shoulder-19': 'Dumbbell_Scaption',
  'shoulder-20': 'Standing_Palm-In_Dumbbell_Press',

  // Arms
  'arm-1': 'Barbell_Curl',
  'arm-2': 'Dumbbell_Bicep_Curl',
  'arm-3': 'Hammer_Curls',
  'arm-4': 'Preacher_Curl',
  'arm-5': 'Incline_Dumbbell_Curl',
  'arm-6': 'Concentration_Curls',
  'arm-7': 'Cable_Hammer_Curls_-_Rope_Attachment',
  'arm-8': 'Triceps_Pushdown',
  'arm-9': 'Triceps_Pushdown_-_Rope_Attachment',
  'arm-10': 'Standing_Overhead_Barbell_Triceps_Extension',
  'arm-11': 'Dips_-_Triceps_Version',
  'arm-12': 'Lying_Triceps_Press',
  'arm-13': 'Seated_Triceps_Press',
  'arm-14': 'Close-Grip_Barbell_Bench_Press',
  'arm-15': 'Tricep_Dumbbell_Kickback',
  'arm-16': 'Diamond_Push-Up',
  'arm-17': 'Wrist_Curl',
  'arm-18': 'Reverse_Barbell_Curl',
  'arm-19': 'Bench_Dips',
  'arm-20': 'Cable_Preacher_Curl',

  // Core (INCLUDING ALL IN USER SCREENSHOT!)
  'core-1': 'Plank',
  'core-2': 'Crunches',
  'core-3': 'Russian_Twist',
  'core-4': 'Cable_Crunch',
  'core-5': 'Hanging_Leg_Raise',
  'core-6': 'Ab_Roller',
  'core-7': 'Side_Plank',
  'core-8': 'Bicycle_Crunches',
  'core-9': 'Mountain_Climbers',
  'core-10': 'V-Up',
  'core-11': 'Dead_Bug',
  'core-12': 'Reverse_Crunch', // عكس كيرل
  'core-13': 'The_Hundred', // بايلاتيس 100
  'core-14': 'Swiss_Ball_Crunch', // سكوازر كيرل
  'core-15': 'Band_Torso_Twist', // تورش بالحبل المقاوم
  'core-16': 'Dragon_Flags',
  'core-17': 'Captains_Chair_Leg_Raise',
  'core-18': 'Decline_Crunch',
  'core-19': 'Bird_Dog',
  'core-20': 'Cable_Crunch', // كرنش بالكابل
}

async function run() {
  console.log('Loading freeDb...')
  const freeDb = await fetchJson(
    'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json',
  )
  if (!freeDb) {
    console.error('Failed to load freeDb')
    return
  }

  console.log('Downloading assets for our 122 exercises...')
  let successCount = 0

  for (const [id, targetName] of Object.entries(ID_TO_FREEDB)) {
    // Find matching exercise in freeDb
    let match = freeDb.find(
      (f) =>
        f.id === targetName ||
        f.name.toLowerCase() === targetName.toLowerCase(),
    )
    if (!match) {
      match = freeDb.find(
        (f) =>
          f.id.toLowerCase().includes(targetName.toLowerCase()) ||
          f.name.toLowerCase().includes(targetName.toLowerCase()),
      )
    }

    if (match && match.images && match.images.length > 0) {
      const img0Dest = path.join(exercisesDir, id + '_0.jpg')
      const img1Dest = path.join(exercisesDir, id + '_1.jpg')

      const url0 = CDN_BASE + match.images[0]
      const url1 = match.images[1] ? CDN_BASE + match.images[1] : url0

      await download(url0, img0Dest)
      if (match.images[1]) await download(url1, img1Dest)

      successCount++
      process.stdout.write('+')
    } else {
      process.stdout.write('x')
    }
  }

  console.log(
    '\nDownloaded',
    successCount,
    'exercises successfully into public/exercises!',
  )
}

run()
