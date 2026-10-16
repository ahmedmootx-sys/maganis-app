import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import type { Exercise } from '../shared/types.ts'
import {
  resolveMuscles,
  type ExerciseMuscleTarget,
  type ResolvedMusclesResult,
} from './muscleResolver.ts'
import { loadAtlasSvg } from './atlasSvgLoader.ts'
import atlasMusclesData from '../../data/atlas_muscles.json'
import atlasGroupsData from '../../data/atlas-groups.json'
import atlasMetaData from '../../../public/atlas/atlas-meta.json'
import { Segmented, Sheet, Callout } from '../../ui/index.ts'
import { assetUrl } from '../../utils/assetUrl.ts'
import { fmtMuscles } from '../../utils/bidi.ts'

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

export function AnatomyMuscleMap({
  exercise,
  exerciseId,
  exerciseName = '',
  category = 'chest',
  targetMuscles = [],
  muscles: explicitMuscles,
  mapNote,
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

  // Active view: 'A' (أمامي) | 'P' (خلفي)
  // Auto-selected initially based on weighted presence
  const [view, setView] = useState<'A' | 'P'>(resolved.defaultView)
  const [svgContent, setSvgContent] = useState<string>('')
  const [svgError, setSvgError] = useState<boolean>(false)
  const [reloadKey, setReloadKey] = useState<number>(0)
  const [showDeep, setShowDeep] = useState(false)
  const [zoom, setZoom] = useState(1.0)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null)
  const [sheetMuscleId, setSheetMuscleId] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const isDraggingRef = useRef(false)
  const startDragRef = useRef({ x: 0, y: 0 })

  // Synchronize default view if exercise changes
  useEffect(() => {
    setView(resolved.defaultView)
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    setSelectedMuscleId(null)
  }, [resolved.defaultView])

  // Fetch and cache SVG with error state tracking
  useEffect(() => {
    let isCancelled = false
    setSvgError(false)
    loadAtlasSvg(view, reloadKey > 0)
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
  }, [view, reloadKey])

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
    return resolved.muscles.some((m) => {
      const meta = META_MUSCLES[m.id]
      return (
        meta && (meta.best_layer === 'D' || (meta.visible_ratio ?? 1) < 0.65)
      )
    })
  }, [resolved.muscles])

  // Counts in current view and other view
  const { currentCounts, otherCounts } = useMemo(() => {
    const otherView = view === 'A' ? 'P' : 'A'
    let curPrimary = 0
    let curSecondary = 0
    let otherTotal = 0

    for (const m of resolved.muscles) {
      const meta = META_MUSCLES[m.id]
      const curVis = meta?.views?.[view]?.visible_pixels ?? 0
      const otherVis = meta?.views?.[otherView]?.visible_pixels ?? 0
      const inCurrent =
        meta?.best_view === view ||
        (curVis > 500 && (meta?.views?.[view]?.visible_ratio ?? 0) >= 0.1)
      const inOther =
        meta?.best_view === otherView ||
        (otherVis > 500 &&
          (meta?.views?.[otherView]?.visible_ratio ?? 0) >= 0.1)

      if (inCurrent) {
        if (m.role === 'primary') curPrimary++
        else curSecondary++
      }
      if (inOther && !inCurrent) {
        otherTotal++
      }
    }

    return {
      currentCounts: { primary: curPrimary, secondary: curSecondary },
      otherCounts: otherTotal,
    }
  }, [resolved.muscles, view])

  // Grouped active muscles for accessible list under figure
  const { primaryList, secondaryList } = useMemo(() => {
    const primary: Array<{
      id: string
      def: { id: string; ar: string; en: string }
      group: string
    }> = []
    const secondary: Array<{
      id: string
      def: { id: string; ar: string; en: string }
      group: string
    }> = []

    for (const m of resolved.muscles) {
      const def = MUSCLE_DEFS[m.id] || { id: m.id, ar: m.id, en: m.id }
      const group = MUSCLE_GROUPS[m.id] || ''
      if (m.role === 'primary') {
        primary.push({ id: m.id, def, group })
      } else {
        secondary.push({ id: m.id, def, group })
      }
    }

    return { primaryList: primary, secondaryList: secondary }
  }, [resolved.muscles])

  // Manipulate SVG DOM nodes when svgContent, highlights, showDeep, or selection change
  useEffect(() => {
    if (!containerRef.current) return
    const svgEl = containerRef.current.querySelector('svg')
    if (!svgEl) return

    svgEl.setAttribute('aria-hidden', 'true')

    // Find all muscle paths
    const visPaths = svgEl.querySelectorAll('.muscle-vis')
    const fullPaths = svgEl.querySelectorAll('.muscle-full')

    visPaths.forEach((path) => {
      const muscleId = path.getAttribute('data-muscle')
      if (!muscleId) return
      const role = roleMap.get(muscleId)

      path.classList.remove(
        'muscle-primary',
        'muscle-secondary',
        'muscle-neutral',
        'muscle-superficial-dimmed',
        'muscle-targeted-highlight',
      )

      if (role === 'primary') {
        path.classList.add('muscle-primary')
      } else if (role === 'secondary') {
        path.classList.add('muscle-secondary')
      } else {
        path.classList.add('muscle-neutral')
      }

      if (showDeep && (!role || META_MUSCLES[muscleId]?.best_layer === 'S')) {
        path.classList.add('muscle-superficial-dimmed')
      }

      if (selectedMuscleId === muscleId) {
        path.classList.add('muscle-targeted-highlight')
      }
    })

    fullPaths.forEach((path) => {
      const muscleId = path.getAttribute('data-muscle')
      if (!muscleId) return
      const role = roleMap.get(muscleId)
      const isDeep = META_MUSCLES[muscleId]?.best_layer === 'D'

      path.classList.remove(
        'muscle-full-active',
        'muscle-primary',
        'muscle-secondary',
        'muscle-targeted-highlight',
      )

      if (showDeep && role && isDeep) {
        path.classList.add('muscle-full-active')
        if (role === 'primary') path.classList.add('muscle-primary')
        else path.classList.add('muscle-secondary')

        if (selectedMuscleId === muscleId) {
          path.classList.add('muscle-targeted-highlight')
        }
      }
    })
  }, [svgContent, roleMap, showDeep, selectedMuscleId])

  // Handle click on SVG to open sheet
  const handleSvgClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as SVGElement
    const muscleId = target.getAttribute?.('data-muscle')
    if (muscleId && MUSCLE_DEFS[muscleId]) {
      setSelectedMuscleId(muscleId)
      setSheetMuscleId(muscleId)
    }
  }, [])

  // Zoom controls
  function handleZoomIn() {
    setZoom((z) => Math.min(3.0, +(z + 0.35).toFixed(2)))
  }

  function handleZoomOut() {
    setZoom((z) => {
      const next = Math.max(1.0, +(z - 0.35).toFixed(2))
      if (next === 1.0) setPan({ x: 0, y: 0 })
      return next
    })
  }

  function handleReset() {
    setZoom(1.0)
    setPan({ x: 0, y: 0 })
    setSelectedMuscleId(null)
  }

  // Pointer drag & pan
  function handlePointerDown(e: React.PointerEvent) {
    if (zoom <= 1.0) return
    isDraggingRef.current = true
    startDragRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!isDraggingRef.current || zoom <= 1.0) return
    const maxPanX = (zoom - 1) * 140
    const maxPanY = (zoom - 1) * 220
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

  // Zoom to muscle on list row click
  function handleRowClick(mId: string) {
    const meta = META_MUSCLES[mId]
    if (
      meta &&
      (meta.best_view === 'A' || meta.best_view === 'P') &&
      meta.best_view !== view
    ) {
      setView(meta.best_view)
    }
    setSelectedMuscleId(mId)

    const anchor = meta?.views?.[meta?.best_view || view]?.anchor
    if (anchor && Array.isArray(anchor) && anchor.length === 2) {
      const dx = ((512 - anchor[0]) / 512) * 60
      const dy = ((1024 - anchor[1]) / 1024) * 90
      setZoom(1.8)
      setPan({ x: dx, y: dy })
    } else {
      setZoom(1.5)
    }
  }

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
    `atlas/shade-${view === 'A' ? 'anterior' : 'posterior'}.webp`,
  )
  const sheetMuscleDef = sheetMuscleId ? MUSCLE_DEFS[sheetMuscleId] : null
  const sheetMuscleRole = sheetMuscleId ? roleMap.get(sheetMuscleId) : null

  return (
    <div className="atlas-wrapper" dir="rtl">
      {/* 1. Toolbar: Segmented View Switch & Deep Layer Toggle */}
      <div className="atlas-toolbar">
        <div style={{ width: '180px' }}>
          <Segmented
            options={[
              { value: 'A', label: 'أمامي' },
              { value: 'P', label: 'خلفي' },
            ]}
            value={view}
            onChange={(v) => {
              setView(v as 'A' | 'P')
              setSelectedMuscleId(null)
            }}
          />
        </div>

        {hasDeepMuscles && (
          <button
            type="button"
            className="chip"
            onClick={() => setShowDeep(!showDeep)}
            style={{
              cursor: 'pointer',
              border: showDeep
                ? '1.5px solid var(--color-accent)'
                : '1px solid var(--color-divider)',
              background: showDeep
                ? 'var(--color-surface-2)'
                : 'var(--color-surface)',
              color: showDeep
                ? 'var(--color-accent-text)'
                : 'var(--color-text-2)',
              fontWeight: showDeep ? 700 : 500,
              padding: '6px 12px',
              borderRadius: 'var(--radius-full)',
            }}
          >
            إظهار العضلات العميقة
          </button>
        )}
      </div>

      {/* Error Callout with Retry (Never leave empty frame without feedback) */}
      {svgError && (
        <div style={{ margin: '8px 0' }}>
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
        className="atlas-container"
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        style={{ cursor: zoom > 1.0 ? 'grab' : 'default' }}
      >
        <div
          className="atlas-viewport"
          style={{
            transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
          }}
        >
          {/* Multiply Shade WebP Layer */}
          <img
            src={shadeSrc}
            alt=""
            aria-hidden="true"
            className="atlas-shade-layer"
            loading="eager"
            onError={(e) => {
              // Hide broken image placeholder if shade asset is unreachable
              e.currentTarget.style.display = 'none'
            }}
          />

          {/* Inline SVG Layer */}
          <div
            className="atlas-svg-container"
            onClick={handleSvgClick}
            dangerouslySetInnerHTML={{ __html: svgContent }}
          />
        </div>

        {/* Zoom Controls Overlay with Reset Always Available */}
        <div className="atlas-zoom-controls">
          <button
            type="button"
            className="atlas-zoom-btn"
            onClick={handleZoomIn}
            aria-label="تكبير"
            title="تكبير"
          >
            <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: 700 }}>
              +
            </span>
          </button>
          <button
            type="button"
            className="atlas-zoom-btn"
            onClick={handleZoomOut}
            aria-label="تصغير"
            title="تصغير"
          >
            <span style={{ fontSize: '18px', lineHeight: 1, fontWeight: 700 }}>
              −
            </span>
          </button>
          <button
            type="button"
            className="atlas-zoom-btn"
            onClick={handleReset}
            aria-label="إعادة ضبط العرض"
            title="إعادة ضبط العرض"
          >
            <span style={{ fontSize: '15px', lineHeight: 1 }}>↺</span>
          </button>
        </div>
      </div>

      {/* 3. Tier 3 Caption or Map Note */}
      {resolved.tier === 3 && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--color-text-2)',
            textAlign: 'center',
            fontWeight: 500,
          }}
        >
          {resolved.caption || 'تحديد على مستوى العضلة كاملة'}
        </div>
      )}

      {mapNote && (
        <div
          style={{
            fontSize: '12.5px',
            color: 'var(--color-text-2)',
            background: 'var(--color-surface-2)',
            padding: '8px 12px',
            borderRadius: 'var(--radius-control)',
          }}
        >
          {mapNote}
        </div>
      )}

      {/* 4. Status Line & Legend */}
      <div className="atlas-status-line">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>
            يعرض الآن: {view === 'A' ? 'الأمامي' : 'الخلفي'}. أساسية{' '}
            {currentCounts.primary}، مساعدة {currentCounts.secondary}
          </span>
          {otherCounts > 0 && (
            <button
              type="button"
              className="atlas-view-switch-btn"
              onClick={() => setView(view === 'A' ? 'P' : 'A')}
            >
              في {view === 'A' ? 'الخلفي' : 'الأمامي'} —{' '}
              {fmtMuscles(otherCounts)}
            </button>
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
        </div>
      </div>

      {/* 5. Grouped Accessible Muscle List */}
      <div className="atlas-muscle-list" role="list">
        {primaryList.map(({ id, def, group }) => (
          <button
            key={id}
            type="button"
            className={`atlas-muscle-row ${selectedMuscleId === id ? 'atlas-muscle-row--active' : ''}`}
            onClick={() => handleRowClick(id)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 0,
                flex: 1,
              }}
            >
              <span
                className="role-marker role-marker--primary"
                title="عضلة أساسية"
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  {def.ar}
                </span>
                <span
                  style={{ fontSize: '11px', color: 'var(--color-text-2)' }}
                  dir="ltr"
                >
                  {def.en}
                </span>
              </div>
            </div>
            {group && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-2)',
                  flexShrink: 0,
                }}
              >
                {group}
              </span>
            )}
          </button>
        ))}

        {secondaryList.map(({ id, def, group }) => (
          <button
            key={id}
            type="button"
            className={`atlas-muscle-row ${selectedMuscleId === id ? 'atlas-muscle-row--active' : ''}`}
            onClick={() => handleRowClick(id)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                minWidth: 0,
                flex: 1,
              }}
            >
              <span
                className="role-marker role-marker--secondary"
                title="عضلة مساعدة"
              />
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '14px',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                  }}
                >
                  {def.ar}
                </span>
                <span
                  style={{ fontSize: '11px', color: 'var(--color-text-2)' }}
                  dir="ltr"
                >
                  {def.en}
                </span>
              </div>
            </div>
            {group && (
              <span
                style={{
                  fontSize: '11px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--color-surface-2)',
                  color: 'var(--color-text-2)',
                  flexShrink: 0,
                }}
              >
                {group}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* 6. Attribution Credit */}
      <div className="atlas-attribution">
        BodyParts3D, © The Database Center for Life Science licensed under CC
        Attribution 4.0 International
      </div>

      {/* 7. Muscle Info Sheet (on tapping SVG shape) */}
      <Sheet
        isOpen={!!sheetMuscleId}
        onClose={() => setSheetMuscleId(null)}
        title={sheetMuscleDef?.ar || 'تفاصيل العضلة'}
      >
        {sheetMuscleDef && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              paddingBottom: '16px',
            }}
            dir="rtl"
          >
            <div
              style={{ fontSize: '13px', color: 'var(--color-text-2)' }}
              dir="ltr"
            >
              {sheetMuscleDef.en}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  background:
                    sheetMuscleRole === 'primary'
                      ? 'rgba(229, 57, 53, 0.12)'
                      : 'rgba(253, 216, 53, 0.15)',
                  color: sheetMuscleRole === 'primary' ? '#E53935' : '#b45309',
                }}
              >
                <span
                  className={`role-marker ${sheetMuscleRole === 'primary' ? 'role-marker--primary' : 'role-marker--secondary'}`}
                />
                <span>
                  {sheetMuscleRole === 'primary'
                    ? 'عضلة أساسية'
                    : 'عضلة مساعدة'}
                </span>
              </div>

              {MUSCLE_GROUPS[sheetMuscleDef.id] && (
                <span
                  style={{
                    fontSize: '12px',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-full)',
                    background: 'var(--color-surface-2)',
                    color: 'var(--color-text)',
                  }}
                >
                  المجموعة: {MUSCLE_GROUPS[sheetMuscleDef.id]}
                </span>
              )}
            </div>

            <div
              style={{
                fontSize: '12px',
                color: 'var(--color-text-2)',
                lineHeight: 1.6,
              }}
            >
              المسار التشريحي للرأس العضلي محدد وفق قاعدة بيانات BodyParts3D 4.0
              المعيارية.
            </div>
          </div>
        )}
      </Sheet>
    </div>
  )
}
