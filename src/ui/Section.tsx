import React from 'react'

export interface SectionAction {
  label: string
  onClick: () => void
  ariaLabel?: string
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  action?: SectionAction
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({
  title,
  action,
  children,
  className = '',
  ...props
}) => {
  return (
    <section className={`section ${className}`.trim()} {...props}>
      {(title || action) && (
        <header className="section__header">
          {title && <h2 className="section__title">{title}</h2>}
          {action && (
            <button
              type="button"
              className="section__action"
              onClick={action.onClick}
              aria-label={action.ariaLabel || action.label}
            >
              {action.label}
            </button>
          )}
        </header>
      )}
      {children}
    </section>
  )
}
