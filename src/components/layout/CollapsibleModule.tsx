import type { ReactNode } from 'react'

type CollapsibleModuleProps = {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
}

export const CollapsibleModule = ({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: CollapsibleModuleProps) => {
  return (
    <details className="collapsible-module" open={defaultOpen}>
      <summary className="collapsible-module__summary">
        <div className="collapsible-module__text">
          <p className="collapsible-module__title">{title}</p>
          {subtitle ? <p className="collapsible-module__subtitle">{subtitle}</p> : null}
        </div>
        <span aria-hidden="true" className="collapsible-module__chevron">
          ▸
        </span>
      </summary>
      <div className="collapsible-module__content">{children}</div>
    </details>
  )
}
