import { BadgesModule } from '../components/badges/BadgesModule'
import { RouteIntro } from '../components/layout/RouteIntro'

export const BadgesPage = () => {
  return (
    <section className="route-page">
      <RouteIntro title="Medallas" />
      <BadgesModule />
    </section>
  )
}
