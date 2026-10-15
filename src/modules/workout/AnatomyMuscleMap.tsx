import { useState, useMemo } from 'react'
import type { MuscleGroup, ExerciseMuscleTarget } from '../shared/types.ts'
import {
  MUSCLE_ATLAS,
  BODY_CONTOURS,
  ROLE_COLORS,
  type MuscleDefinition,
} from './muscleAtlasData.ts'
import { resolveExerciseMuscles } from './legacyMuscleMapper.ts'

interface AnatomyMuscleMapProps {
  category?: MuscleGroup | string
  exerciseName?: string
  targetMuscles?: string[]
  exerciseId?: string
  muscles?: ExerciseMuscleTarget[]
  isFullView?: boolean
}

export function AnatomyMuscleMap({
  category = 'chest',
  exerciseName = '',
  targetMuscles = [],
  exerciseId,
  muscles: explicitMuscles,
  isFullView = true,
}: AnatomyMuscleMapProps) {
  const [selectedMuscleId, setSelectedMuscleId] = useState<string | null>(null)
  const [pulsingMuscleId, setPulsingMuscleId] = useState<string | null>(null)
  const [showDeepLayer, setShowDeepLayer] = useState(false)
  const [isZoomed, setIsZoomed] = useState(false)

  // Resolve head-level muscle targets
  const { muscles: activeMuscles, isProvisional } = useMemo(() => {
    return resolveExerciseMuscles({
      id: exerciseId,
      name: exerciseName,
      category: category as MuscleGroup,
      targetMusclesAr: targetMuscles,
      muscles: explicitMuscles,
    })
  }, [exerciseId, exerciseName, category, targetMuscles, explicitMuscles])

  // Lookup map: muscleId -> role ('primary' | 'secondary')
  const muscleRoleMap = useMemo(() => {
    const map = new Map<string, 'primary' | 'secondary'>()
    for (const m of activeMuscles) {
      map.set(m.id, m.role)
    }
    return map
  }, [activeMuscles])

  // Split into primary and secondary lists with atlas metadata
  const { primaryList, secondaryList, hasDeepMuscles, viewPriority } =
    useMemo(() => {
      const primary: MuscleDefinition[] = []
      const secondary: MuscleDefinition[] = []
      let hasDeep = false
      let anteriorCount = 0
      let posteriorCount = 0

      for (const m of activeMuscles) {
        const def = MUSCLE_ATLAS[m.id]
        if (!def) continue

        if (def.layer === 'D') {
          hasDeep = true
        }

        if (m.role === 'primary') {
          primary.push(def)
          if (def.view === 'A' || def.view === 'A+P') anteriorCount += 2
          if (def.view === 'P' || def.view === 'A+P') posteriorCount += 2
        } else {
          secondary.push(def)
          if (def.view === 'A' || def.view === 'A+P') anteriorCount += 1
          if (def.view === 'P' || def.view === 'A+P') posteriorCount += 1
        }
      }

      // View that has primary muscles appears first/larger
      const priority: 'A' | 'P' = anteriorCount >= posteriorCount ? 'A' : 'P'

      return {
        primaryList: primary,
        secondaryList: secondary,
        hasDeepMuscles: hasDeep,
        viewPriority: priority,
      }
    }, [activeMuscles])

  // Calculate zoom viewBoxes
  const { zoomViewBoxA, zoomViewBoxP } = useMemo(() => {
    function computeBBox(view: 'A' | 'P'): string {
      let minX = 200
      let minY = 440
      let maxX = 0
      let maxY = 0
      let found = false

      for (const m of activeMuscles) {
        const def = MUSCLE_ATLAS[m.id]
        if (!def) continue
        const bbox = view === 'A' ? def.bboxA : def.bboxP
        if (bbox) {
          found = true
          minX = Math.min(minX, bbox.minX)
          minY = Math.min(minY, bbox.minY)
          maxX = Math.max(maxX, bbox.maxX)
          maxY = Math.max(maxY, bbox.maxY)
        }
      }

      if (!found) return '0 0 200 440'

      // Add padding
      const padX = 14
      const padY = 20
      const boxMinX = Math.max(0, minX - padX)
      const boxMinY = Math.max(0, minY - padY)
      const boxMaxX = Math.min(200, maxX + padX)
      const boxMaxY = Math.min(440, maxY + padY)
      const width = Math.max(70, boxMaxX - boxMinX)
      const height = Math.max(100, boxMaxY - boxMinY)

      return `${boxMinX} ${boxMinY} ${width} ${height}`
    }

    return {
      zoomViewBoxA: computeBBox('A'),
      zoomViewBoxP: computeBBox('P'),
    }
  }, [activeMuscles])

  function handlePulse(id: string) {
    setSelectedMuscleId(id)
    setPulsingMuscleId(id)
    setTimeout(() => {
      setPulsingMuscleId(null)
    }, 1800)
  }

  // Render SVG figure for Anterior (A) or Posterior (P)
  function renderSvgFigure(view: 'A' | 'P', isPrimaryView: boolean) {
    const isAnterior = view === 'A'
    const contour = isAnterior
      ? BODY_CONTOURS.anterior
      : BODY_CONTOURS.posterior
    const currentViewBox = isZoomed
      ? isAnterior
        ? zoomViewBoxA
        : zoomViewBoxP
      : '0 0 200 440'

    // Sort atlas muscles: non-active first, active next, deep layer according to toggle
    const atlasList = Object.values(MUSCLE_ATLAS).filter((m) =>
      isAnterior
        ? m.view === 'A' || m.view === 'A+P'
        : m.view === 'P' || m.view === 'A+P',
    )

    return (
      <div
        className={`muscle-atlas-view-box ${isPrimaryView ? 'primary-view-box' : 'secondary-view-box'}`}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          flex: isPrimaryView ? '1.2' : '1',
          minWidth: '150px',
        }}
      >
        <div
          style={{
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--muted)',
            marginBottom: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {isAnterior
            ? 'المنظر الأمامي (Anterior)'
            : 'المنظر الخلفي (Posterior)'}
          {isPrimaryView && (
            <span
              style={{
                fontSize: '10px',
                background: 'rgba(229, 57, 53, 0.15)',
                color: '#E53935',
                padding: '1px 5px',
                borderRadius: '4px',
              }}
            >
              الرئيسي
            </span>
          )}
        </div>

        <svg
          viewBox={currentViewBox}
          style={{
            width: '100%',
            maxHeight: isFullView ? '320px' : '230px',
            height: 'auto',
            filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.1))',
            transition: 'all 0.3s ease',
          }}
          className="maganis-muscle-atlas-svg"
        >
          <defs>
            {/* Diagonal Hatch Overlay Pattern for Secondary Muscles */}
            <pattern
              id="diagonal-hatch"
              width="6"
              height="6"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="6"
                stroke="#B71C1C"
                strokeWidth="1.2"
                strokeOpacity="0.45"
              />
            </pattern>

            {/* Subtle fiber line texture */}
            <pattern
              id="fiber-texture"
              width="4"
              height="4"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="2"
                x2="4"
                y2="2"
                stroke="rgba(255,255,255,0.12)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>

          {/* Neutral Anatomical Body Silhouette Base */}
          <path
            d={contour}
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1"
            className="body-base-silhouette"
          />

          {/* Render All Muscles */}
          {atlasList.map((m) => {
            const pathData = isAnterior ? m.pathA : m.pathP
            if (!pathData) return null

            const role = muscleRoleMap.get(m.id)
            const isTargeted = Boolean(role)
            const isDeep = m.layer === 'D'

            // Deep muscle visibility handling
            if (isDeep && !showDeepLayer && !isTargeted) {
              return null
            }

            let fill = '#94a3b8'
            let stroke = '#64748b'
            let strokeWidth = '0.75'
            let opacity = 1

            if (role === 'primary') {
              fill = ROLE_COLORS.primary.fill
              stroke = ROLE_COLORS.primary.outline
              strokeWidth = '1.2'
            } else if (role === 'secondary') {
              fill = ROLE_COLORS.secondary.fill
              stroke = ROLE_COLORS.secondary.outline
              strokeWidth = '1.1'
            } else {
              // Neutral muscle
              if (showDeepLayer && !isDeep) {
                opacity = 0.25
              }
            }

            if (showDeepLayer && !isDeep && !isTargeted) {
              opacity = 0.25
            }

            const isPulsing = pulsingMuscleId === m.id
            const isSelected = selectedMuscleId === m.id

            return (
              <g
                key={m.id}
                id={`muscle-${m.id}-${view}`}
                onClick={() => handlePulse(m.id)}
                style={{
                  cursor: 'pointer',
                  opacity,
                  transition: 'opacity 0.25s ease',
                }}
              >
                {/* Main Muscle Shape */}
                <path
                  d={pathData}
                  fill={fill}
                  stroke={isSelected ? '#ffffff' : stroke}
                  strokeWidth={isSelected ? '2' : strokeWidth}
                  className={isPulsing ? 'pulse-region-highlight' : ''}
                />

                {/* Diagonal Hatch Overlay for Secondary Involvement */}
                {role === 'secondary' && (
                  <path
                    d={pathData}
                    fill="url(#diagonal-hatch)"
                    stroke="none"
                    pointerEvents="none"
                  />
                )}

                {/* Subtle anatomical fiber lines */}
                {isTargeted && (
                  <path
                    d={pathData}
                    fill="url(#fiber-texture)"
                    stroke="none"
                    pointerEvents="none"
                  />
                )}
              </g>
            )
          })}
        </svg>
      </div>
    )
  }

  return (
    <div
      className="anatomy-atlas-card"
      style={{
        background: 'var(--card-subtle)',
        border: '1px solid var(--line)',
        borderRadius: '14px',
        padding: '14px',
        margin: '12px 0',
      }}
    >
      {/* Header with Title and Control Toolbar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          marginBottom: '10px',
          borderBottom: '1px solid var(--line)',
          paddingBottom: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div>
            <h4
              style={{
                margin: 0,
                fontSize: '14px',
                fontWeight: 800,
                color: 'var(--ink)',
              }}
            >
              الخريطة التشريحية الدقيقة (Head-Level Muscle Atlas)
            </h4>
            <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
              استهداف رؤوس العضلات المحددة بالألوان التشريحية المعتمدة
            </span>
          </div>
        </div>

        {/* Controls: Zoom & Deep Muscle Layer */}
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {hasDeepMuscles && (
            <button
              type="button"
              className="chip-btn"
              onClick={() => setShowDeepLayer((prev) => !prev)}
              style={{
                fontSize: '11px',
                padding: '3px 8px',
                fontWeight: 700,
                background: showDeepLayer
                  ? 'rgba(124, 58, 237, 0.15)'
                  : 'var(--card-bg)',
                color: showDeepLayer ? '#7c3aed' : 'var(--ink)',
                borderColor: showDeepLayer ? '#7c3aed' : 'var(--line)',
              }}
              title="إظهار العضلات العميقة بتعتيم الطبقة السطحية"
            >
              عضلات عميقة متضمنة {showDeepLayer ? '✓' : ''}
            </button>
          )}

          <button
            type="button"
            className="chip-btn"
            onClick={() => setIsZoomed((prev) => !prev)}
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              fontWeight: 700,
              background: isZoomed ? 'var(--accent)' : 'var(--card-bg)',
              color: isZoomed ? '#ffffff' : 'var(--ink)',
              borderColor: isZoomed ? 'var(--accent)' : 'var(--line)',
            }}
            title="تكبير لمنطقة العضلات المستهدفة بدقة"
          >
            {isZoomed ? 'تكبير (مفعّل)' : 'تكبير'}
          </button>
        </div>
      </div>

      {/* Provisional badge if legacy expansion */}
      {isProvisional && (
        <div
          style={{
            fontSize: '10.5px',
            color: '#b45309',
            background: '#fffbeb',
            border: '1px solid #fde68a',
            padding: '3px 8px',
            borderRadius: '6px',
            marginBottom: '8px',
            display: 'inline-block',
          }}
        >
          توزيع رؤوس مؤقت من التصنيف القديم (provisional - needs head-level
          review)
        </div>
      )}

      {/* Atlas Viewport (Anterior & Posterior Side by Side without nested scroll) */}
      <div
        className="muscle-atlas-grid"
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          alignItems: 'flex-start',
          margin: '4px 0',
        }}
      >
        {viewPriority === 'A' ? (
          <>
            {renderSvgFigure('A', true)}
            {renderSvgFigure('P', false)}
          </>
        ) : (
          <>
            {renderSvgFigure('P', true)}
            {renderSvgFigure('A', false)}
          </>
        )}
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '16px',
          fontSize: '11.5px',
          margin: '10px 0 6px',
          flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              background: ROLE_COLORS.primary.fill,
              border: `1.5px solid ${ROLE_COLORS.primary.outline}`,
              borderRadius: '3px',
              display: 'inline-block',
            }}
          />
          <strong style={{ color: '#E53935' }}>هدف رئيسي (Primary)</strong>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span
            style={{
              width: '14px',
              height: '14px',
              background: ROLE_COLORS.secondary.fill,
              border: `1.5px solid ${ROLE_COLORS.secondary.outline}`,
              borderRadius: '3px',
              display: 'inline-block',
              backgroundImage:
                'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(183, 28, 28, 0.4) 2px, rgba(183, 28, 28, 0.4) 4px)',
            }}
          />
          <strong style={{ color: '#d97706' }}>
            عضلة مساعدة / ثانوية (Secondary)
          </strong>
        </div>
      </div>

      {/* Muscle Breakdown List */}
      <div
        style={{
          marginTop: '10px',
          borderTop: '1px solid var(--line)',
          paddingTop: '8px',
        }}
      >
        {/* Primary List */}
        {primaryList.length > 0 && (
          <div style={{ marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#E53935',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              العضلات المستهدفة الأساسية (Primary Active Focus):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {primaryList.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handlePulse(m.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border:
                      selectedMuscleId === m.id
                        ? '1.5px solid #E53935'
                        : '1px solid var(--line)',
                    background:
                      selectedMuscleId === m.id
                        ? 'rgba(229, 57, 53, 0.15)'
                        : 'var(--card-bg)',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#E53935',
                    }}
                  />
                  <span>
                    <strong>{m.nameAr}</strong>{' '}
                    <span style={{ color: 'var(--muted)', fontSize: '10px' }}>
                      ({m.nameEn})
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Secondary List */}
        {secondaryList.length > 0 && (
          <div>
            <span
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: '#d97706',
                display: 'block',
                marginBottom: '4px',
              }}
            >
              العضلات المساعدة (Secondary Involvement):
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {secondaryList.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => handlePulse(m.id)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11.5px',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    border:
                      selectedMuscleId === m.id
                        ? '1.5px solid #FDD835'
                        : '1px solid var(--line)',
                    background:
                      selectedMuscleId === m.id
                        ? 'rgba(253, 216, 53, 0.2)'
                        : 'var(--card-bg)',
                    cursor: 'pointer',
                    color: 'var(--ink)',
                  }}
                >
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#FDD835',
                      border: '1px solid #F9A825',
                    }}
                  />
                  <span>
                    <strong>{m.nameAr}</strong>{' '}
                    <span style={{ color: 'var(--muted)', fontSize: '10px' }}>
                      ({m.nameEn})
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes musclePulseAnimation {
          0% { filter: drop-shadow(0 0 1px #fff); }
          50% { filter: drop-shadow(0 0 7px #fff); stroke: #ffffff; stroke-width: 2.5; }
          100% { filter: drop-shadow(0 0 1px #fff); }
        }
        .pulse-region-highlight {
          animation: musclePulseAnimation 0.8s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .pulse-region-highlight {
            animation: none !important;
            stroke: #ffffff !important;
            stroke-width: 2 !important;
          }
        }
      `}</style>
    </div>
  )
}
