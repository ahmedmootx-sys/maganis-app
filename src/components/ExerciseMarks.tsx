import React from 'react'
import { Icon } from '../ui/Icon.tsx'

export interface ExerciseMarksProps {
  hasVideo?: boolean
  hasCustomMedia?: boolean
  className?: string
  style?: React.CSSProperties
}

/**
 * ExerciseMarks (Task H2.3)
 * Renders small indicator icons (16px) at the logical end of the exercise name:
 * - video-play: for exercises with an explanation video
 * - image-up: for exercises with custom/modified media
 * In both themes, uses token colors with >= 3:1 contrast.
 * Accessible with role="img" and descriptive Arabic aria-labels.
 */
export const ExerciseMarks: React.FC<ExerciseMarksProps> = ({
  hasVideo,
  hasCustomMedia,
  className = '',
  style = {},
}) => {
  if (!hasVideo && !hasCustomMedia) {
    return null
  }

  return (
    <span
      className={`exercise-marks ${className}`}
      data-testid="exercise-marks"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        flexShrink: 0,
        verticalAlign: 'middle',
        marginInlineStart: '6px',
        color: 'var(--color-accent, #0284c7)',
        ...style,
      }}
    >
      {hasVideo && (
        <span
          role="img"
          aria-label="فيه فيديو شرح"
          title="فيه فيديو شرح"
          data-testid="mark-video"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          <Icon name="video-play" size={16} />
        </span>
      )}
      {hasCustomMedia && (
        <span
          role="img"
          aria-label="صورة مخصصة"
          title="صورة مخصصة"
          data-testid="mark-custom-media"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          <Icon name="image-up" size={16} />
        </span>
      )}
    </span>
  )
}
