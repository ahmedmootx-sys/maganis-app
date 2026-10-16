import React from 'react'

export interface SectionAction {
  label: string
  onClick: () => void
  ariaLabel?: string
}

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  action?: SectionAction
  trailing?: React.ReactNode
  children: React.ReactNode
}

export const Section: React.FC<SectionProps> = ({
  title,
  action,
  trailing,
  children,
  className = '',
  ...props
}) => {
  return (
    <section className={`section ${className}`.trim()} {...props}>
      {(title || action || trailing) && (
        <header className="section__header">
          {title && <h2 className="section__title">{title}</h2>}
          {trailing ? (
            <div className="section__trailing">{trailing}</div>
          ) : action ? (
            <button
              type="button"
              className="section__action"
              onClick={action.onClick}
              aria-label={action.ariaLabel || action.label}
            >
              {action.label}
            </button>
          ) : null}
        </header>
      )}
      {children}
    </section>
  )
}
