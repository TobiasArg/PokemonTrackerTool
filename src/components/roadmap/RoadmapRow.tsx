import clsx from 'clsx'

import type { RoadmapZone, ZoneProgress } from '../../hooks/useNuzlockeStore'

type RoadmapRowProps = {
  zone: RoadmapZone
  progress: ZoneProgress
  onToggle: (zoneId: string, field: keyof ZoneProgress) => void
  isHighlighted?: boolean
  isFocused?: boolean
}

export const RoadmapRow = ({
  zone,
  progress,
  onToggle,
  isHighlighted = false,
  isFocused = false,
}: RoadmapRowProps) => {
  const isLeader = zone.checkpoint === 'leader'
  const isDone = isLeader
    ? progress.completed
    : progress.captured && progress.completed
  const isPartial = !isDone && (progress.captured || progress.completed)

  return (
    <li
      className={clsx('roadmap-row', {
        'roadmap-row--leader': isLeader,
        'roadmap-row--done': isDone,
        'roadmap-row--partial': isPartial,
        'roadmap-row--updated': isHighlighted,
        'roadmap-row--focused': isFocused,
      })}
      id={`roadmap-zone-${zone.id}`}
    >
      <span aria-hidden className="roadmap-row__timeline-dot" />

      <div className="roadmap-row__body">
        <div className="roadmap-row__top">
          <p className="roadmap-zone__name">{zone.name}</p>
          <span className="level-cap-pill">Lvl cap {zone.levelCap}</span>
        </div>

        <div className={`roadmap-row__checks ${isLeader ? 'roadmap-row__checks--single' : ''}`}>
          {isLeader ? (
            <label className="roadmap-check" htmlFor={`${zone.id}-completed`}>
              <span className="roadmap-check__label">Superado</span>
              <input
                checked={progress.completed}
                id={`${zone.id}-completed`}
                onChange={() => onToggle(zone.id, 'completed')}
                type="checkbox"
              />
              <span className="sr-only">Marcar superado a {zone.name}</span>
            </label>
          ) : (
            <>
              <label className="roadmap-check" htmlFor={`${zone.id}-captured`}>
                <span className="roadmap-check__label">Captura</span>
                <input
                  checked={progress.captured}
                  id={`${zone.id}-captured`}
                  onChange={() => onToggle(zone.id, 'captured')}
                  type="checkbox"
                />
                <span className="sr-only">Marcar captura en {zone.name}</span>
              </label>

              <label className="roadmap-check" htmlFor={`${zone.id}-completed`}>
                <span className="roadmap-check__label">Completada</span>
                <input
                  checked={progress.completed}
                  id={`${zone.id}-completed`}
                  onChange={() => onToggle(zone.id, 'completed')}
                  type="checkbox"
                />
                <span className="sr-only">Marcar completada en {zone.name}</span>
              </label>
            </>
          )}
        </div>
      </div>
    </li>
  )
}
