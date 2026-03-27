import { RouteIntro } from '../components/layout/RouteIntro'
import { RoadmapModule } from '../components/roadmap/RoadmapModule'

export const RoadmapPage = () => {
  return (
    <section className="route-page">
      <RouteIntro title="Roadmap" />
      <RoadmapModule />
    </section>
  )
}
