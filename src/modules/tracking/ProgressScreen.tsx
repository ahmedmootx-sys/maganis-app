import { useState, useMemo } from 'react'
import type {
  TrackingSession,
  BodyLogEntry,
  DayNote,
} from '../shared/types.ts'
import type { UserProfile } from '../onboarding/types.ts'
import { getExerciseById } from '../workout/exercises.ts'
import { SvgLineChart } from '../reports/SvgLineChart.tsx'
import { DateField, formatArabicDate } from '../../components/DateField.tsx'
import { TopBar } from '../../components/TopBar.tsx'
import { Sheet } from '../../components/Sheet.tsx'
import { ConfirmSheet } from '../../components/ConfirmSheet.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import { Stat } from '../../components/Stat.tsx'
import {
  IconPlus,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconCheck,
} from '../../components/Icons.tsx'

export interface ProgressScreenProps {
  sessions: TrackingSession[]
  bodyLog: BodyLogEntry[]
  dayNotes: DayNote[]
  profile?: UserProfile | null
  onAddBodyWeight: (entry: BodyLogEntry) => void
  onDeleteBodyWeight?: (date: string) => void
  onAddDayNote: (note: DayNote) => void
  onDeleteDayNote?: (date: string, text: string) => void
  onUpdateSessions?: (sessions: TrackingSession[]) => void
  onUpdateBodyLog?: (bodyLog: BodyLogEntry[]) => void
  initialSubTab?: 'log' | 'reports'
}

type DateRange = '4w' | '12w' | '1y' | 'all'

const RANGE_LABELS: Record<DateRange, string> = {
  '4w': '4 أسابيع',
  '12w': '3 شهور',
  '1y': 'سنة',
  all: 'الكل',
}

const MONTH_NAMES_AR = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
]

const DAY_NAMES_SHORT = ['سب', 'أح', 'إث', 'ثلا', 'أرب', 'خم', 'جم']

function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
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

export function ProgressScreen({
  sessions,
  bodyLog,
  dayNotes,
  profile,
  onAddBodyWeight,
  onDeleteBodyWeight,
  onAddDayNote,
  onDeleteDayNote,
  initialSubTab = 'log',
}: ProgressScreenProps) {
  const [activeTab, setActiveTab] = useState<'log' | 'reports'>(initialSubTab)

  // --- LOG TAB: Weight State ---
  const [weightInput, setWeightInput] = useState('')
  const [weightDate, setWeightDate] = useState(() => todayStr())
  const [weightError, setWeightError] = useState('')
  const [weightToDelete, setWeightToDelete] = useState<string | null>(null)

  // --- LOG TAB: Calendar State ---
  const now = new Date()
  const [calYear, setCalYear] = useState(now.getFullYear())
  const [calMonth, setCalMonth] = useState(now.getMonth())
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string | null>(null)

  // --- LOG TAB: Notes State ---
  const [showAddNoteSheet, setShowAddNoteSheet] = useState(false)
  const [newNoteDate, setNewNoteDate] = useState(() => todayStr())
  const [newNoteText, setNewNoteText] = useState('')
  const [noteError, setNoteError] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<{ date: string; text: string } | null>(null)

  // --- REPORTS TAB State ---
  const [range, setRange] = useState<DateRange>('4w')
  const [exportFeedback, setExportFeedback] = useState<string | null>(null)

  // Weight Submit Handler
  function handleWeightSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weightInput)
    if (isNaN(w) || w < 25 || w > 350) {
      setWeightError('الوزن يجب أن يكون بين 25 و 350 كجم')
      return
    }
    onAddBodyWeight({ date: weightDate, weightKg: w })
    setWeightInput('')
    setWeightError('')
  }

  // Note Submit Handler
  function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newNoteText.trim()
    if (!trimmed) {
      setNoteError('يرجى كتابة الملاحظة أولاً')
      return
    }
    onAddDayNote({ date: newNoteDate, note: trimmed })
    setNewNoteText('')
    setNoteError('')
    setShowAddNoteSheet(false)
  }

  // Calendar Helpers
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate()
  // Saturday start (0 in JS is Sunday, so Saturday is 6)
  const rawFirstDay = new Date(calYear, calMonth, 1).getDay()
  const firstDayIndex = (rawFirstDay + 1) % 7 // maps Sat -> 0, Sun -> 1, ...

  function prevMonth() {
    if (calMonth === 0) {
      setCalMonth(11)
      setCalYear(calYear - 1)
    } else {
      setCalMonth(calMonth - 1)
    }
  }

  function nextMonth() {
    if (calMonth === 11) {
      setCalMonth(0)
      setCalYear(calYear + 1)
    } else {
      setCalMonth(calMonth + 1)
    }
  }

  const sessionDatesSet = useMemo(
    () => new Set(sessions.map((s) => s.date)),
    [sessions],
  )
  const noteDatesSet = useMemo(
    () => new Set(dayNotes.map((n) => n.date)),
    [dayNotes],
  )

  const sortedBodyLog = useMemo(
    () => [...bodyLog].sort((a, b) => b.date.localeCompare(a.date)),
    [bodyLog],
  )

  const sortedDayNotes = useMemo(
    () => [...dayNotes].sort((a, b) => b.date.localeCompare(a.date)),
    [dayNotes],
  )

  // --- Reports Filtering & Metrics ---
  const cutoff = useMemo(() => {
    switch (range) {
      case '4w':
        return weeksAgo(4)
      case '12w':
        return weeksAgo(12)
      case '1y':
        return weeksAgo(52)
      case 'all':
        return new Date(0)
    }
  }, [range])

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => new Date(s.date) >= cutoff)
  }, [sessions, cutoff])

  const filteredBodyLog = useMemo(() => {
    return bodyLog
      .filter((e) => new Date(e.date) >= cutoff)
      .sort((a, b) => a.date.localeCompare(b.date))
  }, [bodyLog, cutoff])

  // Volume by week
  const volumeByWeek = useMemo(() => {
    const map: Record<string, number> = {}
    for (const session of filteredSessions) {
      const wk = getWeekStart(session.date)
      if (!map[wk]) map[wk] = 0
      for (const ex of session.exercises) {
        for (const set of ex.sets) {
          map[wk] += set.reps * set.weightKg
        }
      }
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([wk, vol]) => ({ label: weekLabel(wk), value: Math.round(vol) }))
  }, [filteredSessions])

  // Sessions by week
  const sessionsByWeek = useMemo(() => {
    const map: Record<string, number> = {}
    for (const session of filteredSessions) {
      const wk = getWeekStart(session.date)
      map[wk] = (map[wk] ?? 0) + 1
    }
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([wk, count]) => ({ label: weekLabel(wk), value: count }))
  }, [filteredSessions])

  // Total volume in range
  const totalVolumeInRange = useMemo(() => {
    return filteredSessions.reduce((acc, s) => {
      return (
        acc +
        s.exercises.reduce((eAcc, e) => {
          return eAcc + e.sets.reduce((sAcc, set) => sAcc + set.reps * set.weightKg, 0)
        }, 0)
      )
    }, 0)
  }, [filteredSessions])

  // Personal Records
  const personalRecords = useMemo(() => {
    const map: Record<string, { name: string; weight: number }> = {}
    for (const s of sessions) {
      for (const ex of s.exercises) {
        const info = getExerciseById(ex.exerciseId)
        const name = info?.nameAr ?? ex.exerciseId
        const maxWeight = Math.max(...ex.sets.map((set) => set.weightKg), 0)
        if (maxWeight > 0) {
          if (!map[ex.exerciseId] || maxWeight > map[ex.exerciseId].weight) {
            map[ex.exerciseId] = { name, weight: maxWeight }
          }
        }
      }
    }
    return Object.values(map).sort((a, b) => b.weight - a.weight)
  }, [sessions])

  // Weight Trend Data for SvgLineChart
  const weightChartData = useMemo(() => {
    return filteredBodyLog.map((e) => ({
      label: e.date.slice(5),
      value: e.weightKg,
    }))
  }, [filteredBodyLog])

  // Export JSON Report
  function handleExportReports() {
    try {
      const exportPayload = {
        type: 'maganis-progress-backup',
        version: 1,
        exportedAt: Date.now(),
        exportedDate: new Date().toISOString(),
        sessions,
        bodyLog,
        dayNotes,
      }
      const jsonStr = JSON.stringify(exportPayload, null, 2)
      const blob = new Blob([jsonStr], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `maganis-progress-${todayStr()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setExportFeedback('تم تصدير ملف التقارير بنجاح')
      setTimeout(() => setExportFeedback(null), 3000)
    } catch {
      alert('حدث خطأ أثناء تصدير التقارير')
    }
  }

  return (
    <div
      className="progress-screen"
      data-testid="progress-screen"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingBottom: '32px',
      }}
    >
      {/* TopBar with Export Action */}
      <TopBar
        title="التقدم"
        actions={
          <button
            type="button"
            className="btn-icon"
            onClick={handleExportReports}
            title="تصدير بيانات التقدم"
            aria-label="تصدير بيانات التقدم"
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
            <IconDownload size={18} />
          </button>
        }
      />

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
        {exportFeedback && (
          <div
            role="status"
            style={{
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(16, 185, 129, 0.12)',
              color: '#10b981',
              fontSize: '13.5px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IconCheck size={16} />
            <span>{exportFeedback}</span>
          </div>
        )}

        {/* Segmented Control: السجل | التقارير */}
        <div
          className="segmented-control"
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
            onClick={() => setActiveTab('log')}
            style={{
              height: '42px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'log' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'log' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: '14.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'log' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            السجل
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('reports')}
            style={{
              height: '42px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === 'reports' ? 'var(--card-bg)' : 'transparent',
              color: activeTab === 'reports' ? 'var(--ink)' : 'var(--muted)',
              fontWeight: 700,
              fontSize: '14.5px',
              cursor: 'pointer',
              boxShadow: activeTab === 'reports' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s ease',
            }}
          >
            التقارير
          </button>
        </div>

        {/* ===================== LOG SUB-TAB ===================== */}
        {activeTab === 'log' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section 1: Body Weight Tracker */}
            <div
              className="card section-weight"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                سجل قياس الوزن
              </h3>

              {weightError && (
                <div
                  role="alert"
                  style={{
                    padding: '8px 12px',
                    borderRadius: '8px',
                    background: 'var(--danger-surface, rgba(220, 38, 38, 0.1))',
                    color: 'var(--danger)',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {weightError}
                </div>
              )}

              <form
                onSubmit={handleWeightSubmit}
                style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
              >
                <div className="field">
                  <label htmlFor="bw-weight-input" style={{ fontSize: '13px', fontWeight: 600 }}>
                    الوزن (كجم)
                  </label>
                  <input
                    id="bw-weight-input"
                    type="number"
                    step="0.1"
                    min="25"
                    max="350"
                    placeholder="مثال: 74.5"
                    value={weightInput}
                    onChange={(e) => {
                      setWeightInput(e.target.value)
                      setWeightError('')
                    }}
                    className="field-input"
                    style={{ height: '48px', width: '100%' }}
                  />
                </div>

                <div className="field">
                  <DateField
                    id="bw-date-input"
                    label="تاريخ القياس"
                    value={weightDate}
                    onChange={(d) => setWeightDate(d)}
                  />
                </div>

                <button
                  type="submit"
                  className="btn-primary"
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
                  حفظ قياس الوزن
                </button>
              </form>

              {/* Mini SVG Chart if 2+ entries */}
              {bodyLog.length >= 2 && (
                <div style={{ marginTop: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                  <span style={{ fontSize: '12.5px', color: 'var(--muted)', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                    منحنى تغير الوزن
                  </span>
                  <SvgLineChart
                    data={[...bodyLog]
                      .sort((a, b) => a.date.localeCompare(b.date))
                      .slice(-12)
                      .map((e) => ({
                        label: e.date.slice(5),
                        value: e.weightKg,
                      }))}
                    height={160}
                    color="#F95700"
                  />
                </div>
              )}

              {/* Weight Log Entries List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                {sortedBodyLog.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '8px 0', textAlign: 'center' }}>
                    لا توجد قياسات وزن مسجلة بعد.
                  </p>
                ) : (
                  sortedBodyLog.slice(0, 15).map((entry) => (
                    <div
                      key={entry.date}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--card-subtle)',
                      }}
                    >
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <strong style={{ fontSize: '14.5px', color: 'var(--ink)' }}>
                          {entry.weightKg} كجم
                        </strong>
                        <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                          {formatArabicDate(entry.date)}
                        </span>
                      </div>
                      {onDeleteBodyWeight && (
                        <button
                          type="button"
                          onClick={() => setWeightToDelete(entry.date)}
                          aria-label={`حذف قياس ${entry.date}`}
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Section 2: Training Calendar */}
            <div
              className="card section-calendar"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                  تقويم التدريب والملاحظات
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    onClick={prevMonth}
                    aria-label="الشهر السابق"
                    style={{
                      width: '36px',
                      height: '36px',
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
                  <span style={{ fontSize: '14px', fontWeight: 700, minWidth: '100px', textAlign: 'center' }}>
                    {MONTH_NAMES_AR[calMonth]} {calYear}
                  </span>
                  <button
                    type="button"
                    onClick={nextMonth}
                    aria-label="الشهر التالي"
                    style={{
                      width: '36px',
                      height: '36px',
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
              </div>

              {/* Day Names Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                  textAlign: 'center',
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: 'var(--muted)',
                }}
              >
                {DAY_NAMES_SHORT.map((name) => (
                  <div key={name} style={{ padding: '4px 0' }}>{name}</div>
                ))}
              </div>

              {/* Days Cells */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(7, 1fr)',
                  gap: '4px',
                }}
              >
                {Array.from({ length: firstDayIndex }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}

                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const dayNum = i + 1
                  const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`
                  const hasSession = sessionDatesSet.has(dateStr)
                  const hasNote = noteDatesSet.has(dateStr)
                  const isCurrentDay = dateStr === todayStr()

                  return (
                    <button
                      key={dateStr}
                      type="button"
                      onClick={() => setSelectedCalendarDate(dateStr)}
                      style={{
                        height: '42px',
                        borderRadius: '10px',
                        border: isCurrentDay ? '1.5px solid var(--brand)' : '1px solid transparent',
                        background: hasSession
                          ? 'var(--brand-surface, rgba(230, 81, 0, 0.1))'
                          : 'var(--card-subtle)',
                        color: hasSession ? 'var(--brand)' : 'var(--ink)',
                        fontWeight: hasSession || isCurrentDay ? 800 : 500,
                        fontSize: '13px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        position: 'relative',
                      }}
                    >
                      <span>{dayNum}</span>
                      <div style={{ display: 'flex', gap: '3px', position: 'absolute', bottom: '4px' }}>
                        {hasSession && (
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: 'var(--brand)',
                            }}
                          />
                        )}
                        {hasNote && (
                          <span
                            style={{
                              width: '4px',
                              height: '4px',
                              borderRadius: '50%',
                              background: '#3b82f6',
                            }}
                          />
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Legend */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '16px',
                  fontSize: '12px',
                  color: 'var(--muted)',
                  paddingTop: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--brand)' }} />
                  <span>جلسة تمرين</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                  <span>ملاحظة يومية</span>
                </div>
              </div>
            </div>

            {/* Section 3: Daily Notes */}
            <div
              className="card section-notes"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: 'var(--ink)' }}>
                  ملاحظات يومية ({dayNotes.length})
                </h3>
                <button
                  type="button"
                  className="btn-ghost"
                  onClick={() => setShowAddNoteSheet(true)}
                  style={{
                    fontSize: '13.5px',
                    fontWeight: 600,
                    color: 'var(--brand)',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  + إضافة ملاحظة
                </button>
              </div>

              {sortedDayNotes.length === 0 ? (
                <EmptyState
                  title="لا توجد ملاحظات مسجلة"
                  description="سجّل أي شعور بالإجهاد أو الطاقة أو تقدم الأداء"
                  actionLabel="+ تدوين ملاحظة"
                  onAction={() => setShowAddNoteSheet(true)}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sortedDayNotes.slice(0, 15).map((n, i) => (
                    <div
                      key={`${n.date}-${i}`}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        background: 'var(--card-subtle)',
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block', marginBottom: '2px' }}>
                          {formatArabicDate(n.date)}
                        </span>
                        <p style={{ margin: 0, fontSize: '14px', color: 'var(--ink)', lineHeight: 1.5 }}>
                          {n.note}
                        </p>
                      </div>
                      {onDeleteDayNote && (
                        <button
                          type="button"
                          onClick={() => setNoteToDelete(n)}
                          aria-label="حذف الملاحظة"
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            border: 'none',
                            background: 'transparent',
                            color: 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            flexShrink: 0,
                          }}
                        >
                          <IconTrash size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===================== REPORTS SUB-TAB ===================== */}
        {activeTab === 'reports' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Range Filter (Equal-width row) */}
            <div
              className="range-buttons-row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '6px',
                background: 'var(--card-subtle)',
                padding: '4px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
              }}
            >
              {(Object.keys(RANGE_LABELS) as DateRange[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRange(r)}
                  style={{
                    height: '38px',
                    borderRadius: '8px',
                    border: 'none',
                    background: range === r ? 'var(--card-bg)' : 'transparent',
                    color: range === r ? 'var(--ink)' : 'var(--muted)',
                    fontWeight: 700,
                    fontSize: '13px',
                    cursor: 'pointer',
                    boxShadow: range === r ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  {RANGE_LABELS[r]}
                </button>
              ))}
            </div>

            {/* Overview Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Stat
                label="إجمالي الجلسات"
                value={`${filteredSessions.length} جلسة`}
                secondary="في هذه الفترة"
              />
              <Stat
                label="إجمالي الحجم المرفوع"
                value={`${totalVolumeInRange.toLocaleString()} كجم`}
                secondary="مجموع التكرارات بالأوزان"
              />
            </div>

            {/* Training Volume Section */}
            <div
              className="card"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)' }}>
                الحجم التدريبي الأسبوعي (كجم)
              </h3>
              {volumeByWeek.length === 0 ? (
                <EmptyState
                  title="لا توجد جلسات تدريبية"
                  description="سجّل جلسات تمرينك لتبدأ بمتابعة تطور الحجم التدريبي"
                />
              ) : (
                <SvgLineChart data={volumeByWeek} height={180} color="#10b981" />
              )}
            </div>

            {/* Body Weight Trend Section */}
            <div
              className="card"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)' }}>
                منحنى تغير وزن الجسم
              </h3>
              {weightChartData.length < 2 ? (
                <EmptyState
                  title="بيانات الوزن غير كافية"
                  description="سجّل قياسين على الأقل في هذه الفترة لعرض منحنى التغير"
                />
              ) : (
                <SvgLineChart data={weightChartData} height={180} color="#F95700" />
              )}
            </div>

            {/* Personal Records Section */}
            <div
              className="card"
              style={{
                padding: '16px',
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--line)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: 700, color: 'var(--ink)' }}>
                الأرقام القياسية الشخصية (أعلى وزن)
              </h3>
              {personalRecords.length === 0 ? (
                <EmptyState
                  title="لا توجد أرقام قياسية بعد"
                  description="سجّل جلسات التمرين بأوزانك لتظهر أفضل أرقامك هنا"
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {personalRecords.slice(0, 10).map((pr, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        background: 'var(--card-subtle)',
                      }}
                    >
                      <span style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--ink)' }}>
                        {pr.name}
                      </span>
                      <strong
                        style={{
                          fontSize: '15px',
                          color: 'var(--brand)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {pr.weight} كجم
                      </strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Calendar Day Detail Sheet */}
      {selectedCalendarDate && (
        <Sheet
          isOpen={true}
          onClose={() => setSelectedCalendarDate(null)}
          title={`سجل يوم: ${formatArabicDate(selectedCalendarDate)}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
            {/* Sessions on this day */}
            <div>
              <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                جلسات التمرين
              </strong>
              {sessions.filter((s) => s.date === selectedCalendarDate).length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  لم تسجل جلسة تمرين في هذا اليوم.
                </p>
              ) : (
                sessions
                  .filter((s) => s.date === selectedCalendarDate)
                  .map((s) => (
                    <div
                      key={s.id}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--card-subtle)',
                        marginBottom: '6px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13.5px' }}>
                        <span style={{ fontWeight: 700 }}>{s.exercises.length} تمرين</span>
                        <span style={{ color: 'var(--muted)' }}>
                          {new Date(s.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {s.notes && (
                        <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: 'var(--muted)' }}>
                          {s.notes}
                        </p>
                      )}
                    </div>
                  ))
              )}
            </div>

            {/* Notes on this day */}
            <div style={{ paddingTop: '8px', borderTop: '1px solid var(--line)' }}>
              <strong style={{ fontSize: '14px', color: 'var(--ink)', display: 'block', marginBottom: '8px' }}>
                الملاحظات
              </strong>
              {dayNotes.filter((n) => n.date === selectedCalendarDate).length === 0 ? (
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: 0 }}>
                  لا توجد ملاحظات مسجلة لهذا اليوم.
                </p>
              ) : (
                dayNotes
                  .filter((n) => n.date === selectedCalendarDate)
                  .map((n, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        background: 'var(--card-subtle)',
                        fontSize: '13.5px',
                        marginBottom: '6px',
                      }}
                    >
                      {n.note}
                    </div>
                  ))
              )}
            </div>

            <button
              type="button"
              className="btn-ghost"
              onClick={() => {
                setNewNoteDate(selectedCalendarDate)
                setSelectedCalendarDate(null)
                setShowAddNoteSheet(true)
              }}
              style={{
                height: '44px',
                borderRadius: '10px',
                border: '1px solid var(--line)',
                background: 'var(--card-subtle)',
                color: 'var(--ink)',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                marginTop: '4px',
              }}
            >
              + إضافة ملاحظة لهذا اليوم
            </button>
          </div>
        </Sheet>
      )}

      {/* Add Note Sheet */}
      {showAddNoteSheet && (
        <Sheet
          isOpen={true}
          onClose={() => {
            setShowAddNoteSheet(false)
            setNoteError('')
          }}
          title="تدوين ملاحظة يومية"
        >
          <form onSubmit={handleNoteSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '8px 0' }}>
            {noteError && (
              <div
                role="alert"
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  background: 'var(--danger-surface, rgba(220, 38, 38, 0.1))',
                  color: 'var(--danger)',
                  fontSize: '13px',
                  fontWeight: 600,
                }}
              >
                {noteError}
              </div>
            )}

            <div className="field">
              <DateField
                id="sheet-note-date"
                label="التاريخ"
                value={newNoteDate}
                onChange={(d) => setNewNoteDate(d)}
              />
            </div>

            <div className="field">
              <label htmlFor="sheet-note-text" style={{ fontSize: '13.5px', fontWeight: 600 }}>
                الملاحظة
              </label>
              <textarea
                id="sheet-note-text"
                rows={3}
                placeholder="سجّل أي تفاصيل حول مستوى الطاقة، النوم، أو الآلام العضلية..."
                value={newNoteText}
                onChange={(e) => {
                  setNewNoteText(e.target.value)
                  setNoteError('')
                }}
                dir="rtl"
                className="field-input"
                style={{
                  minHeight: '80px',
                  resize: 'vertical',
                  padding: '12px',
                  borderRadius: '10px',
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
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
              حفظ الملاحظة
            </button>
          </form>
        </Sheet>
      )}

      {/* Delete Weight Confirm Sheet */}
      {weightToDelete && (
        <ConfirmSheet
          isOpen={true}
          onClose={() => setWeightToDelete(null)}
          onConfirm={() => {
            onDeleteBodyWeight?.(weightToDelete)
            setWeightToDelete(null)
          }}
          title="حذف قياس الوزن؟"
          message={`هل أنت متأكد من حذف قياس الوزن المسجل في ${formatArabicDate(weightToDelete)}؟`}
          confirmLabel="نعم، حذف"
          cancelLabel="إلغاء"
          isDestructive={true}
        />
      )}

      {/* Delete Note Confirm Sheet */}
      {noteToDelete && (
        <ConfirmSheet
          isOpen={true}
          onClose={() => setNoteToDelete(null)}
          onConfirm={() => {
            onDeleteDayNote?.(noteToDelete.date, noteToDelete.text)
            setNoteToDelete(null)
          }}
          title="حذف الملاحظة؟"
          message={`هل أنت متأكد من حذف هذه الملاحظة المسجلة في ${formatArabicDate(noteToDelete.date)}؟`}
          confirmLabel="نعم، حذف"
          cancelLabel="إلغاء"
          isDestructive={true}
        />
      )}
    </div>
  )
}
