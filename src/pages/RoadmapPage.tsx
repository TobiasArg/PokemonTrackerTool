import { RouteIntro } from '../components/layout/RouteIntro'
import { TelemetryStrip } from '../components/layout/TelemetryStrip'
import { RoadmapModule } from '../components/roadmap/RoadmapModule'
import { useTrackerTelemetry } from '../hooks/useTrackerTelemetry'

export const RoadmapPage = () => {
  const telemetry = useTrackerTelemetry()

  return (
    <section className="route-page">
      <RouteIntro
        description="Gestiona captura/completado por zona y superación de líderes."
        title="Roadmap"
      />
      <TelemetryStrip
        items={[
          { label: 'Checks', value: `${telemetry.doneChecks}/${telemetry.totalChecks}` },
          {
            label: 'Capturas',
            value: `${telemetry.capturedZones}/${telemetry.totalCaptureZones}`,
          },
          {
            label: 'Líderes',
            value: `${telemetry.leadersDefeated}/${telemetry.totalLeaders}`,
          },
        ]}
        title="Telemetría de progreso"
      />
      <RoadmapModule />
    </section>
  )
}
