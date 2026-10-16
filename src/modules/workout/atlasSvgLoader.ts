const svgCache: Record<'A' | 'P', string> = {
  A: '',
  P: '',
}

/**
 * Loads and caches SVG content for Anterior (A) and Posterior (P) views.
 * Works both in the browser via fetch and in Node/test environments via fs.
 */
export async function loadAtlasSvg(view: 'A' | 'P'): Promise<string> {
  if (svgCache[view]) {
    return svgCache[view]
  }

  const fileName = view === 'A' ? 'anterior.svg' : 'posterior.svg'

  // Browser fetch
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    try {
      const res = await window.fetch(`/atlas/${fileName}`)
      if (res.ok) {
        const text = await res.text()
        svgCache[view] = text
        return text
      }
    } catch {
      // Fallback if fetch fails or relative URL cannot be resolved in tests
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
