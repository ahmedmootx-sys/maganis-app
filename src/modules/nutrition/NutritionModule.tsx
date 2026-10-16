import { useEffect, useMemo, useState } from 'react'
import type { Goal, Sex, UserProfile } from '../onboarding/types.ts'
import { ACTIVITY_LEVELS, GOALS } from '../onboarding/types.ts'
import type { BodyLogEntry } from '../shared/types.ts'
import { calculateCalorieMacroTargets } from './calorieCalculator.ts'
import { CustomMealModal } from './CustomMealModal.tsx'
import {
  calibrateTDEE,
  validateNutritionInput,
  LIFESTYLE_OPTIONS,
  mapLifestyleToLegacyActivity,
  mapLegacyActivityToLifestyle,
  type FormulaChoice,
  type LifestyleLevel,
  type NutritionPace,
  type WorkoutBlockInput,
} from './nutritionEngine.ts'
import { QuickManualMealModal } from './QuickManualMealModal.tsx'
import { MacroGuideModal } from './MacroGuideModal.tsx'
import type { CustomMeal, DailyNutritionLog, MealCategory } from './types.ts'
import {
  TopBar,
  Button,
  ProgressBar,
  Sheet,
  ConfirmSheet,
  Callout,
  EmptyState,
  KeyValueList,
  Stat,
  Select,
  DateField,
} from '../../ui/index.ts'
import { formatArabicDate } from '../../lib/dateUtils.ts'
import {
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheck,
  IconChevronLeft,
  IconChevronRight,
  IconMoreVertical,
} from '../../components/Icons.tsx'

interface NutritionModuleProps {
  profile: UserProfile | null
  bodyLog?: BodyLogEntry[]
  onAddBodyWeight?: (entry: BodyLogEntry) => void
  onUpdateProfile?: (profile: UserProfile) => void
}

const CATEGORY_LABELS: Record<MealCategory, string> = {
  breakfast: 'فطور',
  lunch: 'غداء',
  dinner: 'عشاء',
  snack: 'سناك وخفايف',
}

function getTodayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function addDays(dateStr: string, days: number): string {
  const parts = dateStr.split('-')
  const d = new Date(
    parseInt(parts[0], 10),
    parseInt(parts[1], 10) - 1,
    parseInt(parts[2], 10),
  )
  d.setDate(d.getDate() + days)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function NutritionModule({
  profile,
  bodyLog = [],
  onAddBodyWeight,
  onUpdateProfile,
}: NutritionModuleProps) {
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<
    MealCategory | 'all'
  >('all')
  const [recentlyLoggedId, setRecentlyLoggedId] = useState<string | null>(null)

  // Day Switcher state
  const [selectedDate, setSelectedDate] = useState(() => getTodayStr())
  const isToday = selectedDate === getTodayStr()

  // Sub-screens & sheets
  const [showBodyTargetsDetails, setShowBodyTargetsDetails] = useState(false)
  const [showPlusSheet, setShowPlusSheet] = useState(false)
  const [mealActionTarget, setMealActionTarget] = useState<CustomMeal | null>(
    null,
  )
  const [mealToDelete, setMealToDelete] = useState<CustomMeal | null>(null)

  // Custom Meals State
  const [customMeals, setCustomMeals] = useState<CustomMeal[]>(() => {
    try {
      const raw = localStorage.getItem('maganis:custom_meals')
      if (raw) return JSON.parse(raw) as CustomMeal[]
    } catch {
      // ignore
    }
    return []
  })
  const [isCustomMealModalOpen, setIsCustomMealModalOpen] = useState(false)
  const [isQuickManualModalOpen, setIsQuickManualModalOpen] = useState(false)
  const [editingCustomMeal, setEditingCustomMeal] = useState<CustomMeal | null>(
    null,
  )
  const [showMacroGuide, setShowMacroGuide] = useState(false)

  // Profile / Calculator Editor Modal State
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isImperial, setIsImperial] = useState(false)
  const [editWeight, setEditWeight] = useState<number>(
    profile?.body?.weightKg ?? 70,
  )
  const [editHeight, setEditHeight] = useState<number>(
    profile?.body?.heightCm ?? 170,
  )
  const [editAge, setEditAge] = useState<number>(profile?.body?.age ?? 25)
  const [editSex, setEditSex] = useState<Sex>(profile?.body?.sex ?? 'male')
  const [editBodyFat, setEditBodyFat] = useState<number | undefined>(
    profile?.body?.bodyFatPercent,
  )
  const [editLifestyle, setEditLifestyle] = useState<LifestyleLevel>(
    profile?.body?.lifestyle ?? 2,
  )
  const [editWorkoutBlocks, setEditWorkoutBlocks] = useState<
    WorkoutBlockInput[]
  >(
    profile?.body?.workoutBlocks ?? [
      {
        type: 'resistance',
        sessionsPerWeek: 4,
        minutesPerSession: 60,
        intensity: 'moderate',
      },
    ],
  )
  const [editGoal, setEditGoal] = useState<Goal>(
    profile?.primaryGoal ?? 'hypertrophy',
  )
  const [editPace, setEditPace] = useState<NutritionPace>(
    profile?.body?.pace ?? 'standard',
  )
  const [editFormulaOverride, setEditFormulaOverride] = useState<FormulaChoice>(
    profile?.body?.formulaOverride ?? 'auto',
  )
  const [editProteinOverride, setEditProteinOverride] = useState<
    number | undefined
  >(profile?.body?.proteinPerKgOverride)
  const [modalError, setModalError] = useState('')

  // Explanation & Calibration Modal State
  const [showExplanation, setShowExplanation] = useState(false)
  const [showResetDailyConfirm, setShowResetDailyConfirm] = useState(false)
  const [isCalibrationModalOpen, setIsCalibrationModalOpen] = useState(false)
  const [quickWeight, setQuickWeight] = useState('')
  const [quickWeightDate, setQuickWeightDate] = useState(() => getTodayStr())
  const [calibrationFeedback, setCalibrationFeedback] = useState('')

  useEffect(() => {
    if (profile) {
      setEditWeight(profile.body.weightKg)
      setEditHeight(profile.body.heightCm)
      setEditAge(profile.body.age)
      setEditSex(profile.body.sex)
      setEditBodyFat(profile.body.bodyFatPercent)
      setEditLifestyle(profile.body.lifestyle ?? 2)
      setEditWorkoutBlocks(
        profile.body.workoutBlocks ?? [
          {
            type: 'resistance',
            sessionsPerWeek: 4,
            minutesPerSession: 60,
            intensity: 'moderate',
          },
        ],
      )
      setEditGoal(profile.primaryGoal)
      setEditPace(profile.body.pace ?? 'standard')
      setEditFormulaOverride(profile.body.formulaOverride ?? 'auto')
      setEditProteinOverride(profile.body.proteinPerKgOverride)
    }
  }, [profile])

  useEffect(() => {
    try {
      localStorage.setItem('maganis:custom_meals', JSON.stringify(customMeals))
    } catch {
      // ignore
    }
  }, [customMeals])

  // Storage key based on selectedDate
  const storageKey = `maganis:daily_nutrition_${selectedDate}`

  // Daily tracker state
  const [dailyLog, setDailyLog] = useState<DailyNutritionLog>(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        return JSON.parse(raw) as DailyNutritionLog
      }
    } catch {
      // ignore
    }
    return {
      date: selectedDate,
      consumedCalories: 0,
      consumedProtein: 0,
      consumedCarbs: 0,
      consumedFats: 0,
      loggedMeals: [],
    }
  })

  // Re-read dailyLog when selectedDate changes
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey)
      if (raw) {
        setDailyLog(JSON.parse(raw) as DailyNutritionLog)
        return
      }
    } catch {
      // ignore
    }
    setDailyLog({
      date: selectedDate,
      consumedCalories: 0,
      consumedProtein: 0,
      consumedCarbs: 0,
      consumedFats: 0,
      loggedMeals: [],
    })
  }, [storageKey, selectedDate])

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(dailyLog))
    } catch {
      // ignore
    }
  }, [dailyLog, storageKey])

  const targets = useMemo(() => {
    if (!profile) return null
    return calculateCalorieMacroTargets(profile)
  }, [profile])

  // Check for migration requirement (legacy user who hasn't reviewed migration yet)
  const isLegacyUserNeedingReview = Boolean(
    profile &&
    !profile.body.lifestyleMigrated &&
    !profile.body.migrationReviewed,
  )

  const legacyCalorieTarget = useMemo(() => {
    if (!profile) return null
    const bmr =
      profile.body.sex === 'male'
        ? 10 * profile.body.weightKg +
          6.25 * profile.body.heightCm -
          5 * profile.body.age +
          5
        : 10 * profile.body.weightKg +
          6.25 * profile.body.heightCm -
          5 * profile.body.age -
          161
    const legacyMultiplier =
      ACTIVITY_LEVELS.find((a) => a.value === profile.body.activityLevel)
        ?.multiplier ?? 1.55
    const tdee = Math.round(bmr * legacyMultiplier)
    const goalDelta =
      profile.primaryGoal === 'cut'
        ? -500
        : profile.primaryGoal === 'hypertrophy'
          ? 300
          : 0
    return Math.round(tdee + goalDelta)
  }, [profile])

  const proposedLifestyle = useMemo(() => {
    if (!profile) return 2 as LifestyleLevel
    return mapLegacyActivityToLifestyle(profile.body.activityLevel)
  }, [profile])

  const proposedTargets = useMemo(() => {
    if (!profile) return null
    const hypotheticalProfile: UserProfile = {
      ...profile,
      body: {
        ...profile.body,
        lifestyle: proposedLifestyle,
        workoutBlocks: profile.body.workoutBlocks?.length
          ? profile.body.workoutBlocks
          : [
              {
                type: 'resistance',
                sessionsPerWeek: profile.trainingDaysPerWeek ?? 4,
                minutesPerSession: profile.body.sessionMinutes ?? 60,
                intensity: profile.body.sessionIntensity ?? 'moderate',
              },
            ],
      },
    }
    return calculateCalorieMacroTargets(hypotheticalProfile)
  }, [profile, proposedLifestyle])

  const hasTrainingDaysMismatch = Boolean(
    profile?.body?.hasCustomWorkoutBlocks &&
    profile?.body?.workoutBlocks?.length &&
    profile.body.workoutBlocks[0].sessionsPerWeek !==
      profile.trainingDaysPerWeek,
  )

  function handleLogDirectMeal(meal: {
    id: string
    nameAr: string
    calories: number
    protein: number
    carbs: number
    fats: number
  }) {
    setDailyLog((prev) => {
      const newCalories = Math.round(prev.consumedCalories + meal.calories)
      const newProtein = Math.round(prev.consumedProtein + meal.protein)
      const newCarbs = Math.round(prev.consumedCarbs + meal.carbs)
      const newFats = Math.round(prev.consumedFats + meal.fats)

      return {
        ...prev,
        consumedCalories: newCalories,
        consumedProtein: newProtein,
        consumedCarbs: newCarbs,
        consumedFats: newFats,
        loggedMeals: [
          ...prev.loggedMeals,
          {
            mealId: meal.id,
            nameAr: meal.nameAr,
            calories: meal.calories,
            protein: meal.protein,
            carbs: meal.carbs,
            fats: meal.fats,
            timestamp: Date.now(),
          },
        ],
      }
    })

    setRecentlyLoggedId(meal.id)
    setTimeout(() => {
      setRecentlyLoggedId(null)
    }, 2000)
  }

  function handleLogCustomMeal(meal: CustomMeal) {
    handleLogDirectMeal({
      id: meal.id,
      nameAr: meal.nameAr,
      calories: meal.calories,
      protein: meal.proteinGrams,
      carbs: meal.carbsGrams,
      fats: meal.fatsGrams,
    })
  }

  function handleSaveCustomMeal(meal: CustomMeal) {
    setCustomMeals((prev) => {
      const exists = prev.some((m) => m.id === meal.id)
      if (exists) {
        return prev.map((m) => (m.id === meal.id ? meal : m))
      }
      return [meal, ...prev]
    })
    setIsCustomMealModalOpen(false)
    setEditingCustomMeal(null)
  }

  function handleDeleteCustomMeal(id: string) {
    setCustomMeals((prev) => prev.filter((m) => m.id !== id))
    setMealToDelete(null)
    setMealActionTarget(null)
  }

  const calibrationData = useMemo(() => {
    if (!targets || !bodyLog || bodyLog.length < 8) return null
    const intakeLogs: { date: string; calories: number }[] = []
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('maganis:daily_nutrition_')) {
          const raw = localStorage.getItem(k)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.date && parsed.consumedCalories > 0) {
              intakeLogs.push({
                date: parsed.date,
                calories: parsed.consumedCalories,
              })
            }
          }
        }
      }
    } catch {
      // ignore
    }

    const plannedAdj = targets.engineResult
      ? targets.engineResult.adjustmentKcal
      : 0
    return calibrateTDEE({
      currentTDEE: targets.tdee,
      currentTarget: targets.targetCalories,
      plannedAdjustment: plannedAdj,
      weightLogs: bodyLog,
      intakeLogs,
    })
  }, [targets, bodyLog])

  function handleQuickWeightSave() {
    const w = parseFloat(quickWeight)
    if (isNaN(w) || w < 30 || w > 350) {
      setCalibrationFeedback('يرجى إدخال وزن صحيح بين 30 و 350 كجم.')
      return
    }
    if (onAddBodyWeight) {
      onAddBodyWeight({ date: quickWeightDate, weightKg: w })
      setCalibrationFeedback('✓ تم حفظ الوزن بنجاح في سجلك الصحي.')
      setQuickWeight('')
    }
  }

  function handleApplyCalibration(newTarget: number) {
    if (!profile || !onUpdateProfile) return
    const updated: UserProfile = {
      ...profile,
      updatedAt: Date.now(),
    }
    onUpdateProfile(updated)
    setCalibrationFeedback(
      `✓ تم تطبيق الهدف المعاير (${newTarget} كالوِري) بنجاح!`,
    )
    setIsCalibrationModalOpen(false)
  }

  function handleSaveProfileChanges(e: React.FormEvent) {
    e.preventDefault()
    if (!profile) return

    const validation = validateNutritionInput({
      sex: editSex,
      age: Number(editAge),
      weightKg: Number(editWeight),
      heightCm: Number(editHeight),
      bodyFatPercent: editBodyFat ? Number(editBodyFat) : undefined,
      lifestyle: editLifestyle,
      workoutBlocks: editWorkoutBlocks,
      goal:
        editGoal === 'hypertrophy'
          ? 'gain'
          : editGoal === 'cut'
            ? 'lose'
            : 'maintain',
      pace: editPace,
      formulaOverride: editFormulaOverride,
      proteinPerKgOverride: editProteinOverride
        ? Number(editProteinOverride)
        : undefined,
    })

    if (!validation.isValid) {
      setModalError(Object.values(validation.errorsAr)[0])
      return
    }
    setModalError('')

    const hasCustom =
      editWorkoutBlocks.length > 1 ||
      (editWorkoutBlocks[0] &&
        editWorkoutBlocks[0].sessionsPerWeek !== profile.trainingDaysPerWeek) ||
      Boolean(profile.body.hasCustomWorkoutBlocks)

    const updatedProfile: UserProfile = {
      ...profile,
      primaryGoal: editGoal,
      body: {
        ...profile.body,
        sex: editSex,
        weightKg: Number(editWeight) || profile.body.weightKg,
        heightCm: Number(editHeight) || profile.body.heightCm,
        age: Number(editAge) || profile.body.age,
        activityLevel: mapLifestyleToLegacyActivity(editLifestyle),
        bodyFatPercent: editBodyFat ? Number(editBodyFat) : undefined,
        lifestyle: editLifestyle,
        workoutBlocks: editWorkoutBlocks,
        hasCustomWorkoutBlocks: hasCustom,
        lifestyleMigrated: true,
        migrationReviewed: true,
        pace: editPace,
        formulaOverride: editFormulaOverride,
        proteinPerKgOverride: editProteinOverride
          ? Number(editProteinOverride)
          : undefined,
      },
      updatedAt: Date.now(),
    }

    if (onUpdateProfile) {
      onUpdateProfile(updatedProfile)
    }
    setIsProfileModalOpen(false)
  }

  function handleResetDailyLog() {
    setShowResetDailyConfirm(true)
  }

  function doResetDailyLog() {
    const resetState: DailyNutritionLog = {
      date: selectedDate,
      consumedCalories: 0,
      consumedProtein: 0,
      consumedCarbs: 0,
      consumedFats: 0,
      loggedMeals: [],
    }
    setDailyLog(resetState)
    try {
      localStorage.setItem(storageKey, JSON.stringify(resetState))
    } catch {
      // ignore
    }
    setShowResetDailyConfirm(false)
  }

  const filteredCustomMeals = useMemo(() => {
    if (selectedCategoryFilter === 'all') return customMeals
    return customMeals.filter((m) => m.category === selectedCategoryFilter)
  }, [customMeals, selectedCategoryFilter])

  if (!profile || !targets) {
    return (
      <div className="card" style={{ margin: '16px' }}>
        <Callout
          title="الملف غير مكتمل"
          message="يرجى إكمال بيانات ملفك الشخصي لتشغيل محرك حساب السعرات والماكروز العلمي."
          actionLabel="إكمال الملف الشخصي"
          onAction={() => setIsProfileModalOpen(true)}
        />
      </div>
    )
  }

  const calPercent = Math.min(
    100,
    Math.round((dailyLog.consumedCalories / targets.targetCalories) * 100),
  )
  const proteinPercent = Math.min(
    100,
    Math.round((dailyLog.consumedProtein / targets.proteinGrams) * 100),
  )
  const carbsPercent = Math.min(
    100,
    Math.round((dailyLog.consumedCarbs / targets.carbsGrams) * 100),
  )
  const fatsPercent = Math.min(
    100,
    Math.round((dailyLog.consumedFats / targets.fatsGrams) * 100),
  )

  const currentGoalObj = GOALS.find((g) => g.value === profile.primaryGoal)

  return (
    <div
      className="nutrition-module"
      data-testid="nutrition-module"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '24px',
      }}
    >
      {/* TopBar with Plus Sheet & Day Switcher */}
      <TopBar
        title="التغذية"
        actions={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-icon"
              onClick={() => setShowPlusSheet(true)}
              aria-label="إضافة وتتبع التغذية"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                border: 'none',
                background: 'var(--brand)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <IconPlus size={20} />
            </button>
          </div>
        }
      />

      {/* Day Switcher */}
      <div
        className="day-switcher-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          background: 'var(--card-bg)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        <button
          type="button"
          onClick={() => setSelectedDate((d) => addDays(d, -1))}
          aria-label="اليوم السابق"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--card-subtle)',
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IconChevronRight size={18} />
        </button>

        <div
          style={{
            fontSize: '14.5px',
            fontWeight: 700,
            color: 'var(--ink)',
            textAlign: 'center',
          }}
        >
          {isToday
            ? `اليوم، ${formatArabicDate(selectedDate)}`
            : formatArabicDate(selectedDate)}
        </div>

        <button
          type="button"
          onClick={() => setSelectedDate((d) => addDays(d, 1))}
          aria-label="اليوم التالي"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            border: 'none',
            background: 'var(--card-subtle)',
            color: 'var(--ink)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <IconChevronLeft size={18} />
        </button>
      </div>

      <div
        className="screen-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '0 16px',
          maxWidth: '720px',
          margin: '0 auto',
          width: '100%',
          boxSizing: 'border-box',
        }}
      >
        {/* Migration Callout for Existing Users */}
        {isLegacyUserNeedingReview && proposedTargets && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            <Callout
              variant="info"
              title="راجع نمط نشاطك اليومي"
              message={`قمنا بتحديث نظام السعرات لفصل نمط النشاط اليومي خارج التمرين عن جلسات التمرين حتى لا تُحسب السعرات مرتين.\nالهدف السابق: ${legacyCalorieTarget} كالوِري -> الهدف الدقيق الجديد: ${proposedTargets.targetCalories} كالوِري (${proposedTargets.proteinGrams} جم بروتين).`}
              actionLabel="تطبيق"
              onAction={() => {
                if (!profile || !onUpdateProfile) return
                const migratedProfile: UserProfile = {
                  ...profile,
                  body: {
                    ...profile.body,
                    lifestyle: proposedLifestyle,
                    activityLevel:
                      mapLifestyleToLegacyActivity(proposedLifestyle),
                    workoutBlocks: profile.body.workoutBlocks?.length
                      ? profile.body.workoutBlocks
                      : [
                          {
                            type: 'resistance',
                            sessionsPerWeek: profile.trainingDaysPerWeek ?? 4,
                            minutesPerSession:
                              profile.body.sessionMinutes ?? 60,
                            intensity:
                              profile.body.sessionIntensity ?? 'moderate',
                          },
                        ],
                    lifestyleMigrated: true,
                    migrationReviewed: true,
                  },
                  updatedAt: Date.now(),
                }
                onUpdateProfile(migratedProfile)
              }}
            />
            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                padding: '0 4px',
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  if (!profile || !onUpdateProfile) return
                  onUpdateProfile({
                    ...profile,
                    body: {
                      ...profile.body,
                      migrationReviewed: true,
                    },
                    updatedAt: Date.now(),
                  })
                }}
                style={{
                  fontSize: '12px',
                  color: 'var(--muted)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: '2px 4px',
                }}
              >
                إبقاء الأرقام الحالية
              </button>
            </div>
          </div>
        )}

        {/* Training days mismatch Callout */}
        {hasTrainingDaysMismatch && (
          <Callout
            variant="warning"
            title="عدد الأيام مختلف بين ملفك وحاسبة السعرات"
            message={`ملفك محدد به ${profile.trainingDaysPerWeek} أيام، بينما حاسبة السعرات محدد بها ${profile.body.workoutBlocks![0].sessionsPerWeek} أيام.`}
            actionLabel="تطابق"
            onAction={() => {
              if (!profile || !onUpdateProfile) return
              const synced: UserProfile = {
                ...profile,
                body: {
                  ...profile.body,
                  workoutBlocks: profile.body.workoutBlocks?.map((b, i) =>
                    i === 0
                      ? { ...b, sessionsPerWeek: profile.trainingDaysPerWeek }
                      : b,
                  ),
                },
                updatedAt: Date.now(),
              }
              onUpdateProfile(synced)
            }}
          />
        )}

        {/* Outdated / Incomplete Profile Notice Banner */}
        {!isLegacyUserNeedingReview &&
          (!profile.body.lifestyle ||
            !profile.body.workoutBlocks ||
            profile.body.workoutBlocks.length === 0) && (
            <Callout
              title="استكمال البيانات"
              message="لتفعيل حساب معدل الأيض ومعامل النشاط اليومي وتفاصيل جلسات التمرين بدقة 100% بنظام 2026، استكمل بياناتك الآن."
              actionLabel="استكمال البيانات"
              onAction={() => setIsProfileModalOpen(true)}
            />
          )}

        {/* Daily Summary Card: Calories & 3 Macros Grouped */}
        <div
          className="card daily-summary-card"
          style={{
            padding: '18px',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--line)',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          {/* Calories Row */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '12.5px',
                    color: 'var(--muted)',
                    fontWeight: 600,
                  }}
                >
                  السعرات المستهلكة
                </span>
                <div
                  style={{
                    fontSize: '26px',
                    fontWeight: 800,
                    color: 'var(--brand)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {dailyLog.consumedCalories}{' '}
                  <span
                    style={{
                      fontSize: '15px',
                      color: 'var(--muted)',
                      fontWeight: 500,
                    }}
                  >
                    / {targets.targetCalories} كالوِري
                  </span>
                </div>
              </div>
              <span
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: calPercent >= 100 ? '#10b981' : 'var(--muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {calPercent}%
              </span>
            </div>
            <ProgressBar
              value={dailyLog.consumedCalories}
              max={targets.targetCalories}
              height={8}
              color={calPercent >= 100 ? '#10b981' : 'var(--brand)'}
              aria-label="شريط السعرات اليومية"
            />
          </div>

          {/* 3 Macro Bars Grouped */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              paddingTop: '12px',
              borderTop: '1px solid var(--line)',
            }}
          >
            {/* Protein */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    className="macro-marker macro-marker--protein"
                    aria-hidden="true"
                  />
                  البروتين
                </span>
                <span
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--ink)',
                  }}
                >
                  {dailyLog.consumedProtein} / {targets.proteinGrams} جم (
                  {proteinPercent}%)
                </span>
              </div>
              <ProgressBar
                value={dailyLog.consumedProtein}
                max={targets.proteinGrams}
                height={6}
                color="var(--macro-protein)"
                aria-label="البروتين"
              />
            </div>

            {/* Carbs */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    className="macro-marker macro-marker--carbs"
                    aria-hidden="true"
                  />
                  الكاربوهيدرات
                </span>
                <span
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--ink)',
                  }}
                >
                  {dailyLog.consumedCarbs} / {targets.carbsGrams} جم (
                  {carbsPercent}%)
                </span>
              </div>
              <ProgressBar
                value={dailyLog.consumedCarbs}
                max={targets.carbsGrams}
                height={6}
                color="var(--macro-carbs)"
                aria-label="الكاربوهيدرات"
              />
            </div>

            {/* Fats */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '13px',
                }}
              >
                <span
                  style={{
                    fontWeight: 700,
                    color: 'var(--color-text)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    className="macro-marker macro-marker--fats"
                    aria-hidden="true"
                  />
                  الدهون
                </span>
                <span
                  style={{
                    fontVariantNumeric: 'tabular-nums',
                    color: 'var(--ink)',
                  }}
                >
                  {dailyLog.consumedFats} / {targets.fatsGrams} جم (
                  {fatsPercent}%)
                </span>
              </div>
              <ProgressBar
                value={dailyLog.consumedFats}
                max={targets.fatsGrams}
                height={6}
                color="var(--macro-fats)"
                aria-label="الدهون"
              />
            </div>
          </div>

          {dailyLog.loggedMeals.length > 0 && (
            <div
              style={{
                fontSize: '12px',
                color: 'var(--muted)',
                paddingTop: '4px',
              }}
            >
              الوجبات المسجلة:{' '}
              {dailyLog.loggedMeals.map((m) => m.nameAr).join(' • ')}
            </div>
          )}
        </div>

        {/* 'احتياجك اليومي العلمي' Row */}
        <div
          className="card"
          onClick={() => setShowBodyTargetsDetails(true)}
          style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'var(--card-bg)',
            border: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
          }}
          role="button"
          tabIndex={0}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span
              style={{ fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}
            >
              احتياجك اليومي العلمي
            </span>
            <span style={{ fontSize: '13px', color: 'var(--muted)' }}>
              {targets.targetCalories} كالوِري ({targets.goalLabelAr}) · BMR{' '}
              {targets.bmr} · TDEE {targets.tdee}
            </span>
          </div>
          <IconChevronLeft
            size={20}
            style={{ color: 'var(--muted)', flexShrink: 0 }}
          />
        </div>

        {/* Meal Categories & List Section */}
        <div
          className="section-meals"
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--ink)',
              }}
            >
              قائمة الوجبات ({filteredCustomMeals.length})
            </h3>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setEditingCustomMeal(null)
                setIsCustomMealModalOpen(true)
              }}
              style={{
                fontSize: '13.5px',
                fontWeight: 600,
                color: 'var(--brand)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              + تصميم وجبة
            </button>
          </div>

          {/* Category Filter Chips (No Emoji) */}
          <div
            className="chips-row"
            style={{
              display: 'flex',
              gap: '8px',
              overflowX: 'auto',
              paddingBottom: '4px',
            }}
          >
            <button
              type="button"
              className={
                'chip-btn' +
                (selectedCategoryFilter === 'all' ? ' selected' : '')
              }
              onClick={() => setSelectedCategoryFilter('all')}
              style={{
                padding: '8px 14px',
                borderRadius: '999px',
                fontSize: '13px',
                fontWeight: 600,
                border: '1px solid var(--color-divider)',
                background:
                  selectedCategoryFilter === 'all'
                    ? 'var(--color-primary)'
                    : 'var(--color-surface-2)',
                color:
                  selectedCategoryFilter === 'all'
                    ? 'var(--color-primary-contrast, #ffffff)'
                    : 'var(--color-text)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              الكل ({customMeals.length})
            </button>
            {(Object.keys(CATEGORY_LABELS) as MealCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                className={
                  'chip-btn' +
                  (selectedCategoryFilter === cat ? ' selected' : '')
                }
                onClick={() => setSelectedCategoryFilter(cat)}
                style={{
                  padding: '8px 14px',
                  borderRadius: '999px',
                  fontSize: '13px',
                  fontWeight: 600,
                  border: '1px solid var(--color-divider)',
                  background:
                    selectedCategoryFilter === cat
                      ? 'var(--color-primary)'
                      : 'var(--color-surface-2)',
                  color:
                    selectedCategoryFilter === cat
                      ? 'var(--color-primary-contrast, #ffffff)'
                      : 'var(--color-text)',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                {CATEGORY_LABELS[cat]} (
                {customMeals.filter((m) => m.category === cat).length})
              </button>
            ))}
          </div>

          {/* Meals List */}
          {filteredCustomMeals.length === 0 ? (
            <EmptyState
              title="لا توجد وجبات في هذا القسم"
              description="صمّم وجبتك بالجرامات أو سجّل وجبة سريعة بالأرقام"
              actionLabel="+ إضافة وجبة"
              onAction={() => setIsCustomMealModalOpen(true)}
            />
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
            >
              {filteredCustomMeals.map((meal) => {
                const isJustLogged = recentlyLoggedId === meal.id
                return (
                  <div
                    key={meal.id}
                    className="card meal-list-row"
                    style={{
                      padding: '12px 16px',
                      borderRadius: '12px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--line)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <strong
                        style={{
                          fontSize: '15px',
                          color: 'var(--ink)',
                          display: 'block',
                        }}
                      >
                        {meal.nameAr}
                      </strong>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: 'var(--muted)',
                          marginTop: '2px',
                          display: 'block',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {meal.calories} كالوِري · ب: {meal.proteinGrams}ج · ك:{' '}
                        {meal.carbsGrams}ج · د: {meal.fatsGrams}ج
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => handleLogCustomMeal(meal)}
                        style={{
                          height: '38px',
                          padding: '0 12px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isJustLogged ? '#10b981' : 'var(--brand)',
                          color: '#fff',
                          fontSize: '13px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        {isJustLogged && <IconCheck size={16} />}
                        <span>{isJustLogged ? 'تم التسجيل' : 'أكلتها'}</span>
                      </button>

                      <button
                        type="button"
                        className="btn-icon"
                        onClick={() => setMealActionTarget(meal)}
                        aria-label={`خيارات وجبة ${meal.nameAr}`}
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '8px',
                          border: 'none',
                          background: 'var(--card-subtle)',
                          color: 'var(--ink)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                      >
                        <IconMoreVertical size={18} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Plus Sheet: Quick Log / Custom Meal / Macro Guide */}
      <Sheet
        isOpen={showPlusSheet}
        onClose={() => setShowPlusSheet(false)}
        title="إضافة وتتبع التغذية"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            padding: '8px 0',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setShowPlusSheet(false)
              setIsQuickManualModalOpen(true)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--card-subtle)',
              textAlign: 'right',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>
              تسجيل وجبة سريعة
            </strong>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
              سجل سعرات وماكروز وجبة مباشرة بالأرقام
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPlusSheet(false)
              setEditingCustomMeal(null)
              setIsCustomMealModalOpen(true)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--card-subtle)',
              textAlign: 'right',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>
              تصميم وجبة بالمكونات
            </strong>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
              احسب الماكروز بالجرام من قاعدة الأغذية المصرية والعربية
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPlusSheet(false)
              setShowMacroGuide(true)
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--card-subtle)',
              textAlign: 'right',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <strong style={{ fontSize: '15px', color: 'var(--ink)' }}>
              دليل الماكروز والتغذية
            </strong>
            <span style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
              شرح مبسط لكيفية تقسيم البروتين والكارب والدهون
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowPlusSheet(false)
              handleResetDailyLog()
            }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '2px',
              padding: '14px 16px',
              borderRadius: '12px',
              border: 'none',
              background: 'var(--danger-surface, rgba(220, 38, 38, 0.08))',
              color: 'var(--danger)',
              textAlign: 'right',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <strong style={{ fontSize: '15px' }}>تصفير عداد اليوم</strong>
            <span style={{ fontSize: '12.5px', opacity: 0.8 }}>
              إعادة عداد السعرات والماكروز لليوم الحالي إلى الصفر
            </span>
          </button>
        </div>
      </Sheet>

      {/* Meal Actions Sheet */}
      {mealActionTarget && (
        <Sheet
          isOpen={true}
          onClose={() => setMealActionTarget(null)}
          title={`خيارات: ${mealActionTarget.nameAr}`}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              padding: '8px 0',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setEditingCustomMeal(mealActionTarget)
                setMealActionTarget(null)
                setIsCustomMealModalOpen(true)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'right',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <IconEdit size={18} />
              <span>تعديل الوجبة</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setMealToDelete(mealActionTarget)
                setMealActionTarget(null)
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--danger-surface, rgba(220, 38, 38, 0.08))',
                color: 'var(--danger)',
                fontSize: '15px',
                fontWeight: 600,
                textAlign: 'right',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              <IconTrash size={18} />
              <span>حذف الوجبة</span>
            </button>
          </div>
        </Sheet>
      )}

      {/* Delete Meal Confirm Sheet */}
      {mealToDelete && (
        <ConfirmSheet
          isOpen={true}
          onClose={() => setMealToDelete(null)}
          onConfirm={() => handleDeleteCustomMeal(mealToDelete.id)}
          title="حذف الوجبة؟"
          consequences={[
            `هل أنت متأكد من حذف وجبة «${mealToDelete.nameAr}» نهائياً؟`,
          ]}
          confirmLabel="نعم، حذف"
          cancelLabel="إلغاء"
          isDestructive={true}
        />
      )}

      {/* Reset Daily Log Confirm Sheet */}
      {showResetDailyConfirm && (
        <ConfirmSheet
          isOpen={true}
          onClose={() => setShowResetDailyConfirm(false)}
          onConfirm={doResetDailyLog}
          title="تصفير سجل اليوم؟"
          consequences={[
            'سيتم حذف جميع الوجبات المسجلة وتصفير عداد السعرات والماكروز لهذا اليوم.',
          ]}
          confirmLabel="نعم، تصفير السجل"
          cancelLabel="إلغاء"
          isDestructive={true}
        />
      )}

      {/* Body & Targets Detail Sub-Screen */}
      {showBodyTargetsDetails && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <TopBar
            title="ملف جسمك واحتياجك العلمي"
            onBack={() => setShowBodyTargetsDetails(false)}
          />

          <div
            className="screen-content"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '16px',
              maxWidth: '680px',
              margin: '0 auto',
              width: '100%',
              boxSizing: 'border-box',
            }}
          >
            {/* KeyValueList of metrics */}
            <div
              className="card"
              style={{
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                padding: '8px 16px',
              }}
            >
              <KeyValueList
                items={[
                  {
                    id: 'weight',
                    label: 'الوزن',
                    value: `${profile.body.weightKg} كجم`,
                  },
                  {
                    id: 'height',
                    label: 'الطول',
                    value: `${profile.body.heightCm} سم`,
                  },
                  {
                    id: 'age',
                    label: 'العمر',
                    value: `${profile.body.age} سنة`,
                  },
                  {
                    id: 'sex',
                    label: 'الجنس',
                    value: profile.body.sex === 'male' ? 'ذكر' : 'أنثى',
                  },
                  {
                    id: 'bf',
                    label: 'نسبة دهون الجسم',
                    value: profile.body.bodyFatPercent
                      ? `${profile.body.bodyFatPercent}%`
                      : 'غير محددة',
                  },
                  {
                    id: 'lifestyle',
                    label: 'نمط النشاط اليومي',
                    value:
                      LIFESTYLE_OPTIONS.find(
                        (l) =>
                          l.level ===
                          (profile.body.lifestyle ??
                            mapLegacyActivityToLifestyle(
                              profile.body.activityLevel,
                            )),
                      )?.titleAr || '—',
                  },
                  {
                    id: 'workouts',
                    label: 'جلسات التمرين',
                    value: `${profile.trainingDaysPerWeek} أيام أسبوعياً`,
                  },
                  {
                    id: 'goal',
                    label: 'الهدف الأساسي',
                    value: currentGoalObj?.labelAr || 'تضخيم',
                  },
                ]}
              />
            </div>

            {/* BMR and TDEE Stats */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}
            >
              <Stat
                label="الحرق الأساسي"
                value={`${targets.bmr} كالوِري`}
                secondary={<span dir="ltr">BMR</span>}
              />
              <Stat
                label="الحرق بالنشاط"
                value={`${targets.tdee} كالوِري`}
                secondary={<span dir="ltr">TDEE</span>}
              />
            </div>

            {/* Scientific Explanation Expandable */}
            <div
              className="card"
              style={{
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                padding: '16px',
              }}
            >
              <button
                type="button"
                onClick={() => setShowExplanation(!showExplanation)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'transparent',
                  border: 'none',
                  fontSize: '15px',
                  fontWeight: 700,
                  color: 'var(--ink)',
                  cursor: 'pointer',
                  padding: 0,
                }}
              >
                <span>كيف حسبناها؟ (معادلات 2026)</span>
                <span style={{ fontSize: '13px', color: 'var(--brand)' }}>
                  {showExplanation ? 'إخفاء ▲' : 'عرض ▼'}
                </span>
              </button>

              {showExplanation && targets.engineResult && (
                <div
                  style={{
                    marginTop: '12px',
                    fontSize: '13px',
                    lineHeight: 1.7,
                  }}
                >
                  <ul
                    style={{
                      paddingRight: '18px',
                      margin: '8px 0',
                      color: 'var(--ink)',
                    }}
                  >
                    <li>
                      <strong>المعادلة:</strong>{' '}
                      {targets.engineResult.explanationAr.formula}
                    </li>
                    <li>
                      <strong>الحرق القاعدي (BMR):</strong>{' '}
                      {targets.engineResult.explanationAr.bmrText}
                    </li>
                    <li>
                      <strong>معامل نمط الحياة:</strong>{' '}
                      {targets.engineResult.explanationAr.lifestyleText}
                    </li>
                    <li>
                      <strong>حرق التمرين الفعلي (EAT):</strong>{' '}
                      {targets.engineResult.explanationAr.eatText}
                    </li>
                    <li>
                      <strong>نطاق الاستهلاك (TDEE):</strong>{' '}
                      {targets.engineResult.explanationAr.tdeeRangeText}
                    </li>
                    <li>
                      <strong>تعديل السعرات:</strong>{' '}
                      {targets.engineResult.explanationAr.adjustmentText}
                    </li>
                    <li>
                      <strong>أساس احتساب البروتين:</strong>{' '}
                      {targets.engineResult.explanationAr.proteinBasisText}
                    </li>
                  </ul>
                  <div
                    style={{
                      background: 'var(--card-subtle)',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      fontSize: '12px',
                      color: 'var(--muted)',
                    }}
                  >
                    <em>مرجع رياضي:</em> تشير الدراسات إلى أن مكاسب البناء
                    العضلي تصل لذروتها حول 1.6 جم/كجم (Morton et al., BJSM
                    2018).
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Edit profile & Calibration */}
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowBodyTargetsDetails(false)
                  setIsProfileModalOpen(true)
                }}
              >
                تعديل بيانات وزني وهدفي
              </Button>

              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => {
                  setShowBodyTargetsDetails(false)
                  setIsCalibrationModalOpen(true)
                }}
              >
                معايرة السعرات الذكية
              </Button>
            </div>

            {/* Safety Disclaimer Footnote */}
            <p
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                lineHeight: 1.5,
                margin: '8px 0',
                textAlign: 'center',
              }}
            >
              تنويه طبي: هذه الأرقام والخطط الغذائية هي تقديرات حسابية إرشادية
              مستندة للأدبيات الرياضية وليست استشارة طبية. يُرجى استشارة طبيب أو
              أخصائي تغذية قبل اتباع أي حمية صارمة.
            </p>
          </div>
        </div>
      )}

      {/* Screen 10: Calculator Settings (Full-Screen Route) */}
      {isProfileModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 500,
            background: 'var(--bg)',
            display: 'flex',
            flexDirection: 'column',
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <TopBar
            title="إعدادات الحاسبة واحتياج السعرات"
            onBack={() => setIsProfileModalOpen(false)}
          />

          <form
            onSubmit={handleSaveProfileChanges}
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            <div
              className="screen-content"
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                padding: '16px',
                maxWidth: '680px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
                flex: 1,
              }}
            >
              {modalError && (
                <div
                  role="alert"
                  style={{
                    padding: '12px 16px',
                    borderRadius: '10px',
                    background: 'var(--danger-surface, rgba(220, 38, 38, 0.1))',
                    color: 'var(--danger)',
                    fontSize: '14px',
                    fontWeight: 600,
                  }}
                >
                  {modalError}
                </div>
              )}

              {/* Unit Toggle: Segmented control */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  background: 'var(--card-subtle)',
                  padding: '4px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                }}
              >
                <button
                  type="button"
                  onClick={() => setIsImperial(false)}
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: !isImperial ? 'var(--card-bg)' : 'transparent',
                    color: !isImperial ? 'var(--ink)' : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: !isImperial
                      ? '0 1px 3px rgba(0,0,0,0.1)'
                      : 'none',
                  }}
                >
                  متري (كجم / سم)
                </button>
                <button
                  type="button"
                  onClick={() => setIsImperial(true)}
                  style={{
                    height: '40px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isImperial ? 'var(--card-bg)' : 'transparent',
                    color: isImperial ? 'var(--ink)' : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13.5px',
                    cursor: 'pointer',
                    boxShadow: isImperial
                      ? '0 1px 3px rgba(0,0,0,0.1)'
                      : 'none',
                  }}
                >
                  إمبراطوري (باوند / بوصة)
                </button>
              </div>

              {/* Weight Field */}
              <div className="field">
                <label
                  htmlFor="calc-weight"
                  style={{ fontSize: '13.5px', fontWeight: 700 }}
                >
                  الوزن ({isImperial ? 'باوند' : 'كجم'})
                </label>
                <input
                  id="calc-weight"
                  type="number"
                  step="0.1"
                  className="field-input"
                  value={
                    isImperial
                      ? Number((editWeight * 2.20462).toFixed(1))
                      : editWeight
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    setEditWeight(
                      isImperial ? Number((val / 2.20462).toFixed(1)) : val,
                    )
                  }}
                  required
                  style={{ height: '48px', width: '100%' }}
                />
              </div>

              {/* Height Field */}
              <div className="field">
                <label
                  htmlFor="calc-height"
                  style={{ fontSize: '13.5px', fontWeight: 700 }}
                >
                  الطول ({isImperial ? 'بوصة' : 'سم'})
                </label>
                <input
                  id="calc-height"
                  type="number"
                  step="0.5"
                  className="field-input"
                  value={
                    isImperial
                      ? Number((editHeight / 2.54).toFixed(1))
                      : editHeight
                  }
                  onChange={(e) => {
                    const val = parseFloat(e.target.value) || 0
                    setEditHeight(
                      isImperial ? Number((val * 2.54).toFixed(1)) : val,
                    )
                  }}
                  required
                  style={{ height: '48px', width: '100%' }}
                />
              </div>

              {/* Age Field */}
              <div className="field">
                <label
                  htmlFor="calc-age"
                  style={{ fontSize: '13.5px', fontWeight: 700 }}
                >
                  العمر (بالسنوات)
                </label>
                <input
                  id="calc-age"
                  type="number"
                  min="12"
                  max="100"
                  className="field-input"
                  value={editAge}
                  onChange={(e) => setEditAge(Number(e.target.value))}
                  required
                  style={{ height: '48px', width: '100%' }}
                />
              </div>

              {/* Sex Select */}
              <div className="field">
                <Select
                  id="calc-sex-select"
                  label="الجنس"
                  value={editSex}
                  onChange={(val) => setEditSex(val as Sex)}
                  options={[
                    { value: 'male', labelAr: 'ذكر', labelEn: 'Male' },
                    { value: 'female', labelAr: 'أنثى', labelEn: 'Female' },
                  ]}
                  sheetTitle="اختر الجنس"
                />
              </div>

              {/* Body Fat % (Optional) */}
              <div className="field">
                <label
                  htmlFor="calc-bf"
                  style={{ fontSize: '13.5px', fontWeight: 700 }}
                >
                  نسبة دهون الجسم (اختياري، %)
                </label>
                <input
                  id="calc-bf"
                  type="number"
                  min="3"
                  max="65"
                  step="0.5"
                  className="field-input"
                  value={editBodyFat ?? ''}
                  placeholder="مثال: 18"
                  onChange={(e) =>
                    setEditBodyFat(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  style={{ height: '48px', width: '100%' }}
                />
              </div>

              {/* Lifestyle Level Select */}
              <div className="field">
                <Select
                  id="calc-lifestyle-select"
                  label="نمط النشاط اليومي (خارج أوقات التمرين)"
                  value={String(editLifestyle)}
                  onChange={(val) =>
                    setEditLifestyle(Number(val) as LifestyleLevel)
                  }
                  options={LIFESTYLE_OPTIONS.map((opt) => ({
                    value: String(opt.level),
                    labelAr: `${opt.level} = ${opt.titleAr}`,
                    description: `${opt.descriptionAr} (معامل ${opt.factor.toFixed(2)})`,
                  }))}
                  sheetTitle="اختر نمط النشاط اليومي"
                />
              </div>

              {/* Workout Blocks (Vertical Repeater: 1 per row) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  padding: '14px',
                  borderRadius: '16px',
                  background: 'var(--card-subtle)',
                  border: '1px solid var(--line)',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: '14px',
                      fontWeight: 700,
                      color: 'var(--ink)',
                    }}
                  >
                    جلسات التمرين (حساب EAT)
                  </span>
                  {editWorkoutBlocks.length < 3 && (
                    <button
                      type="button"
                      className="btn-ghost"
                      onClick={() =>
                        setEditWorkoutBlocks([
                          ...editWorkoutBlocks,
                          {
                            type: 'cardio',
                            sessionsPerWeek: 3,
                            minutesPerSession: 30,
                            intensity: 'moderate',
                          },
                        ])
                      }
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: 'var(--brand)',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                      }}
                    >
                      + إضافة نشاط
                    </button>
                  )}
                </div>

                {editWorkoutBlocks.map((block, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      padding: '14px',
                      borderRadius: '12px',
                      background: 'var(--card-bg)',
                      border: '1px solid var(--line)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '13.5px',
                          fontWeight: 700,
                          color: 'var(--ink)',
                        }}
                      >
                        نشاط #{idx + 1}
                      </span>
                      {editWorkoutBlocks.length > 1 && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditWorkoutBlocks(
                              editWorkoutBlocks.filter((_, i) => i !== idx),
                            )
                          }
                          aria-label="حذف هذا النشاط"
                          style={{
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--danger)',
                            cursor: 'pointer',
                            fontSize: '12.5px',
                            fontWeight: 600,
                          }}
                        >
                          حذف
                        </button>
                      )}
                    </div>

                    <Select
                      id={`block-type-${idx}`}
                      label="نوع التمرين"
                      value={block.type}
                      onChange={(val) => {
                        const updated = [...editWorkoutBlocks]
                        updated[idx] = {
                          ...updated[idx],
                          type: val as 'resistance' | 'cardio',
                        }
                        setEditWorkoutBlocks(updated)
                      }}
                      options={[
                        { value: 'resistance', labelAr: 'حديد ومقاومة' },
                        { value: 'cardio', labelAr: 'كارديو وجري' },
                      ]}
                      sheetTitle="اختر نوع التمرين"
                    />

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '8px',
                      }}
                    >
                      <div className="field">
                        <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                          الجلسات أسبوعياً
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="14"
                          value={block.sessionsPerWeek}
                          onChange={(e) => {
                            const updated = [...editWorkoutBlocks]
                            updated[idx] = {
                              ...updated[idx],
                              sessionsPerWeek:
                                parseInt(e.target.value, 10) || 1,
                            }
                            setEditWorkoutBlocks(updated)
                          }}
                          className="field-input"
                          style={{ height: '48px', width: '100%' }}
                        />
                      </div>
                      <div className="field">
                        <label style={{ fontSize: '12.5px', fontWeight: 600 }}>
                          الدقائق لكل جلسة
                        </label>
                        <input
                          type="number"
                          min="10"
                          max="180"
                          step="5"
                          value={block.minutesPerSession}
                          onChange={(e) => {
                            const updated = [...editWorkoutBlocks]
                            updated[idx] = {
                              ...updated[idx],
                              minutesPerSession:
                                parseInt(e.target.value, 10) || 10,
                            }
                            setEditWorkoutBlocks(updated)
                          }}
                          className="field-input"
                          style={{ height: '48px', width: '100%' }}
                        />
                      </div>
                    </div>

                    <Select
                      id={`block-intensity-${idx}`}
                      label="شدة التمرين"
                      value={block.intensity}
                      onChange={(val) => {
                        const updated = [...editWorkoutBlocks]
                        updated[idx] = {
                          ...updated[idx],
                          intensity: val as 'light' | 'moderate' | 'hard',
                        }
                        setEditWorkoutBlocks(updated)
                      }}
                      options={[
                        { value: 'light', labelAr: 'خفيفة (راحة طويلة)' },
                        { value: 'moderate', labelAr: 'متوسطة (عادية)' },
                        { value: 'hard', labelAr: 'شديدة (جهد عالي)' },
                      ]}
                      sheetTitle="اختر شدة التمرين"
                    />
                  </div>
                ))}
              </div>

              {/* Goal Select */}
              <div className="field">
                <Select
                  id="calc-goal-select"
                  label="الهدف الأساسي"
                  value={editGoal}
                  onChange={(val) => setEditGoal(val as Goal)}
                  options={GOALS.map((g) => ({
                    value: g.value,
                    labelAr: g.labelAr,
                    labelEn: g.hintAr,
                  }))}
                  sheetTitle="اختر هدفك التدريبي"
                />
              </div>

              {/* Pace Select */}
              <div className="field">
                <Select
                  id="calc-pace-select"
                  label="وتيرة التقدم"
                  value={editPace}
                  onChange={(val) => setEditPace(val as NutritionPace)}
                  options={[
                    {
                      value: 'conservative',
                      labelAr: 'بطيء ومحافظ (تغيير طفيف في الوزن)',
                    },
                    {
                      value: 'standard',
                      labelAr: 'معتدل (المعدل العلمي الموصى به)',
                    },
                    {
                      value: 'aggressive',
                      labelAr: 'سريع ومكثف',
                    },
                  ]}
                  sheetTitle="اختر وتيرة التقدم"
                />
              </div>

              {/* Advanced Calculation Formula Select */}
              <div className="field">
                <Select
                  id="calc-formula-select"
                  label="معادلة الحساب المعتمدة"
                  value={editFormulaOverride}
                  onChange={(val) =>
                    setEditFormulaOverride(val as FormulaChoice)
                  }
                  options={[
                    {
                      value: 'auto',
                      labelAr: 'تلقائي (الأفضل علمياً حسب معطياتك)',
                    },
                    {
                      value: 'mifflin',
                      labelAr: 'ميفلين سانت جيور (الأكثر دقة للأصحاء)',
                    },
                    {
                      value: 'katch',
                      labelAr: 'كاتش-ماكاردل (تتطلب نسبة دهون دقيقة)',
                    },
                    {
                      value: 'cunningham',
                      labelAr: 'كامينغهام (للرياضيين المتقدمين)',
                    },
                  ]}
                  sheetTitle="اختر معادلة الحساب"
                />
              </div>

              {/* Protein Override Field */}
              <div className="field">
                <label
                  htmlFor="calc-protein-override"
                  style={{ fontSize: '13.5px', fontWeight: 700 }}
                >
                  تعديل البروتين يدوياً (اختياري، جم/كجم)
                </label>
                <input
                  id="calc-protein-override"
                  type="number"
                  min="1.2"
                  max="3.5"
                  step="0.1"
                  className="field-input"
                  value={editProteinOverride ?? ''}
                  placeholder="اتركه فارغاً للحساب التلقائي (1.6 - 2.2)"
                  onChange={(e) =>
                    setEditProteinOverride(
                      e.target.value ? Number(e.target.value) : undefined,
                    )
                  }
                  style={{ height: '48px', width: '100%' }}
                />
              </div>
            </div>

            {/* Sticky Bottom Bar */}
            <div
              className="sticky-actions-bar"
              style={{
                position: 'sticky',
                bottom: 0,
                background: 'var(--bg)',
                padding: '12px 16px',
                borderTop: '1px solid var(--line)',
                zIndex: 20,
                display: 'flex',
                gap: '12px',
                maxWidth: '680px',
                margin: '0 auto',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <button
                type="button"
                className="btn-ghost"
                onClick={() => setIsProfileModalOpen(false)}
                style={{
                  height: '48px',
                  flex: '0 0 90px',
                  borderRadius: '12px',
                  border: '1px solid var(--line)',
                  background: 'transparent',
                  color: 'var(--ink)',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{
                  height: '48px',
                  flex: 1,
                  borderRadius: '12px',
                  border: 'none',
                  background: 'var(--brand)',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                تطبيق وحساب السعرات
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Smart Calibration Sheet */}
      <Sheet
        isOpen={isCalibrationModalOpen}
        onClose={() => {
          setIsCalibrationModalOpen(false)
          setCalibrationFeedback('')
        }}
        title="معايرة السعرات الذكية"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
            padding: '8px 0',
          }}
        >
          <Callout title="كيف تعمل المعايرة؟">
            المعايرة تقارن وزنك الفعلي على مدار أسبوعين مع سعراتك اليومية
            المتناولة لتحديد معدل الحرق الحقيقي لجسمك بدقة تامة وتعديل سعراتك
            تلقائياً.
          </Callout>

          {/* Progress to 8 logs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: '13px',
              }}
            >
              <span style={{ fontWeight: 600 }}>الأوزان المسجلة</span>
              <span style={{ fontWeight: 700, color: 'var(--brand)' }}>
                {Math.min(8, bodyLog.length)} من 8 أوزان مطلوبة
              </span>
            </div>
            <ProgressBar
              value={Math.min(8, bodyLog.length)}
              max={8}
              height={8}
            />
          </div>

          {/* Quick Weight Form */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '14px',
              borderRadius: '12px',
              background: 'var(--card-subtle)',
              border: '1px solid var(--line)',
            }}
          >
            <span
              style={{ fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}
            >
              تسجيل وزن سريع للمعايرة
            </span>

            <div className="field">
              <label
                htmlFor="quick-cal-weight"
                style={{ fontSize: '13px', fontWeight: 600 }}
              >
                الوزن (كجم)
              </label>
              <input
                id="quick-cal-weight"
                type="number"
                step="0.1"
                className="field-input"
                value={quickWeight}
                onChange={(e) => setQuickWeight(e.target.value)}
                placeholder="مثال: 72.5"
                style={{ height: '48px', width: '100%' }}
              />
            </div>

            <div className="field">
              <DateField
                id="quick-cal-date"
                label="التاريخ"
                value={quickWeightDate}
                onChange={(val) => setQuickWeightDate(val)}
              />
            </div>

            <button
              type="button"
              className="btn-primary"
              onClick={handleQuickWeightSave}
              style={{
                height: '48px',
                borderRadius: '12px',
                border: 'none',
                background: 'var(--brand)',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 700,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              حفظ الوزن
            </button>

            {calibrationFeedback && (
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: calibrationFeedback.startsWith('✓')
                    ? '#10b981'
                    : 'var(--danger)',
                  marginTop: '4px',
                }}
              >
                {calibrationFeedback}
              </div>
            )}
          </div>

          {/* Calibration Result */}
          {calibrationData && calibrationData.canCalibrate ? (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '14px',
                borderRadius: '12px',
                background: 'var(--card-bg)',
                border: '1px solid #10b981',
              }}
            >
              <span
                style={{ fontSize: '14px', fontWeight: 700, color: '#10b981' }}
              >
                ✓ تتوفر بيانات كافية للمعايرة ({calibrationData.logsCount} أوزان
                عبر {calibrationData.daysSpan} يوماً)
              </span>

              <ul
                style={{
                  margin: 0,
                  paddingRight: '18px',
                  fontSize: '13px',
                  lineHeight: 1.7,
                }}
              >
                <li>
                  <strong>معدل التغير الأسبوعي:</strong>{' '}
                  {calibrationData.slopeKgPerWeek} كجم/أسبوع
                </li>
                <li>
                  <strong>الحرق المشاهد (TDEE):</strong>{' '}
                  {calibrationData.tdeeObserved} كالوِري
                </li>
                <li>
                  <strong>الهدف المعاير المقترح:</strong>{' '}
                  {calibrationData.newTargetCalories} كالوِري
                </li>
              </ul>

              <button
                type="button"
                className="btn-primary"
                onClick={() =>
                  handleApplyCalibration(calibrationData.newTargetCalories!)
                }
                style={{
                  height: '44px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#10b981',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  width: '100%',
                  marginTop: '4px',
                }}
              >
                تطبيق الهدف المعاير ({calibrationData.newTargetCalories}{' '}
                كالوِري)
              </button>
            </div>
          ) : (
            <div
              style={{
                fontSize: '12.5px',
                color: 'var(--muted)',
                lineHeight: 1.5,
                padding: '8px',
              }}
            >
              سجّل وزنك 8 مرات على الأقل لتفعيل حساب المعايرة التلقائية.
            </div>
          )}
        </div>
      </Sheet>

      {/* External Modals */}
      {isCustomMealModalOpen && (
        <CustomMealModal
          initialMeal={editingCustomMeal}
          onSave={handleSaveCustomMeal}
          onClose={() => {
            setIsCustomMealModalOpen(false)
            setEditingCustomMeal(null)
          }}
        />
      )}

      {isQuickManualModalOpen && (
        <QuickManualMealModal
          isOpen={isQuickManualModalOpen}
          onClose={() => setIsQuickManualModalOpen(false)}
          onSaveMeal={handleSaveCustomMeal}
          onLogDirect={handleLogDirectMeal}
        />
      )}

      {showMacroGuide && (
        <MacroGuideModal onClose={() => setShowMacroGuide(false)} />
      )}
    </div>
  )
}
