/**
 * src/modules/workout/CopyExerciseNameButton.tsx
 *
 * Implements Task G5-B4.1:
 * "انسخ الاسم" button with:
 * - Two-item choice menu ("عربي" / "إنجليزي") when both names exist.
 * - Direct copy when only one exists.
 * - Resilient clipboard helper with execCommand and selectable textarea fallback.
 * - Arabic toast "اتنسخ".
 */

import React, { useState, useRef, useEffect } from 'react'
import { copyToClipboard } from '../../utils/clipboard.ts'

export interface CopyExerciseNameButtonProps {
  nameAr?: string
  nameEn?: string
  onToast?: (message: string) => void
  variant?: 'button' | 'menu-item' | 'placeholder-action'
  className?: string
  style?: React.CSSProperties
}

export const CopyExerciseNameButton: React.FC<CopyExerciseNameButtonProps> = ({
  nameAr = '',
  nameEn = '',
  onToast,
  variant = 'button',
  className = '',
  style,
}) => {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const cleanAr = nameAr.trim()
  const cleanEn = nameEn.trim()
  const hasBoth = Boolean(cleanAr && cleanEn && cleanAr !== cleanEn)

  // Close menu on click outside
  useEffect(() => {
    if (!showMenu) return
    const handleClickOutside = (e: Event) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [showMenu])

  const doCopy = async (text: string) => {
    setShowMenu(false)
    const success = await copyToClipboard(text)
    if (success && onToast) {
      onToast('اتنسخ')
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (hasBoth) {
      setShowMenu((prev) => !prev)
    } else {
      doCopy(cleanAr || cleanEn)
    }
  }

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        ...style,
      }}
      className={`copy-exercise-name-btn-container copy-exercise--${variant} ${className}`.trim()}
    >
      <button
        type="button"
        data-testid="copy-exercise-name-btn"
        onClick={handleClick}
        aria-label="انسخ اسم التمرين"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 'var(--space-2)',
          minHeight: 'var(--touch-target-min)',
          padding: 'var(--space-2) var(--space-3)',
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--color-divider)',
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text)',
          fontSize: 'var(--font-size-sm)',
          fontWeight: 'var(--font-weight-semibold)',
          cursor: 'pointer',
        }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <span>انسخ الاسم</span>
      </button>

      {/* Two-Item Menu: عربي / إنجليزي */}
      {showMenu && (
        <div
          data-testid="copy-name-menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 4px)',
            left: 0,
            zIndex: 100,
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-divider)',
            borderRadius: 'var(--radius-control)',
            boxShadow: 'var(--shadow-dropdown)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '130px',
            overflow: 'hidden' /* clip-ok: dropdown menu container */,
          }}
        >
          <button
            type="button"
            data-testid="copy-ar-btn"
            onClick={(e) => {
              e.stopPropagation()
              doCopy(cleanAr)
            }}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              minHeight: 'var(--touch-target-min)',
              textAlign: 'start',
              border: 'none',
              background: 'none',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
              borderBottom: '1px solid var(--color-divider)',
            }}
          >
            عربي
          </button>
          <button
            type="button"
            data-testid="copy-en-btn"
            onClick={(e) => {
              e.stopPropagation()
              doCopy(cleanEn)
            }}
            style={{
              padding: 'var(--space-2) var(--space-3)',
              minHeight: 'var(--touch-target-min)',
              textAlign: 'start',
              border: 'none',
              background: 'none',
              color: 'var(--color-text)',
              fontSize: 'var(--font-size-sm)',
              cursor: 'pointer',
            }}
          >
            إنجليزي
          </button>
        </div>
      )}
    </div>
  )
}
