import type { ReactNode } from 'react'
import { Sheet } from './Sheet'

export interface ConfirmSheetProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: ReactNode
  message: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  isDestructive?: boolean
  confirmDisabled?: boolean
}

export function ConfirmSheet({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  isDestructive = false,
  confirmDisabled = false,
}: ConfirmSheetProps) {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      className="confirm-sheet"
    >
      <div className="confirm-sheet__message">{message}</div>
      <div className="confirm-sheet__actions">
        <button
          type="button"
          className={
            isDestructive
              ? 'danger full-width'
              : 'btn-primary-action full-width'
          }
          disabled={confirmDisabled}
          onClick={() => {
            onConfirm()
            onClose()
          }}
        >
          {confirmLabel}
        </button>
        <button
          type="button"
          className="ghost-secondary full-width"
          onClick={onClose}
        >
          {cancelLabel}
        </button>
      </div>
    </Sheet>
  )
}
