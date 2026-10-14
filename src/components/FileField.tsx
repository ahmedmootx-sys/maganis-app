import React, { useId, useRef, useState } from 'react'

export interface FileFieldProps {
  id?: string
  name?: string
  label?: string
  accept?: string
  buttonText?: string
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  style?: React.CSSProperties
  onChange: (file: File | null) => void
  onFileLoaded?: (content: string, file: File) => void
  readAs?: 'text' | 'dataURL'
  currentFileName?: string
  'aria-label'?: string
}

/**
 * FileField Component
 * Styled 48px full-width button + selected file name + remove button.
 * Completely hides raw browser file inputs.
 */
export const FileField: React.FC<FileFieldProps> = ({
  id,
  name,
  label,
  accept,
  buttonText = 'اختيار ملف...',
  disabled = false,
  required = false,
  className = '',
  style,
  onChange,
  onFileLoaded,
  readAs = 'text',
  currentFileName,
  'aria-label': ariaLabel,
}) => {
  const generatedId = useId()
  const fieldId = id || generatedId
  const inputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const activeFileName = selectedFile?.name || currentFileName

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setSelectedFile(file)
    onChange(file)

    if (file && onFileLoaded) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onFileLoaded(reader.result, file)
        }
      }
      if (readAs === 'dataURL') {
        reader.readAsDataURL(file)
      } else {
        reader.readAsText(file)
      }
    }
  }

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedFile(null)
    if (inputRef.current) {
      inputRef.current.value = ''
    }
    onChange(null)
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div
      className={`maganis-field file-field ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        width: '100%',
        ...style,
      }}
      data-testid={`file-field-${fieldId}`}
    >
      {label && (
        <label
          htmlFor={fieldId}
          className="field-label"
          style={{
            display: 'block',
            fontSize: '13.5px',
            fontWeight: 600,
            color: 'var(--ink)',
            marginBottom: '2px',
            textAlign: 'right',
          }}
        >
          {label}
          {required && (
            <span style={{ color: 'var(--danger)', marginInlineStart: '4px' }}>
              *
            </span>
          )}
        </label>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={inputRef}
        type="file"
        id={fieldId}
        name={name}
        accept={accept}
        disabled={disabled}
        onChange={handleInputChange}
        style={{ display: 'none' }}
        aria-label={ariaLabel || label || buttonText}
      />

      {/* Styled 48px Container */}
      {!activeFileName ? (
        <button
          type="button"
          disabled={disabled}
          onClick={() => inputRef.current?.click()}
          className="file-field-button button-subtle"
          style={{
            width: '100%',
            height: '48px',
            minHeight: '48px',
            maxHeight: '48px',
            padding: '0 16px',
            borderRadius: '10px',
            border: '1.5px dashed var(--input-border, var(--line))',
            background: 'var(--input-bg, var(--card-bg))',
            color: 'var(--ink)',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            cursor: disabled ? 'not-allowed' : 'pointer',
            opacity: disabled ? 0.6 : 1,
            boxSizing: 'border-box',
            transition: 'all 0.15s ease',
          }}
        >
          <span style={{ fontSize: '18px' }}>📁</span>
          <span>{buttonText}</span>
        </button>
      ) : (
        <div
          className="file-field-selected"
          style={{
            width: '100%',
            height: '48px',
            minHeight: '48px',
            maxHeight: '48px',
            padding: '0 12px',
            borderRadius: '10px',
            border: '1.5px solid var(--accent)',
            background: 'var(--accent-soft)',
            color: 'var(--ink)',
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            boxSizing: 'border-box',
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
            <span style={{ fontSize: '18px' }}>📄</span>
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 600,
                color: 'var(--ink)',
              }}
            >
              {activeFileName}
            </span>
            {selectedFile?.size ? (
              <span
                style={{
                  fontSize: '11px',
                  color: 'var(--muted)',
                  whiteSpace: 'nowrap',
                }}
              >
                ({formatFileSize(selectedFile.size)})
              </span>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={disabled}
            aria-label="إزالة الملف"
            style={{
              background: 'rgba(239, 68, 68, 0.12)',
              color: 'var(--danger)',
              border: 'none',
              borderRadius: '6px',
              padding: '4px 10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: disabled ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ✕ إزالة
          </button>
        </div>
      )}
    </div>
  )
}

export default FileField
