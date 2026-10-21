import React, { useState } from 'react'

export interface SafeImageProps extends Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  'alt' | 'src'
> {
  src?: string | null
  alt?: string
  fallback?: React.ReactNode
}

/**
 * SafeImage Component
 * Prevents broken image icons and browser alt text painting when images fail or are missing.
 * If an error occurs or src is null/empty, cleanly renders the fallback (or nothing).
 */
export function SafeImage({
  src,
  alt = '',
  fallback = null,
  onError,
  style,
  ...props
}: SafeImageProps) {
  const [hasError, setHasError] = useState(false)

  if (!src || hasError) {
    return <>{fallback}</>
  }

  return (
    <img
      src={src}
      alt=""
      aria-label={alt || undefined}
      onError={(e) => {
        setHasError(true)
        onError?.(e)
      }}
      style={style}
      {...props}
    />
  )
}
