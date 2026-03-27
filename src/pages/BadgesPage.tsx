import { BadgesModule } from '../components/badges/BadgesModule'
import { RouteIntro } from '../components/layout/RouteIntro'
import { TelemetryStrip } from '../components/layout/TelemetryStrip'
import { useTrackerTelemetry } from '../hooks/useTrackerTelemetry'

export const BadgesPage = () => {
  const telemetry = useTrackerTelemetry()

  return (
    <section className="route-page">
      <RouteIntro
        description="Tablero de medallas con estado activo o silueta según avance."
        title="Medallas"
      />
      <TelemetryStrip
        items={[
          { label: 'Medallas', value: `${telemetry.badgesEarned}/${telemetry.totalBadges}` },
          { label: 'Checks', value: `${telemetry.doneChecks}/${telemetry.totalChecks}` },
          { label: 'Progreso', value: `${telemetry.completionRate}%` },
        ]}
        title="Telemetría de medallas"
      />
      <BadgesModule />
    </section>
  )
}
