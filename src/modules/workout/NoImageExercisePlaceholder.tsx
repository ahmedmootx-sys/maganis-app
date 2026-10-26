/**
 * src/modules/workout/NoImageExercisePlaceholder.tsx
 *
 * Implements Task G5-B4.1:
 * "No image" placeholder displayed when an exercise has no media,
 * featuring 3 prominent actions:
 * 1. انسخ الاسم (with copy helper and toast)
 * 2. ضيف صورتك (triggers custom image upload / edit sheet)
 * 3. ضيف فيديو (triggers video link entry / edit sheet)
 */

import React from 'react'
import { CopyExerciseNameButton } from './CopyExerciseNameButton.tsx'

export interface NoImageExercisePlaceholderProps {
  nameAr?: string
  nameEn?: string
  onToast?: (message: string) => void
  onAddImage?: () => void
  onAddVideo?: () => void
}

export const NoImageExercisePlaceholder: React.FC<
  NoImageExercisePlaceholderProps
> = ({ nameAr, nameEn, onToast, onAddImage, onAddVideo }) => {
  return (
    <div
      data-testid="no-image-placeholder"
      style={{
        borderRadius: 'var(--radius-card)',
        border: '1px dashed var(--color-divider)',
        backgroundColor: 'var(--color-surface)',
        padding: 'var(--space-6) var(--space-4)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--space-4)',
        textAlign: 'center',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1)',
        }}
      >
        <span
          style={{
            fontSize: 'var(--font-size-md)',
            fontWeight: 'var(--font-weight-semibold)',
            color: 'var(--color-text)',
          }}
        >
          لا توجد صورة أو حركة لهذا التمرين
        </span>
        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            color: 'var(--color-text-2)',
          }}
        >
          تقدر تنسخ الاسم عشان تبحث عنه أو تضيف صور وفيديوهات بنفسك
        </span>
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 'var(--space-2)',
          justifyContent: 'center',
          width: '100%',
        }}
      >
        {/* Action 1: انسخ الاسم */}
        <CopyExerciseNameButton
          nameAr={nameAr}
          nameEn={nameEn}
          onToast={onToast}
        />

        {/* Action 2: ضيف صورتك */}
        {onAddImage && (
          <button
            type="button"
            data-testid="placeholder-add-image-btn"
            onClick={onAddImage}
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>ضيف صورتك</span>
          </button>
        )}

        {/* Action 3: ضيف فيديو */}
        {onAddVideo && (
          <button
            type="button"
            data-testid="placeholder-add-video-btn"
            onClick={onAddVideo}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 'var(--space-2)',
              minHeight: 'var(--touch-target-min)',
              padding: 'var(--space-2) var(--space-3)',
              borderRadius: 'var(--radius-control)',
              border: '1px solid var(--color-accent)',
              backgroundColor: 'var(--color-accent-tint)',
              color: 'var(--color-accent-text)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 'var(--font-weight-semibold)',
              cursor: 'pointer',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            <span>ضيف فيديو</span>
          </button>
        )}
      </div>
    </div>
  )
}
