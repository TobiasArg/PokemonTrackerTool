import { ChosenPokemonModule } from '../components/chosen/ChosenPokemonModule'
import { FallenPokemonModule } from '../components/fallen/FallenPokemonModule'
import { CollapsibleModule } from '../components/layout/CollapsibleModule'
import { RouteIntro } from '../components/layout/RouteIntro'

export const PokemonPage = () => {
  return (
    <section className="route-page">
      <RouteIntro title="Pokémon" />

      <CollapsibleModule defaultOpen subtitle="Capturados y usables" title="Equipo">
        <ChosenPokemonModule compact />
      </CollapsibleModule>

      <CollapsibleModule subtitle="Registro de bajas" title="Caídos">
        <FallenPokemonModule compact />
      </CollapsibleModule>
    </section>
  )
}
