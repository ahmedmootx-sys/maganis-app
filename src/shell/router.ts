import { useState, useEffect, useCallback } from 'react'

export type RoutePath =
  | '/home'
  | '/training'
  | '/training/day/:id'
  | '/exercise/:id'
  | '/library'
  | '/nutrition'
  | '/progress'
  | '/settings'
  | '/styleguide'

export interface RouteMatch {
  path: RoutePath
  raw: string
  params: Record<string, string>
}

const scrollCache = new Map<string, number>()

export function parseHash(hash: string): RouteMatch {
  const clean = hash.replace(/^#\/?/, '').split('?')[0] || 'home'
  const parts = clean.split('/')

  if (parts[0] === 'home') {
    return { path: '/home', raw: '#/home', params: {} }
  }
  if (parts[0] === 'training') {
    if (parts[1] === 'day' && parts[2]) {
      return {
        path: '/training/day/:id',
        raw: `#/training/day/${parts[2]}`,
        params: { id: parts[2] },
      }
    }
    return { path: '/training', raw: '#/training', params: {} }
  }
  if (parts[0] === 'exercise' && parts[1]) {
    return {
      path: '/exercise/:id',
      raw: `#/exercise/${parts[1]}`,
      params: { id: parts[1] },
    }
  }
  if (parts[0] === 'library') {
    return { path: '/library', raw: '#/library', params: {} }
  }
  if (parts[0] === 'nutrition') {
    return { path: '/nutrition', raw: '#/nutrition', params: {} }
  }
  if (parts[0] === 'progress') {
    return { path: '/progress', raw: '#/progress', params: {} }
  }
  if (parts[0] === 'settings') {
    return { path: '/settings', raw: '#/settings', params: {} }
  }
  if (parts[0] === 'styleguide') {
    return { path: '/styleguide', raw: '#/styleguide', params: {} }
  }

  // Fallback to home
  return { path: '/home', raw: '#/home', params: {} }
}

export function useRouter() {
  const [currentRoute, setCurrentRoute] = useState<RouteMatch>(() => {
    return typeof window !== 'undefined'
      ? parseHash(window.location.hash)
      : { path: '/home', raw: '#/home', params: {} }
  })

  useEffect(() => {
    let prevRaw = currentRoute.raw

    const handleHashChange = () => {
      // Save scroll of previous route
      scrollCache.set(prevRaw, window.scrollY)

      const next = parseHash(window.location.hash)
      setCurrentRoute(next)
      prevRaw = next.raw

      // Restore scroll position after tick
      setTimeout(() => {
        const savedScroll = scrollCache.get(next.raw) ?? 0
        window.scrollTo({ top: savedScroll, behavior: 'instant' })
      }, 0)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [currentRoute.raw])

  const navigate = useCallback((to: string) => {
    const formatted = to.startsWith('#')
      ? to
      : `#${to.startsWith('/') ? to : '/' + to}`
    window.location.hash = formatted
  }, [])

  const goBack = useCallback(() => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      navigate('/home')
    }
  }, [navigate])

  return {
    route: currentRoute,
    navigate,
    goBack,
  }
}
