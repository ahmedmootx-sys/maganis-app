import { useMemo } from 'react'
import type { MuscleGroup } from '../shared/types.ts'

interface AnatomyMuscleMapProps {
  category: MuscleGroup | string
  exerciseName?: string
  targetMuscles?: string[]
  isFullView?: boolean
}

interface MuscleDetail {
  nameAr: string
  nameLatin: string
  role: 'primary' | 'secondary'
  percentage: number
  descriptionAr: string
  heads?: string[]
}

/**
 * 3D-Realistic Anatomical Muscle Targeting System (Hevy / MuscleWiki Style).
 * Renders full-physique anterior and posterior athletic human models with 3D volumetric shaders,
 * precise muscle group highlighting in gym crimson red, and an accompanying muscle involvement breakdown.
 */
export function AnatomyMuscleMap({
  category,
  exerciseName = '',
  targetMuscles = [],
  isFullView = true,
}: AnatomyMuscleMapProps) {
  // Detection logic for each anatomical muscle group
  const nameAndTargets = (
    exerciseName +
    ' ' +
    targetMuscles.join(' ')
  ).toLowerCase()

  const isChest =
    category === 'chest' ||
    targetMuscles.some(
      (m) =>
        m.includes('صدر') ||
        m.toLowerCase().includes('chest') ||
        m.toLowerCase().includes('pec'),
    ) ||
    nameAndTargets.includes('بنش') ||
    nameAndTargets.includes('صدر')

  const isBack =
    category === 'back' ||
    targetMuscles.some(
      (m) =>
        m.includes('ظهر') ||
        m.includes('لاتس') ||
        m.includes('سحب') ||
        m.toLowerCase().includes('lat') ||
        m.toLowerCase().includes('back') ||
        m.toLowerCase().includes('row'),
    ) ||
    nameAndTargets.includes('ظهر') ||
    nameAndTargets.includes('سحب') ||
    nameAndTargets.includes('عقلة')

  const isShoulders =
    category === 'shoulders' ||
    targetMuscles.some(
      (m) =>
        m.includes('كتف') ||
        m.includes('دالية') ||
        m.toLowerCase().includes('shoulder') ||
        m.toLowerCase().includes('delt'),
    ) ||
    nameAndTargets.includes('كتف') ||
    nameAndTargets.includes('رفرفة')

  const isBiceps =
    (category === 'arms' &&
      (nameAndTargets.includes('باي') ||
        nameAndTargets.includes('تبادل') ||
        nameAndTargets.includes('كيرل') ||
        nameAndTargets.includes('bicep'))) ||
    targetMuscles.some(
      (m) => m.includes('باي') || m.toLowerCase().includes('bicep'),
    )

  const isTriceps =
    (category === 'arms' &&
      (nameAndTargets.includes('تراي') ||
        nameAndTargets.includes('فرنسي') ||
        nameAndTargets.includes('tricep') ||
        nameAndTargets.includes('غطس'))) ||
    targetMuscles.some(
      (m) => m.includes('تراي') || m.toLowerCase().includes('tricep'),
    )

  const isArms = category === 'arms' || isBiceps || isTriceps

  const isLegs =
    category === 'legs' ||
    targetMuscles.some(
      (m) =>
        m.includes('أرجل') ||
        m.includes('فخذ') ||
        m.includes('ألوية') ||
        m.includes('سمانة') ||
        m.toLowerCase().includes('leg') ||
        m.toLowerCase().includes('squat'),
    ) ||
    nameAndTargets.includes('سكوات') ||
    nameAndTargets.includes('أرجل') ||
    nameAndTargets.includes('سمانة')

  const isCore =
    category === 'core' ||
    targetMuscles.some(
      (m) =>
        m.includes('بطن') ||
        m.includes('جذع') ||
        m.includes('معدة') ||
        m.toLowerCase().includes('core') ||
        m.toLowerCase().includes('ab') ||
        m.toLowerCase().includes('plank'),
    ) ||
    nameAndTargets.includes('بطن') ||
    nameAndTargets.includes('بلانك')

  // Secondary muscles synergy detection
  const isChestSynergyTriceps = isChest && !isTriceps
  const isChestSynergyShoulders = isChest && !isShoulders
  const isBackSynergyBiceps = isBack && !isBiceps
  const isLegsSynergyGlutes = isLegs
  const isLegsSynergyCalves = isLegs

  // Compute breakdown cards data
  const muscleBreakdown = useMemo<{
    primary: MuscleDetail[]
    secondary: MuscleDetail[]
  }>(() => {
    const primary: MuscleDetail[] = []
    const secondary: MuscleDetail[] = []

    if (isChest) {
      const isUpper =
        nameAndTargets.includes('عالي') ||
        nameAndTargets.includes('مائل') ||
        nameAndTargets.includes('علوي') ||
        nameAndTargets.includes('ترقوي')
      const isLower =
        nameAndTargets.includes('مقلوب') || nameAndTargets.includes('سفلي')
      primary.push({
        nameAr: isUpper
          ? 'عضلة الصدر العلوي'
          : isLower
            ? 'عضلة الصدر السفلي'
            : 'عضلة الصدر الكبرى',
        nameLatin: isUpper
          ? 'Pectoralis Major (Clavicular Head)'
          : 'Pectoralis Major (Sternal Head)',
        role: 'primary',
        percentage: 100,
        descriptionAr: 'العضلة المحركة الأساسية للحركة وتوليد القوة الدافعة.',
        heads: isUpper
          ? ['الرأس الترقوي', 'الألياف العلوية']
          : isLower
            ? ['الرأس القصي', 'الألياف السفلية']
            : ['الرأس القصي', 'الرأس الترقوي'],
      })
      secondary.push({
        nameAr: 'العضلة الدالية الأمامية',
        nameLatin: 'Anterior Deltoid',
        role: 'secondary',
        percentage: 75,
        descriptionAr: 'تثبيت مفصل الكتف والمساعدة في الدفع.',
      })
      secondary.push({
        nameAr: 'عضلة الترايسبس (الذراع الخلفي)',
        nameLatin: 'Triceps Brachii',
        role: 'secondary',
        percentage: 70,
        descriptionAr: 'المسؤولة عن مد المرفق في نهاية مدى الحركة.',
      })
    } else if (isBack) {
      primary.push({
        nameAr: 'عضلات الظهر العريضة (المجنص)',
        nameLatin: 'Latissimus Dorsi',
        role: 'primary',
        percentage: 100,
        descriptionAr: 'العضلة الرئيسية لسحب الوزن وبناء العرض والقوة.',
        heads: ['الألياف العريضة', 'عضلات المجنص'],
      })
      primary.push({
        nameAr: 'عضلات الترابيس وأعلى الظهر',
        nameLatin: 'Trapezius & Rhomboids',
        role: 'primary',
        percentage: 85,
        descriptionAr: 'ضم لوحي الكتف وتثبيت أعلى الجذع.',
      })
      secondary.push({
        nameAr: 'عضلة البايسبس (الذراع الأمامي)',
        nameLatin: 'Biceps Brachii',
        role: 'secondary',
        percentage: 65,
        descriptionAr: 'مساعدة ثني المرفق أثناء حركة السحب.',
      })
      secondary.push({
        nameAr: 'الساعد وعضلات القبضة',
        nameLatin: 'Brachioradialis',
        role: 'secondary',
        percentage: 60,
        descriptionAr: 'تثبيت الوزن وإحكام القبضة.',
      })
    } else if (isShoulders) {
      primary.push({
        nameAr: 'عضلات الكتف (الدالية)',
        nameLatin: 'Deltoid Muscle',
        role: 'primary',
        percentage: 100,
        descriptionAr: 'المحرك الأساسي لرفع وتدوير الذراع ومنح المظهر الدائري.',
        heads: ['الرأس الجانبي', 'الرأس الأمامي', 'الرأس الخلفي'],
      })
      secondary.push({
        nameAr: 'عضلة الترايسبس والترابيس العلوية',
        nameLatin: 'Triceps & Upper Trapezius',
        role: 'secondary',
        percentage: 70,
        descriptionAr: 'تثبيت مفصل الكتف وقفل الذراع في أعلى نقطة.',
      })
    } else if (isArms) {
      if (isBiceps) {
        primary.push({
          nameAr: 'عضلة البايسبس والبريكيالس',
          nameLatin: 'Biceps Brachii & Brachialis',
          role: 'primary',
          percentage: 100,
          descriptionAr: 'ثني المرفق ولف الساعد وبناء ذروة الذراع (Peak).',
          heads: ['الرأس الطويل', 'الرأس القصير', 'العضلة العضدية'],
        })
        secondary.push({
          nameAr: 'عضلات الساعد',
          nameLatin: 'Forearm Flexors',
          role: 'secondary',
          percentage: 65,
          descriptionAr: 'تثبيت القبضة ونقل القوة.',
        })
      } else if (isTriceps || !isBiceps) {
        primary.push({
          nameAr: 'عضلة الترايسبس (الذراع الخلفي)',
          nameLatin: 'Triceps Brachii',
          role: 'primary',
          percentage: 100,
          descriptionAr: 'المسؤولة عن ثلثي حجم الذراع ومد مفصل المرفق.',
          heads: ['الرأس الطويل', 'الرأس الجانبي', 'الرأس الأوسط'],
        })
        secondary.push({
          nameAr: 'عضلات الصدر والكتف المساعدة',
          nameLatin: 'Anterior Deltoid & Core',
          role: 'secondary',
          percentage: 55,
          descriptionAr: 'تثبيت الجذع واستقرار المفاصل.',
        })
      }
    } else if (isLegs) {
      primary.push({
        nameAr: 'عضلات الفخذ الرباعية (الأمامية)',
        nameLatin: 'Quadriceps Femoris',
        role: 'primary',
        percentage: 100,
        descriptionAr: 'العضلة الأكبر في الجسم لتوليد الدفع ومد الركبة.',
        heads: ['الفخذية المستقيمة', 'المتسعة الوحشية', 'المتسعة الإنسية'],
      })
      primary.push({
        nameAr: 'عضلات الألوية (المؤخرة)',
        nameLatin: 'Gluteus Maximus',
        role: 'primary',
        percentage: 90,
        descriptionAr: 'مد مفصل الورك وتثبيت الحوض والعمود الفقري.',
      })
      secondary.push({
        nameAr: 'أوتار الركبة وعضلات السمانة',
        nameLatin: 'Hamstrings & Calves',
        role: 'secondary',
        percentage: 70,
        descriptionAr: 'الحفاظ على التوازن والامتصاص الحركي.',
      })
    } else if (isCore) {
      primary.push({
        nameAr: 'عضلات البطن المستقيمة (Six-Pack)',
        nameLatin: 'Rectus Abdominis',
        role: 'primary',
        percentage: 100,
        descriptionAr: 'ثني الجذع وحماية العمود الفقري وتنسيق القوة.',
        heads: ['البطن العلوية', 'البطن السفلية'],
      })
      secondary.push({
        nameAr: 'العضلات المائلة والجذع العرضي',
        nameLatin: 'Obliques & Transverse Abdominis',
        role: 'secondary',
        percentage: 80,
        descriptionAr: 'مقاومة الالتواء ودعم الحزام البطني.',
      })
    }

    return { primary, secondary }
  }, [
    isChest,
    isBack,
    isShoulders,
    isArms,
    isBiceps,
    isTriceps,
    isLegs,
    isCore,
    nameAndTargets,
  ])

  return (
    <div
      className={`anatomy-3d-card ${isFullView ? 'full-view' : 'compact-view'}`}
    >
      <div className="anatomy-3d-header">
        <div className="anatomy-3d-title">
          <span className="anatomy-icon">🧬</span>
          <div>
            <h4>المجسم التشريحي لاستهداف العضلات (3D Muscle Map)</h4>
            <p>توضيح عضلي واقعي للعضلات المستهدفة والمساعدة في هذا التمرين</p>
          </div>
        </div>
        <div className="anatomy-badges">
          <span className="badge-primary-target">🔴 هدف رئيسي</span>
          <span className="badge-synergy-target">🟠 عضلة مساعدة</span>
        </div>
      </div>

      <div className="anatomy-3d-content">
        {/* ===== 3D FIGURES WRAPPER (ANTERIOR & POSTERIOR) ===== */}
        <div className="anatomy-models-grid">
          {/* ----- ANTERIOR VIEW (المنظر الأمامي) ----- */}
          <div className="model-figure-card">
            <div className="figure-caption">المنظر الأمامي (Anterior)</div>
            <div className="svg-container">
              <svg viewBox="0 0 160 310" className="realistic-anatomy-svg">
                <defs>
                  {/* Inactive Realistic Muscle Shaders */}
                  <linearGradient
                    id="skinBase"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#475569" />
                    <stop offset="50%" stopColor="#334155" />
                    <stop offset="100%" stopColor="#1e293b" />
                  </linearGradient>

                  <linearGradient
                    id="skinShadow"
                    x1="0%"
                    y1="0%"
                    x2="0%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#64748b" />
                    <stop offset="100%" stopColor="#334155" />
                  </linearGradient>

                  {/* Active Crimson 3D Muscle Shaders */}
                  <linearGradient
                    id="activeMuscle3D"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#ff4d4d" />
                    <stop offset="40%" stopColor="#ef4444" />
                    <stop offset="85%" stopColor="#b91c1c" />
                    <stop offset="100%" stopColor="#7f1d1d" />
                  </linearGradient>

                  <linearGradient
                    id="synergyMuscle3D"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <stop offset="0%" stopColor="#fb923c" />
                    <stop offset="50%" stopColor="#ea580c" />
                    <stop offset="100%" stopColor="#9a3412" />
                  </linearGradient>

                  {/* Drop glow filter for active muscles */}
                  <filter
                    id="muscleGlow"
                    x="-20%"
                    y="-20%"
                    width="140%"
                    height="140%"
                  >
                    <feDropShadow
                      dx="0"
                      dy="2"
                      stdDeviation="3"
                      floodColor="#ef4444"
                      floodOpacity="0.5"
                    />
                  </filter>
                </defs>

                {/* --- HEAD & NECK --- */}
                <ellipse
                  cx="80"
                  cy="24"
                  rx="14"
                  ry="17"
                  fill="url(#skinBase)"
                />
                {/* Sternocleidomastoid (Neck) */}
                <path
                  d="M72 38 C75 42, 75 50, 70 55 L90 55 C85 50, 85 42, 88 38 Z"
                  fill="url(#skinShadow)"
                />

                {/* --- SHOULDERS (DELTOIDS - ANTERIOR & LATERAL) --- */}
                {/* Left Deltoid */}
                <path
                  d="M58 53 C50 54, 40 59, 38 70 C36 80, 42 88, 48 89 C52 83, 56 75, 59 66 Z"
                  fill={
                    isShoulders
                      ? 'url(#activeMuscle3D)'
                      : isChestSynergyShoulders
                        ? 'url(#synergyMuscle3D)'
                        : 'url(#skinBase)'
                  }
                  filter={isShoulders ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Deltoid */}
                <path
                  d="M102 53 C110 54, 120 59, 122 70 C124 80, 118 88, 112 89 C108 83, 104 75, 101 66 Z"
                  fill={
                    isShoulders
                      ? 'url(#activeMuscle3D)'
                      : isChestSynergyShoulders
                        ? 'url(#synergyMuscle3D)'
                        : 'url(#skinBase)'
                  }
                  filter={isShoulders ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- CHEST (PECTORALIS MAJOR) --- */}
                {/* Left Pec */}
                <path
                  d="M60 55 C70 54, 78 57, 78 78 C70 82, 60 82, 53 74 C54 66, 56 60, 60 55 Z"
                  fill={isChest ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isChest ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Pec */}
                <path
                  d="M100 55 C90 54, 82 57, 82 78 C90 82, 100 82, 107 74 C106 66, 104 60, 100 55 Z"
                  fill={isChest ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isChest ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- BICEPS & BRACHIALIS (ANTERIOR ARMS) --- */}
                {/* Left Bicep */}
                <path
                  d="M48 87 C44 94, 43 108, 48 116 C53 113, 56 104, 55 92 Z"
                  fill={
                    isBiceps
                      ? 'url(#activeMuscle3D)'
                      : isArms && !isTriceps
                        ? 'url(#activeMuscle3D)'
                        : isBackSynergyBiceps
                          ? 'url(#synergyMuscle3D)'
                          : 'url(#skinBase)'
                  }
                  filter={isBiceps ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Bicep */}
                <path
                  d="M112 87 C116 94, 117 108, 112 116 C107 113, 104 104, 105 92 Z"
                  fill={
                    isBiceps
                      ? 'url(#activeMuscle3D)'
                      : isArms && !isTriceps
                        ? 'url(#activeMuscle3D)'
                        : isBackSynergyBiceps
                          ? 'url(#synergyMuscle3D)'
                          : 'url(#skinBase)'
                  }
                  filter={isBiceps ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- FOREARMS (BRACHIORADIALIS) --- */}
                {/* Left Forearm */}
                <path
                  d="M46 118 C40 126, 38 142, 42 154 C46 153, 49 146, 51 130 C52 124, 49 120, 46 118 Z"
                  fill="url(#skinShadow)"
                />
                {/* Right Forearm */}
                <path
                  d="M114 118 C120 126, 122 142, 118 154 C114 153, 111 146, 109 130 C108 124, 111 120, 114 118 Z"
                  fill="url(#skinShadow)"
                />

                {/* --- ABDOMINALS (6-PACK RECTUS ABDOMINIS & OBLIQUES) --- */}
                <g filter={isCore ? 'url(#muscleGlow)' : undefined}>
                  {/* Top pack */}
                  <rect
                    x="71"
                    y="83"
                    width="8"
                    height="10"
                    rx="2"
                    fill={isCore ? 'url(#activeMuscle3D)' : 'url(#skinShadow)'}
                  />
                  <rect
                    x="81"
                    y="83"
                    width="8"
                    height="10"
                    rx="2"
                    fill={isCore ? 'url(#activeMuscle3D)' : 'url(#skinShadow)'}
                  />
                  {/* Mid pack */}
                  <rect
                    x="71"
                    y="95"
                    width="8"
                    height="10"
                    rx="2"
                    fill={isCore ? 'url(#activeMuscle3D)' : 'url(#skinShadow)'}
                  />
                  <rect
                    x="81"
                    y="95"
                    width="8"
                    height="10"
                    rx="2"
                    fill={isCore ? 'url(#activeMuscle3D)' : 'url(#skinShadow)'}
                  />
                  {/* Lower pack */}
                  <rect
                    x="71"
                    y="107"
                    width="8"
                    height="11"
                    rx="2"
                    fill={isCore ? 'url(#activeMuscle3D)' : 'url(#skinShadow)'}
                  />
                  <rect
                    x="81"
                    y="107"
                    width="8"
                    height="11"
                    rx="2"
                    fill={isCore ? 'url(#activeMuscle3D)' : 'url(#skinShadow)'}
                  />
                  {/* External Obliques */}
                  <path
                    d="M57 85 C64 88, 68 98, 68 116 C63 115, 59 105, 57 85 Z"
                    fill={isCore ? 'url(#synergyMuscle3D)' : 'url(#skinBase)'}
                  />
                  <path
                    d="M103 85 C96 88, 92 98, 92 116 C97 115, 101 105, 103 85 Z"
                    fill={isCore ? 'url(#synergyMuscle3D)' : 'url(#skinBase)'}
                  />
                </g>

                {/* --- PELVIS & HIPS --- */}
                <path
                  d="M68 120 C75 125, 85 125, 92 120 C96 130, 88 136, 80 136 C72 136, 64 130, 68 120 Z"
                  fill="url(#skinBase)"
                />

                {/* --- QUADRICEPS (THIGHS - ANTERIOR) --- */}
                {/* Left Quad (Vastus Medialis, Lateralis, Rectus Femoris) */}
                <path
                  d="M62 135 C54 148, 52 175, 58 198 C65 204, 71 200, 75 188 C76 168, 74 145, 62 135 Z"
                  fill={isLegs ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isLegs ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Quad */}
                <path
                  d="M98 135 C106 148, 108 175, 102 198 C95 204, 89 200, 85 188 C84 168, 86 145, 98 135 Z"
                  fill={isLegs ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isLegs ? 'url(#muscleGlow)' : undefined}
                />

                {/* Knees */}
                <circle cx="68" cy="207" r="6" fill="url(#skinShadow)" />
                <circle cx="92" cy="207" r="6" fill="url(#skinShadow)" />

                {/* --- SHINS & TIBIALIS ANTERIOR / CALVES --- */}
                {/* Left Shin & Calf */}
                <path
                  d="M64 215 C59 228, 60 255, 64 275 C68 277, 72 268, 72 245 C73 230, 70 218, 64 215 Z"
                  fill={
                    isLegsSynergyCalves
                      ? 'url(#synergyMuscle3D)'
                      : 'url(#skinBase)'
                  }
                />
                {/* Right Shin & Calf */}
                <path
                  d="M96 215 C101 228, 100 255, 96 275 C92 277, 88 268, 88 245 C87 230, 90 218, 96 215 Z"
                  fill={
                    isLegsSynergyCalves
                      ? 'url(#synergyMuscle3D)'
                      : 'url(#skinBase)'
                  }
                />

                {/* Feet */}
                <path
                  d="M60 277 L69 277 L71 292 L58 292 Z"
                  fill="url(#skinShadow)"
                />
                <path
                  d="M100 277 L91 277 L89 292 L102 292 Z"
                  fill="url(#skinShadow)"
                />
              </svg>
            </div>
          </div>

          {/* ----- POSTERIOR VIEW (المنظر الخلفي) ----- */}
          <div className="model-figure-card">
            <div className="figure-caption">المنظر الخلفي (Posterior)</div>
            <div className="svg-container">
              <svg viewBox="0 0 160 310" className="realistic-anatomy-svg">
                {/* --- HEAD & NECK POSTERIOR --- */}
                <ellipse
                  cx="80"
                  cy="24"
                  rx="14"
                  ry="17"
                  fill="url(#skinBase)"
                />

                {/* --- TRAPEZIUS (UPPER & MID BACK) --- */}
                <path
                  d="M80 38 L65 52 C72 65, 78 78, 80 82 C82 78, 88 65, 95 52 Z"
                  fill={isBack ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isBack ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- REAR DELTOIDS (الكتف الخلفي) --- */}
                {/* Left Rear Delt */}
                <path
                  d="M58 53 C50 54, 40 59, 38 70 C36 80, 42 88, 48 89 C52 83, 56 75, 59 66 Z"
                  fill={isShoulders ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isShoulders ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Rear Delt */}
                <path
                  d="M102 53 C110 54, 120 59, 122 70 C124 80, 118 88, 112 89 C108 83, 104 75, 101 66 Z"
                  fill={isShoulders ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isShoulders ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- LATISSIMUS DORSI & RHOMBOIDS (عضلات الظهر العريضة) --- */}
                {/* Left Lat */}
                <path
                  d="M59 68 C68 76, 75 88, 75 112 C68 116, 62 108, 56 86 Z"
                  fill={isBack ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isBack ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Lat */}
                <path
                  d="M101 68 C92 76, 85 88, 85 112 C92 116, 98 108, 104 86 Z"
                  fill={isBack ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isBack ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- TRICEPS (POSTERIOR ARM - HORSESHOE) --- */}
                {/* Left Tricep */}
                <path
                  d="M48 87 C44 94, 43 108, 48 116 C53 113, 56 104, 55 92 Z"
                  fill={
                    isTriceps
                      ? 'url(#activeMuscle3D)'
                      : isArms && !isBiceps
                        ? 'url(#activeMuscle3D)'
                        : isChestSynergyTriceps
                          ? 'url(#synergyMuscle3D)'
                          : 'url(#skinBase)'
                  }
                  filter={isTriceps ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Tricep */}
                <path
                  d="M112 87 C116 94, 117 108, 112 116 C107 113, 104 104, 105 92 Z"
                  fill={
                    isTriceps
                      ? 'url(#activeMuscle3D)'
                      : isArms && !isBiceps
                        ? 'url(#activeMuscle3D)'
                        : isChestSynergyTriceps
                          ? 'url(#synergyMuscle3D)'
                          : 'url(#skinBase)'
                  }
                  filter={isTriceps ? 'url(#muscleGlow)' : undefined}
                />

                {/* Forearms Back */}
                <path
                  d="M46 118 C40 126, 38 142, 42 154 C46 153, 49 146, 51 130 C52 124, 49 120, 46 118 Z"
                  fill="url(#skinShadow)"
                />
                <path
                  d="M114 118 C120 126, 122 142, 118 154 C114 153, 111 146, 109 130 C108 124, 111 120, 114 118 Z"
                  fill="url(#skinShadow)"
                />

                {/* --- LOWER BACK (ERECTOR SPINAE) --- */}
                <path
                  d="M74 106 L86 106 L84 126 L76 126 Z"
                  fill={isBack ? 'url(#synergyMuscle3D)' : 'url(#skinShadow)'}
                />

                {/* --- GLUTEUS MAXIMUS (عضلات الألوية / المؤخرة) --- */}
                {/* Left Glute */}
                <path
                  d="M62 125 C72 124, 78 128, 78 145 C78 158, 68 158, 60 152 C56 142, 57 132, 62 125 Z"
                  fill={
                    isLegsSynergyGlutes
                      ? 'url(#synergyMuscle3D)'
                      : 'url(#skinBase)'
                  }
                  filter={isLegs ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Glute */}
                <path
                  d="M98 125 C88 124, 82 128, 82 145 C82 158, 92 158, 100 152 C104 142, 103 132, 98 125 Z"
                  fill={
                    isLegsSynergyGlutes
                      ? 'url(#synergyMuscle3D)'
                      : 'url(#skinBase)'
                  }
                  filter={isLegs ? 'url(#muscleGlow)' : undefined}
                />

                {/* --- HAMSTRINGS (POSTERIOR THIGHS) --- */}
                {/* Left Hamstring */}
                <path
                  d="M60 155 C54 168, 55 185, 60 200 C66 202, 73 198, 76 182 C77 168, 74 158, 60 155 Z"
                  fill={isLegs ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isLegs ? 'url(#muscleGlow)' : undefined}
                />
                {/* Right Hamstring */}
                <path
                  d="M100 155 C106 168, 105 185, 100 200 C94 202, 87 198, 84 182 C83 168, 86 158, 100 155 Z"
                  fill={isLegs ? 'url(#activeMuscle3D)' : 'url(#skinBase)'}
                  filter={isLegs ? 'url(#muscleGlow)' : undefined}
                />

                {/* Knee Backs */}
                <circle cx="68" cy="207" r="5" fill="url(#skinShadow)" />
                <circle cx="92" cy="207" r="5" fill="url(#skinShadow)" />

                {/* --- CALVES (GASTROCNEMIUS DIAMOND & SOLEUS) --- */}
                {/* Left Calf */}
                <path
                  d="M62 215 C54 225, 54 246, 62 262 C68 262, 72 250, 72 230 C72 220, 68 215, 62 215 Z"
                  fill={isLegs ? 'url(#synergyMuscle3D)' : 'url(#skinBase)'}
                />
                {/* Right Calf */}
                <path
                  d="M98 215 C106 225, 106 246, 98 262 C92 262, 88 250, 88 230 C88 220, 92 215, 98 215 Z"
                  fill={isLegs ? 'url(#synergyMuscle3D)' : 'url(#skinBase)'}
                />

                {/* Heels */}
                <path
                  d="M60 277 L69 277 L71 292 L58 292 Z"
                  fill="url(#skinShadow)"
                />
                <path
                  d="M100 277 L91 277 L89 292 L102 292 Z"
                  fill="url(#skinShadow)"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ===== DETAILED MUSCLE INVOLVEMENT BREAKDOWN (ACCORDING TO USER SELECTION) ===== */}
        <div className="anatomy-details-panel">
          {/* Primary Muscles */}
          <div className="detail-section">
            <h5 className="section-title primary-title">
              <span className="dot dot-primary"></span>
              العضلات المستهدفة الأساسية (Primary Active Focus)
            </h5>
            <div className="cards-stack">
              {muscleBreakdown.primary.map((m, idx) => (
                <div key={idx} className="muscle-info-card card-primary">
                  <div className="card-top-row">
                    <strong className="muscle-name">{m.nameAr}</strong>
                    <span className="involvement-pill primary-pill">
                      {m.percentage}% تركيز رئيسي
                    </span>
                  </div>
                  <div className="latin-name">{m.nameLatin}</div>
                  <p className="muscle-desc">{m.descriptionAr}</p>
                  {m.heads && m.heads.length > 0 && (
                    <div className="heads-tags">
                      <span className="heads-label">الرؤوس المفعلة:</span>
                      {m.heads.map((head, hIdx) => (
                        <span key={hIdx} className="head-tag">
                          {head}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Secondary / Synergist Muscles */}
          {muscleBreakdown.secondary.length > 0 && (
            <div className="detail-section">
              <h5 className="section-title secondary-title">
                <span className="dot dot-secondary"></span>
                العضلات المساعدة والمثبتة (Synergists & Stabilizers)
              </h5>
              <div className="cards-stack">
                {muscleBreakdown.secondary.map((m, idx) => (
                  <div key={idx} className="muscle-info-card card-secondary">
                    <div className="card-top-row">
                      <strong className="muscle-name">{m.nameAr}</strong>
                      <span className="involvement-pill secondary-pill">
                        {m.percentage}% مساعدة
                      </span>
                    </div>
                    <div className="latin-name">{m.nameLatin}</div>
                    <p className="muscle-desc">{m.descriptionAr}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
