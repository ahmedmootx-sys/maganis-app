import {
  useState,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useCallback,
} from 'react'
import type { Exercise } from '../shared/types.ts'
import {
  resolveMuscles,
  type ExerciseMuscleTarget,
  type ResolvedMusclesResult,
} from './muscleResolver.ts'
import { loadAtlasSvg } from './atlasSvgLoader.ts'
import { APPROXIMATE_REGIONS } from './approximateRegions.ts'
import atlasMusclesData from '../../data/atlas_muscles.json'
import atlasGroupsData from '../../data/atlas-groups.json'
import atlasMetaData from '../../../public/atlas/atlas-meta.json' with { type: 'json' }
import catalogData from '../../data/catalog-v1.json' with { type: 'json' }
import { Segmented, Sheet, Callout, Button } from '../../ui/index.ts'
import { IconPlus, IconMinus, IconRefreshCw } from '../../components/Icons.tsx'
import { assetUrl } from '../../utils/assetUrl.ts'
import { Claim } from '../../content/Claim.tsx'
import {
  getMuscleInfo,
  getMuscleGymName,
  getMuscleSciName,
  getMuscleGroup,
  getAllGroups,
} from './muscleNames.ts'
import {
  ANTERIOR_LABELS,
  POSTERIOR_LABELS,
  type AtlasLabel,
} from './atlasLabels.ts'

export interface AnatomyMuscleMapProps {
  exercise?: Partial<Exercise> | (Partial<Exercise> & Record<string, unknown>)
  exerciseId?: string
  exerciseName?: string
  category?: string
  targetMuscles?: string[]
  muscles?: ExerciseMuscleTarget[]
  mapNote?: string
  isFullView?: boolean
}

// Build static fast lookup dictionaries
const MUSCLE_DEFS: Record<string, { id: string; ar: string; en: string }> = {}
for (const m of atlasMusclesData.muscles) {
  MUSCLE_DEFS[m.id] = { id: m.id, ar: m.ar, en: m.en }
}

const MUSCLE_GROUPS: Record<string, string> = {}
for (const g of atlasGroupsData.groups) {
  for (const mId of g.muscles) {
    MUSCLE_GROUPS[mId] = g.ar
  }
}

interface AtlasMetaMuscleInfo {
  best_layer?: string
  visible_ratio?: number
  best_view?: string
  views?: Record<
    string,
    { visible_pixels?: number; anchor?: number[]; visible_ratio?: number }
  >
  [key: string]: unknown
}

const META_MUSCLES = (
  atlasMetaData as unknown as { muscles: Record<string, AtlasMetaMuscleInfo> }
).muscles

interface AtlasViewState {
  view: 'A' | 'P'
  layer: 'surface' | 'deep'
  selectedMuscleId: string | null
  exerciseContext: boolean
}

export function AnatomyMuscleMap({
  exercise,
  exerciseId,
  exerciseName = '',
  category = 'chest',
  targetMuscles = [],
  muscles: explicitMuscles,
  mapNote: _mapNote,
  isFullView: _isFullView = true,
}: AnatomyMuscleMapProps) {
  // Resolve head-level muscle data across 4 strict tiers
  const resolved: ResolvedMusclesResult = useMemo(() => {
    const input = exercise || {
      id: exerciseId,
      name: exerciseName,
      category,
      targetMusclesAr: targetMuscles,
      muscles: explicitMuscles,
    }
    return resolveMuscles(input)
  }, [
    exercise,
    exerciseId,
    exerciseName,
    category,
    targetMuscles,
    explicitMuscles,
  ])

  const hasContext = resolved.muscles.length > 0

  // C1.3: Unified View-State driving view, layer, selection, and context
  const [viewState, setViewState] = useState<AtlasViewState>({
    view: resolved.defaultView,
    layer: 'surface',
    selectedMuscleId: null,
    exerciseContext: hasContext,
  })

  const [svgContent, setSvgContent] = useState<string>('')
  const [svgError, setSvgError] = useState<boolean>(false)
  const [reloadKey, setReloadKey] = useState<number>(0)
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [showLabels, setShowLabels] = useState<boolean>(false)
  const [chipSearch, setChipSearch] = useState<string>('')
  const [showUnpaintedSheet, setShowUnpaintedSheet] = useState<boolean>(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startDragRef = useRef({ x: 0, y: 0 })
  const lastTapRef = useRef<number>(0)
  const touchStartDistRef = useRef<number | null>(null)
  const touchStartZoomRef = useRef<number>(1.0)

  // Synchronize default view if exercise changes
  useEffect(() => {
    setViewState((s) => ({
      ...s,
      view: resolved.defaultView,
      selectedMuscleId: null,
      exerciseContext: resolved.muscles.length > 0,
    }))
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
  }, [resolved.defaultView, resolved.muscles.length])

  // Fetch and cache SVG with error state tracking
  useEffect(() => {
    let isCancelled = false
    setSvgError(false)
    loadAtlasSvg(viewState.view, reloadKey > 0)
      .then((text) => {
        if (!isCancelled) {
          if (text && text.includes('<svg')) {
            setSvgContent(text)
            setSvgError(false)
          } else {
            setSvgError(true)
          }
        }
      })
      .catch(() => {
        if (!isCancelled) setSvgError(true)
      })
    return () => {
      isCancelled = true
    }
  }, [viewState.view, reloadKey])

  // Fast map of resolved active muscles for lookup: muscleId -> role
  const roleMap = useMemo(() => {
    const map = new Map<string, 'primary' | 'secondary'>()
    for (const m of resolved.muscles) {
      map.set(m.id, m.role)
    }
    return map
  }, [resolved.muscles])

  // Deep muscles presence detection
  const hasDeepMuscles = useMemo(() => {
    if (!hasContext) return true
    return resolved.muscles.some((m) => {
      const meta = META_MUSCLES[m.id]
      return (
        meta && (meta.best_layer === 'D' || (meta.visible_ratio ?? 1) < 0.65)
      )
    })
  }, [resolved.muscles, hasContext])

  // Drawn counts in current view and other view, and tracking unpainted muscles
  const {
    currentCounts: _currentCounts,
    unpaintedMuscles,
    unpaintedPrimaries,
    otherCounts,
    anteriorCount,
    posteriorCount,
  } = useMemo(() => {
    const otherView = viewState.view === 'A' ? 'P' : 'A'
    let curPrimary = 0
    let curSecondary = 0
    let otherTotal = 0
    let countA = 0
    let countP = 0
    const unpainted: Array<{ id: string; role: 'primary' | 'secondary' }> = []
    const missingPrimaries: Array<{ id: string; name: string }> = []

    for (const m of resolved.muscles) {
      const approx = APPROXIMATE_REGIONS[m.id]
      const inApproxCur = approx && approx.view === viewState.view
      const inApproxOther = approx && approx.view === otherView
      const inApproxA = approx && approx.view === 'A'
      const inApproxP = approx && approx.view === 'P'

      const meta = META_MUSCLES[m.id]
      const curVis = meta?.views?.[viewState.view]?.visible_pixels ?? 0
      const otherVis = meta?.views?.[otherView]?.visible_pixels ?? 0
      const aVis = meta?.views?.['A']?.visible_pixels ?? 0
      const pVis = meta?.views?.['P']?.visible_pixels ?? 0

      const inMeshCur =
        meta?.best_view === viewState.view ||
        (curVis > 500 &&
          (meta?.views?.[viewState.view]?.visible_ratio ?? 0) >= 0.1)
      const inMeshOther =
        meta?.best_view === otherView ||
        (otherVis > 500 &&
          (meta?.views?.[otherView]?.visible_ratio ?? 0) >= 0.1)
      const inMeshA =
        meta?.best_view === 'A' ||
        (aVis > 500 && (meta?.views?.['A']?.visible_ratio ?? 0) >= 0.1)
      const inMeshP =
        meta?.best_view === 'P' ||
        (pVis > 500 && (meta?.views?.['P']?.visible_ratio ?? 0) >= 0.1)

      const isDrawnCur = inApproxCur || inMeshCur
      const isDrawnOther = inApproxOther || inMeshOther
      const isDrawnA = inApproxA || inMeshA
      const isDrawnP = inApproxP || inMeshP

      if (isDrawnA) countA++
      if (isDrawnP) countP++

      if (isDrawnCur) {
        if (m.role === 'primary') curPrimary++
        else curSecondary++
      }

      if (isDrawnOther && !isDrawnCur) {
        otherTotal++
      }

      if (!isDrawnA && !isDrawnP) {
        unpainted.push({ id: m.id, role: m.role })
        if (m.role === 'primary') {
          missingPrimaries.push({
            id: m.id,
            name: MUSCLE_DEFS[m.id]?.ar || m.id,
          })
        }
      }
    }

    return {
      currentCounts: { primary: curPrimary, secondary: curSecondary },
      unpaintedMuscles: unpainted,
      unpaintedPrimaries: missingPrimaries,
      otherCounts: otherTotal,
      anteriorCount: countA,
      posteriorCount: countP,
    }
  }, [resolved.muscles, viewState.view])

  // Center of highlighted muscles' union bounding box for natural zoom origin
  const zoomOrigin = useMemo(() => {
    const anchors: Array<[number, number]> = []
    for (const m of resolved.muscles) {
      const approx = APPROXIMATE_REGIONS[m.id]
      if (approx && approx.view === viewState.view) {
        anchors.push(approx.anchor)
        continue
      }
      const meta = META_MUSCLES[m.id]
      const a =
        meta?.views?.[viewState.view]?.anchor ||
        (meta as { anchors?: Record<string, number[]> } | undefined)?.anchors?.[
          viewState.view
        ]
      if (a && Array.isArray(a) && a.length === 2) {
        anchors.push(a as [number, number])
      }
    }

    if (anchors.length === 0) {
      return { x: 50, y: 50 }
    }

    let minX = Infinity,
      maxX = -Infinity,
      minY = Infinity,
      maxY = -Infinity
    for (const [x, y] of anchors) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    const midX = (minX + maxX) / 2
    const midY = (minY + maxY) / 2
    return {
      x: +((midX / 1024) * 100).toFixed(1),
      y: +((midY / 2048) * 100).toFixed(1),
    }
  }, [resolved.muscles, viewState.view])

  // Memoize SVG HTML container object to prevent DOM wipes on re-render
  const svgHtml = useMemo(() => ({ __html: svgContent }), [svgContent])

  // Relevant exercises list for the selected muscle
  const relevantExercises = useMemo(() => {
    if (!viewState.selectedMuscleId) return []
    const exercises = (catalogData as { exercises?: Array<{
      key?: string
      name_ar?: string
      name_en?: string
      muscles?: Array<{ id: string; role: 'primary' | 'secondary' }>
    }> }).exercises || []

    const matches: Array<{
      key: string
      name_ar: string
      name_en: string
      role: 'primary' | 'secondary'
    }> = []

    for (const ex of exercises) {
      const found = ex.muscles?.find((m) => m.id === viewState.selectedMuscleId)
      if (found) {
        matches.push({
          key: ex.key || ex.name_en || '',
          name_ar: ex.name_ar || '',
          name_en: ex.name_en || '',
          role: found.role,
        })
      }
    }
    return matches
  }, [viewState.selectedMuscleId])

  // Declarative imperative-hybrid highlight and layer application
  const applyHighlights = useCallback(() => {
    if (!containerRef.current) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return

    svgEl.setAttribute('aria-hidden', 'true')

    const isDeepMode = viewState.layer === 'deep'
    const currentView = viewState.view
    const selectedId = viewState.selectedMuscleId

    // Find all muscle paths
    const visPaths = svgEl.querySelectorAll('.muscle-vis')
    const fullPaths = svgEl.querySelectorAll('.muscle-full')
    const hitCircles = svgEl.querySelectorAll('.muscle-hit-target')

    visPaths.forEach((path) => {
      const muscleId = path.getAttribute('data-muscle')
      if (!muscleId) return
      const role = roleMap.get(muscleId)
      const meta = META_MUSCLES[muscleId]
      const approx = APPROXIMATE_REGIONS[muscleId]

      const visibleInView = approx
        ? approx.view === currentView
        : meta?.best_view === currentView ||
          (meta?.views?.[currentView]?.visible_pixels ?? 0) > 200

      if (!visibleInView) {
        ;(path as SVGElement).style.display = 'none'
        return
      } else {
        ;(path as SVGElement).style.display = ''
      }

      path.classList.remove(
        'muscle-primary',
        'muscle-secondary',
        'muscle-neutral',
        'muscle-surface',
        'muscle-context-involved',
        'muscle-targeted-highlight',
      )

      path.classList.add('muscle-surface')

      if (role === 'primary') {
        path.classList.add('muscle-primary')
      } else if (role === 'secondary') {
        path.classList.add('muscle-secondary')
      } else {
        path.classList.add('muscle-neutral')
      }

      if (isDeepMode && role) {
        path.classList.add('muscle-context-involved')
      }

      if (selectedId === muscleId) {
        path.classList.add('muscle-targeted-highlight')
      }
    })

    fullPaths.forEach((path) => {
      const muscleId = path.getAttribute('data-muscle')
      if (!muscleId) return
      const role = roleMap.get(muscleId)
      const meta = META_MUSCLES[muscleId]
      const isDeep = meta?.best_layer === 'D'

      const approx = APPROXIMATE_REGIONS[muscleId]
      const visibleInView = approx
        ? approx.view === currentView
        : meta?.best_view === currentView ||
          (meta?.views?.[currentView]?.visible_pixels ?? 0) > 200

      path.classList.remove(
        'muscle-deep',
        'muscle-primary',
        'muscle-secondary',
        'muscle-neutral',
        'muscle-targeted-highlight',
      )

      if (isDeepMode && isDeep && visibleInView) {
        path.classList.add('muscle-deep')
        if (role === 'primary') path.classList.add('muscle-primary')
        else if (role === 'secondary') path.classList.add('muscle-secondary')
        else path.classList.add('muscle-neutral')

        if (selectedId === muscleId) {
          path.classList.add('muscle-targeted-highlight')
        }
      }
    })

    hitCircles.forEach((circle) => {
      const muscleId = circle.getAttribute('data-muscle')
      if (selectedId === muscleId) {
        circle.classList.add('muscle-targeted-highlight')
      } else {
        circle.classList.remove('muscle-targeted-highlight')
      }
    })
  }, [roleMap, viewState])

  // Apply highlights synchronously before paint on every commit
  useLayoutEffect(() => {
    applyHighlights()
  })

  // Select muscle and shift viewBox so it remains visible above bottom sheet (C1.2)
  const selectMuscleWithOcclusionShift = useCallback(
    (muscleId: string) => {
      setViewState((s) => ({ ...s, selectedMuscleId: muscleId }))

      const meta = META_MUSCLES[muscleId]
      const anchor =
        meta?.views?.[viewState.view]?.anchor ||
        (meta as { anchors?: Record<string, number[]> } | undefined)?.anchors?.[
          viewState.view
        ]

      if (anchor && Array.isArray(anchor) && anchor.length === 2) {
        // In 1024x2048 viewBox, muscles with Y > 650 would be occluded by the 340px sheet.
        // Shift pan.y upward proportionally so the muscle stays in the upper visible area.
        if (anchor[1] > 650) {
          const shiftY = -Math.min(130, Math.round(((anchor[1] - 650) / 1400) * 135))
          setPan((p) => ({ ...p, y: shiftY }))
        }
      }
    },
    [viewState.view],
  )

  // Handle click on SVG: select muscle or clear selection on background tap
  const handleSvgClick = useCallback(
    (e: React.MouseEvent) => {
      const target = e.target as SVGElement
      const muscleId = target.getAttribute?.('data-muscle')

      if (muscleId && (MUSCLE_DEFS[muscleId] || getMuscleInfo(muscleId))) {
        selectMuscleWithOcclusionShift(muscleId)
      } else {
        // Tap on empty space clears selection (C1.2)
        setViewState((s) => ({ ...s, selectedMuscleId: null }))
      }
    },
    [selectMuscleWithOcclusionShift],
  )

  // Double-tap zoom (1x -> 2x -> 3x -> 1x) with natural reset
  const handleContainerClick = useCallback((_e: React.MouseEvent) => {
    const now = Date.now()
    if (now - lastTapRef.current < 280) {
      setZoom((z) => (z === 1.0 ? 2.0 : z === 2.0 ? 3.0 : 1.0))
      if (zoom >= 2.0) {
        setPan({ x: 0, y: 0 })
      }
    }
    lastTapRef.current = now
  }, [zoom])

  // Zoom controls
  function handleZoomIn() {
    setZoom((z) => Math.min(3.0, +(z + 0.5).toFixed(1)))
  }

  function handleZoomOut() {
    setZoom((z) => {
      const next = Math.max(1.0, +(z - 0.5).toFixed(1))
      if (next === 1.0) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handleReset() {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    setViewState((s) => ({ ...s, selectedMuscleId: null }))
  }

  // Pointer drag & pan with boundary constraints
  function handlePointerDown(e: React.PointerEvent) {
    if (zoom <= 1.0) return
    isDraggingRef.current = true
    startDragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current || zoom <= 1.0) return
    const maxPanX = (zoom - 1) * 160
    const maxPanY = (zoom - 1) * 240
    const nextX = Math.max(
      -maxPanX,
      Math.min(maxPanX, e.clientX - startDragRef.current.x),
    )
    const nextY = Math.max(
      -maxPanY,
      Math.min(maxPanY, e.clientY - startDragRef.current.y),
    )
    setPan({ x: nextX, y: nextY })
  }

  function handlePointerUp() {
    isDraggingRef.current = false
  }

  // Multi-touch pinch zoom
  function handleTouchStart(e: React.TouchEvent) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      touchStartDistRef.current = Math.hypot(dx, dy)
      touchStartZoomRef.current = zoom
    }
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (e.touches.length === 2 && touchStartDistRef.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const currentDist = Math.hypot(dx, dy)
      const scale = currentDist / touchStartDistRef.current
      const nextZoom = Math.max(1.0, Math.min(3.0, +(touchStartZoomRef.current * scale).toFixed(2)))
      setZoom(nextZoom)
    }
  }

  function handleTouchEnd() {
    touchStartDistRef.current = null
  }

  // Row / chip selection
  function handleSelectMuscle(mId: string) {
    const meta = META_MUSCLES[mId]
    if (
      meta &&
      (meta.best_view === 'A' || meta.best_view === 'P') &&
      meta.best_view !== viewState.view
    ) {
      setViewState((s) => ({ ...s, view: meta.best_view as 'A' | 'P' }))
    }
    selectMuscleWithOcclusionShift(mId)
  }

  // Leader line labels to render
  const activeLabels: AtlasLabel[] = showLabels
    ? viewState.view === 'A'
      ? ANTERIOR_LABELS
      : POSTERIOR_LABELS
    : []

  // All groups and filtered muscles for the chip list under figure
  const allGroups = useMemo(() => getAllGroups(), [])
  const filteredMuscles = useMemo(() => {
    const q = chipSearch.trim().toLowerCase()
    const muscles = atlasMusclesData.muscles
    if (!q) return muscles
    return muscles.filter((m) => {
      const info = getMuscleInfo(m.id)
      if (m.ar.toLowerCase().includes(q)) return true
      if (m.en.toLowerCase().includes(q)) return true
      if (info?.gym_ar.toLowerCase().includes(q)) return true
      if (info?.short_ar.toLowerCase().includes(q)) return true
      if (info?.sci_en.toLowerCase().includes(q)) return true
      if (info?.gym_ar_alt?.some((alt) => alt.toLowerCase().includes(q))) return true
      return false
    })
  }, [chipSearch])

  // If Tier 4: Render names only with fallback note
  if (resolved.tier === 4) {
    return (
      <div className="atlas-wrapper" dir="rtl">
        <div
          className="atlas-container"
          style={{
            flexDirection: 'column',
            gap: '12px',
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            {resolved.note || 'لا توجد خريطة تفصيلية لهذا التمرين بعد'}
          </div>
          {resolved.namesOnly && resolved.namesOnly.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
                justifyContent: 'center',
              }}
            >
              {resolved.namesOnly.map((name, i) => (
                <span
                  key={i}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                    fontSize: '13px',
                  }}
                >
                  {name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  const shadeSrc = assetUrl(
    `atlas/shade-${viewState.view === 'A' ? 'anterior' : 'posterior'}.webp`,
  )
  const isDeep = viewState.layer === 'deep'
  const selectedInfo = viewState.selectedMuscleId
    ? getMuscleInfo(viewState.selectedMuscleId)
    : null
  const sheetMuscleDef = viewState.selectedMuscleId
    ? MUSCLE_DEFS[viewState.selectedMuscleId]
    : null
  const selectedGroup = selectedInfo?.group
    ? getMuscleGroup(selectedInfo.group)
    : null
  const groupName = selectedGroup?.gym_ar || (selectedInfo?.group ? MUSCLE_GROUPS[viewState.selectedMuscleId || ''] : '')

  return (
    <div
      className={`atlas-wrapper ${viewState.selectedMuscleId ? 'atlas-has-selection' : ''}`}
      dir="rtl"
    >
      {/* 1. Toolbar: Segmented View Switch, Deep Toggle, and Labels Button */}
      <div className="atlas-toolbar">
        <div style={{ width: '210px' }}>
          <Segmented
            options={[
              {
                value: 'A',
                label: anteriorCount > 0 ? `أمامي (${anteriorCount})` : 'أمامي',
              },
              {
                value: 'P',
                label: posteriorCount > 0 ? `خلفي (${posteriorCount})` : 'خلفي',
              },
            ]}
            value={viewState.view}
            onChange={(v) => {
              setViewState((s) => ({
                ...s,
                view: v as 'A' | 'P',
                selectedMuscleId: null,
              }))
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Labels Toggle Button (C1.1: default OFF) */}
          <button
            type="button"
            className={`chip ${showLabels ? 'chip--active' : ''}`}
            onClick={() => setShowLabels(!showLabels)}
            aria-pressed={showLabels}
            title="الأسماء"
            style={{
              cursor: 'pointer',
              border: showLabels
                ? '1.5px solid var(--color-accent)'
                : '1px solid var(--color-divider)',
              background: showLabels
                ? 'var(--color-surface-2)'
                : 'var(--color-surface)',
              color: showLabels
                ? 'var(--color-accent-text)'
                : 'var(--color-text-2)',
              fontWeight: showLabels ? 700 : 500,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            الأسماء
          </button>

          {/* Deep Muscle Toggle (C1.3) */}
          {hasDeepMuscles && (
            <button
              type="button"
              role="checkbox"
              aria-checked={isDeep}
              className={`chip ${isDeep ? 'chip--active' : ''}`}
              onClick={() =>
                setViewState((s) => ({
                  ...s,
                  layer: s.layer === 'deep' ? 'surface' : 'deep',
                  selectedMuscleId: null,
                }))
              }
              style={{
                cursor: 'pointer',
                border: isDeep
                  ? '1.5px solid var(--color-accent)'
                  : '1px solid var(--color-divider)',
                background: isDeep
                  ? 'var(--color-surface-2)'
                  : 'var(--color-surface)',
                color: isDeep
                  ? 'var(--color-accent-text)'
                  : 'var(--color-text-2)',
                fontWeight: isDeep ? 700 : 500,
                padding: '6px 12px',
                borderRadius: 'var(--radius-full)',
              }}
            >
              إظهار العضلات العميقة
            </button>
          )}
        </div>
      </div>

      {/* Unpainted Primary Muscles Callout (Honest Anatomy Feedback) */}
      {unpaintedPrimaries.length > 0 && (
        <div style={{ margin: '6px 0' }}>
          <Callout variant="warning">
            العضلة الأساسية ({unpaintedPrimaries.map((p) => p.name).join('، ')})
            غير مرسومة في الخريطة الحالية
          </Callout>
        </div>
      )}

      {/* Error Callout with Retry */}
      {svgError && (
        <div style={{ margin: '6px 0' }}>
          <Callout
            variant="warning"
            title="تعذر تحميل الخريطة التشريحية"
            action={{
              label: 'إعادة المحاولة',
              onClick: () => setReloadKey((k) => k + 1),
            }}
          >
            تعذر جلب ملف الرسم التشريحي من الخادم. تأكد من اتصال الإنترنت أو
            إعدادات المسار، مع إمكانية استعراض قائمة العضلات أدناه.
          </Callout>
        </div>
      )}

      {/* 2. Interactive Atlas Stage */}
      <div
        className={`atlas-container ${isDeep ? 'atlas-deep-mode' : 'atlas-surface-mode'} ${hasContext ? 'atlas-has-context' : 'atlas-no-context'}`}
        ref={containerRef}
        onClick={handleContainerClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: zoom > 1.0 ? 'grab' : 'default' }}
      >
        <div
          className="atlas-viewport"
          style={{
            transformOrigin: `${zoomOrigin.x}% ${zoomOrigin.y}%`,
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {/* Multiply Shade WebP Layer (hidden in deep mode) */}
          <img
            src={shadeSrc}
            alt=""
            aria-hidden="true"
            className="atlas-shade-layer"
            loading="eager"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />

          {/* Inline SVG Layer */}
          <div
            className="atlas-svg-container"
            onClick={handleSvgClick}
            dangerouslySetInnerHTML={svgHtml}
          />

          {/* Leader-line labels overlay (C1.1) */}
          {showLabels && activeLabels.length > 0 && (
            <svg
              className="atlas-labels-layer"
              viewBox="0 0 1024 2048"
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                zIndex: 6,
                pointerEvents: 'none',
              }}
              aria-hidden="true"
            >
              {activeLabels.map((lbl) => (
                <g key={lbl.id} className="atlas-label-group">
                  {/* Leader line from muscle anchor to label lineEnd */}
                  <line
                    x1={lbl.anchor[0]}
                    y1={lbl.anchor[1]}
                    x2={lbl.lineEnd[0]}
                    y2={lbl.lineEnd[1]}
                    stroke="var(--atlas-line)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Anchor point circle */}
                  <circle
                    cx={lbl.anchor[0]}
                    cy={lbl.anchor[1]}
                    r="4"
                    fill="var(--color-accent)"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Label card box */}
                  <rect
                    x={lbl.box[0]}
                    y={lbl.box[1]}
                    width={lbl.box[2]}
                    height={lbl.box[3]}
                    rx="8"
                    fill="var(--color-surface)"
                    stroke="var(--color-divider)"
                    strokeWidth="1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                  {/* Gym name text */}
                  <text
                    x={lbl.box[0] + lbl.box[2] / 2}
                    y={lbl.box[1] + lbl.box[3] / 2 + 5}
                    textAnchor="middle"
                    fill="var(--color-text)"
                    fontSize="17"
                    fontWeight="600"
                    fontFamily="inherit"
                  >
                    {lbl.gym_ar}
                  </text>
                </g>
              ))}
            </svg>
          )}

          {/* Approximate Polygon Overlay Layer for muscles absent in BP3D 4.0 */}
          <svg
            className="atlas-approx-layer"
            viewBox="0 0 1024 2048"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex: 4,
              pointerEvents: 'auto',
            }}
            aria-hidden="true"
          >
            {resolved.muscles.map((m) => {
              const approx = APPROXIMATE_REGIONS[m.id]
              if (!approx || approx.view !== viewState.view) return null
              const isPrimary = m.role === 'primary'
              const isSelected = viewState.selectedMuscleId === m.id
              return (
                <path
                  key={m.id}
                  d={approx.path}
                  data-muscle={m.id}
                  onClick={handleSvgClick}
                  className={`muscle-vis ${isPrimary ? 'muscle-primary' : 'muscle-secondary'} muscle-approximate ${isSelected ? 'muscle-targeted-highlight' : ''}`}
                  fill={
                    isPrimary
                      ? 'rgba(229, 57, 53, 0.45)'
                      : 'rgba(253, 216, 53, 0.45)'
                  }
                  stroke={isPrimary ? '#b71c1c' : '#f9a825'}
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
              )
            })}
          </svg>
        </div>

        {/* Zoom Controls Overlay with Reset Always Available (E1) */}
        <div className="atlas-zoom-controls">
          <button
            type="button"
            className="atlas-zoom-btn"
            onClick={handleZoomIn}
            aria-label="تكبير"
            title="تكبير"
          >
            <IconPlus size={18} />
          </button>
          <button
            type="button"
            className="atlas-zoom-btn"
            onClick={handleZoomOut}
            aria-label="تصغير"
            title="تصغير"
          >
            <IconMinus size={18} />
          </button>
          <button
            type="button"
            className="atlas-zoom-btn"
            onClick={handleReset}
            aria-label="إعادة الضبط"
            title="رجوع للحجم الأصلي"
          >
            <IconRefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* 3. Action bar & Legend */}
      <div className="atlas-status-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {unpaintedMuscles.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowUnpaintedSheet(true)}
              style={{
                fontSize: '12px',
                height: '32px',
                padding: '0 10px',
              }}
            >
              <span>{unpaintedMuscles.length} عضلات غير مرسومة في الأطلس</span>
            </Button>
          )}

          {otherCounts > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="atlas-view-switch-btn"
              onClick={() => {
                setViewState((s) => ({
                  ...s,
                  view: s.view === 'A' ? 'P' : 'A',
                  selectedMuscleId: null,
                }))
              }}
              style={{
                fontSize: '12px',
                height: '32px',
                padding: '0 8px',
                color: 'var(--color-accent-text)',
                fontWeight: 600,
              }}
            >
              <span>
                عرض {viewState.view === 'A' ? 'الخلفي' : 'الأمامي'}
              </span>
              <span
                style={{
                  background: 'var(--color-surface-2)',
                  padding: '1px 6px',
                  borderRadius: 'var(--radius-full)',
                  marginInlineStart: '4px',
                  fontSize: '11px',
                  fontWeight: 700,
                }}
              >
                {otherCounts}
              </span>
            </Button>
          )}
        </div>

        <div className="atlas-legend">
          <div className="atlas-legend-item">
            <span className="role-marker role-marker--primary" />
            <span>أساسية</span>
          </div>
          <div className="atlas-legend-item">
            <span className="role-marker role-marker--secondary" />
            <span>مساعدة</span>
          </div>
          <div className="atlas-legend-item">
            <span className="role-marker role-marker--approx" />
            <span>تقريبي</span>
          </div>
        </div>
      </div>

      {/* 4. Chip List Under the Figure ("العضلات في المنظر ده" - C1.2) */}
      <div className="atlas-chips-section" style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--color-text)' }}>
            العضلات في المنظر ده ({filteredMuscles.length})
          </div>
          <input
            type="search"
            value={chipSearch}
            onChange={(e) => setChipSearch(e.target.value)}
            placeholder="ابحث عن عضلة..."
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-divider)',
              background: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: '13px',
              maxWidth: '200px',
            }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allGroups.map((group) => {
            const groupMuscles = filteredMuscles.filter((m) => {
              const info = getMuscleInfo(m.id)
              return info?.group === group.id
            })
            if (groupMuscles.length === 0) return null

            return (
              <div key={group.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ fontSize: '12.5px', fontWeight: 600, color: 'var(--color-text-2)' }}>
                  {group.gym_ar}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {groupMuscles.map((m) => {
                    const info = getMuscleInfo(m.id)
                    const role = roleMap.get(m.id)
                    const isSelected = viewState.selectedMuscleId === m.id
                    const isNoMesh = info?.atlas === 'no_mesh'

                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleSelectMuscle(m.id)}
                        className={`chip ${isSelected ? 'chip--active' : ''}`}
                        style={{
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '5px 10px',
                          borderRadius: 'var(--radius-full)',
                          border: isSelected
                            ? '1.5px solid var(--color-accent)'
                            : role === 'primary'
                              ? '1.5px solid var(--atlas-primary)'
                              : role === 'secondary'
                                ? '1.5px solid var(--atlas-secondary)'
                                : '1px solid var(--color-divider)',
                          background: isSelected
                            ? 'var(--color-surface-2)'
                            : 'var(--color-surface)',
                          color: 'var(--color-text)',
                          fontSize: '12.5px',
                        }}
                      >
                        {role === 'primary' && (
                          <span className="role-marker role-marker--primary" />
                        )}
                        {role === 'secondary' && (
                          <span className="role-marker role-marker--secondary" />
                        )}
                        <span>{info?.short_ar || m.ar}</span>
                        {isNoMesh && (
                          <span
                            style={{
                              fontSize: '10px',
                              color: 'var(--color-text-2)',
                              background: 'var(--color-surface-2)',
                              padding: '1px 5px',
                              borderRadius: '4px',
                            }}
                          >
                            مفيش رسم للعضلة دي
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 5. Attribution Credit */}
      <div className="atlas-attribution" style={{ marginTop: '12px' }}>
        BodyParts3D, © The Database Center for Life Science licensed under CC
        Attribution 4.0 International
      </div>

      {/* 6. Muscle Detail Card Bottom Sheet (C1.2) */}
      <Sheet
        isOpen={!!viewState.selectedMuscleId}
        onClose={() => setViewState((s) => ({ ...s, selectedMuscleId: null }))}
        title={
          selectedInfo?.gym_ar ||
          (viewState.selectedMuscleId
            ? getMuscleGymName(viewState.selectedMuscleId, sheetMuscleDef?.ar)
            : 'تفاصيل العضلة')
        }
      >
        {viewState.selectedMuscleId && (
          <div
            className="atlas-detail-card"
            dir="rtl"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              paddingBottom: '20px',
            }}
          >
            {/* 1. Primary Line: Gym name */}
            <div
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: 'var(--color-text)',
              }}
            >
              {selectedInfo?.gym_ar ||
                getMuscleGymName(
                  viewState.selectedMuscleId,
                  sheetMuscleDef?.ar,
                )}
            </div>

            {/* 2. Secondary Line: Scientific English name in <bdi dir="ltr"> */}
            <div style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>
              <bdi dir="ltr">
                {selectedInfo?.sci_en ||
                  getMuscleSciName(viewState.selectedMuscleId) ||
                  sheetMuscleDef?.en}
              </bdi>
            </div>

            {/* 3. Where it is (where_ar) */}
            {selectedInfo?.where_ar && (
              <div
                style={{
                  fontSize: '13.5px',
                  lineHeight: 1.5,
                  color: 'var(--color-text)',
                  background: 'var(--color-surface-2)',
                  padding: '10px 14px',
                  borderRadius: 'var(--radius-control)',
                }}
              >
                <strong>الموقع: </strong>
                <span>{selectedInfo.where_ar}</span>
              </div>
            )}

            {/* 4. What it does (does_ar via <Claim id={`muscle_does.${id}`} status="coach_authored">) */}
            <div
              style={{
                fontSize: '13.5px',
                lineHeight: 1.6,
                color: 'var(--color-text)',
                background: 'var(--color-surface-2)',
                padding: '10px 14px',
                borderRadius: 'var(--radius-control)',
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: '4px' }}>
                وظيفتها الحركية:
              </div>
              <Claim id={`muscle_does.${viewState.selectedMuscleId}`} />
            </div>

            {/* 5. Group Name */}
            {groupName && (
              <div style={{ fontSize: '13px', color: 'var(--color-text-2)' }}>
                <span>المجموعة العضلية: </span>
                <span style={{ fontWeight: 600, color: 'var(--color-text)' }}>
                  {groupName}
                </span>
              </div>
            )}

            {/* 6. Note "الرسم تقريبي" when derived_approx */}
            {selectedInfo?.atlas === 'derived_approx' && (
              <div
                style={{
                  fontSize: '12.5px',
                  color: 'var(--color-warning)',
                  background: 'var(--color-warning-bg)',
                  border: '1px solid var(--color-warning-border)',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-control)',
                  lineHeight: 1.5,
                }}
              >
                <strong>الرسم تقريبي: </strong>
                <span>
                  {selectedInfo.note_ar ||
                    'تمثيل هندسي تقريبي في الأطلس التشريحي'}
                </span>
              </div>
            )}

            {/* 7. Exercises activating this muscle ("تمارين بتشغّل العضلة دي") */}
            {relevantExercises.length > 0 && (
              <div style={{ marginTop: '6px' }}>
                <div
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: 'var(--color-text)',
                  }}
                >
                  تمارين بتشغّل العضلة دي:
                </div>
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  {relevantExercises.map((ex) => (
                    <div
                      key={ex.key}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        background: 'var(--color-surface-2)',
                        borderRadius: 'var(--radius-control)',
                        fontSize: '13px',
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{ex.name_ar}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          padding: '2px 8px',
                          borderRadius: 'var(--radius-full)',
                          background:
                            ex.role === 'primary'
                              ? 'rgba(229, 57, 53, 0.15)'
                              : 'rgba(253, 216, 53, 0.2)',
                          color:
                            ex.role === 'primary'
                              ? 'var(--atlas-primary)'
                              : 'var(--color-warning)',
                          fontWeight: 600,
                        }}
                      >
                        {ex.role === 'primary' ? 'أساسية' : 'مساعدة'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </Sheet>

      {/* 7. Unpainted in Atlas Muscle Sheet */}
      <Sheet
        isOpen={showUnpaintedSheet}
        onClose={() => setShowUnpaintedSheet(false)}
        title="عضلات غير مرسومة في الأطلس"
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            paddingBottom: '16px',
          }}
          dir="rtl"
        >
          <p
            style={{
              margin: 0,
              fontSize: '13.5px',
              color: 'var(--color-text-2)',
              lineHeight: 1.5,
            }}
          >
            هذه العضلات مستهدفة في التمرين ولكن لا توجد لها طبقة مجسمة مرسومة
            حالياً في خريطة الأطلس:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {unpaintedMuscles.map(({ id, role }) => {
              const def = MUSCLE_DEFS[id]
              const info = getMuscleInfo(id)
              return (
                <div
                  key={id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    padding: '10px 12px',
                    background: 'var(--color-surface-2)',
                    borderRadius: 'var(--radius-control)',
                    border: '1px solid var(--color-divider)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: '6px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                    >
                      <span
                        className={`role-marker ${role === 'primary' ? 'role-marker--primary' : 'role-marker--secondary'}`}
                      />
                      <strong style={{ fontSize: '14px' }}>
                        {getMuscleGymName(id, def?.ar)}
                      </strong>
                    </div>
                    <span
                      style={{ fontSize: '11px', color: 'var(--color-text-2)' }}
                    >
                      <bdi dir="ltr">{getMuscleSciName(id) || def?.en}</bdi>
                    </span>
                  </div>
                  {info?.note_ar && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        lineHeight: 1.4,
                      }}
                    >
                      {info.note_ar}
                    </div>
                  )}
                  {info?.where_ar && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: 'var(--color-text-2)',
                        lineHeight: 1.4,
                      }}
                    >
                      الموضع: {info.where_ar}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </Sheet>
    </div>
  )
}
