import type { RoadmapZone, ZoneProgress } from '../../hooks/useNuzlockeStore'

type RoadmapRowProps = {
  zone: RoadmapZone
  progress: ZoneProgress
  onToggle: (zoneId: string, field: keyof ZoneProgress) => void
}

export const RoadmapRow = ({ zone, progress, onToggle }: RoadmapRowProps) => {
  return (
    <tr>
      <td>
        <div className="roadmap-zone">
          <p className="roadmap-zone__name">{zone.name}</p>
          <span className="level-cap-pill">Cap {zone.levelCap}</span>
        </div>
      </td>
      <td>
        <label className="roadmap-check" htmlFor={`${zone.id}-visited`}>
          <input
            checked={progress.visited}
            id={`${zone.id}-visited`}
            onChange={() => onToggle(zone.id, 'visited')}
            type="checkbox"
          />
          <span className="sr-only">Marcar visitado en {zone.name}</span>
        </label>
      </td>
      <td>
        <label className="roadmap-check" htmlFor={`${zone.id}-captured`}>
          <input
            checked={progress.captured}
            id={`${zone.id}-captured`}
            onChange={() => onToggle(zone.id, 'captured')}
            type="checkbox"
          />
          <span className="sr-only">Marcar captura en {zone.name}</span>
        </label>
      </td>
      <td>
        <label className="roadmap-check" htmlFor={`${zone.id}-completed`}>
          <input
            checked={progress.completed}
            id={`${zone.id}-completed`}
            onChange={() => onToggle(zone.id, 'completed')}
            type="checkbox"
          />
          <span className="sr-only">Marcar completada en {zone.name}</span>
        </label>
      </td>
    </tr>
  )
}
