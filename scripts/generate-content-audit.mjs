import fs from 'node:fs'
import path from 'node:path'

// 1. Load Data Files
const exerciseMusclesData = JSON.parse(
  fs.readFileSync('src/data/exercise_muscles.json', 'utf8'),
)
const groupToHeadsData = JSON.parse(
  fs.readFileSync('src/data/group-to-heads.json', 'utf8'),
)
const atlasMetaData = JSON.parse(
  fs.readFileSync('public/atlas/atlas-meta.json', 'utf8'),
)
const prescriptionRules = JSON.parse(
  fs.readFileSync('src/data/prescription-rules.json', 'utf8'),
)

// 2. Load EXERCISES from src/modules/workout/exercises.ts
const exercisesTs = fs.readFileSync('src/modules/workout/exercises.ts', 'utf8')
const match = exercisesTs.match(
  /export const EXERCISES: Exercise\[\] = (\[[\s\S]*?\]);?\r?\n/,
)
if (!match) {
  console.error('Failed to parse EXERCISES from exercises.ts')
  process.exit(1)
}
const exercises = new Function(`return ${match[1]}`)()
console.log(`Loaded ${exercises.length} exercises for content audit.`)

// 3. Normalization & Group Mappings
const GROUP_NORM_MAP = {
  abdominals: 'abdominals',
  abs: 'abdominals',
  core: 'abdominals',
  abductors: 'abductors',
  adductors: 'adductors',
  biceps: 'biceps',
  arms: 'biceps',
  calves: 'calves',
  chest: 'chest',
  forearms: 'forearms',
  glutes: 'glutes',
  hamstrings: 'hamstrings',
  legs: 'quadriceps',
  quadriceps: 'quadriceps',
  quads: 'quadriceps',
  lats: 'lats',
  'lower back': 'lower back',
  lower_back: 'lower back',
  lowerback: 'lower back',
  'middle back': 'middle back',
  middle_back: 'middle back',
  back: 'lats',
  neck: 'neck',
  shoulders: 'shoulders',
  traps: 'traps',
  triceps: 'triceps',
}

function normalizeKey(str) {
  if (!str) return ''
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

function resolveMuscles(exercise) {
  if (!exercise) {
    return { tier: 4, muscles: [], tierLabel: 'Tier 4 (Names Only)' }
  }

  // TIER 1: Curated match
  const candidates = [
    exercise.key,
    exercise.name_en,
    exercise.name,
    exercise.db_id,
    exercise.id,
  ].filter(Boolean)

  for (const candidate of candidates) {
    const norm = normalizeKey(candidate)
    if (
      norm &&
      exerciseMusclesData[norm] &&
      exerciseMusclesData[norm].muscles?.length > 0
    ) {
      return {
        tier: 1,
        tierLabel: 'Tier 1 (مدروس يدوياً)',
        muscles: exerciseMusclesData[norm].muscles,
      }
    }
  }

  // TIER 2: User-defined muscles
  if (exercise.muscles && exercise.muscles.length > 0) {
    return {
      tier: 2,
      tierLabel: 'Tier 2 (محدد مخصصاً)',
      muscles: exercise.muscles,
    }
  }

  // TIER 3: Group-level expansion
  const groupTable = groupToHeadsData.groups || {}
  const primaryGroups = []
  const secondaryGroups = []

  if (Array.isArray(exercise.primary_muscles)) {
    primaryGroups.push(...exercise.primary_muscles)
  } else if (exercise.primary_muscles?.db) {
    primaryGroups.push(...exercise.primary_muscles.db)
  }

  if (Array.isArray(exercise.secondary_muscles)) {
    secondaryGroups.push(...exercise.secondary_muscles)
  } else if (exercise.secondary_muscles?.db) {
    secondaryGroups.push(...exercise.secondary_muscles.db)
  }

  if (primaryGroups.length === 0) {
    const fallback = exercise.muscle_group || exercise.category
    if (fallback) {
      const nameText = `${exercise.name || ''} ${exercise.name_ar || ''} ${exercise.nameAr || ''}`.toLowerCase()
      if (
        fallback === 'lower back' ||
        fallback === 'lower_back' ||
        (fallback === 'back' &&
          (nameText.includes('lower back') ||
            nameText.includes('قطنية') ||
            nameText.includes('أسفل الظهر') ||
            nameText.includes('hyperextension') ||
            nameText.includes('back extension')))
      ) {
        primaryGroups.push('lower back')
      } else {
        primaryGroups.push(fallback)
      }
    }
  }

  const primaryHeadIds = new Set()
  const secondaryHeadIds = new Set()

  for (const g of primaryGroups) {
    const norm = GROUP_NORM_MAP[g.toLowerCase().trim()] || g.toLowerCase().trim()
    const heads = groupTable[norm]
    if (heads) for (const h of heads) primaryHeadIds.add(h)
  }

  for (const g of secondaryGroups) {
    const norm = GROUP_NORM_MAP[g.toLowerCase().trim()] || g.toLowerCase().trim()
    const heads = groupTable[norm]
    if (heads) {
      for (const h of heads) {
        if (!primaryHeadIds.has(h)) secondaryHeadIds.add(h)
      }
    }
  }

  if (primaryHeadIds.size > 0 || secondaryHeadIds.size > 0) {
    const muscles = [
      ...Array.from(primaryHeadIds).map((id) => ({ id, role: 'primary' })),
      ...Array.from(secondaryHeadIds).map((id) => ({ id, role: 'secondary' })),
    ]
    return {
      tier: 3,
      tierLabel: 'Tier 3 (توسيع على مستوى المجموعة)',
      muscles,
    }
  }

  return {
    tier: 4,
    tierLabel: 'Tier 4 (أسماء فقط)',
    muscles: [],
  }
}

// 4. Boilerplate Detection Across the Corpus
const sentenceCountMap = new Map()

for (const ex of exercises) {
  const texts = [
    ex.descriptionAr,
    ex.benefitAr,
    ex.mechanicsAr,
    ex.benefit,
    ex.mechanics,
  ].filter((t) => typeof t === 'string' && t.trim().length > 0)

  for (const t of texts) {
    // Split into sentences
    const sentences = t
      .split(/[.،؛\n]+/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 25)

    for (const s of sentences) {
      sentenceCountMap.set(s, (sentenceCountMap.get(s) || 0) + 1)
    }
  }
}

// Phrases occurring in 3 or more exercises
const boilerplatePhrases = Array.from(sentenceCountMap.entries())
  .filter(([, count]) => count >= 3)
  .sort((a, b) => b[1] - a[1])

const top10Boilerplate = boilerplatePhrases.slice(0, 10).map(([phrase, count]) => ({
  phrase,
  count,
}))

const boilerplateSet = new Set(boilerplatePhrases.map(([p]) => p))

// Category to allowed muscle IDs mapping dynamically derived from groupToHeadsData
const CATEGORY_GROUPS = {
  chest: ['chest'],
  back: ['lats', 'middle back', 'lower back', 'traps'],
  legs: [
    'quadriceps',
    'hamstrings',
    'glutes',
    'calves',
    'abductors',
    'adductors',
  ],
  shoulders: ['shoulders', 'traps'],
  arms: ['biceps', 'triceps', 'forearms'],
  core: ['abdominals', 'lower back'],
}

const CATEGORY_ALLOWED_HEADS = {}
for (const [cat, grpList] of Object.entries(CATEGORY_GROUPS)) {
  const heads = new Set()
  for (const g of grpList) {
    const list = groupToHeadsData.groups[g] || []
    for (const h of list) heads.add(h)
  }
  CATEGORY_ALLOWED_HEADS[cat] = Array.from(heads)
}

// 5. Scan Every Exercise
const auditResults = []
let tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 }
let genuineBenefitCount = 0
let genuineMechanicsCount = 0
let genuineStepsCount = 0
let mediaCount = 0

for (const ex of exercises) {
  const resolved = resolveMuscles(ex)
  tierCounts[resolved.tier] = (tierCounts[resolved.tier] || 0) + 1

  const fieldsPresent = []
  const fieldsMissing = []
  const flaggedIssues = []

  // Steps
  const steps = ex.howToStepsAr || ex.steps || []
  if (Array.isArray(steps) && steps.length > 0) {
    fieldsPresent.push('steps')
    if (steps.length >= 2) genuineStepsCount++
  } else {
    fieldsMissing.push('steps')
    flaggedIssues.push('missing_steps')
  }

  // Benefit
  const benefitText = ex.benefitAr || ex.benefit
  if (typeof benefitText === 'string' && benefitText.trim().length > 0) {
    fieldsPresent.push('benefit')
    const isShort = benefitText.trim().length < 40
    let isBoilerplate = false
    for (const [bp] of boilerplatePhrases) {
      if (benefitText.includes(bp)) {
        isBoilerplate = true
        break
      }
    }
    if (isShort) flaggedIssues.push('benefit_too_short (<40 chars)')
    if (isBoilerplate) flaggedIssues.push('benefit_contains_boilerplate')
    if (!isShort && !isBoilerplate) genuineBenefitCount++
  } else {
    fieldsMissing.push('benefit')
    flaggedIssues.push('missing_benefit')
  }

  // Mechanics
  const mechanicsText = ex.mechanicsAr || ex.mechanics || ex.descriptionAr
  if (typeof mechanicsText === 'string' && mechanicsText.trim().length > 0) {
    fieldsPresent.push('mechanics')
    const isShort = mechanicsText.trim().length < 40
    let isBoilerplate = false
    for (const [bp] of boilerplatePhrases) {
      if (mechanicsText.includes(bp)) {
        isBoilerplate = true
        break
      }
    }
    if (isShort) flaggedIssues.push('mechanics_too_short (<40 chars)')
    if (isBoilerplate) flaggedIssues.push('mechanics_contains_boilerplate')
    if (!isShort && !isBoilerplate) genuineMechanicsCount++
  } else {
    fieldsMissing.push('mechanics')
    flaggedIssues.push('missing_mechanics')
  }

  // Common Mistakes
  const mistakes = ex.commonMistakes || ex.common_mistakes
  if (Array.isArray(mistakes) && mistakes.length > 0) {
    fieldsPresent.push('common_mistakes')
  } else {
    fieldsMissing.push('common_mistakes')
  }

  // Safety Cues
  const safety = ex.safetyCues || ex.safety_cues || ex.avoidForInjuries
  if (Array.isArray(safety) && safety.length > 0) {
    fieldsPresent.push('safety_cues')
  } else {
    fieldsMissing.push('safety_cues')
  }

  // Tempo
  if (ex.tempo && ex.tempo.trim().length > 0) {
    fieldsPresent.push('tempo')
  } else {
    fieldsMissing.push('tempo')
  }

  // Breathing
  if (ex.breathing && ex.breathing.trim().length > 0) {
    fieldsPresent.push('breathing')
  } else {
    fieldsMissing.push('breathing')
  }

  // Reference
  const ref = ex.medicalSource || ex.reference
  if (ref && ref.trim().length > 0) {
    fieldsPresent.push('reference')
  } else {
    fieldsMissing.push('reference')
  }

  // Media (image / gif)
  const hasMedia = Boolean(
    ex.imageUrl || ex.gifUrl || ex.image || ex.gif || ex.thumbnailUrl,
  )
  if (hasMedia) {
    fieldsPresent.push('image_or_gif')
    mediaCount++
  } else {
    fieldsMissing.push('image_or_gif')
    flaggedIssues.push('missing_media')
  }

  // Rest Seconds
  const rest = ex.restSeconds ?? ex.rest_seconds
  const isCompound =
    ex.equipment === 'barbell' ||
    ex.id.includes('squat') ||
    ex.id.includes('bench') ||
    ex.id.includes('deadlift') ||
    ex.id.includes('press') ||
    ex.id.includes('row') ||
    ex.id.includes('pull_up')

  if (rest !== undefined && rest !== null) {
    fieldsPresent.push('rest_seconds')
    if (isCompound && (rest < 60 || rest > 300)) {
      flaggedIssues.push(`rest_seconds_out_of_range (${rest}s for compound)`)
    } else if (!isCompound && (rest < 30 || rest > 180)) {
      flaggedIssues.push(`rest_seconds_out_of_range (${rest}s for isolation)`)
    }
  } else {
    fieldsMissing.push('rest_seconds')
    // Not fatal since prescription-rules provides dynamic default
  }

  // Muscle / Category Disagreement Check
  const primaryMuscles = resolved.muscles.filter((m) => m.role === 'primary')
  const allowedHeads = CATEGORY_ALLOWED_HEADS[ex.category] || []
  if (
    allowedHeads.length > 0 &&
    primaryMuscles.length > 0 &&
    !primaryMuscles.some((m) => allowedHeads.includes(m.id))
  ) {
    flaggedIssues.push(
      `category_disagreement: category '${ex.category}' but primary muscles [${primaryMuscles.map((m) => m.id).join(', ')}]`,
    )
  }

  auditResults.push({
    id: ex.id,
    name_ar: ex.nameAr || ex.name_ar || '',
    name_en: ex.name || ex.name_en || '',
    category: ex.category || '',
    tier: resolved.tier,
    tier_label: resolved.tierLabel,
    resolved_muscles_count: resolved.muscles.length,
    fields_present: fieldsPresent,
    fields_missing: fieldsMissing,
    flagged_issues: flaggedIssues,
    issues_count: flaggedIssues.length,
  })
}

// 6. Compute Aggregates & Priority Review List
const totalExercises = exercises.length
const tier1Pct = Math.round((tierCounts[1] / totalExercises) * 1000) / 10
const tier2Pct = Math.round((tierCounts[2] / totalExercises) * 1000) / 10
const tier3Pct = Math.round((tierCounts[3] / totalExercises) * 1000) / 10
const tier4Pct = Math.round((tierCounts[4] / totalExercises) * 1000) / 10

const genuineBenefitPct = Math.round((genuineBenefitCount / totalExercises) * 1000) / 10
const genuineMechanicsPct = Math.round((genuineMechanicsCount / totalExercises) * 1000) / 10
const genuineStepsPct = Math.round((genuineStepsCount / totalExercises) * 1000) / 10
const mediaPct = Math.round((mediaCount / totalExercises) * 1000) / 10

// Priority List: exercises with most flagged issues or missing critical fields
const priorityReviewList = [...auditResults]
  .filter((r) => r.issues_count > 0 || r.tier === 4)
  .sort((a, b) => b.issues_count - a.issues_count)
  .slice(0, 30)

const auditReportJson = {
  generated_at: new Date().toISOString(),
  summary: {
    total_exercises: totalExercises,
    tiers: {
      tier1: { count: tierCounts[1], percentage: tier1Pct },
      tier2: { count: tierCounts[2], percentage: tier2Pct },
      tier3: { count: tierCounts[3], percentage: tier3Pct },
      tier4: { count: tierCounts[4], percentage: tier4Pct },
    },
    quality_metrics: {
      genuine_benefit: { count: genuineBenefitCount, percentage: genuineBenefitPct },
      genuine_mechanics: { count: genuineMechanicsCount, percentage: genuineMechanicsPct },
      genuine_steps: { count: genuineStepsCount, percentage: genuineStepsPct },
      media_coverage: { count: mediaCount, percentage: mediaPct },
    },
    top_10_boilerplate_phrases: top10Boilerplate,
  },
  priority_review_list: priorityReviewList,
  exercises: auditResults,
}

// Write JSON
fs.mkdirSync('docs', { recursive: true })
fs.writeFileSync(
  'docs/content-audit.json',
  JSON.stringify(auditReportJson, null, 2),
  'utf8',
)
console.log('Successfully written docs/content-audit.json')

// 7. Generate Markdown Report (docs/content-audit.md) with ZERO emoji
let mdContent = `# تقرير التدقيق الشامل لمحتوى مكتبة التمارين (Content Audit Report)

**تاريخ التوليد:** ${new Date().toISOString().split('T')[0]}  
**إجمالي التمارين:** ${totalExercises} تمرين  

---

## 1. ملخص المستويات التشريحية (Anatomical Tiers Breakdown)

| المستوى | التسمية | عدد التمارين | النسبة المئوية |
|:---|:---|:---:|:---:|
| **Tier 1** | مدروس يدوياً بدقة الرؤوس العضلية (\`exercise_muscles.json\`) | ${tierCounts[1]} | ${tier1Pct}% |
| **Tier 2** | مخصص من المستخدم مع تحديد تشريحي صريح | ${tierCounts[2]} | ${tier2Pct}% |
| **Tier 3** | توسيع المجموعة العضلية (\`group-to-heads.json\`) | ${tierCounts[3]} | ${tier3Pct}% |
| **Tier 4** | أسماء فقط دون خريطة تفصيلية | ${tierCounts[4]} | ${tier4Pct}% |

---

## 2. مؤشرات الجودة والأصالة العلمية (Content Quality Metrics)

| المقياس العلمي | التمارين المطابقة | النسبة | التقييم |
|:---|:---:|:---:|:---|
| **خطوات أداء واضحة (Steps >= 2)** | ${genuineStepsCount} / ${totalExercises} | ${genuineStepsPct}% | ${genuineStepsPct >= 95 ? 'ممتاز' : 'يحتاج استكمال'} |
| **وسائط بصرية (Media / Image / GIF)** | ${mediaCount} / ${totalExercises} | ${mediaPct}% | ${mediaPct >= 95 ? 'ممتاز' : 'يحتاج مراجعة'} |
| **فائدة علمية أصيلة (غير مكررة)** | ${genuineBenefitCount} / ${totalExercises} | ${genuineBenefitPct}% | ${genuineBenefitPct >= 70 ? 'جيد' : 'يحتوي قوالب متكررة'} |
| **ميكانيكا حركة أصيلة (غير مكررة)** | ${genuineMechanicsCount} / ${totalExercises} | ${genuineMechanicsPct}% | ${genuineMechanicsPct >= 70 ? 'جيد' : 'يحتوي قوالب متكررة'} |

---

## 3. أكثر العبارات النمطية المكررة (Top 10 Boilerplate Phrases)

| الترتيب | عدد التكرارات | نص العبارة المتكررة |
|:---:|:---:|:---|
${top10Boilerplate
  .map(
    (bp, idx) =>
      `| ${idx + 1} | ${bp.count} | ${bp.phrase.replace(/\|/g, '-')} |`,
  )
  .join('\n')}

---

## 4. قائمة أولويات المراجعة العلمية (Priority Review List)

تم ترتيب أول 30 تمريناً يحتاج تدقيقاً علمياً بناءً على عدد الملاحظات والبيانات الناقصة:

| ID | اسم التمرين | التصنيف | المستوى | عدد الملاحظات | الملاحظات المرفوعة |
|:---|:---|:---:|:---:|:---:|:---|
${priorityReviewList
  .map(
    (ex) =>
      `| \`${ex.id}\` | ${ex.name_ar} (${ex.name_en}) | ${ex.category} | ${ex.tier} | ${ex.issues_count} | ${ex.flagged_issues.join('; ') || 'لا توجد'} |`,
  )
  .join('\n')}

---

## 5. التوصيات والإجراءات التصحيحية

1. **إثراء التمارين الشائعة إلى Tier 1**: الاستمرار في ترقية تمارين Tier 3 إلى Tier 1 بإضافتها في \`src/data/exercise_muscles.json\` وتحديد رؤوس العضلات بدقة (Primary vs Secondary).
2. **استبدال القوالب المتكررة بنصوص فسيولوجية محددة**: صياغة فوائد وميكانيكا حركة مخصصة لكل تمرين لتجنب القوالب المكررة.
3. **تطبيق قواعد الراحة العلمية**: الاعتماد على \`src/data/prescription-rules.json\` لضبط فترات الراحة بين المجموعات بناءً على نوع الحركة (مركبة vs عزل).
`

fs.writeFileSync('docs/content-audit.md', mdContent, 'utf8')
console.log('Successfully written docs/content-audit.md')
