import { BadgesModule } from '../components/badges/BadgesModule'
import { FallenPokemonModule } from '../components/fallen/FallenPokemonModule'
import { PageHeader } from '../components/layout/PageHeader'
import { PageShell } from '../components/layout/PageShell'
import { RevivesModule } from '../components/revives/RevivesModule'
import { RoadmapModule } from '../components/roadmap/RoadmapModule'

export const NuzlockeTrackerPage = () => {
  return (
    <PageShell>
      <PageHeader />

      <section className="module-grid">
        <RevivesModule />
        <FallenPokemonModule />
      </section>

      <RoadmapModule />
      <BadgesModule />
    </PageShell>
  )
}
