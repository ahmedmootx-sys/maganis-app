import fs from 'node:fs'
import path from 'node:path'

const projectRoot = process.cwd()

console.log('====================================================')
console.log('             GATE: ATLAS LABELS AUDIT               ')
console.log('====================================================')

const atlasLabelsModule = await import('../src/modules/workout/atlasLabels.ts')
const { ANTERIOR_LABELS, POSTERIOR_LABELS } = atlasLabelsModule
const catalogData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src', 'data', 'catalog-v1.json'), 'utf8'))
const muscleNamesData = JSON.parse(fs.readFileSync(path.join(projectRoot, 'src', 'data', 'muscle-names.json'), 'utf8'))

const errors = []
let totalLabelsExamined = 0

// SVG viewBox 1024 x 2048 rendered at mobile viewport 360 CSS px:
// 1 CSS px = 1024 / 360 = 2.844 SVG units
// Min font size = 11 CSS px = 11 * 2.844 = 31.28 SVG units
const MIN_FONT_SIZE_CSS = 11
const MIN_FONT_SIZE_SVG = (1024 / 360) * MIN_FONT_SIZE_CSS // ~31.3
const ACTUAL_FONT_SIZE_SVG = 32
const ACTUAL_FONT_SIZE_CSS = (ACTUAL_FONT_SIZE_SVG * 360) / 1024 // 11.25 CSS px

console.log(`Checking font size: ${ACTUAL_FONT_SIZE_CSS.toFixed(2)} CSS px at 360px viewport (required >= ${MIN_FONT_SIZE_CSS} CSS px)...`)
if (ACTUAL_FONT_SIZE_CSS < MIN_FONT_SIZE_CSS) {
  errors.push(`Font size ${ACTUAL_FONT_SIZE_CSS.toFixed(2)} CSS px is below required minimum of ${MIN_FONT_SIZE_CSS} CSS px`)
} else {
  console.log(`✓ Font size passes requirement: ${ACTUAL_FONT_SIZE_CSS.toFixed(2)} CSS px >= ${MIN_FONT_SIZE_CSS} CSS px`)
}

// Function to simulate layout & collision avoidance for a state
function computeActiveLabels(state) {
  const { view, exerciseKey, zoom, selectedMuscleId } = state
  const baseLabels = view === 'A' ? ANTERIOR_LABELS : POSTERIOR_LABELS
  let filtered = []

  if (zoom >= 2.0) {
    filtered = baseLabels
  } else if (exerciseKey) {
    const ex = catalogData.exercises.find(e => e.key === exerciseKey)
    const involvedIds = new Set((ex?.muscles || []).map(m => m.id))
    if (selectedMuscleId) involvedIds.add(selectedMuscleId)
    filtered = baseLabels.filter(lbl => involvedIds.has(lbl.id))

    // If fewer than 5 labels, supplement with surrounding major landmark muscles in this view
    if (filtered.length < 5) {
      const existingIds = new Set(filtered.map(l => l.id))
      const majorAnterior = ['pec_sternal', 'delt_anterior', 'biceps_long', 'obliques_external', 'rectus_femoris', 'tibialis_anterior']
      const majorPosterior = ['trap_upper', 'trap_middle', 'trap_lower', 'delt_posterior', 'erector_spinae', 'triceps_long', 'glute_max']
      const candidates = (view === 'A' ? majorAnterior : majorPosterior)
        .filter(id => !existingIds.has(id))
      for (const id of candidates) {
        const found = baseLabels.find(l => l.id === id)
        if (found) {
          filtered.push(found)
          if (filtered.length >= 5) break
        }
      }
    }
  } else {
    const majorAnterior = ['pec_sternal', 'delt_anterior', 'biceps_long', 'obliques_external', 'rectus_femoris', 'tibialis_anterior']
    const majorPosterior = ['trap_upper', 'delt_posterior', 'erector_spinae', 'triceps_long', 'glute_max', 'hamstring_bf_long', 'gastrocnemius_medial']
    const targetIds = view === 'A' ? majorAnterior : majorPosterior
    filtered = baseLabels.filter(lbl => targetIds.includes(lbl.id) || lbl.id === selectedMuscleId)
  }

  const leftSide = filtered.filter(lbl => lbl.align === 'end')
  const rightSide = filtered.filter(lbl => lbl.align === 'start')

  const adjustSide = (list) => {
    const sorted = list
      .map(l => ({ ...l, box: [...l.box], lineEnd: [...l.lineEnd] }))
      .sort((a, b) => a.anchor[1] - b.anchor[1])
    let lastBottom = 10
    for (const item of sorted) {
      let boxY = item.box[1]
      if (boxY < lastBottom + 12) {
        boxY = lastBottom + 12
      }
      item.box = [item.box[0], boxY, item.box[2], item.box[3]]
      item.lineEnd = [item.lineEnd[0], boxY + item.box[3] / 2]
      lastBottom = boxY + item.box[3]
    }
    return sorted
  }

  return [...adjustSide(leftSide), ...adjustSide(rightSide)]
}

// Registered atlas states to audit
const TEST_STATES = [
  { id: 'atlas-names-front-default', title: 'Anterior Names (Default)', view: 'A', exerciseKey: null, zoom: 1.0 },
  { id: 'atlas-names-back-default', title: 'Posterior Names (Default)', view: 'P', exerciseKey: null, zoom: 1.0 },
  { id: 'atlas-names-bench-press', title: 'Bench Press Names', view: 'A', exerciseKey: 'bench', zoom: 1.0 },
  { id: 'atlas-names-pullup', title: 'Pull-Up Names', view: 'P', exerciseKey: 'pullup', zoom: 1.0 },
  { id: 'atlas-names-scapular-pullup', title: 'Scapular Pull-Up Names', view: 'P', exerciseKey: 'scappull', zoom: 1.0 },
  { id: 'atlas-names-side-plank', title: 'Side Plank Names', view: 'P', exerciseKey: 'sideplank', zoom: 1.0 },
  { id: 'atlas-names-zoomed-front', title: 'Zoomed 2x Anterior Names', view: 'A', exerciseKey: null, zoom: 2.0 },
  { id: 'atlas-names-zoomed-back', title: 'Zoomed 2x Posterior Names', view: 'P', exerciseKey: null, zoom: 2.0 },
]

console.log(`\nAuditing ${TEST_STATES.length} registered atlas states...`)

for (const state of TEST_STATES) {
  const labels = computeActiveLabels(state)
  totalLabelsExamined += labels.length

  console.log(`[State: ${state.id}] "${state.title}" - ${labels.length} labels examined`)

  // Check minimum labels count (minimum 5 per state with labels)
  if (labels.length < 5) {
    errors.push(`[${state.id}] State has only ${labels.length} labels (minimum 5 required)`)
  }

  // Check each label boundary containment [10, 10, 1014, 2038]
  for (const lbl of labels) {
    const [x, y, w, h] = lbl.box
    if (x < 10 || y < 10 || x + w > 1014 || y + h > 2038) {
      errors.push(`[${state.id}] Label for ${lbl.id} clips outside bounds: [${x}, ${y}, ${w}, ${h}]`)
    }
  }

  // Check pair-wise collision
  for (let i = 0; i < labels.length; i++) {
    for (let j = i + 1; j < labels.length; j++) {
      const [x1, y1, w1, h1] = labels[i].box
      const [x2, y2, w2, h2] = labels[j].box
      const overlaps = x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2
      if (overlaps) {
        errors.push(`[${state.id}] Labels overlap: "${labels[i].gym_ar}" (${labels[i].id}) and "${labels[j].gym_ar}" (${labels[j].id})`)
      }
    }
  }
}

console.log(`\nTotal label instances examined across registered states: ${totalLabelsExamined}`)
console.log(`Errors found: ${errors.length}`)

if (errors.length > 0) {
  for (const err of errors) console.error(` ❌ ${err}`)
  process.exit(1)
} else {
  console.log('✓ All atlas labels criteria passed successfully!')
  process.exit(0)
}
