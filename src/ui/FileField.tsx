import React, { useRef } from 'react'
import { Icon } from './Icon.tsx'
import { IconButton } from './Button.tsx'

export interface FileFieldProps {
  id?: string
  name?: string
  fileName?: string
  accept?: string
  onChange: (file: File | null) => void
  buttonLabel?: string
  disabled?: boolean
  className?: string
}

export const FileField: React.FC<FileFieldProps> = ({
  id,
  name,
  fileName,
  accept,
  onChange,
  buttonLabel = 'اختيار ملف...',
  disabled = false,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    onChange(file)
  }

  const handleClear = () => {
    if (inputRef.current) inputRef.current.value = ''
    onChange(null)
  }

  return (
    <div className={`file-field-container ${className}`.trim()}>
      <input
        ref={inputRef}
        type="file"
        id={id}
        name={name}
        accept={accept}
        onChange={handleFileChange}
        disabled={disabled}
        tabIndex={-1}
        style={{
          position: 'absolute',
          opacity: 0,
          pointerEvents: 'none',
          width: 0,
          height: 0,
        }}
        aria-hidden="true"
      />

      {!fileName ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="btn btn--secondary btn--full-width"
          style={{
            minHeight: 'var(--control-height)',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <Icon name="folder" size={18} />
          <span>{buttonLabel}</span>
        </button>
      ) : (
        <div
          className="field-input"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            minHeight: 'var(--control-height)',
          }}
        >
          <div
            onClick={() => !disabled && inputRef.current?.click()}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflow: 'hidden',
              cursor: disabled ? 'default' : 'pointer',
            }}
          >
            <Icon
              name="file-text"
              size={18}
              style={{ color: 'var(--color-text-2)' }}
            />
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                fontSize: '14px',
              }}
            >
              {fileName}
            </span>
          </div>
          {!disabled && (
            <IconButton
              name="x"
              size={16}
              aria-label="مسح الملف"
              onClick={handleClear}
            />
          )}
        </div>
      )}
    </div>
  )
}
