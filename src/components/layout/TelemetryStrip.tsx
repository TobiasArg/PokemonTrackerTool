import type { ReactNode } from 'react'

type TelemetryItem = {
  label: string
  value: ReactNode
}

type TelemetryStripProps = {
  title?: string
  items: TelemetryItem[]
}

export const TelemetryStrip = ({ title = 'Telemetría', items }: TelemetryStripProps) => {
  return (
    <section aria-label={title} className="telemetry-strip">
      <p className="telemetry-strip__title">{title}</p>
      <div className="telemetry-strip__grid">
        {items.map((item) => {
          return (
            <article className="telemetry-strip__item" key={item.label}>
              <p className="telemetry-strip__label">{item.label}</p>
              <p className="telemetry-strip__value">{item.value}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
