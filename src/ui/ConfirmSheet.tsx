import React, { useState } from 'react'
import { Sheet } from './Sheet.tsx'
import { Button } from './Button.tsx'

export interface ConfirmSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  consequences: string[]
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  requiredWord?: string
  className?: string
}

export const ConfirmSheet: React.FC<ConfirmSheetProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  consequences,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  isDestructive = true,
  requiredWord,
  className = '',
}) => {
  const [typedWord, setTypedWord] = useState('')

  const canConfirm = !requiredWord || typedWord.trim() === requiredWord

  const handleConfirm = () => {
    if (!canConfirm) return
    onConfirm()
    onClose()
  }

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
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
          <Button variant="tertiary" fullWidth onClick={onClose}>
            {cancelLabel}
          </Button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {consequences.length > 0 && (
          <ul
            style={{
              margin: 0,
              paddingInlineStart: '20px',
              color: 'var(--color-text-2)',
              fontSize: '14px',
              lineHeight: 1.6,
            }}
          >
            {consequences.map((c, idx) => (
              <li key={idx}>{c}</li>
            ))}
          </ul>
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
              لتأكيد العملية، يرجى كتابة كلمة "<strong>{requiredWord}</strong>":
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
