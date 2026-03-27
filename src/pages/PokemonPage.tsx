import { ChosenPokemonModule } from '../components/chosen/ChosenPokemonModule'
import { FallenPokemonModule } from '../components/fallen/FallenPokemonModule'
import { CollapsibleModule } from '../components/layout/CollapsibleModule'
import { RouteIntro } from '../components/layout/RouteIntro'
import { TelemetryStrip } from '../components/layout/TelemetryStrip'
import { useTrackerTelemetry } from '../hooks/useTrackerTelemetry'

export const PokemonPage = () => {
  const telemetry = useTrackerTelemetry()

  return (
    <section className="route-page">
      <RouteIntro
        description="Registra tu equipo utilizable y lleva control de las bajas de la run."
        title="Pokémon"
      />
      <TelemetryStrip
        items={[
          { label: 'Equipo', value: telemetry.chosenCount },
          { label: 'Cupos', value: `${telemetry.capturedZones}/${telemetry.totalCaptureZones}` },
          { label: 'Caídos', value: telemetry.fallenCount },
        ]}
        title="Telemetría de equipo"
      />

      <CollapsibleModule defaultOpen subtitle="Capturados y usables" title="Equipo">
        <ChosenPokemonModule compact />
      </CollapsibleModule>

      <CollapsibleModule subtitle="Registro de bajas" title="Caídos">
        <FallenPokemonModule compact />
      </CollapsibleModule>
    </section>
  )
}
