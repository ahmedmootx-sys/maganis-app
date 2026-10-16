import { useState, useMemo } from 'react'
import type { TrackingSession, BodyLogEntry } from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import { getExerciseById } from '../workout/exercises.ts'
import { calculateCalorieMacroTargets } from '../nutrition/calorieCalculator.ts'
import { SvgLineChart } from './SvgLineChart.tsx'
import { ConfirmSheet } from '../../ui/index.ts'

interface ReportsProps {
  sessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  profile?: UserProfile | null
  onUpdateSessions?: (sessions: TrackingSession[]) => void
  onUpdateBodyLog?: (bodyLog: BodyLogEntry[]) => void
}

type DateRange = '4w' | '12w' | '1y' | 'all'

const RANGE_LABELS: Record<DateRange, string> = {
  '4w': 'شهر (4 أسابيع)',
  '12w': '3 شهور (12 أسبوعاً)',
  '1y': 'سنة كاملة (52 أسبوعاً)',
  all: 'الكل',
}

function weeksAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n * 7)
  d.setHours(0, 0, 0, 0)
  return d
}

function getWeekStart(dateStr: string): string {
  const d = new Date(dateStr)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function weekLabel(weekStart: string): string {
  const d = new Date(weekStart)
  return `${d.getDate()}/${d.getMonth() + 1}`
}

export function Reports({
  sessions,
  bodyLog,
  profile,
  onUpdateSessions,
  onUpdateBodyLog,
}: ReportsProps) {
  const [range, setRange] = useState<DateRange>('4w')
  const [resetNonce, setResetNonce] = useState(0)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [reportStatusMessage, setReportStatusMessage] = useState<string | null>(
    null,
  )

  function showMessage(msg: string) {
    setReportStatusMessage(msg)
    setTimeout(() => setReportStatusMessage(null), 3500)
  }

  function handleExportReports() {
    try {
      const allNutritionLogs: { key: string; value: unknown }[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('maganis:daily_nutrition_')) {
          const raw = localStorage.getItem(k)
          if (raw) {
            allNutritionLogs.push({ key: k, value: JSON.parse(raw) })
          }
        }
      }

      const exportPayload = {
        type: 'maganis-reports-backup',
        version: 1,
        exportedAt: Date.now(),
        exportedDate: new Date().toISOString(),
        sessions,
        bodyLog,
        nutritionLogs: allNutritionLogs,
      }

      const jsonStr = JSON.stringify(exportPayload, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const todayStr = new Date().toISOString().split('T')[0]
      a.href = url
      a.download = `maganis-reports-${todayStr}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      showMessage('✓ تم تصدير ملف التقارير بنجاح!')
    } catch (e) {
      console.error(e)
      showMessage('حدث خطأ أثناء تصدير التقارير.')
    }
  }

  function handleImportReports(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const content = evt.target?.result as string
        const parsed = JSON.parse(content)
        if (
          parsed.type !== 'maganis-reports-backup' ||
          !Array.isArray(parsed.sessions)
        ) {
          showMessage(
            'ملف غير صالح! يرجى اختيار ملف تقارير صالح تم تصديره من تطبيق مجانص.',
          )
          return
        }

        if (Array.isArray(parsed.sessions) && onUpdateSessions) {
          onUpdateSessions(parsed.sessions)
        }
        if (Array.isArray(parsed.bodyLog) && onUpdateBodyLog) {
          onUpdateBodyLog(parsed.bodyLog)
        }
        if (Array.isArray(parsed.nutritionLogs)) {
          for (const item of parsed.nutritionLogs) {
            if (item.key && item.value) {
              localStorage.setItem(item.key, JSON.stringify(item.value))
            }
          }
        }
        setResetNonce((p) => p + 1)
        showMessage('✓ تم استيراد بيانات وسجلات التقارير بنجاح!')
      } catch (err) {
        console.error(err)
        showMessage('تعذر قراءة ملف التقارير. تأكد من سلامة ملف JSON.')
      }
    }
    reader.readAsText(file)
    e.target.value = ''
  }

  function handleResetReports() {
    setShowResetConfirm(true)
  }

  function doResetReports() {
    try {
      if (onUpdateSessions) onUpdateSessions([])
      if (onUpdateBodyLog) onUpdateBodyLog([])

      const keysToRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('maganis:daily_nutrition_')) {
          keysToRemove.push(k)
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k))

      setResetNonce((p) => p + 1)
      showMessage('تم تصفير سجلات التقارير بنجاح.')
    } catch (e) {
      console.error(e)
      showMessage('حدث خطأ أثناء تصفير التقارير.')
    }
  }

  const cutoff = useMemo(() => {
    if (range === 'all') return new Date(0)
    return weeksAgo(range === '4w' ? 4 : range === '12w' ? 12 : 52)
  }, [range])

  const targets = useMemo(() => {
    if (!profile) return null
    return calculateCalorieMacroTargets(profile)
  }, [profile])

  // --- Nutrition Tracking & Adherence Data ---
  const nutritionLogs = useMemo(() => {
    const list: {
      date: string
      consumedCalories: number
      consumedProtein: number
      consumedCarbs: number
      consumedFats: number
      loggedMeals: {
        mealId: string
        nameAr: string
        calories: number
        protein: number
        carbs: number
        fats: number
      }[]
    }[] = []

    // Re-read storage whenever resetNonce changes
    void resetNonce

    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith('maganis:daily_nutrition_')) {
          const raw = localStorage.getItem(k)
          if (raw) {
            const parsed = JSON.parse(raw)
            if (parsed.date) {
              const entryDate = new Date(parsed.date)
              if (entryDate >= cutoff) {
                list.push(parsed)
              }
            }
          }
        }
      }
    } catch {
      // ignore
    }

    return list.sort((a, b) => a.date.localeCompare(b.date))
  }, [cutoff, resetNonce])

  const targetCalories = targets?.targetCalories ?? 2000
  const targetProtein = targets?.proteinGrams ?? 140

  const daysWithNutrition = nutritionLogs.filter((l) => l.consumedCalories > 0)
  const totalDaysLogged = daysWithNutrition.length

  const calorieHitDays = daysWithNutrition.filter(
    (l) =>
      Math.abs(l.consumedCalories - targetCalories) <= targetCalories * 0.15,
  ).length
  const calorieAdherencePct =
    totalDaysLogged > 0
      ? Math.round((calorieHitDays / totalDaysLogged) * 100)
      : 0

  const proteinHitDays = daysWithNutrition.filter(
    (l) => l.consumedProtein >= targetProtein * 0.9,
  ).length
  const proteinAdherencePct =
    totalDaysLogged > 0
      ? Math.round((proteinHitDays / totalDaysLogged) * 100)
      : 0

  const avgCalories =
    totalDaysLogged > 0
      ? Math.round(
          daysWithNutrition.reduce((sum, l) => sum + l.consumedCalories, 0) /
            totalDaysLogged,
        )
      : 0
  const avgProtein =
    totalDaysLogged > 0
      ? Math.round(
          daysWithNutrition.reduce((sum, l) => sum + l.consumedProtein, 0) /
            totalDaysLogged,
        )
      : 0

  // Aggregate top confirmed / eaten foods in this period
  const topFoods = useMemo(() => {
    const foodMap: Record<
      string,
      { nameAr: string; count: number; totalCalories: number }
    > = {}
    for (const log of daysWithNutrition) {
      for (const meal of log.loggedMeals || []) {
        const key = meal.nameAr || meal.mealId
        if (!foodMap[key]) {
          foodMap[key] = {
            nameAr: meal.nameAr || 'وجبة مجهولة',
            count: 0,
            totalCalories: 0,
          }
        }
        foodMap[key].count += 1
        foodMap[key].totalCalories += Math.round(meal.calories || 0)
      }
    }
    return Object.values(foodMap).sort((a, b) => b.count - a.count)
  }, [daysWithNutrition])

  const calorieData = daysWithNutrition.map((l) => ({
    label: l.date.slice(5),
    value: l.consumedCalories,
  }))

  const proteinData = daysWithNutrition.map((l) => ({
    label: l.date.slice(5),
    value: l.consumedProtein,
  }))

  const filteredSessions = sessions.filter((s) => new Date(s.date) >= cutoff)

  // --- Training volume per week ---
  const volumeByWeek: Record<string, number> = {}
  for (const session of filteredSessions) {
    const wk = getWeekStart(session.date)
    if (!volumeByWeek[wk]) volumeByWeek[wk] = 0
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        volumeByWeek[wk] += set.reps * set.weightKg
      }
    }
  }
  const volumeData = Object.entries(volumeByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([wk, vol]) => ({ label: weekLabel(wk), value: Math.round(vol) }))

  // --- Sessions per week ---
  const sessionsByWeek: Record<string, number> = {}
  for (const session of filteredSessions) {
    const wk = getWeekStart(session.date)
    sessionsByWeek[wk] = (sessionsByWeek[wk] ?? 0) + 1
  }
  const sessionsData = Object.entries(sessionsByWeek)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([wk, count]) => ({ label: weekLabel(wk), value: count }))

  // --- Body weight trend ---
  const filteredBodyLog = bodyLog
    .filter((e) => new Date(e.date) >= cutoff)
    .sort((a, b) => a.date.localeCompare(b.date))
  const weightData = filteredBodyLog.map((e) => ({
    label: e.date.slice(5), // MM-DD
    value: e.weightKg,
  }))

  // --- Personal records ---
  const prMap: Record<string, { name: string; weight: number }> = {}
  for (const session of sessions) {
    for (const ex of session.exercises) {
      const info = getExerciseById(ex.exerciseId)
      const name = info?.nameAr ?? ex.exerciseId
      const maxWeight = Math.max(...ex.sets.map((s) => s.weightKg), 0)
      if (maxWeight > 0) {
        if (!prMap[ex.exerciseId] || maxWeight > prMap[ex.exerciseId].weight) {
          prMap[ex.exerciseId] = { name, weight: maxWeight }
        }
      }
    }
  }
  const personalRecords = Object.values(prMap).sort(
    (a, b) => b.weight - a.weight,
  )

  // --- SVG Bar Chart helper ---
  function BarChart({
    data: barData,
  }: {
    data: { label: string; value: number }[]
  }) {
    if (barData.length === 0) return <p className="muted">لا توجد بيانات</p>
    const maxVal = Math.max(...barData.map((d) => d.value), 1)
    return (
      <div className="bar-chart">
        {barData.map((d, i) => (
          <div key={i} className="bar-chart__item">
            <div
              className="bar-chart__bar"
              style={{ height: `${(d.value / maxVal) * 100}%` }}
              title={`${d.label}: ${d.value}`}
            />
            <span className="bar-chart__label">{d.label}</span>
            <span className="bar-chart__value">{d.value}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="reports">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '16px',
        }}
      >
        <h2 className="reports__title" style={{ margin: 0 }}>
          التقارير والإحصائيات الشاملة
        </h2>
        {reportStatusMessage && (
          <span
            style={{
              fontSize: '12.5px',
              fontWeight: 700,
              color: 'var(--accent)',
              background: 'var(--accent-soft)',
              padding: '4px 12px',
              borderRadius: '999px',
              border: '1px solid var(--accent)',
            }}
          >
            {reportStatusMessage}
          </span>
        )}
      </div>

      {/* Reports Data Management (Export / Import / Reset) */}
      <div
        className="card reports-management-card"
        style={{
          border: '1.5px solid var(--accent)',
          background: 'var(--card-bg)',
          padding: '14px 16px',
          marginBottom: '16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          <div>
            <h3
              style={{
                margin: 0,
                fontSize: '15px',
                color: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              إدارة بيانات وسجلات التقارير
            </h3>
            <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
              تصدير واستيراد وإعادة تعيين سجلات التمارين والتغذية والوزن بشكل
              منفصل
            </span>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="button-primary small"
              onClick={handleExportReports}
              style={{ fontWeight: 700 }}
            >
              تصدير التقارير (JSON)
            </button>
            <label
              className="button-secondary small"
              style={{
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                margin: 0,
                fontWeight: 700,
              }}
            >
              استيراد تقارير
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                onChange={handleImportReports}
              />
            </label>
            <button
              type="button"
              className="ghost-danger tiny"
              onClick={handleResetReports}
              style={{ fontWeight: 700 }}
            >
              تصفير التقارير (Reset)
            </button>
          </div>
        </div>
      </div>

      <div className="reports__range-selector">
        {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
          <button
            key={r}
            type="button"
            className={r === range ? 'option-btn selected' : 'option-btn'}
            onClick={() => setRange(r)}
          >
            {RANGE_LABELS[r]}
          </button>
        ))}
      </div>

      {/* ===== SECTION: NUTRITION & MACROS ADHERENCE TRACKING ===== */}
      <div
        className="card reports__section"
        style={{ border: '2px solid var(--accent)' }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            marginBottom: '14px',
          }}
        >
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--accent)' }}>
              تقارير الالتزام بالتغذية والسعرات والماكروز
            </h3>
            <p className="muted-small" style={{ margin: '4px 0 0' }}>
              متابعة مدى تحقيقك للأهداف الغذائية خلال ({RANGE_LABELS[range]})
            </p>
          </div>
          <span
            style={{
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '12px',
              fontWeight: 800,
              background: calorieAdherencePct >= 70 ? '#f0fdf4' : '#fffbeb',
              color: calorieAdherencePct >= 70 ? '#166534' : '#b45309',
              border: `1px solid ${calorieAdherencePct >= 70 ? '#86efac' : '#fde68a'}`,
            }}
          >
            {calorieAdherencePct >= 70
              ? 'التزام ممتاز بالدايت'
              : 'بحاجة لزيادة الالتزام'}
          </span>
        </div>

        {/* Adherence Score Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: '10px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              أيام تسجيل الوجبات
            </span>
            <strong style={{ fontSize: '20px', color: 'var(--ink)' }}>
              {totalDaysLogged}
            </strong>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              يوم مسجل
            </span>
          </div>

          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              نسبة الالتزام بالسعرات
            </span>
            <strong
              style={{
                fontSize: '20px',
                color: calorieAdherencePct >= 70 ? '#16a34a' : '#d97706',
              }}
            >
              {calorieAdherencePct}%
            </strong>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              الهدف: {targetCalories} سعرة
            </span>
          </div>

          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              نسبة تحقيق البروتين
            </span>
            <strong
              style={{
                fontSize: '20px',
                color: proteinAdherencePct >= 70 ? '#16a34a' : '#d97706',
              }}
            >
              {proteinAdherencePct}%
            </strong>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              الهدف: {targetProtein} جم
            </span>
          </div>

          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              متوسط السعرات اليومي
            </span>
            <strong style={{ fontSize: '20px', color: 'var(--ink)' }}>
              {avgCalories}
            </strong>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              سعرة حرارية
            </span>
          </div>

          <div
            style={{
              background: 'var(--card-subtle)',
              padding: '12px',
              borderRadius: '10px',
              textAlign: 'center',
              border: '1px solid var(--line)',
            }}
          >
            <span
              style={{
                fontSize: '11.5px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              متوسط البروتين اليومي
            </span>
            <strong style={{ fontSize: '20px', color: 'var(--ink)' }}>
              {avgProtein}
            </strong>
            <span
              style={{
                fontSize: '11px',
                color: 'var(--muted)',
                display: 'block',
              }}
            >
              جرام بروتين
            </span>
          </div>
        </div>

        {/* Calorie Intake Chart */}
        <div style={{ marginTop: '12px', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '13.5px', margin: '0 0 8px' }}>
            السعرات الحرارية المسجلة يومياً (الهدف: {targetCalories} ك.س)
          </h4>
          <BarChart data={calorieData} />
        </div>

        {/* Protein Intake Chart */}
        <div style={{ marginTop: '12px', marginBottom: '14px' }}>
          <h4 style={{ fontSize: '13.5px', margin: '0 0 8px' }}>
            كمية البروتين اليومية (الهدف: {targetProtein} جم)
          </h4>
          <BarChart data={proteinData} />
        </div>

        {/* Top Confirmed / Logged Foods */}
        <div
          style={{
            marginTop: '14px',
            paddingTop: '12px',
            borderTop: '1px solid var(--line)',
          }}
        >
          <h4 style={{ fontSize: '14px', margin: '0 0 8px' }}>
            أكثر الأغذية والوجبات التي تم تناولها وتأكيدها في هذا النطاق:
          </h4>
          {topFoods.length === 0 ? (
            <p className="muted" style={{ fontSize: '12.5px' }}>
              لم يتم تسجيل وجبات في هذا النطاق الزمني بعد. يمكنك تسجيل وجباتك من
              قسم "التغذية".
            </p>
          ) : (
            <ul
              style={{
                listStyle: 'none',
                margin: 0,
                padding: 0,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '8px',
              }}
            >
              {topFoods.slice(0, 10).map((food, idx) => (
                <li
                  key={idx}
                  style={{
                    background: 'var(--card-subtle)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid var(--line)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: '13px' }}>{food.nameAr}</strong>
                    <div style={{ fontSize: '11.5px', color: 'var(--muted)' }}>
                      إجمالي: {food.totalCalories} سعرة
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11px',
                      background: 'var(--accent)',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '999px',
                      fontWeight: 700,
                    }}
                  >
                    {food.count} مرات
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="card reports__section">
        <h3>حجم التدريب الأسبوعي</h3>
        <BarChart data={volumeData} />
      </div>

      <div className="card reports__section">
        <h3>اتجاه الوزن</h3>
        <SvgLineChart
          data={weightData}
          width={400}
          height={200}
          color="#0284c7"
        />
      </div>

      <div className="card reports__section">
        <h3>جلسات التدريب أسبوعياً</h3>
        <BarChart data={sessionsData} />
      </div>

      <div className="card reports__section">
        <h3>أرقام قياسية شخصية</h3>
        {personalRecords.length === 0 ? (
          <p className="muted">لا توجد أرقام قياسية بعد</p>
        ) : (
          <ul className="reports__pr-list">
            {personalRecords.slice(0, 20).map((pr) => (
              <li key={pr.name}>
                <span>{pr.name}</span>
                <strong>{pr.weight} كجم</strong>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmSheet
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={doResetReports}
        title="تصفير كافة سجلات التقارير؟"
        consequences={[
          'سيتم مسح كافة سجلات التمارين السابقة والتقارير والوزن والتغذية.',
          'لن يتم المساس بملفك الشخصي أو جدولك التدريبي الحالي.',
        ]}
        confirmLabel="تأكيد التصفير"
        cancelLabel="إلغاء"
        isDestructive={true}
      />
    </div>
  )
}
