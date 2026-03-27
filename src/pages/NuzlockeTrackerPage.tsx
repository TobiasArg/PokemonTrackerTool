import { BadgesModule } from '../components/badges/BadgesModule'
import { ChosenPokemonModule } from '../components/chosen/ChosenPokemonModule'
import { FallenPokemonModule } from '../components/fallen/FallenPokemonModule'
import { PageHeader } from '../components/layout/PageHeader'
import { PageShell } from '../components/layout/PageShell'
import { RoadmapModule } from '../components/roadmap/RoadmapModule'

export const NuzlockeTrackerPage = () => {
  return (
    <PageShell>
      <PageHeader />
      <ChosenPokemonModule />
      <RoadmapModule />
      <FallenPokemonModule />
      <BadgesModule />
    </PageShell>
  )
}
