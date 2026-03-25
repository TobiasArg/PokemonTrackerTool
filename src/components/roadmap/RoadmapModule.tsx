import { Panel } from '../atomic/Panel'
import { useRoadmap } from '../../hooks/useRoadmap'
import { RoadmapRow } from './RoadmapRow'

export const RoadmapModule = () => {
  const { zones, zoneProgress, toggleZoneProgress, summary } = useRoadmap()

  return (
    <Panel
      className="roadmap-panel"
      description="Marca visitado, captura y completada por zona, con level cap visible."
      title="Módulo Roadmap"
    >
      <div className="roadmap-summary">
        <article className="summary-item">
          <p className="summary-item__label">Zonas</p>
          <p className="summary-item__value">{summary.totalZones}</p>
        </article>
        <article className="summary-item">
          <p className="summary-item__label">Visitadas</p>
          <p className="summary-item__value">{summary.visited}</p>
        </article>
        <article className="summary-item">
          <p className="summary-item__label">Capturas</p>
          <p className="summary-item__value">{summary.captured}</p>
        </article>
        <article className="summary-item">
          <p className="summary-item__label">Completadas</p>
          <p className="summary-item__value">{summary.completed}</p>
        </article>
      </div>

      <div className="roadmap-table-wrap">
        <table className="roadmap-table">
          <thead>
            <tr>
              <th scope="col">Ruta / Zona</th>
              <th scope="col">Visitado</th>
              <th scope="col">Captura</th>
              <th scope="col">Completada</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => {
              return (
                <RoadmapRow
                  key={zone.id}
                  onToggle={toggleZoneProgress}
                  progress={
                    zoneProgress[zone.id] ?? {
                      visited: false,
                      captured: false,
                      completed: false,
                    }
                  }
                  zone={zone}
                />
              )
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  )
}
