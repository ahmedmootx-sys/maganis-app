import React from 'react'
import { Icon, type IconName } from './Icon.tsx'

export interface TabItem {
  id: string
  label: string
  icon?: IconName
  count?: number
}

export interface TabsProps {
  tabs: TabItem[]
  activeId: string
  onChange: (id: string) => void
  className?: string
  sticky?: boolean
}

export const Tabs: React.FC<TabsProps> = ({
  tabs,
  activeId,
  onChange,
  className = '',
  sticky = true,
}) => {
  return (
    <div
      className={`tabs-container ${className}`.trim()}
      role="tablist"
      style={{
        position: sticky ? 'sticky' : 'relative',
      }}
    >
      {tabs.map((tab) => {
        const isActive = tab.id === activeId
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            className={`tab-btn ${isActive ? 'tab-btn--active' : ''}`.trim()}
            onClick={() => onChange(tab.id)}
          >
            {tab.icon && <Icon name={tab.icon} size={18} />}
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  padding: '2px 6px',
                  borderRadius: '999px',
                  background: isActive
                    ? 'var(--color-accent)'
                    : 'var(--color-surface-2)',
                  color: isActive
                    ? 'var(--color-accent-contrast)'
                    : 'var(--color-text-2)',
                }}
              >
                <bdi>{tab.count}</bdi>
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
