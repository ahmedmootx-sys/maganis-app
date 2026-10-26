/**
 * src/modules/settings/ResetSheet.tsx
 *
 * Implements Task H2.4:
 * Two-choice reset confirmation sheet:
 * 1. «احتفظ بتعديلات التمارين» (shows Arabic plural counts of modified exercises, images, videos, custom exercises)
 * 2. «امسح كل حاجة» (complete wipe)
 * No default selected; confirm button disabled until an option is chosen and «حذف» is typed.
 */

import React, { useState, useMemo } from 'react'
import { Sheet } from '../../ui/Sheet.tsx'
import { Button } from '../../ui/Button.tsx'
import { getExerciseEditsStats } from './resetService.ts'
import type { CustomExercise } from '../shared/types.ts'

export interface ResetSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (mode: 'keep-edits' | 'delete-all') => void
  customExercises?: CustomExercise[]
  deletedExerciseIds?: string[]
  onBackup?: () => Promise<void>
}

export const ResetSheet: React.FC<ResetSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  customExercises = [],
  deletedExerciseIds = [],
  onBackup,
}) => {
  const [selectedMode, setSelectedMode] = useState<
    'keep-edits' | 'delete-all' | null
  >(null)
  const [typedWord, setTypedWord] = useState('')
  const [isResetting, setIsResetting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const stats = useMemo(() => {
    if (!isOpen)
      return getExerciseEditsStats(customExercises, deletedExerciseIds)
    return getExerciseEditsStats(customExercises, deletedExerciseIds)
  }, [customExercises, deletedExerciseIds, isOpen])

  const isConfirmed =
    selectedMode !== null && typedWord.trim() === 'حذف' && !isResetting

  const handleExecute = async () => {
    if (!selectedMode || typedWord.trim() !== 'حذف') return
    setIsResetting(true)
    setErrorMsg('')
    try {
      await onConfirm(selectedMode)
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || 'حدث خطأ أثناء تنفيذ إعادة الضبط')
      setIsResetting(false)
    }
  }

  const handleClose = () => {
    setSelectedMode(null)
    setTypedWord('')
    setErrorMsg('')
    setIsResetting(false)
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title="إعادة ضبط التطبيق"
      subtitle="اختر نوع المسح لتحديد البيانات المراد حذفها"
      footer={
        <div
          style={{
            display: 'flex',
            gap: 'var(--space-3)',
            width: '100%',
          }}
        >
          <Button
            variant="secondary"
            data-testid="btn-cancel-factory-reset"
            onClick={handleClose}
            style={{ flex: 1, minHeight: '44px' }}
          >
            إلغاء
          </Button>
          <Button
            variant="primary"
            data-testid="btn-confirm-factory-reset"
            onClick={handleExecute}
            disabled={!isConfirmed}
            style={{
              flex: 2,
              minHeight: '44px',
              backgroundColor: isConfirmed
                ? 'var(--color-danger, #ef4444)'
                : undefined,
              borderColor: isConfirmed
                ? 'var(--color-danger, #ef4444)'
                : undefined,
              color: isConfirmed ? '#ffffff' : undefined,
            }}
          >
            {isResetting
              ? 'جارِ المسح...'
              : selectedMode === 'keep-edits'
                ? 'إعادة الضبط والاحتفاظ بالتعديلات'
                : 'مسح كل شيء نهائياً'}
          </Button>
        </div>
      }
    >
      <div
        data-testid="reset-sheet-content"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
          paddingBottom: 'var(--space-4)',
        }}
      >
        {errorMsg && (
          <div
            data-testid="reset-error-banner"
            style={{
              backgroundColor: 'var(--color-danger-bg, rgba(239, 68, 68, 0.1))',
              border: '1px solid var(--color-danger-border, #fca5a5)',
              color: 'var(--color-danger, #ef4444)',
              padding: 'var(--space-3)',
              borderRadius: 'var(--radius-control)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Offer Backup */}
        {onBackup && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-3)',
              backgroundColor: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-divider)',
            }}
          >
            <span style={{ fontSize: '13px', color: 'var(--color-text)' }}>
              تحب تحفظ نسخة احتياطية من بياناتك أولاً؟
            </span>
            <button
              type="button"
              data-testid="btn-backup-before-reset"
              onClick={onBackup}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-accent-text, #ff6b00)',
                fontWeight: 700,
                fontSize: '13px',
                cursor: 'pointer',
                minHeight: '36px',
                padding: '4px 8px',
              }}
            >
              حفظ نسخة أولاً
            </button>
          </div>
        )}

        {/* Choice 1: احتفظ بتعديلات التمارين */}
        <button
          type="button"
          data-testid="reset-option-keep-edits"
          onClick={() => setSelectedMode('keep-edits')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'right',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-card)',
            border: `2px solid ${
              selectedMode === 'keep-edits'
                ? 'var(--color-accent, #ff6b00)'
                : 'var(--color-divider)'
            }`,
            backgroundColor:
              selectedMode === 'keep-edits'
                ? 'var(--color-accent-tint, rgba(255, 107, 0, 0.08))'
                : 'var(--color-surface)',
            cursor: 'pointer',
            gap: '6px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color: 'var(--color-text)',
              }}
            >
              ١. احتفظ بتعديلات التمارين
            </span>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${
                  selectedMode === 'keep-edits'
                    ? 'var(--color-accent, #ff6b00)'
                    : 'var(--color-divider)'
                }`,
                backgroundColor:
                  selectedMode === 'keep-edits'
                    ? 'var(--color-accent, #ff6b00)'
                    : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedMode === 'keep-edits' && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            </div>
          </div>

          <span
            data-testid="reset-keep-edits-summary"
            style={{
              fontSize: '13px',
              fontWeight: 600,
              color: 'var(--color-accent-text, #ff6b00)',
            }}
          >
            {stats.summaryText}
          </span>

          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-2)',
              lineHeight: 1.5,
            }}
          >
            يمسح الملف الشخصي والجدول والوزن والجلسات، ويحتفظ بتعديلات أسماء
            وصور وفيديوهات التمارين والتمارين التي أضفتها.
          </span>
        </button>

        {/* Choice 2: امسح كل حاجة */}
        <button
          type="button"
          data-testid="reset-option-delete-all"
          onClick={() => setSelectedMode('delete-all')}
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            textAlign: 'right',
            padding: 'var(--space-3)',
            borderRadius: 'var(--radius-card)',
            border: `2px solid ${
              selectedMode === 'delete-all'
                ? 'var(--color-danger, #ef4444)'
                : 'var(--color-divider)'
            }`,
            backgroundColor:
              selectedMode === 'delete-all'
                ? 'var(--color-danger-bg, rgba(239, 68, 68, 0.08))'
                : 'var(--color-surface)',
            cursor: 'pointer',
            gap: '6px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
            }}
          >
            <span
              style={{
                fontWeight: 700,
                fontSize: '15px',
                color:
                  selectedMode === 'delete-all'
                    ? 'var(--color-danger, #ef4444)'
                    : 'var(--color-text)',
              }}
            >
              ٢. امسح كل حاجة
            </span>
            <div
              style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                border: `2px solid ${
                  selectedMode === 'delete-all'
                    ? 'var(--color-danger, #ef4444)'
                    : 'var(--color-divider)'
                }`,
                backgroundColor:
                  selectedMode === 'delete-all'
                    ? 'var(--color-danger, #ef4444)'
                    : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {selectedMode === 'delete-all' && (
                <div
                  style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    backgroundColor: '#ffffff',
                  }}
                />
              )}
            </div>
          </div>

          <span
            style={{
              fontSize: '12px',
              color: 'var(--color-text-2)',
              lineHeight: 1.5,
            }}
          >
            حذف شامل ونهائي لكل البيانات بدون استثناء، بما فيها تعديلات
            التمارين، ملفات الصور، والتمارين المخصصة.
          </span>
        </button>

        {/* Confirmation Word Input */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-2)',
          }}
        >
          <label
            htmlFor="confirm-delete-input"
            style={{
              fontSize: '13px',
              fontWeight: 700,
              color: 'var(--color-text)',
            }}
          >
            لتأكيد المسح، اكتب كلمة «حذف» في المربع:
          </label>
          <input
            id="confirm-delete-input"
            data-testid="input-confirm-delete"
            type="text"
            placeholder="حذف"
            value={typedWord}
            onChange={(e) => setTypedWord(e.target.value)}
            style={{
              height: 'var(--control-height)',
              padding: '0 var(--space-3)',
              borderRadius: 'var(--radius-control)',
              border: `1px solid ${
                typedWord.trim() === 'حذف'
                  ? 'var(--color-accent)'
                  : 'var(--color-divider)'
              }`,
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-md)',
              textAlign: 'center',
              fontWeight: 'bold',
            }}
          />
        </div>
      </div>
    </Sheet>
  )
}
