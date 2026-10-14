import { useState } from 'react'
import type { SavedWorkoutProgram, WorkoutProgram } from '../shared/types.ts'
import { formatArabicDate } from '../../lib/dateUtils.ts'
import { Sheet } from '../../components/Sheet.tsx'
import { ConfirmSheet } from '../../components/ConfirmSheet.tsx'
import { ListRow } from '../../components/ListRow.tsx'
import { EmptyState } from '../../components/EmptyState.tsx'
import {
  IconMoreVertical,
  IconClipboard,
  IconEdit,
  IconTrash,
  IconCheck,
} from '../../components/Icons.tsx'

export interface ProgramVaultModalProps {
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
  const [selectedProgram, setSelectedProgram] =
    useState<SavedWorkoutProgram | null>(null)
  const [isRenaming, setIsRenaming] = useState(false)
  const [renameText, setRenameText] = useState('')

  // Confirmation Sheets
  const [confirmApply, setConfirmApply] =
    useState<SavedWorkoutProgram | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  function handleSaveCurrent(e: React.FormEvent) {
    e.preventDefault()
    if (!activeProgram) return
    const title =
      newTitleToSave.trim() || `جدولي المحفوظ (${savedPrograms.length + 1})`
    onSaveCurrentProgram(title)
    setNewTitleToSave('')
  }

  function handleRenameSubmit() {
    if (!selectedProgram || !renameText.trim()) return
    onRenameProgram(selectedProgram.id, renameText.trim())
    setIsRenaming(false)
    setSelectedProgram(null)
  }

  return (
    <>
      <Sheet
        isOpen={true}
        onClose={onClose}
        title="حافظة الجداول"
        subtitle={`${savedPrograms.length} جداول محفوظة`}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Save Current Program Section */}
          {activeProgram && (
            <form
              onSubmit={handleSaveCurrent}
              className="screen-section"
              style={{
                background: 'var(--card-subtle)',
                padding: '14px',
                borderRadius: '12px',
                border: '1px solid var(--line)',
                gap: '10px',
              }}
            >
              <div className="field">
                <label htmlFor="vault-save-title">
                  حفظ الجدول الحالي في الحافظة:
                </label>
                <input
                  id="vault-save-title"
                  type="text"
                  className="field-input"
                  value={newTitleToSave}
                  onChange={(e) => setNewTitleToSave(e.target.value)}
                  placeholder="اسم مخصص للجدول (مثال: جدول 4 أيام تضخيم)..."
                  dir="rtl"
                />
              </div>

              {/* On its OWN row a full-width primary button */}
              <button
                type="submit"
                className="button-primary full-width"
                style={{ height: '48px', fontSize: '14.5px', fontWeight: 700 }}
              >
                حفظ في الحافظة
              </button>
            </form>
          )}

          {/* Saved Programs List */}
          <div className="screen-section">
            <div className="section-title">
              <span>الجداول المحفوظة</span>
              <span className="section-title-counter">
                {savedPrograms.length}
              </span>
            </div>

            {savedPrograms.length === 0 ? (
              <EmptyState
                icon={<IconClipboard size={36} />}
                title="لا توجد جداول محفوظة"
                message="احفظ جدولك النشط أو جداولك المفضلة هنا للرجوع إليها وتطبيقها في أي وقت دون فقدان أي تمرين."
              />
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px',
                }}
              >
                {savedPrograms.map((item) => {
                  const isCurrentlyActive =
                    activeProgram && activeProgram.id === item.program.id
                  const dateStr = formatArabicDate(item.savedAt)
                  const daysStr = `${item.program.days.length} أيام أسبوعياً`

                  return (
                    <ListRow
                      key={item.id}
                      className={isCurrentlyActive ? 'list-row--active' : ''}
                      onClick={() => {
                        setSelectedProgram(item)
                        setRenameText(item.title)
                        setIsRenaming(false)
                      }}
                      title={
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                        >
                          <span>{item.title}</span>
                          {isCurrentlyActive && (
                            <span
                              style={{
                                fontSize: '10.5px',
                                background: 'var(--accent)',
                                color: '#fff',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                fontWeight: 700,
                              }}
                            >
                              النشط
                            </span>
                          )}
                        </div>
                      }
                      secondary={daysStr}
                      tertiary={dateStr}
                      trailing={
                        <button
                          type="button"
                          className="topbar-icon-btn"
                          style={{
                            width: '38px',
                            height: '38px',
                            minWidth: '38px',
                            minHeight: '38px',
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedProgram(item)
                            setRenameText(item.title)
                            setIsRenaming(false)
                          }}
                          aria-label={`خيارات ${item.title}`}
                        >
                          <IconMoreVertical size={18} />
                        </button>
                      }
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </Sheet>

      {/* Row Action Sheet */}
      <Sheet
        isOpen={Boolean(selectedProgram) && !isRenaming}
        onClose={() => setSelectedProgram(null)}
        title={selectedProgram?.title}
        subtitle={`${selectedProgram?.program.days.length} أيام تدريبية`}
      >
        {selectedProgram && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <button
              type="button"
              className="button-primary full-width"
              style={{ height: '48px', gap: '10px' }}
              onClick={() => {
                const prog = selectedProgram
                setSelectedProgram(null)
                setConfirmApply(prog)
              }}
            >
              <IconCheck size={18} />
              <span>تطبيق هذا الجدول كجدول نشط الآن</span>
            </button>

            <button
              type="button"
              className="ghost-secondary full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => setIsRenaming(true)}
            >
              <IconEdit size={18} />
              <span>إعادة تسمية الجدول</span>
            </button>

            <button
              type="button"
              className="danger full-width"
              style={{
                justifyContent: 'flex-start',
                height: '48px',
                gap: '10px',
              }}
              onClick={() => {
                const progId = selectedProgram.id
                setSelectedProgram(null)
                setConfirmDelete(progId)
              }}
            >
              <IconTrash size={18} />
              <span>حذف من الحافظة</span>
            </button>
          </div>
        )}
      </Sheet>

      {/* Rename Sheet */}
      <Sheet
        isOpen={isRenaming}
        onClose={() => {
          setIsRenaming(false)
          setSelectedProgram(null)
        }}
        title="إعادة تسمية الجدول"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="field">
            <label htmlFor="rename-input">اسم الجدول الجديد:</label>
            <input
              id="rename-input"
              type="text"
              className="field-input"
              value={renameText}
              onChange={(e) => setRenameText(e.target.value)}
              dir="rtl"
              autoFocus
            />
          </div>
          <button
            type="button"
            className="button-primary full-width"
            onClick={handleRenameSubmit}
          >
            حفظ التسمية الجديدة
          </button>
        </div>
      </Sheet>

      {/* Confirm Apply Sheet */}
      <ConfirmSheet
        isOpen={Boolean(confirmApply)}
        onClose={() => setConfirmApply(null)}
        onConfirm={() => {
          if (confirmApply) {
            onApplyProgram(confirmApply)
            setConfirmApply(null)
            onClose()
          }
        }}
        title="تأكيد تطبيق الجدول"
        message={`سيتم استبدال جدولك النشط الحالي بالجدول المحفوظ: "${confirmApply?.title}" (${confirmApply?.program.days.length} أيام). هل أنت متأكد؟`}
        confirmLabel="تطبيق الجدول"
        cancelLabel="إلغاء"
      />

      {/* Confirm Delete Sheet */}
      <ConfirmSheet
        isOpen={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => {
          if (confirmDelete) {
            onDeleteProgram(confirmDelete)
            setConfirmDelete(null)
          }
        }}
        title="حذف الجدول من الحافظة"
        message="هل أنت متأكد من حذف هذا الجدول نهائياً من الحافظة؟ لن تتمكن من استرجاعه لاحقاً."
        confirmLabel="حذف نهائي"
        cancelLabel="إلغاء"
        isDestructive={true}
      />
    </>
  )
}

export default ProgramVaultModal
