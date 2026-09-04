/**
 * Returns the correct path to a public asset, respecting Vite's base URL.
 * This ensures paths work both in development (/) and on GitHub Pages (/maganis-app/).
 *
 * @example
 * assetUrl('branding/maganis-mascot-inner.png')
 * // dev:  '/branding/maganis-mascot-inner.png'
 * // prod: '/maganis-app/branding/maganis-mascot-inner.png'
 */
export function assetUrl(path: string): string {
  const base = import.meta.env.BASE_URL
  // Strip leading slash from path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanPath}`
}
