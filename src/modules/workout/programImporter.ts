import {
  ProgramImportSchema,
  type ImportedProgram,
  type ImportedDay,
  type ImportedItem,
} from './importSchema.ts'
import type {
  WorkoutProgram,
  ProgramDay,
  ProgramExercise,
  WorkoutSplitType,
  Goal,
} from '../shared/types.ts'
import {
  ALL_EXERCISES,
  CATALOG_EXERCISES,
  EXERCISE_ALIASES,
} from './exercises.ts'
import {
  getExerciseTags,
  type UserLimitation,
  type RegionTag,
} from './limitations.ts'

export interface ProgramImporterOptions {
  limitations?: UserLimitation[] | null
}

export interface ImportItemDiagnostic {
  dayName: string
  exerciseName: string
  exerciseId: string | null
  status: 'matched' | 'custom' | 'unreviewed' | 'warning' | 'danger'
  message?: string
  tags: RegionTag[]
}

export interface ImportResult {
  success: boolean
  program?: WorkoutProgram
  rawProgram?: ImportedProgram
  diagnostics: ImportItemDiagnostic[]
  errors: string[]
  warnings: string[]
  stats: {
    daysCount: number
    totalItems: number
    matchedItems: number
    customItems: number
    limitationConflicts: number
  }
}

/**
 * Extracts JSON content from raw user text or markdown code fence.
 */
export function extractJsonFromText(rawText: string): string {
  const trimmed = rawText.trim()
  if (!trimmed) return ''

  // 1. Try markdown code block
  const codeBlockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim()
  }

  // 2. Find outermost balanced curly braces
  const firstBrace = trimmed.indexOf('{')
  const lastBrace = trimmed.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1).trim()
  }

  return trimmed
}

/**
 * Translates JSON parse errors into Arabic with line and column references.
 */
export function formatJsonSyntaxError(err: unknown, jsonText: string): string {
  const message = err instanceof Error ? err.message : String(err)
  let line = 1
  let column = 1

  const posMatch = message.match(/position\s+(\d+)/i)
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10)
    const prefix = jsonText.slice(0, Math.min(pos, jsonText.length))
    const lines = prefix.split('\n')
    line = lines.length
    column = lines[lines.length - 1].length + 1
  } else {
    const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i)
    if (lineColMatch) {
      line = parseInt(lineColMatch[1], 10)
      column = parseInt(lineColMatch[2], 10)
    }
  }

  let hint =
    'يرجى التأكد من صحة علامات التنصيص المزدوجة والفواصل وإغلاق كافة الأقواس المعقوفة.'
  if (message.includes('Unexpected end')) {
    hint =
      'نهاية غير متوقعة للملف، يبدو أن كائن JSON غير مكتمل أو ينقصه قوس إغلاق.'
  } else if (message.includes('Unexpected token')) {
    hint =
      'رمز غير متوقع، تأكد من استخدام علامات تنصيص مزدوجة وعدم وضع فاصلة زائدة في نهاية القوائم.'
  }

  return `خطأ في بناء جملة JSON عند السطر ${line} والعمود ${column}: ${hint}`
}

/**
 * Pre-processes and fixes known fixture and AI-generated quirks on an item:
 * 1. Omit "عضلة رئيسية" in targetSubMuscleAr
 * 2. Split compound customName "اسم عربي (Name En) [قيد المراجعة]" into customName, nameEn, needsReview
 * 3. Convert reps: 0 + amrap: true to reps: null
 * 4. Resolve exerciseId aliases and matching
 */
function cleanItem(raw: Record<string, unknown>): Record<string, unknown> {
  const item = { ...raw }

  // 1. Omit targetSubMuscleAr: "عضلة رئيسية"
  if (
    item.targetSubMuscleAr === 'عضلة رئيسية' ||
    item.targetSubMuscleAr === 'عضلة رئيسية '
  ) {
    delete item.targetSubMuscleAr
  }

  // 2. Parse customName if it contains "(English)" or "[قيد المراجعة]"
  if (typeof item.customName === 'string') {
    const compoundMatch = item.customName.match(
      /^(.+?)\s*\(([^)]+)\)(?:\s*\[([^\]]+)\])?$/,
    )
    if (compoundMatch) {
      item.customName = compoundMatch[1].trim()
      if (!item.nameEn) {
        item.nameEn = compoundMatch[2].trim()
      }
      if (
        compoundMatch[3]?.includes('مراجعة') ||
        compoundMatch[3]?.includes('review')
      ) {
        item.needsReview = true
      }
    }
  }

  // 3. AMRAP with 0 or null reps, and zero repsMin
  if (item.amrap === true) {
    if (item.reps === 0 || item.reps === undefined || item.reps === '0') {
      item.reps = null
    }
    if (item.repsMin === 0 || item.repsMin === '0') {
      delete item.repsMin
    }
  }
  if (item.repsMin === 0 || item.repsMin === '0') {
    delete item.repsMin
  }

  return item
}

/**
 * Resolves an exercise key against Catalog, Aliases, and All exercises.
 */
export function resolveExerciseKey(
  candidateId: string | null | undefined,
  nameHint?: string,
): {
  canonicalId: string | null
  isCatalog: boolean
  isCustom: boolean
  matchedName?: string
} {
  if (!candidateId) {
    if (nameHint) {
      const hint = nameHint.trim().toLowerCase()
      const foundInCatalog = CATALOG_EXERCISES.find(
        (c) =>
          c.name?.toLowerCase() === hint ||
          c.nameEn?.toLowerCase() === hint ||
          c.nameAr === hint,
      )
      if (foundInCatalog) {
        return {
          canonicalId: foundInCatalog.id,
          isCatalog: true,
          isCustom: false,
          matchedName: foundInCatalog.nameAr,
        }
      }
    }
    return { canonicalId: null, isCatalog: false, isCustom: true }
  }

  const rawKey = candidateId.trim()
  const alias = EXERCISE_ALIASES[rawKey] || rawKey

  // Check Catalog first
  const catalogMatch = CATALOG_EXERCISES.find(
    (c) => c.id === alias || c.id === rawKey,
  )
  if (catalogMatch) {
    return {
      canonicalId: catalogMatch.id,
      isCatalog: true,
      isCustom: false,
      matchedName: catalogMatch.nameAr,
    }
  }

  // Check All exercises (legacy)
  const legacyMatch = ALL_EXERCISES.find(
    (e) => e.id === alias || e.id === rawKey,
  )
  if (legacyMatch) {
    return {
      canonicalId: legacyMatch.id,
      isCatalog: false,
      isCustom: false,
      matchedName: legacyMatch.nameAr,
    }
  }

  // If it's a placeholder-*, check if the inner name matches catalog
  if (rawKey.startsWith('placeholder-')) {
    const slug = rawKey
      .replace(/^placeholder-/, '')
      .replace(/[-_]/g, ' ')
      .toLowerCase()
    const found = CATALOG_EXERCISES.find(
      (c) =>
        c.name?.toLowerCase().includes(slug) || c.id.toLowerCase() === slug,
    )
    if (found) {
      return {
        canonicalId: found.id,
        isCatalog: true,
        isCustom: false,
        matchedName: found.nameAr,
      }
    }
  }

  return { canonicalId: rawKey, isCatalog: false, isCustom: true }
}

/**
 * Main Program Importer function for TASK G4 Part 3.
 */
export function importProgramFromJson(
  rawInput: string,
  options: ProgramImporterOptions = {},
): ImportResult {
  const errors: string[] = []
  const warnings: string[] = []
  const diagnostics: ImportItemDiagnostic[] = []

  const jsonText = extractJsonFromText(rawInput)
  if (!jsonText) {
    return {
      success: false,
      diagnostics: [],
      errors: ['لم يتم العثور على نص أو كود JSON في المدخل.'],
      warnings: [],
      stats: {
        daysCount: 0,
        totalItems: 0,
        matchedItems: 0,
        customItems: 0,
        limitationConflicts: 0,
      },
    }
  }

  let parsedRaw: unknown
  try {
    parsedRaw = JSON.parse(jsonText)
  } catch (err) {
    return {
      success: false,
      diagnostics: [],
      errors: [formatJsonSyntaxError(err, jsonText)],
      warnings: [],
      stats: {
        daysCount: 0,
        totalItems: 0,
        matchedItems: 0,
        customItems: 0,
        limitationConflicts: 0,
      },
    }
  }

  const candidateObject =
    parsedRaw && typeof parsedRaw === 'object' && 'program' in parsedRaw
      ? (parsedRaw as { program: unknown }).program
      : parsedRaw

  if (!candidateObject || typeof candidateObject !== 'object') {
    return {
      success: false,
      diagnostics: [],
      errors: ['الملف لا يحتوي على كائن جدول تدريبي صالح.'],
      warnings: [],
      stats: {
        daysCount: 0,
        totalItems: 0,
        matchedItems: 0,
        customItems: 0,
        limitationConflicts: 0,
      },
    }
  }

  const preProcessed = { ...(candidateObject as Record<string, unknown>) }
  if (Array.isArray(preProcessed.days)) {
    preProcessed.days = preProcessed.days.map((day: unknown) => {
      if (!day || typeof day !== 'object') return day
      const d = { ...(day as Record<string, unknown>) }
      const itemArrays = [
        'warmup',
        'exercises',
        'controlBlock',
        'cooldown',
        'pullPrep',
      ] as const
      for (const key of itemArrays) {
        if (Array.isArray(d[key])) {
          d[key] = (d[key] as Array<Record<string, unknown>>).map((item) =>
            item && typeof item === 'object' ? cleanItem(item) : item,
          )
        }
      }
      return d
    })
  }

  const zodResult = ProgramImportSchema.safeParse(preProcessed)
  if (!zodResult.success) {
    for (const issue of zodResult.error.issues) {
      const pathStr = issue.path.join(' ◂ ')
      errors.push(`خطأ في الحقل (${pathStr}): ${issue.message}`)
    }
    return {
      success: false,
      diagnostics: [],
      errors,
      warnings,
      stats: {
        daysCount: 0,
        totalItems: 0,
        matchedItems: 0,
        customItems: 0,
        limitationConflicts: 0,
      },
    }
  }

  const rawProgram: ImportedProgram = zodResult.data
  let totalItems = 0
  let matchedItems = 0
  let customItems = 0
  let limitationConflicts = 0

  const normalizedDays: ProgramDay[] = rawProgram.days.map(
    (day: ImportedDay, dayIdx: number) => {
      const dayName = day.labelAr || day.name || `اليوم ${dayIdx + 1}`

      const processItems = (
        items: ImportedItem[] | undefined,
        defaultSection: 'warmup' | 'primary' | 'flexibility_core',
      ): ProgramExercise[] => {
        if (!items || items.length === 0) return []
        return items.map((item, itemIdx) => {
          totalItems++
          const resolution = resolveExerciseKey(
            item.exerciseId,
            item.customName || item.nameEn,
          )
          const effectiveId =
            resolution.canonicalId ||
            item.exerciseId ||
            `custom-${dayIdx}-${itemIdx}`
          const displayName =
            item.customName ||
            resolution.matchedName ||
            item.nameEn ||
            effectiveId

          if (resolution.isCatalog) {
            matchedItems++
          } else {
            customItems++
          }

          const tags = getExerciseTags(effectiveId, options.limitations)
          let status: ImportItemDiagnostic['status'] = resolution.isCatalog
            ? 'matched'
            : 'custom'

          const hasHigh = tags.some((t) => t.level === 'high')
          const hasMod = tags.some((t) => t.level === 'moderate')
          const hasUnreviewed = tags.some((t) => t.level === 'unreviewed')

          if (hasHigh) {
            status = 'danger'
            limitationConflicts++
          } else if (hasMod) {
            status = 'warning'
            limitationConflicts++
          } else if (hasUnreviewed) {
            status = 'unreviewed'
          }

          diagnostics.push({
            dayName,
            exerciseName: displayName,
            exerciseId: effectiveId,
            status,
            tags,
          })

          const exObj: ProgramExercise = {
            exerciseId: effectiveId,
            sets: item.sets,
            reps: item.reps ?? item.repsMin ?? 10,
            restSeconds: item.restSeconds ?? 90,
            unit: item.unit,
            repsMin: item.repsMin,
            repsMax: item.repsMax,
            perSide: item.perSide,
            amrap: item.amrap,
            rpe: item.rpe,
            notes: item.notesAr,
            section: defaultSection,
            customName: item.customName,
            nameEn: item.nameEn,
            needsReview: item.needsReview || resolution.isCustom,
          }

          if (item.targetSubMuscleAr) {
            exObj.targetSubMuscleAr = item.targetSubMuscleAr
          }

          return exObj
        })
      }

      const warmupExercises = processItems(day.warmup, 'warmup')
      const primaryExercises = processItems(day.exercises, 'primary')
      const cooldownExercises = processItems(day.cooldown, 'flexibility_core')
      const pullPrepExercises = processItems(day.pullPrep, 'warmup')
      const controlExercises = processItems(day.controlBlock, 'primary')

      const combinedExercises: ProgramExercise[] = [
        ...warmupExercises,
        ...pullPrepExercises,
        ...primaryExercises,
        ...controlExercises,
        ...cooldownExercises,
      ]

      const programDay: ProgramDay = {
        id: day.id || `day-${dayIdx + 1}`,
        dayIndex: day.dayIndex ?? dayIdx,
        labelAr: dayName,
        focus: day.focus || 'تمارين متنوعة',
        kind: day.kind || 'strength',
        exercises: combinedExercises,
        warmup: warmupExercises,
        pullPrep: pullPrepExercises,
        controlBlock: controlExercises,
        cooldown: cooldownExercises,
        cardio: day.cardio || day.cardioConfig,
        cardioConfig: day.cardio || day.cardioConfig,
      }

      return programDay
    },
  )

  const finalProgram: WorkoutProgram = {
    id: rawProgram.id || `imported-${Date.now()}`,
    createdAt: rawProgram.createdAt || Date.now(),
    title: rawProgram.title,
    primaryGoal: (rawProgram.primaryGoal as Goal) || 'hypertrophy',
    trainingDaysPerWeek:
      rawProgram.trainingDaysPerWeek || normalizedDays.length,
    splitType: (rawProgram.splitType as WorkoutSplitType) || 'custom',
    days: normalizedDays,
    isCustom: true,
  }

  if (limitationConflicts > 0) {
    warnings.push(
      `تنبيه: يحتوي الجدول على ${limitationConflicts} تمريناً يتعارض أو يشكل حملاً على مناطق إصاباتك المسجلة.`,
    )
  }

  return {
    success: true,
    program: finalProgram,
    rawProgram,
    diagnostics,
    errors,
    warnings,
    stats: {
      daysCount: normalizedDays.length,
      totalItems,
      matchedItems,
      customItems,
      limitationConflicts,
    },
  }
}
