import { useState } from 'react'
import type { SavedWorkoutProgram, WorkoutProgram } from '../shared/types.ts'

interface ProgramVaultModalProps {
  savedPrograms: SavedWorkoutProgram[]
  activeProgram: WorkoutProgram | null
  onSaveCurrentProgram: (title: string) => void
  onApplyProgram: (savedProgram: SavedWorkoutProgram) => void
  onDeleteProgram: (id: string) => void
  onRenameProgram: (id: string, newTitle: string) => void
  onClose: () => void
}

export function ProgramVaultModal({
  savedPrograms,
  activeProgram,
  onSaveCurrentProgram,
  onApplyProgram,
  onDeleteProgram,
  onRenameProgram,
  onClose,
}: ProgramVaultModalProps) {
  const [newTitleToSave, setNewTitleToSave] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitleText, setEditingTitleText] = useState('')

  function handleSaveCurrent(e: React.FormEvent) {
    e.preventDefault()
    if (!activeProgram) {
      alert('لا يوجد جدول نشط حالياً لحفظه!')
      return
    }
    const title =
      newTitleToSave.trim() || `جدولي المحفوظ (${savedPrograms.length + 1})`
    onSaveCurrentProgram(title)
    setNewTitleToSave('')
  }

  function handleRenameSubmit(id: string) {
    if (!editingTitleText.trim()) return
    onRenameProgram(id, editingTitleText.trim())
    setEditingId(null)
  }

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '16px',
      }}
    >
      <div
        className="card"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflowY: 'auto',
          borderRadius: '16px',
          padding: '20px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '12px',
          }}
        >
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800 }}>
            📁 حافظة الجداول التدريبية المحفوظة
          </h2>
          <button
            type="button"
            className="ghost-secondary tiny"
            onClick={onClose}
            style={{ fontSize: '18px', lineHeight: 1 }}
          >
            ✕
          </button>
        </div>

        {/* Save Current Program Form */}
        {activeProgram && (
          <form
            onSubmit={handleSaveCurrent}
            style={{
              background: 'var(--card-subtle)',
              border: '1.5px solid var(--line)',
              borderRadius: '12px',
              padding: '14px',
              marginBottom: '18px',
            }}
          >
            <h4 style={{ margin: '0 0 6px', fontSize: '14px' }}>
              💾 حفظ الجدول الحالي كنسخة في الحافظة:
            </h4>
            <p
              style={{
                margin: '0 0 10px',
                fontSize: '12px',
                color: 'var(--muted)',
              }}
            >
              احفظ جدولك النشط باسم مخصص للرجوع إليه أو استدعائه في أي وقت.
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="field-input"
                value={newTitleToSave}
                onChange={(e) => setNewTitleToSave(e.target.value)}
                placeholder="اسم الجدول (مثال: جدول التضخيم 4 أيام، جدول أرنولد...)"
                style={{ flex: 1, padding: '8px 10px', fontSize: '13px' }}
              />
              <button
                type="submit"
                className="button-primary"
                style={{
                  padding: '8px 14px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                + حفظ في الحافظة
              </button>
            </div>
          </form>
        )}

        {/* Saved Programs List */}
        <div>
          <h4 style={{ margin: '0 0 10px', fontSize: '14px' }}>
            📋 الجداول المحفوظة ({savedPrograms.length}):
          </h4>

          {savedPrograms.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '30px 16px',
                background: 'var(--card-subtle)',
                borderRadius: '10px',
                border: '1px dashed var(--line)',
                color: 'var(--muted)',
                fontSize: '13px',
              }}
            >
              لم تقم بحفظ أي جداول بعد. صمّم جدولك واحفظه هنا حتى لا تفقد أي
              تمرين!
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {savedPrograms.map((item) => {
                const totalExercises = item.program.days.reduce(
                  (sum, d) => sum + d.exercises.length,
                  0,
                )
                const isCurrentlyActive =
                  activeProgram && activeProgram.id === item.program.id

                return (
                  <div
                    key={item.id}
                    style={{
                      background: 'var(--card-bg)',
                      border: isCurrentlyActive
                        ? '2px solid var(--accent)'
                        : '1px solid var(--line)',
                      borderRadius: '12px',
                      padding: '14px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: '6px',
                      }}
                    >
                      {editingId === item.id ? (
                        <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                          <input
                            type="text"
                            value={editingTitleText}
                            onChange={(e) =>
                              setEditingTitleText(e.target.value)
                            }
                            style={{
                              flex: 1,
                              padding: '4px 8px',
                              fontSize: '13px',
                            }}
                            autoFocus
                          />
                          <button
                            type="button"
                            className="button-primary tiny"
                            onClick={() => handleRenameSubmit(item.id)}
                          >
                            ✓ حفظ
                          </button>
                          <button
                            type="button"
                            className="ghost tiny"
                            onClick={() => setEditingId(null)}
                          >
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                          }}
                        >
                          <h3
                            style={{
                              margin: 0,
                              fontSize: '15px',
                              fontWeight: 800,
                            }}
                          >
                            {item.title}
                          </h3>
                          {isCurrentlyActive && (
                            <span
                              style={{
                                background: 'var(--accent)',
                                color: '#fff',
                                fontSize: '10.5px',
                                padding: '2px 8px',
                                borderRadius: '999px',
                                fontWeight: 700,
                              }}
                            >
                              ✓ الجدول النشط حالياً
                            </span>
                          )}
                        </div>
                      )}

                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {new Date(item.savedAt).toLocaleDateString('ar-EG')}
                      </span>
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--muted)' }}>
                      ⚡ {item.program.days.length} أيام تمرين •{' '}
                      {totalExercises} تمرين إجمالي
                      {item.program.days.length > 0 && (
                        <div style={{ marginTop: '4px', fontSize: '11.5px' }}>
                          الأيام:{' '}
                          {item.program.days.map((d) => d.labelAr).join(' • ')}
                        </div>
                      )}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: '6px',
                        justifyContent: 'flex-end',
                        marginTop: '4px',
                      }}
                    >
                      {!isCurrentlyActive && (
                        <button
                          type="button"
                          className="button-primary tiny"
                          onClick={() => {
                            if (
                              window.confirm(
                                `هل تريد استدعاء وتطبيق "${item.title}" كجدول التمارين النشط الآن؟`,
                              )
                            ) {
                              onApplyProgram(item)
                              onClose()
                            }
                          }}
                        >
                          ⚡ تطبيق هذا الجدول الآن
                        </button>
                      )}
                      <button
                        type="button"
                        className="ghost tiny"
                        onClick={() => {
                          setEditingId(item.id)
                          setEditingTitleText(item.title)
                        }}
                      >
                        ✏️ إعادة تسمية
                      </button>
                      <button
                        type="button"
                        className="ghost-danger tiny"
                        onClick={() => {
                          if (
                            window.confirm(
                              `هل أنت متأكد من حذف "${item.title}" من الحافظة؟`,
                            )
                          ) {
                            onDeleteProgram(item.id)
                          }
                        }}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
