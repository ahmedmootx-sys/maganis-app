/**
 * Returns the correct path to a public asset, respecting Vite's base URL.
 * This ensures paths work in development (/), native (/), and on GitHub Pages subpaths.
 *
 * @example
 * assetUrl('branding/bunyan-logo.png')
 * // dev:  '/branding/bunyan-logo.png'
 * // hosted subpath: `${BASE_URL}branding/bunyan-logo.png`
 */
export function assetUrl(path: string): string {
  const base =
    (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL) || '/'
  // Strip leading slash from path to avoid double slashes
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return `${base}${cleanPath}`
}
