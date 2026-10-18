import React, { useState } from 'react'
import { Sheet } from './Sheet.tsx'
import { Button } from './Button.tsx'

export interface ConfirmSheetProps {
  isOpen: boolean
  onClose?: () => void
  onCancel?: () => void
  onConfirm: () => void
  title: string
  consequences?: string[]
  message?: string
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  requiredWord?: string
  backupOffer?: {
    label: string
    onBackup: () => void
  }
  className?: string
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  isOpen,
  onClose,
  onCancel,
  onConfirm,
  title,
  consequences = [],
  message,
  children,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  isDestructive = false,
  requiredWord,
  backupOffer,
  className = '',
}) => {
  const handleClose = onClose || onCancel || (() => {})
  const [typedWord, setTypedWord] = useState('')

  React.useEffect(() => {
    if (!isOpen) {
      setTypedWord('')
    }
  }, [isOpen])

  const canConfirm = !requiredWord || typedWord.trim() === requiredWord

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm()
    handleClose()
  }

  const effectiveConsequences = consequences.length > 0 ? consequences : message ? [message] : []

  return (
    <Sheet
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      className={className}
      footer={
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Button
            variant={isDestructive ? 'danger' : 'primary'}
            fullWidth
            size="large"
            disabled={!canConfirm}
            onClick={handleConfirm}
          >
            {confirmLabel}
          </Button>
          <Button variant="secondary" fullWidth onClick={handleClose}>
            {cancelLabel}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {children}
        {effectiveConsequences.length > 0 && (
          <ul
            style={{
              margin: 0,
              paddingInlineStart: '20px',
              color: 'var(--color-text-2)',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            {effectiveConsequences.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
        )}

        {backupOffer && (
          <div
            style={{
              padding: '12px',
              backgroundColor: 'var(--color-surface-2)',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              border: '1px solid var(--color-border)',
            }}
          >
            <div style={{ fontSize: '13.5px', color: 'var(--color-text-2)' }}>
              يوصى بحفظ نسخة من بياناتك أولاً قبل المتابعة
            </div>
            <Button
              variant="secondary"
              size="md"
              leadingIcon="download"
              fullWidth
              onClick={backupOffer.onBackup}
            >
              {backupOffer.label}
            </Button>
          </div>
        )}

        {requiredWord && (
          <div style={{ marginTop: '8px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '13px',
                color: 'var(--color-text)',
                marginBottom: '6px',
                fontWeight: 600,
              }}
            >
              اكتب «<strong>{requiredWord}</strong>» للتأكيد
            </label>
            <input
              type="text"
              className="field-input"
              value={typedWord}
              onChange={(e) => setTypedWord(e.target.value)}
              placeholder={requiredWord}
              dir="auto"
            />
          </div>
        )}
      </div>
    </Sheet>
  )
}
