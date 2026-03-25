import clsx from 'clsx'
import type { ReactNode } from 'react'

type PanelProps = {
  title: string
  description?: string
  className?: string
  children: ReactNode
}

export const Panel = ({ title, description, className, children }: PanelProps) => {
  return (
    <section className={clsx('panel', className)}>
      <header className="panel__header">
        <h2 className="panel__title">{title}</h2>
        {description ? <p className="panel__description">{description}</p> : null}
      </header>
      <div className="panel__content">{children}</div>
    </section>
  )
}
