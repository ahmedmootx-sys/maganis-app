import { useEffect, useState } from 'react'
import { assetUrl } from '../../utils/assetUrl.ts'
import type { MuscleGroup } from '../shared/types.ts'

interface ExerciseVisualProps {
  category: MuscleGroup | string
  exerciseId?: string
  exerciseName?: string
  imageUrl?: string
  size?: 'small' | 'medium' | 'large'
  isAnimated?: boolean
}

// Category fallback local images if specific ID image is not found
const CATEGORY_DEFAULT_IMAGES: Record<string, [string, string]> = {
  chest: ['exercises/chest-1_0.jpg', 'exercises/chest-1_1.jpg'],
  back: ['exercises/back-1_0.jpg', 'exercises/back-1_1.jpg'],
  legs: ['exercises/leg-1_0.jpg', 'exercises/leg-1_1.jpg'],
  shoulders: ['exercises/shoulder-1_0.jpg', 'exercises/shoulder-1_1.jpg'],
  arms: ['exercises/arm-1_0.jpg', 'exercises/arm-1_1.jpg'],
  core: ['exercises/core-1_0.jpg', 'exercises/core-1_1.jpg'],
}

/**
 * ExerciseVisual provides white-background anatomical photo/vector avatars matching Hevy/GymVisual,
 * with red highlighted active muscles and smooth movement animation for detail view.
 */
export function ExerciseVisual({
  category,
  exerciseId,
  exerciseName = '',
  imageUrl,
  size = 'small',
  isAnimated = false,
}: ExerciseVisualProps) {
  const [frameIndex, setFrameIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  // Resolve frame 0 and frame 1
  let frame0 = imageUrl
  let frame1 = imageUrl

  if (!frame0 && exerciseId) {
    frame0 = `exercises/${exerciseId}_0.jpg`
    frame1 = `exercises/${exerciseId}_1.jpg`
  }

  if (!frame0) {
    const catDefaults =
      CATEGORY_DEFAULT_IMAGES[category] || CATEGORY_DEFAULT_IMAGES['chest']
    frame0 = catDefaults[0]
    frame1 = catDefaults[1]
  }

  // Smooth animation loop for modal showcase (switches between start and contraction frames)
  useEffect(() => {
    if (!isAnimated || !frame1 || frame0 === frame1) return
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev === 0 ? 1 : 0))
    }, 900)
    return () => clearInterval(interval)
  }, [isAnimated, frame0, frame1])

  const rawSrc = frameIndex === 1 && frame1 ? frame1 : frame0
  const currentSrc =
    rawSrc &&
    (rawSrc.startsWith('http://') ||
      rawSrc.startsWith('https://') ||
      rawSrc.startsWith('data:'))
      ? rawSrc
      : rawSrc
        ? assetUrl(rawSrc)
        : ''

  // High-precision Anatomical Vector Avatar on Pure White Background
  // Matching the user's reference image (silver-grey muscle anatomy with red highlighted active muscles)
  const renderAnatomicalWhiteAvatar = () => {
    const red = '#ef4444' // Vivid crimson red
    const muscleSilver = '#94a3b8' // Anatomical silver-grey
    const deepMuscle = '#64748b' // Deep muscle shadow

    switch (category) {
      case 'chest':
        return (
          <svg viewBox="0 0 64 64" className="anatomy-white-svg" fill="none">
            <rect width="64" height="64" rx="32" fill="#ffffff" />
            {/* Head & Neck */}
            <circle cx="32" cy="13" r="5" fill={muscleSilver} />
            <path d="M30 18 L34 18 L36 24 L28 24 Z" fill={deepMuscle} />
            {/* Torso & Shoulders */}
            <path d="M21 24 L43 24 L45 42 L19 42 Z" fill={muscleSilver} />
            {/* Pectorals in Vivid Anatomical Red with striations */}
            <path
              d="M23 25 C27 25, 31 27, 31 33 C26 33, 23 31, 23 25 Z"
              fill={red}
            />
            <path
              d="M41 25 C37 25, 33 27, 33 33 C38 33, 41 31, 41 25 Z"
              fill={red}
            />
            {/* Barbell Across Chest */}
            <line
              x1="8"
              y1="28"
              x2="56"
              y2="28"
              stroke="#334155"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="6" y="24" width="3" height="8" rx="1" fill="#1e293b" />
            <rect x="55" y="24" width="3" height="8" rx="1" fill="#1e293b" />
          </svg>
        )

      case 'back':
        return (
          <svg viewBox="0 0 64 64" className="anatomy-white-svg" fill="none">
            <rect width="64" height="64" rx="32" fill="#ffffff" />
            {/* Head back */}
            <circle cx="32" cy="13" r="5" fill={muscleSilver} />
            <polygon points="27,22 32,28 37,22" fill={red} />
            {/* Torso & Lats in Vivid Anatomical Red */}
            <path d="M21 24 L43 24 L38 44 L26 44 Z" fill={muscleSilver} />
            <path d="M22 25 L29 35 L26 42 L21 27 Z" fill={red} />
            <path d="M42 25 L35 35 L38 42 L43 27 Z" fill={red} />
            {/* Lower Back & Glutes */}
            <path d="M27 44 L37 44 L36 54 L28 54 Z" fill={muscleSilver} />
          </svg>
        )

      case 'legs':
        return (
          <svg viewBox="0 0 64 64" className="anatomy-white-svg" fill="none">
            <rect width="64" height="64" rx="32" fill="#ffffff" />
            {/* Head & Upper Back tilted like Romanian Deadlift reference */}
            <circle cx="26" cy="18" r="4.5" fill={muscleSilver} />
            <path d="M27 22 L36 28 L32 36 L24 30 Z" fill={muscleSilver} />
            {/* Spine & Erector Spinae */}
            <path
              d="M28 24 L36 30"
              stroke={red}
              strokeWidth="2"
              strokeLinecap="round"
            />
            {/* Glutes in Vivid Anatomical Red (Like Romanian Deadlift reference) */}
            <path
              d="M34 29 C40 27, 44 32, 44 38 C43 43, 38 43, 34 38 Z"
              fill={red}
            />
            {/* Hamstrings & Calves in Vivid Red */}
            <path d="M34 39 L41 39 L39 51 L33 51 Z" fill={red} />
            <path d="M33 52 L38 52 L36 60 L32 60 Z" fill={muscleSilver} />
            {/* Barbell at Shin Level */}
            <line
              x1="12"
              y1="52"
              x2="48"
              y2="52"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="16" cy="52" r="5" fill="#334155" />
            <circle cx="44" cy="52" r="5" fill="#334155" />
          </svg>
        )

      case 'shoulders':
        return (
          <svg viewBox="0 0 64 64" className="anatomy-white-svg" fill="none">
            <rect width="64" height="64" rx="32" fill="#ffffff" />
            <circle cx="32" cy="14" r="5" fill={muscleSilver} />
            <path d="M22 25 L42 25 L44 42 L20 42 Z" fill={muscleSilver} />
            {/* Deltoids in Vivid Red */}
            <circle cx="19" cy="27" r="5" fill={red} />
            <circle cx="45" cy="27" r="5" fill={red} />
            {/* Overhead Barbell */}
            <line
              x1="10"
              y1="12"
              x2="54"
              y2="12"
              stroke="#1e293b"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <rect x="8" y="9" width="3" height="6" fill="#334155" />
            <rect x="53" y="9" width="3" height="6" fill="#334155" />
          </svg>
        )

      case 'arms':
        return (
          <svg viewBox="0 0 64 64" className="anatomy-white-svg" fill="none">
            <rect width="64" height="64" rx="32" fill="#ffffff" />
            <circle cx="32" cy="14" r="5" fill={muscleSilver} />
            <path d="M23 24 L41 24 L39 42 L25 42 Z" fill={muscleSilver} />
            {/* Biceps/Triceps in Vivid Red */}
            <path d="M17 26 C14 30, 16 36, 20 36 L21 28 Z" fill={red} />
            <path d="M47 26 C50 30, 48 36, 44 36 L43 28 Z" fill={red} />
            {/* Dumbbells in hand */}
            <rect x="14" y="37" width="6" height="3.5" rx="1" fill="#1e293b" />
            <rect x="44" y="37" width="6" height="3.5" rx="1" fill="#1e293b" />
          </svg>
        )

      case 'core':
      default:
        return (
          <svg viewBox="0 0 64 64" className="anatomy-white-svg" fill="none">
            <rect width="64" height="64" rx="32" fill="#ffffff" />
            <circle cx="32" cy="14" r="5" fill={muscleSilver} />
            <path d="M23 24 L41 24 L38 45 L26 45 Z" fill={muscleSilver} />
            {/* Six Pack Blocks in Vivid Red */}
            <rect x="28.5" y="26" width="3.2" height="3.5" rx="1" fill={red} />
            <rect x="32.5" y="26" width="3.2" height="3.5" rx="1" fill={red} />
            <rect
              x="28.5"
              y="30.5"
              width="3.2"
              height="3.5"
              rx="1"
              fill={red}
            />
            <rect
              x="32.5"
              y="30.5"
              width="3.2"
              height="3.5"
              rx="1"
              fill={red}
            />
            <rect x="28.5" y="35" width="3.2" height="3.5" rx="1" fill={red} />
            <rect x="32.5" y="35" width="3.2" height="3.5" rx="1" fill={red} />
            {/* Obliques in Red */}
            <path d="M25 28 L27 28 L28 38 L25 36 Z" fill={red} />
            <path d="M39 28 L37 28 L36 38 L39 36 Z" fill={red} />
          </svg>
        )
    }
  }

  // Fallback to anatomical vector avatar if image fails or missing
  if (imgError || !currentSrc) {
    return (
      <div
        className={`exercise-visual-circle white-theme size-${size}`}
        title={exerciseName || category}
      >
        {renderAnatomicalWhiteAvatar()}
      </div>
    )
  }

  return (
    <div
      className={`exercise-visual-circle white-theme size-${size} ${isAnimated ? 'animated-showcase' : ''}`}
      title={exerciseName || category}
    >
      <img
        src={currentSrc}
        alt={exerciseName}
        className="exercise-visual-img"
        onError={() => setImgError(true)}
        loading="lazy"
      />
      {isAnimated && (
        <span className="live-badge">
          {frameIndex === 0 ? 'وضعية البداية' : 'قمة الانقباض'}
        </span>
      )}
    </div>
  )
}
