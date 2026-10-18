import { useState, useMemo } from 'react'
import type {
  Exercise,
  MuscleGroup,
  Difficulty,
  Equipment,
  WorkoutProgram,
  TrackingSession,
} from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { getExerciseById, EXERCISES } from './exercises.ts'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'
import { MovementExplainer } from './MovementExplainer.tsx'
import {
  getExerciseDetailsWithLimitations,
  getRegionLabel,
  type LimitationRegion,
} from './limitations.ts'
import prescriptionRulesData from '../../data/prescription-rules.json'
import exerciseContentData from '../../data/exercise-content.json'
import exerciseFlagsData from '../../data/exercise-flags.json'
import { TopBar, Card, Callout, Button, Segmented, ConfirmSheet } from '../../ui/index.ts'
import { fmtRange, fmtSets, fmtReps } from '../../utils/bidi.ts'

export interface ExerciseDetailViewProps {
  exerciseId: string
  exercise?: Exercise | Partial<Exercise>
  onBack?: () => void
  profile?: UserProfile | null
  program?: WorkoutProgram | null
  sessions?: TrackingSession[]
  onSwapExercise?: (oldExerciseId: string, newExerciseId: string) => void
  onNavigateSettings?: () => void
}

/**
 * Cleans legacy exercise strings at render time:
 * - A name_ar ending with "(English name)" is split into Arabic title + English secondary
 * - Removes any "•" bullet separators
 */
export function cleanExerciseNames(
  exercise: Partial<Exercise> | Record<string, unknown>,
) {
  const ex = exercise as Record<string, unknown>
  let nameAr = String(ex.nameAr || ex.name_ar || '')
  let nameEn = String(ex.name || ex.name_en || '')

  // Split nameAr ending with "(English Name)"
  const matchParen = nameAr.match(/^(.*?)\s*\(([^)]+)\)\s*$/)
  if (matchParen) {
    const mainAr = matchParen[1].trim()
    const inParen = matchParen[2].trim()
    if (/[a-zA-Z]/.test(inParen)) {
      nameAr = mainAr
      if (!nameEn || nameEn === nameAr) {
        nameEn = inParen
      }
    }
  }

  // Remove bullet separators
  nameAr = nameAr.replace(/\s*[•·]\s*/g, ' ').trim()
  nameEn = nameEn.replace(/\s*[•·]\s*/g, ' ').trim()

  return { nameAr, nameEn }
}

/**
 * Checks if a string is empty or contains boilerplate template text
 */
function isBoilerplateOrEmpty(text?: string): boolean {
  if (!text || typeof text !== 'string') return true
  const trimmed = text.trim()
  if (trimmed.length === 0) return true
  // Generic template boilerplate phrases
  if (
    trimmed.includes('تمرين دفع أفقي مركب يركز على تفعيل واستطالة الألياف') ||
    trimmed.includes('تمرين سحب مركب لتطوير سماكة وعرض الظهر') ||
    trimmed.includes('تمرين مركب للجزء السفلي يستهدف بناء عضلات') ||
    trimmed.includes('تمرين دفع رأسي وعزل للأكتاف')
  ) {
    return true
  }
  return false
}

type TabType =
  'understanding' | 'muscles' | 'performance' | 'for_you' | 'history'

export function ExerciseDetailView({
  exerciseId,
  exercise: passedExercise,
  onBack,
  profile,
  program,
  sessions = [],
  onSwapExercise,
  onNavigateSettings,
}: ExerciseDetailViewProps) {
  const [activeTab, setActiveTab] = useState<TabType>('understanding')
  const [swapModalConfirm, setSwapModalConfirm] = useState<{
    isOpen: boolean
    newExerciseId: string
    newExerciseName: string
  }>({ isOpen: false, newExerciseId: '', newExerciseName: '' })

  // Find exercise in unified library or use passed object
  const exercise = useMemo(() => {
    return passedExercise || getExerciseById(exerciseId) || null
  }, [passedExercise, exerciseId])

  const limitationDetails = useMemo(() => {
    return getExerciseDetailsWithLimitations(exercise?.id || exerciseId)
  }, [exercise?.id, exerciseId])

  // Clean strings at render time
  const { nameAr, nameEn } = useMemo(() => {
    if (!exercise) return { nameAr: '', nameEn: '' }
    return cleanExerciseNames(exercise)
  }, [exercise])

  // Lookup authored scientific content from exercise-content.json
  const authoredContent = useMemo(() => {
    const exId = exercise?.id
    if (!exId) return null
    return (exerciseContentData as Record<string, any>)[exId] || null
  }, [exercise])

  // Lookup risk and safety flags from exercise-flags.json
  const flagInfo = useMemo(() => {
    const exId = exercise?.id
    if (!exId) return null
    return (
      (exerciseFlagsData.exercises as Record<string, any>)[exId] || null
    )
  }, [exercise])

  // Retrieve logged session history for this exercise
  const exerciseHistory = useMemo(() => {
    if (!exerciseId || !sessions || sessions.length === 0) return []
    const results: Array<{
      date: string
      sets: Array<{ reps: number; weightKg: number }>
      best1RM: number
      bestSet: { reps: number; weightKg: number } | null
    }> = []

    for (const s of sessions) {
      const match = s.exercises?.find((e) => e.exerciseId === exerciseId)
      if (match && match.sets && match.sets.length > 0) {
        let max1RM = 0
        let topSet: { reps: number; weightKg: number } | null = null

        for (const set of match.sets) {
          if (set.reps > 0 && set.weightKg > 0) {
            // Epley 1RM formula: weight * (1 + reps / 30)
            const epley = set.weightKg * (1 + set.reps / 30)
            if (epley > max1RM) {
              max1RM = epley
              topSet = set
            }
          }
        }

        results.push({
          date: s.date,
          sets: match.sets,
          best1RM: Math.round(max1RM * 10) / 10,
          bestSet: topSet,
        })
      }
    }

    return results
  }, [exerciseId, sessions])

  const hasHistory = exerciseHistory.length > 0

  // Calculate all-time PR (Personal Record)
  const allTimePR = useMemo(() => {
    let max = 0
    let bestSet: { reps: number; weightKg: number; date: string } | null = null
    for (const h of exerciseHistory) {
      if (h.best1RM > max && h.bestSet) {
        max = h.best1RM
        bestSet = { ...h.bestSet, date: h.date }
      }
    }
    return { max1RM: max, bestSet }
  }, [exerciseHistory])

  // Build Tab options (Sticky Tabs: 5 tabs always present)
  const tabOptions = useMemo(() => {
    return [
      { value: 'understanding', label: 'الفهم' },
      { value: 'muscles', label: 'العضلات' },
      { value: 'performance', label: 'الأداء' },
      { value: 'for_you', label: 'لك' },
      { value: 'history', label: 'السجل' },
    ] as Array<{ value: TabType; label: string }>
  }, [])

  // Prescription Rules & Personalisation computations
  interface PrescriptionRules {
    reviewed: boolean
    disclaimer: string
    rir_by_experience: Record<
      string,
      {
        standard_rir: number
        last_set_rir: number
        initial_weeks?: number
        initial_rir?: number
        basis: string
      }
    >
    rpe_to_rir_map: Record<string, { rir: number; textAr: string }>
    rest_seconds: Record<
      'compound' | 'isolation' | 'core_bodyweight',
      { min: number; max: number; basis: string }
    >
    tempo: {
      default: string
      eccentric_seconds: string
      concentric_seconds: string
      pause_seconds: string
      basis: string
    }
    progression: {
      model: string
      descriptionAr: string
      upper_body: { min_kg: number; max_kg: number; basis: string }
      lower_body: { min_kg: number; max_kg: number; basis: string }
      time_based_holds: {
        min_seconds: number
        max_seconds: number
        basis: string
      }
    }
    weekly_sets_bands: Record<
      string,
      { min: number; max: number; basis: string }
    >
    health_flag_rule: {
      calloutTextAr: string
      basis: string
    }
  }

  const rules = prescriptionRulesData as unknown as PrescriptionRules
  const userExperience = (profile?.experienceLevel || 'beginner') as
    'beginner' | 'intermediate' | 'advanced'
  const expRules =
    rules.rir_by_experience[userExperience] || rules.rir_by_experience.beginner

  // Program prescription for this exercise
  const programPrescription = useMemo(() => {
    if (!program || !exerciseId) return null
    for (const day of program.days) {
      const found = day.exercises.find((e) => e.exerciseId === exerciseId)
      if (found) {
        return {
          dayLabel: day.labelAr,
          dayIndex: day.dayIndex,
          sets: found.sets,
          reps: found.reps,
          restSeconds: found.restSeconds,
        }
      }
    }
    return null
  }, [program, exerciseId])

  // Weekly sets calculation for this exercise's muscle group
  const weeklySetsAnalysis = useMemo(() => {
    if (!program || !exercise) return null
    const group = exercise.category
    let totalSets = 0

    for (const day of program.days) {
      for (const exItem of day.exercises) {
        const fullEx = getExerciseById(exItem.exerciseId)
        if (fullEx && fullEx.category === group) {
          totalSets += exItem.sets || 3
        }
      }
    }

    const band =
      rules.weekly_sets_bands[userExperience] ||
      rules.weekly_sets_bands.beginner
    let status: 'below' | 'inside' | 'above' = 'inside'
    let statusTextAr = 'ضمن المدى المثالي'

    if (totalSets < band.min) {
      status = 'below'
      statusTextAr = 'أقل من المدى المستهدف'
    } else if (totalSets > band.max) {
      status = 'above'
      statusTextAr = 'أعلى من المدى المستهدف'
    }

    return {
      totalSets,
      bandMin: band.min,
      bandMax: band.max,
      status,
      statusTextAr,
      basis: band.basis,
    }
  }, [program, exercise, userExperience, rules])

  // Rest seconds recommendations and mismatch flagging
  const restAnalysis = useMemo(() => {
    if (!exercise) {
      return {
        isCompound: false,
        min: 60,
        max: 120,
        basis: '',
        actualRest: undefined as number | undefined,
        mismatch: false,
      }
    }
    const isCompound =
      exercise.equipment === 'barbell' ||
      exercise.id?.includes('squat') ||
      exercise.id?.includes('bench') ||
      exercise.id?.includes('deadlift') ||
      exercise.id?.includes('press') ||
      exercise.id?.includes('row') ||
      exercise.id?.includes('pull_up')
    const isCoreOrBody =
      exercise.category === 'core' || exercise.equipment === 'bodyweight'

    const rec = isCoreOrBody
      ? rules.rest_seconds.core_bodyweight
      : isCompound
        ? rules.rest_seconds.compound
        : rules.rest_seconds.isolation

    const actualRest =
      exercise.restSeconds ||
      exercise.rest_seconds ||
      programPrescription?.restSeconds

    let mismatch = false
    if (actualRest && (actualRest < rec.min || actualRest > rec.max)) {
      mismatch = true
    }

    return {
      isCompound,
      min: rec.min,
      max: rec.max,
      basis: rec.basis,
      actualRest,
      mismatch,
    }
  }, [exercise, programPrescription, rules])

  // Place & equipment alternatives: if user trains at home or equipment missing
  const alternatives = useMemo(() => {
    if (!exercise) return []
    const userPlace = profile?.trainingLocation || 'gym'
    const isHome = userPlace === 'home'
    const isUnavailable =
      isHome &&
      (exercise.equipment === 'barbell' || exercise.equipment === 'machine')

    if (!isUnavailable) return []

    // Find 3 alternatives with same muscle group and available home equipment
    const matches = EXERCISES.filter(
      (e) =>
        e.id !== exercise.id &&
        e.category === exercise.category &&
        (e.equipment === 'dumbbell' ||
          e.equipment === 'bodyweight' ||
          e.equipment === 'band'),
    ).slice(0, 3)

    return matches
  }, [profile, exercise])

  // Double progression load advice
  const progressionAdvice = useMemo(() => {
    if (!exercise) {
      return {
        isLower: false,
        minKg: 1.25,
        maxKg: 2.5,
        basis: '',
      }
    }
    const isLower = exercise.category === 'legs'
    const step = isLower
      ? rules.progression.lower_body
      : rules.progression.upper_body
    return {
      isLower,
      minKg: step.min_kg,
      maxKg: step.max_kg,
      basis: step.basis,
    }
  }, [exercise, rules])

  if (!exercise) {
    return (
      <div
        className="card"
        style={{ padding: '24px', textAlign: 'center' }}
        dir="rtl"
      >
        <p className="muted">التمرين غير موجود في قاعدة البيانات.</p>
        {onBack && (
          <Button variant="ghost" onClick={onBack}>
            رجوع
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className="exercise-detail-page"
      dir="rtl"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* 1. Header: Back button, Arabic title, English small ltr, real Chips */}
      <TopBar
        title={nameAr}
        subtitle={nameEn ? <span dir="ltr">{nameEn}</span> : undefined}
        onBack={onBack ? onBack : () => window.history.back()}
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: 'var(--color-surface-2)',
                color: 'var(--color-text-2)',
              }}
            >
              {MUSCLE_GROUP_LABELS[exercise.category as MuscleGroup] ||
                exercise.category}
            </span>
          </div>
        }
      />

      <div
        style={{
          paddingInline: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '14px',
        }}
      >
        {/* Risk Banner / Callout if flagged */}
        {flagInfo && (
          <Callout
            variant={flagInfo.flagType === 'high_risk' ? 'danger' : 'warning'}
            title={
              flagInfo.badgeAr ||
              (flagInfo.flagType === 'high_risk' ? 'عالي الخطورة' : 'تنبيه أمان')
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <p style={{ margin: 0, fontSize: '13.5px', lineHeight: 1.5 }}>
                {flagInfo.riskReasonAr}
              </p>
              {flagInfo.saferAlternatives &&
                flagInfo.saferAlternatives.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        marginBottom: '6px',
                      }}
                    >
                      بدائل أكثر أماناً موصى بها:
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      {flagInfo.saferAlternatives.map((altId: string) => {
                        const altEx = getExerciseById(altId)
                        const altName = altEx
                          ? altEx.nameAr || altEx.name
                          : altId
                        return (
                          <div
                            key={altId}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'var(--color-surface)',
                              padding: '4px 8px',
                              borderRadius: 'var(--radius-control)',
                              border: '1px solid var(--color-divider)',
                              fontSize: '12px',
                            }}
                          >
                            <span>{altName}</span>
                            {onSwapExercise && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() =>
                                  exercise.id &&
                                  onSwapExercise(exercise.id, altId)
                                }
                                style={{
                                  padding: '2px 6px',
                                  fontSize: '11px',
                                  height: '24px',
                                }}
                              >
                                استبدال
                              </Button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
            </div>
          </Callout>
        )}

        {/* Real Meta Chips (not header bullet string) */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          <span className="chip">
            {MUSCLE_GROUP_LABELS[exercise.category as MuscleGroup] ||
              exercise.category}
          </span>
          <span className="chip">
            {EQUIPMENT_LABELS[exercise.equipment as Equipment] ||
              exercise.equipment}
          </span>
          <span className="chip">
            {DIFFICULTY_LABELS[exercise.difficulty as Difficulty] ||
              exercise.difficulty}
          </span>
          {exercise.targetSubMuscleAr && (
            <span className="chip">{exercise.targetSubMuscleAr}</span>
          )}
        </div>

        {/* Section: الحركة — Visual Movement Explainer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '16px',
              fontWeight: 800,
              color: 'var(--color-text)',
            }}
          >
            الحركة
          </div>
          <MovementExplainer
            exerciseKey={exercise.id || exerciseId}
            exerciseName={nameAr}
            images={
              exercise.imageUrl
                ? [exercise.imageUrl, exercise.gifUrl].filter(Boolean) as string[]
                : []
            }
          />
        </div>

        {/* Section: مع حالتك — Limitations & Injuries Integration */}
        {limitationDetails && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              background: 'var(--color-surface-2)',
              padding: '14px 16px',
              borderRadius: 'var(--radius-card)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div
              style={{
                fontSize: '15px',
                fontWeight: 800,
                color: 'var(--color-text)',
              }}
            >
              مع حالتك الصحية
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {Object.entries(limitationDetails.loads || {}).map(([reg, load]) => (
                <span
                  key={reg}
                  className={`badge ${load === 'high' ? 'tag-danger' : load === 'moderate' ? 'tag-warning' : 'tag-muted'}`}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '12px',
                    fontWeight: 700,
                  }}
                >
                  {getRegionLabel(reg as LimitationRegion)} —{' '}
                  {load === 'high' ? 'حمل عالٍ' : load === 'moderate' ? 'حمل متوسط' : 'حمل خفيف'}
                </span>
              ))}
            </div>

            {limitationDetails.note_ar && (
              <p
                style={{
                  fontSize: '13px',
                  color: 'var(--color-text)',
                  lineHeight: 1.5,
                  margin: 0,
                }}
              >
                {limitationDetails.note_ar}
              </p>
            )}

            {limitationDetails.alternatives && limitationDetails.alternatives.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-text-2)' }}>
                  بدائل أخف مقترحة
                </span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {limitationDetails.alternatives.map((altId) => {
                    const altEx = getExerciseById(altId)
                    const altName = altEx?.nameAr || altId
                    return (
                      <div
                        key={altId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'var(--color-surface)',
                          borderRadius: 'var(--radius-control)',
                          border: '1px solid var(--color-border)',
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{altName}</span>
                        {onSwapExercise && exercise.id && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              setSwapModalConfirm({
                                isOpen: true,
                                newExerciseId: altId,
                                newExerciseName: altName,
                              })
                            }
                          >
                            استبدال في اليوم
                          </Button>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sticky Tabs Header */}
        <div
          style={{
            position: 'sticky',
            top: 'calc(var(--top-bar-height) + var(--safe-area-top))',
            zIndex: 15,
            background: 'var(--color-bg)',
            paddingBlock: '6px',
          }}
        >
          <Segmented
            options={tabOptions}
            value={activeTab}
            onChange={(val) => setActiveTab(val as TabType)}
          />
        </div>

        {/* TAB 1: الفهم */}
        {activeTab === 'understanding' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {authoredContent ? (
              <>
                {/* ليه التمرين ده؟ */}
                <Card padding="md">
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px 0',
                      color: 'var(--color-text)',
                    }}
                  >
                    ليه التمرين ده؟
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--color-text)',
                    }}
                  >
                    {authoredContent.whyThisExerciseAr}
                  </p>
                </Card>

                {/* إزاي بيشتغل */}
                <Card padding="md">
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px 0',
                      color: 'var(--color-text)',
                    }}
                  >
                    إزاي بيشتغل
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--color-text)',
                    }}
                  >
                    {authoredContent.howItWorksAr}
                  </p>
                </Card>

                {/* بيستهدف إيه */}
                <Card padding="md">
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px 0',
                      color: 'var(--color-text)',
                    }}
                  >
                    التركيز التشريحي
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '14px',
                      lineHeight: 1.6,
                      color: 'var(--color-text)',
                    }}
                  >
                    {authoredContent.anatomicalFocusAr}
                  </p>
                </Card>

                {/* المراجع العلمية */}
                {authoredContent.scientificReferences &&
                  authoredContent.scientificReferences.length > 0 && (
                    <Card padding="md">
                      <h3
                        style={{
                          fontSize: '14px',
                          fontWeight: 700,
                          margin: '0 0 8px 0',
                          color: 'var(--color-text)',
                        }}
                      >
                        المراجع العلمية المعتمدة
                      </h3>
                      <ul
                        style={{
                          margin: 0,
                          paddingInlineStart: '18px',
                          fontSize: '12.5px',
                          lineHeight: 1.6,
                          color: 'var(--color-text-2)',
                        }}
                      >
                        {authoredContent.scientificReferences.map(
                          (ref: string, idx: number) => (
                            <li
                              key={idx}
                              dir="ltr"
                              style={{ textAlign: 'start' }}
                            >
                              {ref}
                            </li>
                          ),
                        )}
                      </ul>
                      {authoredContent.reviewedBy && (
                        <div
                          style={{
                            marginTop: '8px',
                            fontSize: '11px',
                            color: 'var(--color-text-2)',
                          }}
                        >
                          مراجعة: {authoredContent.reviewedBy} (
                          {authoredContent.reviewedAt})
                        </div>
                      )}
                    </Card>
                  )}
              </>
            ) : !isBoilerplateOrEmpty(exercise.benefitAr) ||
              !isBoilerplateOrEmpty(exercise.mechanicsAr) ||
              !isBoilerplateOrEmpty(exercise.benefit) ||
              !isBoilerplateOrEmpty(exercise.mechanics) ? (
              <>
                {/* ليه التمرين ده؟ */}
                {(!isBoilerplateOrEmpty(exercise.benefitAr) ||
                  !isBoilerplateOrEmpty(exercise.benefit)) && (
                  <Card padding="md">
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                        color: 'var(--color-text)',
                      }}
                    >
                      ليه التمرين ده؟
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--color-text)',
                      }}
                    >
                      {exercise.benefitAr || exercise.benefit}
                    </p>
                  </Card>
                )}

                {/* إزاي بيشتغل */}
                {(!isBoilerplateOrEmpty(exercise.mechanicsAr) ||
                  !isBoilerplateOrEmpty(exercise.mechanics) ||
                  !isBoilerplateOrEmpty(exercise.descriptionAr)) && (
                  <Card padding="md">
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                        color: 'var(--color-text)',
                      }}
                    >
                      إزاي بيشتغل
                    </h3>
                    <p
                      style={{
                        margin: 0,
                        fontSize: '14px',
                        lineHeight: 1.6,
                        color: 'var(--color-text)',
                      }}
                    >
                      {exercise.mechanicsAr ||
                        exercise.mechanics ||
                        exercise.descriptionAr}
                    </p>
                  </Card>
                )}

                {/* بيستهدف إيه */}
                {(exercise.target ||
                  (exercise.targetMusclesAr &&
                    exercise.targetMusclesAr.length > 0)) && (
                  <Card padding="md">
                    <h3
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        margin: '0 0 8px 0',
                        color: 'var(--color-text)',
                      }}
                    >
                      بيستهدف إيه
                    </h3>
                    {exercise.target && (
                      <p
                        style={{
                          margin: '0 0 8px 0',
                          fontSize: '14px',
                          lineHeight: 1.6,
                          color: 'var(--color-text)',
                        }}
                      >
                        {exercise.target}
                      </p>
                    )}
                    {exercise.targetMusclesAr &&
                      exercise.targetMusclesAr.length > 0 && (
                        <div
                          style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: '6px',
                          }}
                        >
                          {exercise.targetMusclesAr.map(
                            (m: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '12px',
                                  padding: '3px 9px',
                                  borderRadius: 'var(--radius-full)',
                                  background: 'var(--color-surface-2)',
                                  color: 'var(--color-text)',
                                }}
                              >
                                {m}
                              </span>
                            ),
                          )}
                        </div>
                      )}
                  </Card>
                )}

                {/* المصدر العلمي */}
                {(exercise.medicalSource || exercise.reference) && (
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--color-text-2)',
                      paddingInline: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span>المصدر العلمي</span>
                    <span dir="ltr">
                      {exercise.medicalSource || exercise.reference}
                    </span>
                  </div>
                )}
              </>
            ) : (
              /* Honest placeholder card */
              <Card padding="lg">
                <div style={{ textAlign: 'center', padding: '20px 12px' }}>
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px 0',
                      color: 'var(--color-text)',
                    }}
                  >
                    تفاصيل الفهم التشريحي لهذا التمرين قيد المراجعة والتوثيق
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: '13.5px',
                      color: 'var(--color-text-2)',
                      lineHeight: 1.6,
                    }}
                  >
                    نعمل على توثيق التحليل الحركي والبيوميكانيكي لهذا التمرين بدقة
                    علمية معتمدة. يمكنك الاطلاع على خطوات التنفيذ الفنية
                    وإرشادات السلامة في تبويب «الأداء».
                  </p>
                </div>
              </Card>
            )}
          </div>
        )}

        {/* TAB 2: العضلات */}
        {activeTab === 'muscles' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            <AnatomyMuscleMap
              exercise={exercise}
              mapNote={exercise.mapNote || exercise.map_note}
              isFullView={true}
            />
          </div>
        )}

        {/* TAB 3: الأداء */}
        {activeTab === 'performance' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {/* Numbered Steps Cards */}
            {(() => {
              const stepsList = exercise.howToStepsAr || exercise.steps
              if (!stepsList || stepsList.length === 0) return null
              return (
                <div className="steps-cards-list">
                  {stepsList.map((step: string, i: number) => (
                    <div key={i} className="step-card">
                      <span className="step-card__number">{i + 1}</span>
                      <p className="step-card__text">{step}</p>
                    </div>
                  ))}
                </div>
              )
            })()}

            {/* أخطاء شائعة (Only if data has them) */}
            {(() => {
              const mistakesList =
                exercise.commonMistakes || exercise.common_mistakes
              if (!mistakesList || mistakesList.length === 0) return null
              return (
                <Card padding="md">
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px 0',
                      color: 'var(--color-danger)',
                    }}
                  >
                    أخطاء شائعة
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingInlineStart: '20px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    {mistakesList.map((m: string, i: number) => (
                      <li key={i}>{m}</li>
                    ))}
                  </ul>
                </Card>
              )
            })()}

            {/* إشارات الأمان (Only if data has them) */}
            {(() => {
              const safetyList =
                exercise.safetyCues ||
                exercise.safety_cues ||
                exercise.avoidForInjuries
              if (!safetyList || safetyList.length === 0) return null
              return (
                <Card padding="md">
                  <h3
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      margin: '0 0 8px 0',
                      color: 'var(--color-warning)',
                    }}
                  >
                    إشارات الأمان والوقاية
                  </h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingInlineStart: '20px',
                      fontSize: '14px',
                      lineHeight: 1.6,
                    }}
                  >
                    {safetyList.map((c: string, i: number) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </Card>
              )
            })()}

            {/* Tempo / Breathing Block (Only if data has them) */}
            {(exercise.tempo || exercise.breathing) && (
              <Card padding="md">
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                    color: 'var(--color-text)',
                  }}
                >
                  إيقاع الحركة والتنفس
                </h3>
                {exercise.tempo && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '13.5px' }}>
                    <strong>الإيقاع</strong> {exercise.tempo}
                  </p>
                )}
                {exercise.breathing && (
                  <p style={{ margin: 0, fontSize: '13.5px' }}>
                    <strong>التنفس</strong> {exercise.breathing}
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* TAB 4: لك (Personalisation) */}
        {activeTab === 'for_you' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {/* Top Label & Disclaimer */}
            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
                background: 'var(--color-surface-2)',
                padding: '8px 12px',
                borderRadius: 'var(--radius-control)',
                textAlign: 'center',
              }}
            >
              {rules.disclaimer}
            </div>

            {/* Health Callout if applicable */}
            {profile?.medical?.hasIssues && (
              <Callout
                variant="warning"
                title="تنبيه صحي"
                message={rules.health_flag_rule.calloutTextAr}
              />
            )}

            {/* Program Prescription & RIR Guidance */}
            <Card padding="md">
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  margin: '0 0 10px 0',
                  color: 'var(--color-text)',
                }}
              >
                الجهد والتكرارات الاحتياطية
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '13.5px',
                }}
              >
                <div>
                  <strong>
                    المستهدف لمستواك (
                    {userExperience === 'beginner'
                      ? 'مبتدئ'
                      : userExperience === 'intermediate'
                        ? 'متوسط'
                        : 'متقدم'}
                    ):
                  </strong>{' '}
                  RIR {expRules.standard_rir} (اترك {expRules.standard_rir}{' '}
                  تكرارات قبل الفشل العضلي)
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--color-text-2)',
                    lineHeight: 1.5,
                  }}
                >
                  {expRules.basis}
                </div>
                {programPrescription && (
                  <div
                    style={{
                      marginTop: '4px',
                      padding: '8px',
                      background: 'var(--color-surface-2)',
                      borderRadius: 'var(--radius-control)',
                    }}
                  >
                    <strong>وصفة جدولك ({programPrescription.dayLabel})</strong>{' '}
                    {fmtSets(programPrescription.sets)} ×{' '}
                    {programPrescription.reps === 0
                      ? 'أقصى عدد'
                      : fmtReps(programPrescription.reps)}
                  </div>
                )}
              </div>
            </Card>

            {/* Rest & Tempo */}
            <Card padding="md">
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  margin: '0 0 10px 0',
                  color: 'var(--color-text)',
                }}
              >
                فترة الراحة والإيقاع
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '13.5px',
                }}
              >
                <div>
                  <strong>الراحة المقترحة</strong>{' '}
                  {fmtRange(restAnalysis.min, restAnalysis.max, 'ثانية')}
                  {restAnalysis.actualRest && (
                    <span
                      style={{
                        marginInlineStart: '6px',
                        color: restAnalysis.mismatch
                          ? 'var(--color-warning)'
                          : 'inherit',
                      }}
                    >
                      (المسجل بالتمرين: {restAnalysis.actualRest} ثانية)
                    </span>
                  )}
                </div>
                {restAnalysis.mismatch && (
                  <div
                    style={{ fontSize: '12px', color: 'var(--color-warning)' }}
                  >
                    ملاحظة: الراحة المسجلة تختلف عن المدى العلمي الموصى به لنوع
                    التمرين.
                  </div>
                )}
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                  {restAnalysis.basis.includes('(ATP-CP)') ? (
                    <>
                      {restAnalysis.basis.split('(ATP-CP)')[0]}
                      <bdi dir="ltr">(ATP-CP)</bdi>
                      {restAnalysis.basis.split('(ATP-CP)')[1]}
                    </>
                  ) : (
                    restAnalysis.basis
                  )}
                </div>
                <div style={{ marginTop: '4px' }}>
                  <strong>إيقاع الحركة</strong> {rules.tempo.default}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                  {rules.tempo.basis}
                </div>
              </div>
            </Card>

            {/* Progression & First Load */}
            <Card padding="md">
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  margin: '0 0 10px 0',
                  color: 'var(--color-text)',
                }}
              >
                خطة التدرج والوزن المبدئي
              </h3>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                  fontSize: '13.5px',
                }}
              >
                <div>
                  <strong>الوزن المبدئي</strong> ابدأ بوزن تقدر تعمل بيه{' '}
                  {programPrescription?.reps || 10} تكرار مع RIR{' '}
                  {expRules.standard_rir}.
                </div>
                <div>
                  <strong>الزيادة التدريجية</strong> عند الوصول لأعلى مدى
                  التكرارات في كل المجموعات، زد الوزن بمقدار{' '}
                  {fmtRange(
                    progressionAdvice.minKg,
                    progressionAdvice.maxKg,
                    'كجم',
                  )}
                  .
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-2)' }}>
                  {progressionAdvice.basis}
                </div>
              </div>
            </Card>

            {/* Weekly Sets Analysis */}
            {weeklySetsAnalysis && (
              <Card padding="md">
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    margin: '0 0 10px 0',
                    color: 'var(--color-text)',
                  }}
                >
                  الحجم التدريبي الأسبوعي لعضلة (
                  {MUSCLE_GROUP_LABELS[exercise.category as MuscleGroup] ||
                    exercise.category}
                  )
                </h3>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    fontSize: '13.5px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>مجموعاتك في الجدول الحالي</span>
                    <strong style={{ fontSize: '15px' }}>
                      {fmtSets(weeklySetsAnalysis.totalSets)}
                    </strong>
                  </div>
                  <div>
                    المدى الموصى به لمستواك{' '}
                    {fmtRange(
                      weeklySetsAnalysis.bandMin,
                      weeklySetsAnalysis.bandMax,
                      'مجموعة أسبوعياً',
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 600,
                      color:
                        weeklySetsAnalysis.status === 'inside'
                          ? 'var(--color-success)'
                          : 'var(--color-warning)',
                    }}
                  >
                    حالتك: {weeklySetsAnalysis.statusTextAr}
                  </div>
                  <div
                    style={{ fontSize: '12px', color: 'var(--color-text-2)' }}
                  >
                    {weeklySetsAnalysis.basis}
                  </div>
                </div>
              </Card>
            )}

            {/* Alternatives if Home / Unavailable */}
            {alternatives.length > 0 && (
              <Card padding="md">
                <h3
                  style={{
                    fontSize: '15px',
                    fontWeight: 700,
                    margin: '0 0 8px 0',
                    color: 'var(--color-text)',
                  }}
                >
                  بدائل مناسبة لمكان تمرينك (المنزل)
                </h3>
                <p
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--color-text-2)',
                    margin: '0 0 10px 0',
                  }}
                >
                  هذا التمرين يتطلب معدات جيم غير متوفرة في منزلك، إليك 3 بدائل
                  بنفس الاستهداف العضلي:
                </p>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  {alternatives.map((alt) => (
                    <div
                      key={alt.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--color-surface-2)',
                        borderRadius: 'var(--radius-control)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '13.5px', fontWeight: 600 }}>
                          {alt.nameAr}
                        </span>
                        <span
                          style={{
                            fontSize: '11px',
                            color: 'var(--color-text-2)',
                          }}
                        >
                          {EQUIPMENT_LABELS[alt.equipment]}
                        </span>
                      </div>
                      {onSwapExercise && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            onSwapExercise(exercise.id || exerciseId, alt.id)
                          }
                        >
                          تبديل في الجدول
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* CTA for Missing Profile Fields */}
            {(!profile?.body?.weightKg || !profile?.experienceLevel) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-card)',
                  background: 'var(--color-surface)',
                  border: '1px solid var(--color-divider)',
                }}
              >
                <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>
                  أكمل بيانات ملفك في الإعدادات لتخصيص أدق
                </span>
                {onNavigateSettings && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={onNavigateSettings}
                  >
                    الإعدادات
                  </Button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: السجل (History) */}
        {activeTab === 'history' && (
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
          >
            {hasHistory ? (
              <>
            {/* PR Badge & Best Estimated 1RM */}
            {allTimePR.bestSet && (
              <Card padding="md">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background: 'var(--color-accent)',
                          color: '#14161A',
                        }}
                      >
                        رقم قياسي PR
                      </span>
                      <h3
                        style={{ margin: 0, fontSize: '15px', fontWeight: 700 }}
                      >
                        أفضل أداء مسجل
                      </h3>
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '4px',
                      }}
                    >
                      بتاريخ {allTimePR.bestSet.date}:{' '}
                      {allTimePR.bestSet.weightKg} كجم ×{' '}
                      {allTimePR.bestSet.reps} تكرار
                    </div>
                  </div>
                  <div style={{ textAlign: 'end' }}>
                    <div
                      style={{
                        fontSize: '20px',
                        fontWeight: 700,
                        color: 'var(--color-accent-text)',
                      }}
                    >
                      {allTimePR.max1RM} كجم
                    </div>
                    <div
                      style={{ fontSize: '11px', color: 'var(--color-text-2)' }}
                    >
                      1RM التقديري (Epley)
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Weight Progression Over Time Line / Bars */}
            <Card padding="md">
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  margin: '0 0 12px 0',
                  color: 'var(--color-text)',
                }}
              >
                تطور الأوزان عبر الجلسات
              </h3>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  height: '100px',
                  paddingBottom: '4px',
                }}
              >
                {exerciseHistory.map((h, idx) => {
                  const maxW = Math.max(
                    ...h.sets.map((s) => s.weightKg || 0),
                    10,
                  )
                  const heightPct = Math.min(
                    100,
                    Math.max(
                      20,
                      (maxW / (allTimePR.bestSet?.weightKg || 100)) * 100,
                    ),
                  )
                  return (
                    <div
                      key={idx}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '10px',
                          color: 'var(--color-text-2)',
                        }}
                      >
                        {maxW}
                      </span>
                      <div
                        style={{
                          width: '100%',
                          maxWidth: '24px',
                          height: `${heightPct}%`,
                          background:
                            maxW === allTimePR.bestSet?.weightKg
                              ? 'var(--color-accent)'
                              : 'var(--color-surface-2)',
                          borderRadius: '4px 4px 0 0',
                          transition: 'height var(--transition-fast)',
                        }}
                      />
                      <span
                        style={{
                          fontSize: '9px',
                          color: 'var(--color-text-2)',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {h.date.slice(5)}
                      </span>
                    </div>
                  )
                })}
              </div>
            </Card>

            {/* Past Sessions List */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              <h3
                style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  margin: '4px 0',
                  color: 'var(--color-text)',
                }}
              >
                الجلسات السابقة
              </h3>
              {exerciseHistory.map((sessionItem, sIdx) => (
                <div
                  key={sIdx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: 'var(--radius-control)',
                    background: 'var(--color-surface)',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600 }}>
                      {sessionItem.date}
                    </div>
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        marginTop: '2px',
                      }}
                    >
                      {sessionItem.sets
                        .map((s) => `${s.weightKg}k×${s.reps}`)
                        .join(' · ')}
                    </div>
                  </div>
                  {sessionItem.best1RM > 0 && (
                    <div style={{ textAlign: 'end', fontSize: '12px' }}>
                      <span style={{ color: 'var(--color-text-2)' }}>
                        1RM:{' '}
                      </span>
                      <strong>{sessionItem.best1RM} كجم</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <Card padding="lg">
            <div style={{ textAlign: 'center', padding: '24px 16px' }}>
              <h3
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  margin: '0 0 8px 0',
                  color: 'var(--color-text)',
                }}
              >
                لا يوجد سجل سابق لهذا التمرين
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: '13.5px',
                  color: 'var(--color-text-2)',
                  lineHeight: 1.6,
                }}
              >
                عند تسجيل جلسات تدريبية تحتوي على هذا التمرين، سيظهر هنا تاريخ
                الأوزان والتكرارات وأفضل 1RM تقديري وتطور الأداء مع الوقت.
              </p>
            </div>
          </Card>
        )}
      </div>
      )}
      </div>

      <ConfirmSheet
        isOpen={swapModalConfirm.isOpen}
        onClose={() =>
          setSwapModalConfirm({
            isOpen: false,
            newExerciseId: '',
            newExerciseName: '',
          })
        }
        title="تأكيد استبدال التمرين"
        message={`هل تريد استبدال (${nameAr}) بالتمرين البديل (${swapModalConfirm.newExerciseName}) في جدول اليوم؟`}
        confirmLabel="استبدال"
        cancelLabel="إلغاء"
        onConfirm={() => {
          if (exercise?.id && onSwapExercise) {
            onSwapExercise(exercise.id, swapModalConfirm.newExerciseId)
          }
          setSwapModalConfirm({
            isOpen: false,
            newExerciseId: '',
            newExerciseName: '',
          })
        }}
      />
    </div>
  )
}
