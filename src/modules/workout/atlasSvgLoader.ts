import { assetUrl } from '../../utils/assetUrl.ts'

const svgCache: Record<'A' | 'P', string> = {
  A: '',
  P: '',
}

/**
 * Loads and caches SVG content for Anterior (A) and Posterior (P) views.
 * Works both in the browser via fetch (with multiple robust base/hash route fallbacks)
 * and in Node/test environments via fs.
 */
export async function loadAtlasSvg(
  view: 'A' | 'P',
  forceReload = false,
): Promise<string> {
  if (!forceReload && svgCache[view]) {
    return svgCache[view]
  }

  const fileName = view === 'A' ? 'anterior.svg' : 'posterior.svg'

  // Browser fetch with multiple candidate paths for hash routes, subpaths & static servers
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    const candidates = [
      assetUrl(`atlas/${fileName}`),
      `./atlas/${fileName}`,
      `/atlas/${fileName}`,
      `/maganis-app/atlas/${fileName}`,
    ]
    const uniqueCandidates = Array.from(new Set(candidates.filter(Boolean)))

    for (const url of uniqueCandidates) {
      try {
        const res = await window.fetch(url)
        if (res.ok) {
          const text = await res.text()
          if (text && text.includes('<svg')) {
            svgCache[view] = text
            return text
          }
        }
      } catch {
        // Try next candidate
      }
    }
  }

  // Node / test environment fallback
  if (
    typeof window === 'undefined' &&
    typeof process !== 'undefined' &&
    process.cwd
  ) {
    try {
      const fsModuleName = 'node:fs'
      const pathModuleName = 'node:path'
      const fs = await import(/* @vite-ignore */ fsModuleName)
      const path = await import(/* @vite-ignore */ pathModuleName)
      const filePath = path.join(process.cwd(), 'public', 'atlas', fileName)
      if (fs.existsSync(filePath)) {
        const text = fs.readFileSync(filePath, 'utf8')
        svgCache[view] = text
        return text
      }
    } catch {
      // Ignored
    }
  }

  return svgCache[view] || ''
}

export function getCachedAtlasSvg(view: 'A' | 'P'): string {
  return svgCache[view] || ''
}

export function clearAtlasSvgCache(): void {
  svgCache.A = ''
  svgCache.P = ''
}
