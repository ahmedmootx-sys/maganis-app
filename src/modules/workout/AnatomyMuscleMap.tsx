import type { MuscleGroup } from '../shared/types.ts'

interface AnatomyMuscleMapProps {
  category: MuscleGroup | string
  exerciseName?: string
  targetMuscles?: string[]
  isFullView?: boolean
}

/**
 * High-precision Anatomical Human Body Map (Front & Back Views).
 * Highlights the primary and secondary target muscle groups in vivid anatomical crimson red
 * matching professional medical/fitness anatomy illustrations.
 */
export function AnatomyMuscleMap({
  category,
  exerciseName: _exerciseName = '',
  targetMuscles = [],
  isFullView = true,
}: AnatomyMuscleMapProps) {
  // Determine highlighted muscle groups based on category & target muscles
  const isChest =
    category === 'chest' ||
    targetMuscles.some(
      (m) =>
        m.includes('صدر') ||
        m.toLowerCase().includes('chest') ||
        m.toLowerCase().includes('pec'),
    )
  const isBack =
    category === 'back' ||
    targetMuscles.some(
      (m) =>
        m.includes('ظهر') ||
        m.includes('لاتس') ||
        m.toLowerCase().includes('lat') ||
        m.toLowerCase().includes('back'),
    )
  const isLegs =
    category === 'legs' ||
    targetMuscles.some(
      (m) =>
        m.includes('أرجل') ||
        m.includes('فخذ') ||
        m.includes('ألوية') ||
        m.includes('ركبة') ||
        m.toLowerCase().includes('leg') ||
        m.toLowerCase().includes('glute') ||
        m.toLowerCase().includes('quad') ||
        m.toLowerCase().includes('hamstring'),
    )
  const isShoulders =
    category === 'shoulders' ||
    targetMuscles.some(
      (m) =>
        m.includes('كتف') ||
        m.includes('دالية') ||
        m.toLowerCase().includes('shoulder') ||
        m.toLowerCase().includes('delt'),
    )
  const isArms =
    category === 'arms' ||
    targetMuscles.some(
      (m) =>
        m.includes('ذراع') ||
        m.includes('باي') ||
        m.includes('تراي') ||
        m.toLowerCase().includes('arm') ||
        m.toLowerCase().includes('bicep') ||
        m.toLowerCase().includes('tricep'),
    )
  const isCore =
    category === 'core' ||
    targetMuscles.some(
      (m) =>
        m.includes('بطن') ||
        m.includes('جذع') ||
        m.includes('معدة') ||
        m.toLowerCase().includes('core') ||
        m.toLowerCase().includes('ab'),
    )

  const highlightColor = '#ef4444' // Vivid crimson red
  const secondaryHighlight = '#f87171' // Light crimson
  const bodyBaseColor = '#94a3b8' // Anatomical silver-grey (white background theme)
  const bodyDarkColor = '#64748b' // Deep muscle shadow

  return (
    <div
      className={`anatomy-map-container white-theme ${isFullView ? 'full-view' : 'compact-view'}`}
    >
      <div className="anatomy-views-wrapper">
        {/* ===== FRONT VIEW (المنظر الأمامي) ===== */}
        <div className="anatomy-figure-box">
          <span className="figure-label">المنظر الأمامي (Anterior)</span>
          <svg viewBox="0 0 100 200" className="anatomy-svg" fill="none">
            {/* Head & Neck */}
            <circle cx="50" cy="18" r="10" fill={bodyBaseColor} />
            <path d="M46 27 L54 27 L56 36 L44 36 Z" fill={bodyBaseColor} />

            {/* Shoulders (Deltoids - Anterior) */}
            <path
              d="M36 36 C32 36, 26 40, 26 46 L32 56 L38 48 Z"
              fill={isShoulders ? highlightColor : bodyBaseColor}
              className={isShoulders ? 'muscle-active pulse' : ''}
            />
            <path
              d="M64 36 C68 36, 74 40, 74 46 L68 56 L62 48 Z"
              fill={isShoulders ? highlightColor : bodyBaseColor}
              className={isShoulders ? 'muscle-active pulse' : ''}
            />

            {/* Chest (Pectoralis Major) */}
            <path
              d="M38 37 C44 37, 49 39, 49 48 C43 48, 38 46, 36 43 Z"
              fill={isChest ? highlightColor : bodyBaseColor}
              className={isChest ? 'muscle-active pulse' : ''}
            />
            <path
              d="M62 37 C56 37, 51 39, 51 48 C57 48, 62 46, 64 43 Z"
              fill={isChest ? highlightColor : bodyBaseColor}
              className={isChest ? 'muscle-active pulse' : ''}
            />

            {/* Arms (Biceps Anterior) */}
            <path
              d="M26 48 L32 57 L30 72 L23 60 Z"
              fill={isArms ? highlightColor : bodyBaseColor}
              className={isArms ? 'muscle-active pulse' : ''}
            />
            <path
              d="M74 48 L68 57 L70 72 L77 60 Z"
              fill={isArms ? highlightColor : bodyBaseColor}
              className={isArms ? 'muscle-active pulse' : ''}
            />
            {/* Forearms */}
            <path d="M29 73 L27 94 L22 93 L24 73 Z" fill={bodyBaseColor} />
            <path d="M71 73 L73 94 L78 93 L76 73 Z" fill={bodyBaseColor} />

            {/* Core / Abs (Rectus Abdominis & Obliques) */}
            <g className={isCore ? 'muscle-active pulse' : ''}>
              {/* Six pack blocks */}
              <rect
                x="44"
                y="50"
                width="5.5"
                height="6.5"
                rx="1.5"
                fill={isCore ? highlightColor : bodyDarkColor}
              />
              <rect
                x="50.5"
                y="50"
                width="5.5"
                height="6.5"
                rx="1.5"
                fill={isCore ? highlightColor : bodyDarkColor}
              />
              <rect
                x="44"
                y="58"
                width="5.5"
                height="6.5"
                rx="1.5"
                fill={isCore ? highlightColor : bodyDarkColor}
              />
              <rect
                x="50.5"
                y="58"
                width="5.5"
                height="6.5"
                rx="1.5"
                fill={isCore ? highlightColor : bodyDarkColor}
              />
              <rect
                x="44"
                y="66"
                width="5.5"
                height="6.5"
                rx="1.5"
                fill={isCore ? highlightColor : bodyDarkColor}
              />
              <rect
                x="50.5"
                y="66"
                width="5.5"
                height="6.5"
                rx="1.5"
                fill={isCore ? highlightColor : bodyDarkColor}
              />
              {/* Obliques */}
              <path
                d="M37 52 L43 52 L43 72 L38 68 Z"
                fill={isCore ? secondaryHighlight : bodyBaseColor}
              />
              <path
                d="M63 52 L57 52 L57 72 L62 68 Z"
                fill={isCore ? secondaryHighlight : bodyBaseColor}
              />
            </g>

            {/* Pelvis */}
            <path d="M38 74 L62 74 L58 84 L42 84 Z" fill={bodyBaseColor} />

            {/* Thighs / Quads (Quadriceps Femoris) */}
            <path
              d="M38 85 C38 85, 48 85, 48 95 L46 130 C44 133, 40 133, 38 130 L36 95 Z"
              fill={isLegs ? highlightColor : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />
            <path
              d="M62 85 C62 85, 52 85, 52 95 L54 130 C56 133, 60 133, 62 130 L64 95 Z"
              fill={isLegs ? highlightColor : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />

            {/* Knees */}
            <circle cx="42" cy="135" r="4.5" fill={bodyBaseColor} />
            <circle cx="58" cy="135" r="4.5" fill={bodyBaseColor} />

            {/* Shins & Calves (Anterior) */}
            <path
              d="M39 141 L45 141 L43 182 L38 182 Z"
              fill={isLegs ? secondaryHighlight : bodyBaseColor}
            />
            <path
              d="M61 141 L55 141 L57 182 L62 182 Z"
              fill={isLegs ? secondaryHighlight : bodyBaseColor}
            />
            {/* Feet */}
            <path d="M36 183 L44 183 L46 192 L34 192 Z" fill={bodyBaseColor} />
            <path d="M64 183 L56 183 L54 192 L66 192 Z" fill={bodyBaseColor} />
          </svg>
        </div>

        {/* ===== BACK VIEW (المنظر الخلفي) ===== */}
        <div className="anatomy-figure-box">
          <span className="figure-label">المنظر الخلفي (Posterior)</span>
          <svg viewBox="0 0 100 200" className="anatomy-svg" fill="none">
            {/* Head & Neck Posterior */}
            <circle cx="50" cy="18" r="10" fill={bodyBaseColor} />
            <path d="M46 27 L54 27 L57 37 L43 37 Z" fill={bodyBaseColor} />

            {/* Trapezius (الترابيس) */}
            <polygon
              points="50,28 38,38 50,56 62,38"
              fill={isBack ? secondaryHighlight : bodyBaseColor}
              className={isBack ? 'muscle-active pulse' : ''}
            />

            {/* Rear Deltoids (الكتف الخلفي) */}
            <path
              d="M36 36 C32 36, 26 40, 26 46 L32 54 L38 46 Z"
              fill={isShoulders ? highlightColor : bodyBaseColor}
              className={isShoulders ? 'muscle-active pulse' : ''}
            />
            <path
              d="M64 36 C68 36, 74 40, 74 46 L68 54 L62 46 Z"
              fill={isShoulders ? highlightColor : bodyBaseColor}
              className={isShoulders ? 'muscle-active pulse' : ''}
            />

            {/* Latissimus Dorsi (عضلات الظهر العريضة - اللاتس) */}
            <path
              d="M36 44 L48 56 L48 72 L36 64 Z"
              fill={isBack ? highlightColor : bodyBaseColor}
              className={isBack ? 'muscle-active pulse' : ''}
            />
            <path
              d="M64 44 L52 56 L52 72 L64 64 Z"
              fill={isBack ? highlightColor : bodyBaseColor}
              className={isBack ? 'muscle-active pulse' : ''}
            />

            {/* Triceps (الترايسبس الخلفية) */}
            <path
              d="M26 48 L32 57 L30 72 L23 60 Z"
              fill={isArms ? highlightColor : bodyBaseColor}
              className={isArms ? 'muscle-active pulse' : ''}
            />
            <path
              d="M74 48 L68 57 L70 72 L77 60 Z"
              fill={isArms ? highlightColor : bodyBaseColor}
              className={isArms ? 'muscle-active pulse' : ''}
            />

            {/* Lower Back (Erector Spinae) */}
            <path
              d="M45 58 L55 58 L54 75 L46 75 Z"
              fill={isBack || isCore ? secondaryHighlight : bodyDarkColor}
            />

            {/* Glutes (عضلات الألوية الكبرى - Gluteus Maximus) */}
            <path
              d="M36 75 C43 75, 49 76, 49 88 C49 96, 42 98, 36 96 C34 90, 34 82, 36 75 Z"
              fill={isLegs ? highlightColor : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />
            <path
              d="M64 75 C57 75, 51 76, 51 88 C51 96, 58 98, 64 96 C66 90, 66 82, 64 75 Z"
              fill={isLegs ? highlightColor : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />

            {/* Hamstrings (أوتار الركبة الخلفية) */}
            <path
              d="M37 98 L48 98 L46 131 L37 131 Z"
              fill={isLegs ? highlightColor : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />
            <path
              d="M63 98 L52 98 L54 131 L63 131 Z"
              fill={isLegs ? highlightColor : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />

            {/* Calves (عضلات السمانة الخلفية - Gastrocnemius) */}
            <path
              d="M37 138 C44 138, 45 146, 44 165 L40 182 L36 182 C34 165, 34 146, 37 138 Z"
              fill={isLegs ? secondaryHighlight : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />
            <path
              d="M63 138 C56 138, 55 146, 56 165 L60 182 L64 182 C66 165, 66 146, 63 138 Z"
              fill={isLegs ? secondaryHighlight : bodyBaseColor}
              className={isLegs ? 'muscle-active pulse' : ''}
            />

            {/* Heels */}
            <path d="M37 183 L43 183 L42 192 L36 192 Z" fill={bodyBaseColor} />
            <path d="M63 183 L57 183 L58 192 L64 192 Z" fill={bodyBaseColor} />
          </svg>
        </div>
      </div>

      {/* Muscle Focus Legend */}
      <div className="anatomy-legend">
        <div className="legend-item">
          <span className="legend-dot primary"></span>
          <span>العضلة المستهدفة الأساسية (Primary Active)</span>
        </div>
        <div className="legend-item">
          <span className="legend-dot secondary"></span>
          <span>العضلات المساعدة والمثبتة (Stabilizers)</span>
        </div>
      </div>
    </div>
  )
}
