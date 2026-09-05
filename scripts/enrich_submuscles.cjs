const fs = require('fs')
const path = require('path')
const vm = require('vm')

const filePath = path.join(
  __dirname,
  '..',
  'src',
  'modules',
  'workout',
  'exercises.ts',
)
let content = fs.readFileSync(filePath, 'utf8')

function getSubMuscle(name, nameAr, category) {
  const s = (name + ' ' + nameAr).toLowerCase()

  if (category === 'chest') {
    if (
      s.includes('incline') ||
      s.includes('مائل') ||
      s.includes('عالي') ||
      s.includes('low_cable') ||
      s.includes('من الأسفل') ||
      s.includes('guillotine') ||
      s.includes('ترقوي')
    ) {
      return 'صدر علوي (ترقوي)'
    }
    if (
      s.includes('decline') ||
      s.includes('مقلوب') ||
      s.includes('سفلي') ||
      s.includes('dip') ||
      s.includes('متوازي')
    ) {
      return 'صدر سفلي (قصي)'
    }
    return 'صدر أوسط ومستوٍ'
  }

  if (category === 'back') {
    if (s.includes('shrug') || s.includes('شراغز') || s.includes('ترابيس')) {
      return 'عضلات الترابيس (Traps)'
    }
    if (
      s.includes('deadlift') ||
      s.includes('good_morning') ||
      s.includes('hyperextension') ||
      s.includes('superman') ||
      s.includes('قطنية') ||
      s.includes('أسفل الظهر') ||
      s.includes('صباح الخير') ||
      s.includes('تمديد الظهر')
    ) {
      return 'أسفل الظهر والفقرات القطنية'
    }
    if (
      s.includes('pulldown') ||
      s.includes('pullup') ||
      s.includes('pull-up') ||
      s.includes('chin-up') ||
      s.includes('straight-arm') ||
      s.includes('عقلة') ||
      s.includes('سحب عالي') ||
      s.includes('مجانص') ||
      s.includes('لاتس')
    ) {
      return 'المجانص والظهر العريض (Lats)'
    }
    return 'أعلى ومنتصف الظهر (الرومبويدز)'
  }

  if (category === 'legs') {
    if (s.includes('calf') || s.includes('calves') || s.includes('سمانة')) {
      return 'عضلات السمانة (الكاحل)'
    }
    if (
      s.includes('hamstring') ||
      s.includes('lying_leg_curl') ||
      s.includes('seated_leg_curl') ||
      s.includes('romanian') ||
      s.includes('stiff') ||
      s.includes('خلفي') ||
      s.includes('خلفيات') ||
      s.includes('همسترنج') ||
      s.includes('ثني الساق')
    ) {
      return 'الفخذ الخلفي (الهمسترنج)'
    }
    if (
      s.includes('thrust') ||
      s.includes('bridge') ||
      s.includes('glute') ||
      s.includes('مؤخرة') ||
      s.includes('ألوية') ||
      s.includes('kickback') ||
      s.includes('جسر') ||
      s.includes('هيب ثرست')
    ) {
      return 'عضلات المؤخرة والألوية (الجلوتس)'
    }
    if (
      s.includes('adductor') ||
      s.includes('ضامة') ||
      s.includes('ضم الفخذ')
    ) {
      return 'عضلات الفخذ الداخلية (الضامة)'
    }
    if (
      s.includes('abductor') ||
      s.includes('مبعدة') ||
      s.includes('فتح الفخذ')
    ) {
      return 'عضلات الفخذ الخارجية (المبعدة)'
    }
    return 'الفخذ الأمامي (العضلة الرباعية)'
  }

  if (category === 'shoulders') {
    if (
      s.includes('rear') ||
      s.includes('face_pull') ||
      s.includes('face pull') ||
      s.includes('reverse_pec') ||
      s.includes('خلفي') ||
      s.includes('فيس بول') ||
      s.includes('reverse fly')
    ) {
      return 'الكتف الخلفي (Rear Delt)'
    }
    if (
      s.includes('lateral') ||
      s.includes('side') ||
      s.includes('جانبي') ||
      s.includes('رفرفة جانبي')
    ) {
      return 'الكتف الجانبي (Side Delt)'
    }
    if (
      s.includes('cuff') ||
      s.includes('rotator') ||
      s.includes('cuban') ||
      s.includes('مدورة')
    ) {
      return 'الكفة المدورة (Rotator Cuff)'
    }
    if (
      s.includes('upright') ||
      s.includes('clean') ||
      s.includes('عمودي') ||
      s.includes('شراغز')
    ) {
      return 'الكتف والترابيس'
    }
    return 'الكتف الأمامي (Front Delt)'
  }

  if (category === 'arms') {
    if (
      s.includes('wrist') ||
      s.includes('forearm') ||
      s.includes('farmer') ||
      s.includes('pinch') ||
      s.includes('roller') ||
      s.includes('ساعد') ||
      s.includes('معصم') ||
      s.includes('قبضة') ||
      s.includes('أصابع')
    ) {
      return 'عضلات الساعد والقبضة (Forearms)'
    }
    if (
      s.includes('hammer') ||
      s.includes('zottman') ||
      s.includes('reverse_curl') ||
      s.includes('مطرقة') ||
      s.includes('بريكيالس') ||
      s.includes('مقلوب') ||
      s.includes('عكسي')
    ) {
      return 'العضدية والساعد (البريكيالس)'
    }
    if (
      s.includes('incline') ||
      s.includes('wide-grip') ||
      s.includes('preacher') ||
      s.includes('لاري سكوت') ||
      s.includes('ارتكاز')
    ) {
      return 'بايسبس - الرأس القصير (عضلة القمة)'
    }
    if (
      s.includes('curl') ||
      s.includes('بايسبس') ||
      s.includes('spider') ||
      s.includes('concentration') ||
      s.includes('تركيز')
    ) {
      return 'بايسبس - الرأس الطويل'
    }
    if (
      s.includes('overhead') ||
      s.includes('skull') ||
      s.includes('lying_triceps') ||
      s.includes('كسر جمجمة') ||
      s.includes('فوق الرأس') ||
      s.includes('فرنسي')
    ) {
      return 'ترايسبس - الرأس الطويل (Long Head)'
    }
    return 'ترايسبس - الرأس الجانبي والأوسط'
  }

  if (category === 'core') {
    if (
      s.includes('hanging') ||
      s.includes('leg_raise') ||
      s.includes('reverse_crunch') ||
      s.includes('captain') ||
      s.includes('v-up') ||
      s.includes('jackknife') ||
      s.includes('سفلية') ||
      s.includes('رفع الأرجل') ||
      s.includes('ضم الساقين')
    ) {
      return 'عضلات البطن السفلية'
    }
    if (
      s.includes('twist') ||
      s.includes('wood') ||
      s.includes('bicycle') ||
      s.includes('oblique') ||
      s.includes('side_bend') ||
      s.includes('side_plank') ||
      s.includes('تويست') ||
      s.includes('جوانب') ||
      s.includes('خواصر') ||
      s.includes('دراجة') ||
      s.includes('متقاطع')
    ) {
      return 'عضلات الخواصر والجانبية (Obliques)'
    }
    if (
      s.includes('plank') ||
      s.includes('roller') ||
      s.includes('dead_bug') ||
      s.includes('bird_dog') ||
      s.includes('pallof') ||
      s.includes('hollow') ||
      s.includes('ثبات') ||
      s.includes('جذع') ||
      s.includes('عجلة')
    ) {
      return 'ثبات الجذع والكور العميق'
    }
    return 'عضلات البطن العلوية'
  }

  return 'عضلة رئيسية'
}

const lines = content.split('\n')
const startLineIdx = lines.findIndex((l) =>
  l.startsWith('export const EXERCISES: Exercise[] = ['),
)
const endLineIdx = lines.findIndex(
  (l, idx) => idx > startLineIdx && l.trim() === ']',
)

if (startLineIdx === -1 || endLineIdx === -1) {
  console.error('Line markers not found!')
  process.exit(1)
}

const jsArrayCode = lines
  .slice(startLineIdx, endLineIdx + 1)
  .join('\n')
  .replace('export const EXERCISES: Exercise[] = ', '')
const sandbox = {}
vm.createContext(sandbox)
const exercises = vm.runInContext('(' + jsArrayCode + ')', sandbox)

console.log(
  'Enriching',
  exercises.length,
  'exercises with targetSubMuscleAr...',
)

const subMuscleStats = {}
exercises.forEach((ex) => {
  const sub = getSubMuscle(ex.name, ex.nameAr, ex.category)
  ex.targetSubMuscleAr = sub
  ex.targetSubMusclesAr = [sub]
  subMuscleStats[sub] = (subMuscleStats[sub] || 0) + 1
})

console.log('Sub-muscle distribution:', subMuscleStats)

const newLines = [
  ...lines.slice(0, startLineIdx),
  'export const EXERCISES: Exercise[] = ' +
    JSON.stringify(exercises, null, 2) +
    ';',
  ...lines.slice(endLineIdx + 1),
]

fs.writeFileSync(filePath, newLines.join('\n'), 'utf8')
console.log('Successfully updated exercises.ts with targetSubMuscleAr!')
