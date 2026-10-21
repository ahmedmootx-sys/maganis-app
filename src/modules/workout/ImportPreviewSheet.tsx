import { useState } from 'react'
import type {
  WorkoutProgram,
  ProgramDay,
  ProgramExercise,
} from '../shared/types.ts'
import type { ImportResult } from './programImporter.ts'
import { Sheet, Button, Callout, Icon, Card } from '../../ui'

export interface ImportPreviewSheetProps {
  isOpen: boolean
  onClose: () => void
  importResult: ImportResult | null
  onSaveDraft: (program: WorkoutProgram) => void
  onSaveAndActivate: (program: WorkoutProgram) => void
}

export function ImportPreviewSheet({
  isOpen,
  onClose,
  importResult,
  onSaveDraft,
  onSaveAndActivate,
}: ImportPreviewSheetProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(0)

  if (!isOpen || !importResult?.program) return null

  const { program, stats, warnings, diagnostics } = importResult

  return (
    <Sheet isOpen={isOpen} onClose={onClose} title="معاينة الجدول المستورد">
      <div
        className="import-preview-container"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          paddingBottom: '24px',
        }}
      >
        {/* Header Summary */}
        <div style={{ textAlign: 'start' }}>
          <h3 style={{ margin: '0 0 4px', fontSize: '18px', fontWeight: 700 }}>
            {program.title || 'جدول تدريبي جديد'}
          </h3>
          <p
            style={{
              margin: 0,
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}
          >
            {program.days.length} أيام تدريبية • الهدف:{' '}
            {program.primaryGoal === 'hypertrophy'
              ? 'بناء عضلي'
              : program.primaryGoal}
          </p>
        </div>

        {/* Stats Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
          }}
        >
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--text-primary)',
              }}
            >
              {stats.totalItems}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              إجمالي التمارين
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color: 'var(--accent-primary, #ff5722)',
              }}
            >
              {stats.matchedItems}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              مطابق للكتالوج
            </div>
          </div>
          <div
            style={{
              background: 'var(--bg-secondary)',
              padding: '10px',
              borderRadius: '8px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '18px',
                fontWeight: 800,
                color:
                  stats.limitationConflicts > 0
                    ? '#e53935'
                    : 'var(--text-secondary)',
              }}
            >
              {stats.limitationConflicts}
            </div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              تنبيهات إصابات
            </div>
          </div>
        </div>

        {/* Warnings */}
        {warnings.length > 0 && (
          <Callout variant="warning">
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}
            >
              {warnings.map((w, idx) => (
                <div key={idx} style={{ fontSize: '12px' }}>
                  {w}
                </div>
              ))}
            </div>
          </Callout>
        )}

        {/* Days List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <h4 style={{ margin: '4px 0', fontSize: '14px', fontWeight: 700 }}>
            محتوى الأيام التدريبية:
          </h4>
          {program.days.map((day: ProgramDay, dIdx: number) => {
            const isExpanded = expandedDay === dIdx
            const dayExercises = day.exercises || []
            return (
              <Card
                key={day.id || dIdx}
                padding="sm"
                style={{ border: '1px solid var(--border-color, #2a2e37)' }}
              >
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setExpandedDay(isExpanded ? null : dIdx)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ')
                      setExpandedDay(isExpanded ? null : dIdx)
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    userSelect: 'none',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '14px' }}>
                      {day.labelAr || day.name || `اليوم ${dIdx + 1}`}
                    </span>
                    {day.focus && (
                      <span
                        style={{
                          fontSize: '12px',
                          color: 'var(--text-secondary)',
                          marginRight: '8px',
                        }}
                      >
                        ({day.focus})
                      </span>
                    )}
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <span
                      style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                    >
                      {dayExercises.length} تمرين
                    </span>
                    <Icon
                      name={isExpanded ? 'chevron-up' : 'chevron-down'}
                      size={16}
                    />
                  </div>
                </div>

                {isExpanded && (
                  <div
                    style={{
                      marginTop: '12px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      borderTop: '1px solid var(--border-color, #2a2e37)',
                      paddingTop: '10px',
                    }}
                  >
                    {dayExercises.length === 0 ? (
                      <div
                        style={{ fontSize: '12px', color: 'var(--text-muted)' }}
                      >
                        لا توجد تمارين مسجلة لهذا اليوم.
                      </div>
                    ) : (
                      dayExercises.map((ex: ProgramExercise, eIdx: number) => {
                        const diag = diagnostics.find(
                          (d) =>
                            d.dayName === (day.labelAr || day.name) &&
                            (d.exerciseId === ex.exerciseId ||
                              d.exerciseName ===
                                (ex.customName || ex.exerciseId)),
                        )
                        const tags = diag?.tags || []

                        return (
                          <div
                            key={eIdx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              fontSize: '13px',
                              padding: '6px 0',
                              borderBottom:
                                eIdx < dayExercises.length - 1
                                  ? '1px dashed var(--border-color, #2a2e37)'
                                  : 'none',
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '2px',
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                {ex.customName || ex.nameEn || ex.exerciseId}
                              </span>
                              <div
                                style={{
                                  display: 'flex',
                                  flexWrap: 'wrap',
                                  gap: '4px',
                                  marginTop: '2px',
                                }}
                              >
                                {ex.needsReview && (
                                  <span
                                    style={{
                                      fontSize: '10px',
                                      background: '#374151',
                                      color: '#e5e7eb',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                    }}
                                  >
                                    مخصص
                                  </span>
                                )}
                                {tags.map((t, tIdx) => (
                                  <span
                                    key={tIdx}
                                    style={{
                                      fontSize: '10px',
                                      padding: '1px 6px',
                                      borderRadius: '4px',
                                      background:
                                        t.level === 'high'
                                          ? 'rgba(229,57,53,0.15)'
                                          : t.level === 'moderate'
                                            ? 'rgba(253,216,53,0.15)'
                                            : '#262a33',
                                      color:
                                        t.level === 'high'
                                          ? '#e53935'
                                          : t.level === 'moderate'
                                            ? '#fdd835'
                                            : '#9ca3af',
                                      border: `1px solid ${t.level === 'high' ? '#e53935' : t.level === 'moderate' ? '#fdd835' : '#4b5563'}`,
                                    }}
                                  >
                                    {t.labelAr}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div
                              style={{
                                fontSize: '12px',
                                color: 'var(--text-secondary)',
                                whiteSpace: 'nowrap',
                                direction: 'ltr',
                              }}
                            >
                              {ex.sets} ×{' '}
                              {ex.amrap
                                ? 'AMRAP'
                                : (ex.reps ?? ex.repsMin ?? 10)}{' '}
                              {ex.unit === 'seconds' ? 'ث' : ''}
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            marginTop: '8px',
            position: 'sticky',
            bottom: 0,
            background: 'var(--bg-card, #1e222b)',
            paddingTop: '8px',
          }}
        >
          <Button
            variant="primary"
            onClick={() => {
              onSaveAndActivate(program)
              onClose()
            }}
            fullWidth
          >
            حفظ وتفعيل الجدول الآن
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              onSaveDraft(program)
              onClose()
            }}
            fullWidth
          >
            حفظ كمسودة في خزانة البرامج
          </Button>
        </div>
      </div>
    </Sheet>
  )
}
