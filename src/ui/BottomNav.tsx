import React, { useEffect, useRef } from 'react'
import { Icon, type IconName } from './Icon.tsx'

export type BottomNavTabId =
  'home' | 'training' | 'nutrition' | 'progress' | 'settings'

export interface BottomNavTab {
  id: BottomNavTabId
  label: string
  icon: IconName
  route: string
}

export const BOTTOM_NAV_TABS: BottomNavTab[] = [
  { id: 'home', label: 'الرئيسية', icon: 'home', route: '#/home' },
  { id: 'training', label: 'التدريب', icon: 'dumbbell', route: '#/training' },
  { id: 'nutrition', label: 'التغذية', icon: 'utensils', route: '#/nutrition' },
  { id: 'progress', label: 'التقدم', icon: 'trending-up', route: '#/progress' },
  { id: 'settings', label: 'الإعدادات', icon: 'settings', route: '#/settings' },
]

export interface BottomNavProps {
  activeTab: BottomNavTabId
  onSelectTab?: (id: BottomNavTabId) => void
  hidden?: boolean
  className?: string
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  hidden = false,
  className = '',
}) => {
  const navRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = navRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const height =
          entry.borderBoxSize?.[0]?.blockSize ??
          entry.target.getBoundingClientRect().height
        if (height > 0) {
          document.documentElement.style.setProperty(
            '--nav-h',
            `${Math.round(height)}px`,
          )
        }
      }
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  if (hidden) return null

  return (
    <nav
      ref={navRef}
      className={`bottom-nav ${className}`.trim()}
      aria-label="التنقل الرئيسي"
      data-testid="bottom-nav"
    >
      <div className="bottom-nav__inner">
        {BOTTOM_NAV_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              className={`bottom-nav__tab ${isActive ? 'bottom-nav__tab--active' : ''}`.trim()}
              data-testid={`bottom-nav-tab-${tab.id}`}
              aria-current={isActive ? 'page' : undefined}
              onClick={() => {
                if (onSelectTab) {
                  onSelectTab(tab.id)
                } else {
                  window.location.hash = tab.route
                }
              }}
            >
              <Icon name={tab.icon} size={24} />
              <span className="bottom-nav__tab-label">{tab.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
