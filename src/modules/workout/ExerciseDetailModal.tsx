import type { Exercise, MuscleGroup } from '../shared/types.ts'
import {
  DIFFICULTY_LABELS,
  EQUIPMENT_LABELS,
  MUSCLE_GROUP_LABELS,
} from '../shared/types.ts'
import { ExerciseVisual } from './ExerciseVisual.tsx'
import { AnatomyMuscleMap } from './AnatomyMuscleMap.tsx'
import { simplifyMuscleList, formatHowToStep } from './muscleHelper.ts'

interface ExerciseDetailModalProps {
  exercise: Exercise | null
  onClose: () => void
}

/**
 * Returns default comprehensive scientific information if an exercise object is missing fields.
 */
function getEnrichedExercise(ex: Exercise): {
  description: string
  mechanics: string
  benefit: string
  targetMuscles: string[]
  howToSteps: string[]
  avoidInjuries: string[]
} {
  const categoryDefaults: Record<
    MuscleGroup,
    {
      description: string
      mechanics: string
      benefit: string
      targetMuscles: string[]
      howToSteps: string[]
    }
  > = {
    chest: {
      description:
        'تمرين دفع أفقي مركب يركز على تفعيل واستطالة الألياف الصدرية وزيادة القوة العضلية للجزء العلوي.',
      mechanics:
        'حركة ضغط أفقية متعددة المفاصل تشمل مفصل الكتف والمرفق مع انقباض لا مركزي متحكم فيه وثبات عظمي لوح الكتف.',
      benefit:
        'بناء الكتلة العضلية للصدر وتطوير القوة الانفجارية للجزء العلوي من الجسم مع تحسين استقرار مفصل الكتف وقوة الدفع اليومية.',
      targetMuscles: [
        'العضلة الصدرية الكبرى (Pectoralis Major)',
        'العضلة الدالية الأمامية (Anterior Deltoid)',
        'العضلة ثلاثية الرؤوس (Triceps)',
      ],
      howToSteps: [
        'اضبط وضعية البداية مع تثبيت القدمين والأكتاف بإحكام لضمان ثبات الجذع',
        'انزل بالوزن ببطء وتحكم في مرحلة الهبوط اللامركزية (2-3 ثوانٍ) مع استنشاق الهواء (شهيق)',
        'ادفع بقوة في مرحلة الصعود المركزي مع زفير كامل والتركيز على عصر عضلة الصدر',
        'حافظ على ثبات المرفقين بزاوية مريحة (45 إلى 75 درجة) لتفادي إجهاد أوتار الكتف',
      ],
    },
    back: {
      description:
        'تمرين سحب مركب لتطوير سماكة وعرض الظهر وبناء وضعية قوام صحية ومثالية.',
      mechanics:
        'حركة سحب عمودية/أفقية تتضمن انقباضاً كاملاً لعضلات اللاتس مع ضم لوحي الكتف (Scapular Retraction).',
      benefit:
        'تقوية الظهر العلوي والسفلي، تحسين استقامة العمود الفقري والوقاية من انحناء الكتفين، وزيادة قوة القبضة والسحب.',
      targetMuscles: [
        'العضلة الظهرية العريضة (Latissimus Dorsi)',
        'عضلات أعلى الظهر والترابيس (Trapezius & Rhomboids)',
        'عضلة البايسبس (Biceps)',
      ],
      howToSteps: [
        'ابدأ بسحب لوحي الكتف للخلف والأسفل قبل بدء ثني الذراعين',
        'اسحب الوزن باتجاه الجسم مع التركيز على القيادة بالمرفقين وليس باليدين فقط',
        'اعصر عضلات الظهر في نقطة قمة الانقباض لمدة ثانية واحدة',
        'انزل بالوزن ببطء وبامتداد كامل ومتحكم فيه دون تأرجح الجذع',
      ],
    },
    legs: {
      description:
        'تمرين مركب للجزء السفلي يستهدف بناء عضلات الفخذين والألوية وتعزيز التوازن وقوة الجسم الأساسية.',
      mechanics:
        'حركة ثني وبسط لمفصلي الركبة والورك مع توزيع متساوٍ للوزن على منتصف باطن القدم والكعبين.',
      benefit:
        'تحفيز إفراز الهرمونات البنائية، حرق السعرات الحرارية بكفاءة عالية، وزيادة القوة الوظيفية والقفز وتحمل المفاصل.',
      targetMuscles: [
        'العضلة الرباعية (Quadriceps)',
        'عضلات الألوية الكبرى (Gluteus Maximus)',
        'أوتار الركبة (Hamstrings)',
        'عضلات الساق والكاحل',
      ],
      howToSteps: [
        'قف مع مباعدة القدمين بعرض الكتفين مع توجيه أصابع القدمين للخارج قليلاً (15-30 درجة)',
        'انزل بالوركين للخلف والأسفل كأنك تجلس على كرسي، مع الحفاظ على استقامة الصدر والعمود الفقري',
        'انزل حتى تصبح الفخذان موازية للأرض تقريباً مع بقاء الركبتين في مسار أصابع القدمين',
        'ادفع بقوة من خلال الكعبين للعودة إلى وضعية البداية مع زفير منظم',
      ],
    },
    shoulders: {
      description:
        'تمرين دفع رأسي وعزل للأكتاف لبناء استدارة كاملة وثبات للحزام الكتفي.',
      mechanics:
        'حركة رفع وضغط تعتمد على مفصل الكتف مع ثبات جذعي كامل دون إفراط في تقويس أسفل الظهر.',
      benefit:
        'بناء الأكتاف العريضة (3D Shoulders)، تعزيز قوة الرفع فوق الرأس، وتحسين توازن القوة بين مقدمة وخلفية الجسم.',
      targetMuscles: [
        'العضلة الدالية الجانبية والأمامية (Lateral & Anterior Deltoids)',
        'عضلة الترايسبس (Triceps)',
        'عضلات الحزام الكتفي المثبتة',
      ],
      howToSteps: [
        'اضبط وضعية البداية مع شد عضلات البطن والألوية لتثبيت العمود الفقري',
        'ارفع أو اضغط الوزن بمسار محكم دون استخدام قوة الدفع من الساقين (Strict Form)',
        'توقف في قمة الحركة لثانية واحدة مع عصر العضلة المستهدفة',
        'أنزل الوزن بتحكم كامل في مرحلة الهبوط (3 ثوانٍ)',
      ],
    },
    arms: {
      description:
        'تمرين عزل وتركيز لعضلات الذراعين (البايسبس / الترايسبس) لزيادة الحجم والقوة العضلية.',
      mechanics:
        'حركة ثني أو بسط مفردة لمفصل المرفق مع تثبيت تام للكتفين والمرفقين بجانب الجسم.',
      benefit:
        'زيادة محيط وحجم الذراعين، تقوية مفاصل الكوع والرسغين، وتحسين الأداء في كافة تمارين السحب والدفع الكبرى.',
      targetMuscles: [
        'العضلة ذات الرأسين العضدية (Biceps Brachii)',
        'العضلة ثلاثية الرؤوس (Triceps)',
        'عضلات الساعد والقبضة',
      ],
      howToSteps: [
        'ثبّت المرفقين بإحكام بجانب الجذع وتجنب أرجحة الجسم للأمام أو الخلف',
        'قم بثني/بسط الذراع بالكامل للوصول لأقصى انقباض عضلي',
        'انزل بالوزن ببطء حتى الامتداد العضلي الكامل لتحقيق أقصى استطالة تحت الشد',
      ],
    },
    core: {
      description:
        'تمرين تقوية الجذع وعضلات البطن لزيادة الثبات المركزي والوقاية من آلام الظهر.',
      mechanics:
        'انقباض عضلي ثابت (Isometric) أو ديناميكي مع تثبيت الحوض واستقامة الفقرات القطنية.',
      benefit:
        'تقوية جدار البطن الداخلي، حماية أسفل الظهر من الإصابات، ونقل القوة بكفاءة بين الجزء السفلي والعلوي للجسم.',
      targetMuscles: [
        'العضلة المستقيمة البطنية (Rectus Abdominis)',
        'العضلات المائلة (Obliques)',
        'العضلة المستعرضة العميقة (Transverse Abdominis)',
      ],
      howToSteps: [
        'اتخذ الوضعية مع شد عضلات البطن للداخل كأنك تستعد لصد ضربة',
        'حافظ على تنفس هادئ ومنتظم دون كتم النفس',
        'ركز على عصر عضلات البطن في كل عدة بدلاً من الاعتماد على عضلات الرقبة أو الحوض',
      ],
    },
  }

  const cat = (
    ex.category in categoryDefaults ? ex.category : 'chest'
  ) as MuscleGroup
  const defaults = categoryDefaults[cat]

  const rawMuscles =
    ex.targetMusclesAr && ex.targetMusclesAr.length > 0
      ? ex.targetMusclesAr
      : defaults.targetMuscles

  const rawSteps =
    ex.howToStepsAr && ex.howToStepsAr.length > 0
      ? ex.howToStepsAr
      : defaults.howToSteps

  return {
    description: ex.descriptionAr || defaults.description,
    mechanics: ex.mechanicsAr || defaults.mechanics,
    benefit: ex.benefitAr || defaults.benefit,
    targetMuscles: simplifyMuscleList(rawMuscles),
    howToSteps: rawSteps.map((step, idx) =>
      formatHowToStep(step, idx, ex.category),
    ),
    avoidInjuries: ex.avoidForInjuries || [],
  }
}

export function ExerciseDetailModal({
  exercise,
  onClose,
}: ExerciseDetailModalProps) {
  if (!exercise) return null

  const details = getEnrichedExercise(exercise)
  const primaryTitle = exercise.name || exercise.nameAr
  const subtitleAr =
    exercise.name && exercise.nameAr && exercise.name !== exercise.nameAr
      ? exercise.nameAr
      : ''

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      data-testid="exercise-detail-modal"
    >
      <div
        className="modal-content card exercise-detail-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div className="title-with-visual">
            <ExerciseVisual
              category={exercise.category}
              exerciseId={exercise.id}
              exerciseName={primaryTitle}
              imageUrl={exercise.imageUrl}
              size="medium"
            />
            <div>
              <h2 style={{ fontSize: '18px', margin: '0 0 2px' }}>
                {primaryTitle}
              </h2>
              {subtitleAr && (
                <div
                  style={{
                    color: 'var(--primary)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {subtitleAr}
                </div>
              )}
              <span className="muted-small">
                {MUSCLE_GROUP_LABELS[exercise.category] || exercise.category} •{' '}
                {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment} •{' '}
                {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="close-btn"
            onClick={onClose}
            title="إغلاق"
          >
            ✕
          </button>
        </div>

        <div className="modal-body">
          {/* Visual Presentation Area (Animated Movement Loop) */}
          <div className="exercise-showcase-box">
            <ExerciseVisual
              category={exercise.category}
              exerciseId={exercise.id}
              exerciseName={exercise.nameAr}
              imageUrl={exercise.imageUrl}
              size="large"
              isAnimated={true}
            />
            <div className="showcase-meta">
              <span className="showcase-tag">
                🎯 الاستهداف: {details.targetMuscles[0] || 'عضلة رئيسية'}
              </span>
              <span className="showcase-tag">
                ⚙️ الأداة:{' '}
                {EQUIPMENT_LABELS[exercise.equipment] || exercise.equipment}
              </span>
              <span className="showcase-tag">
                📊 المستوى:{' '}
                {DIFFICULTY_LABELS[exercise.difficulty] || exercise.difficulty}
              </span>
            </div>
          </div>

          {/* 1. Scientific Benefits (الفوائد بالتفصيل) */}
          <div className="detail-section benefit-box">
            <h3>🔬 الفائدة العلمية والتأثير العضلي (Scientific Benefits)</h3>
            <p className="highlight-text">{details.benefit}</p>
          </div>

          {/* 2. Targeted Muscles with Anatomy Map (العضلات المستهدفة بالخريطة التشريحية) */}
          <div className="detail-section muscles-box">
            <h3>🎯 خريطة العضلات المستهدفة تشريحياً (Anatomical Muscle Map)</h3>
            <p className="muted-small" style={{ marginBottom: '10px' }}>
              توضح الخريطة التالية باللون الأحمر العضلات النشطة الأساسية
              والمساعدة أثناء أداء تمرين {exercise.nameAr}:
            </p>
            <AnatomyMuscleMap
              category={exercise.category}
              exerciseName={exercise.nameAr}
              targetMuscles={details.targetMuscles}
            />

            <div className="muscle-tags-grid" style={{ marginTop: '14px' }}>
              {details.targetMuscles.map((muscle, idx) => (
                <div
                  key={idx}
                  className={`muscle-tag-card ${idx === 0 ? 'primary-muscle' : 'secondary-muscle'}`}
                >
                  <span className="muscle-type-badge">
                    {idx === 0
                      ? 'عضلة أساسية (Primary Target)'
                      : 'عضلة مساعدة (Secondary Target)'}
                  </span>
                  <strong>{muscle}</strong>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Mechanics (ميكانيكا الحركة) */}
          <div className="detail-section highlight-box">
            <h3>⚙️ ميكانيكا الحركة والتكنيك (Movement Mechanics)</h3>
            <p>{details.mechanics}</p>
          </div>

          {/* 4. Step-by-Step Instructions (طريقة عمل التمرين خطوة بخطوة) */}
          <div className="detail-section steps-box">
            <h3>📋 خطوات الأداء الصحيحة خطوة بخطوة (How-to Guide)</h3>
            <ol className="detailed-steps-list">
              {details.howToSteps.map((step, idx) => (
                <li key={idx} className="step-item">
                  <span className="step-num">{idx + 1}</span>
                  <div className="step-content">{step}</div>
                </li>
              ))}
            </ol>
          </div>

          {/* 5. Injury Warnings (محاذير الإصابات) */}
          {details.avoidInjuries.length > 0 && (
            <div className="detail-section warning-box">
              <h3>⚠️ محاذير الإصابات والأمان (Safety Warning)</h3>
              <p>
                يُنصح بتجنب هذا التمرين أو استبداله ببديل مريح إذا كان لديك ألم
                أو إصابة سابقة في:{' '}
                <strong>{details.avoidInjuries.join('، ')}</strong>.
              </p>
            </div>
          )}

          {/* 6. Scientific Reference */}
          <div className="detail-section source-box">
            <span className="muted-small">
              📚 المرجع العلمي:{' '}
              {exercise.medicalSource ||
                "ACSM's Guidelines for Exercise Testing and Prescription & NSCA Standards"}
            </span>
          </div>
        </div>

        <div className="modal-footer actions-row">
          <button type="button" className="button-primary" onClick={onClose}>
            فهمت، إغلاق الشرح
          </button>
        </div>
      </div>
    </div>
  )
}
