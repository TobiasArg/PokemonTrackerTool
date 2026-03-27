import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { Panel } from '../atomic/Panel'
import { useRoadmap } from '../../hooks/useRoadmap'
import { ActionButton } from '../atomic/ActionButton'
import { RoadmapRow } from './RoadmapRow'

type CaptureFilter = 'all' | 'captured' | 'uncaptured'

const EMPTY_PROGRESS = {
  captured: false,
  completed: false,
}

export const RoadmapModule = () => {
  const { zones, zoneProgress, toggleZoneProgress, summary } = useRoadmap()
  const [captureFilter, setCaptureFilter] = useState<CaptureFilter>('all')
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null)
  const [focusedZoneId, setFocusedZoneId] = useState<string | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const highlightTimeoutRef = useRef<number | null>(null)
  const focusTimeoutRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (feedbackTimeoutRef.current) {
        window.clearTimeout(feedbackTimeoutRef.current)
      }
      if (highlightTimeoutRef.current) {
        window.clearTimeout(highlightTimeoutRef.current)
      }
      if (focusTimeoutRef.current) {
        window.clearTimeout(focusTimeoutRef.current)
      }
    }
  }, [])

  const zonesById = useMemo(() => {
    return new Map(zones.map((zone) => [zone.id, zone]))
  }, [zones])

  const filteredZones = useMemo(() => {
    if (captureFilter === 'all') {
      return zones
    }

    return zones.filter((zone) => {
      if (zone.checkpoint === 'leader') {
        return false
      }

      const progress = zoneProgress[zone.id] ?? EMPTY_PROGRESS
      return captureFilter === 'captured' ? progress.captured : !progress.captured
    })
  }, [captureFilter, zoneProgress, zones])

  const nextPendingZone = useMemo(() => {
    return filteredZones.find((zone) => {
      const progress = zoneProgress[zone.id] ?? EMPTY_PROGRESS
      if (zone.checkpoint === 'leader') {
        return !progress.completed
      }

      return !progress.captured || !progress.completed
    })
  }, [filteredZones, zoneProgress])

  const buildFeedbackMessage = useCallback(
    (zoneId: string, field: 'captured' | 'completed', nextValue: boolean) => {
      const zone = zonesById.get(zoneId)
      if (!zone) {
        return
      }

      if (zone.checkpoint === 'leader') {
        setFeedbackMessage(
          nextValue
            ? `${zone.name}: líder superado.`
            : `${zone.name}: líder marcado como pendiente.`,
        )
        return
      }

      if (field === 'captured') {
        setFeedbackMessage(
          nextValue
            ? `${zone.name}: captura registrada.`
            : `${zone.name}: captura desmarcada.`,
        )
        return
      }

      setFeedbackMessage(
        nextValue
          ? `${zone.name}: zona completada.`
          : `${zone.name}: zona marcada como pendiente.`,
      )
    },
    [zonesById],
  )

  const scheduleFeedbackClear = useCallback(() => {
    if (feedbackTimeoutRef.current) {
      window.clearTimeout(feedbackTimeoutRef.current)
    }
    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedbackMessage(null)
    }, 2100)
  }, [])

  const scheduleHighlightClear = useCallback(() => {
    if (highlightTimeoutRef.current) {
      window.clearTimeout(highlightTimeoutRef.current)
    }
    highlightTimeoutRef.current = window.setTimeout(() => {
      setHighlightedZoneId(null)
    }, 420)
  }, [])

  const scheduleFocusClear = useCallback(() => {
    if (focusTimeoutRef.current) {
      window.clearTimeout(focusTimeoutRef.current)
    }
    focusTimeoutRef.current = window.setTimeout(() => {
      setFocusedZoneId(null)
    }, 1400)
  }, [])

  const handleToggle = useCallback(
    (zoneId: string, field: 'captured' | 'completed') => {
      const progress = zoneProgress[zoneId] ?? EMPTY_PROGRESS
      const nextValue = !progress[field]

      toggleZoneProgress(zoneId, field)
      setHighlightedZoneId(zoneId)
      buildFeedbackMessage(zoneId, field, nextValue)
      scheduleFeedbackClear()
      scheduleHighlightClear()
    },
    [
      buildFeedbackMessage,
      scheduleFeedbackClear,
      scheduleHighlightClear,
      toggleZoneProgress,
      zoneProgress,
    ],
  )

  const jumpToNextPending = useCallback(() => {
    if (!nextPendingZone) {
      setFeedbackMessage('No hay checkpoints pendientes en el filtro actual.')
      scheduleFeedbackClear()
      return
    }

    const target = document.getElementById(`roadmap-zone-${nextPendingZone.id}`)
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setFocusedZoneId(nextPendingZone.id)
      scheduleFocusClear()
    }

    setFeedbackMessage(`Siguiente pendiente: ${nextPendingZone.name}.`)
    scheduleFeedbackClear()
  }, [nextPendingZone, scheduleFeedbackClear, scheduleFocusClear])

  return (
    <Panel
      className="roadmap-panel"
      description="Checkpoints de captura/completado por zona, y superado para líderes."
      title="Módulo Roadmap"
    >
      <div className="roadmap-sticky-head">
        <div className="roadmap-sticky-head__top">
          <div className="roadmap-sticky-head__text">
            <p className="roadmap-sticky-head__label">Run progress</p>
            <p className="roadmap-sticky-head__value">
              {summary.doneChecks}/{summary.totalChecks} checks · {summary.completionRate}%
            </p>
          </div>
          <ActionButton
            disabled={!nextPendingZone}
            onClick={jumpToNextPending}
            variant="secondary"
          >
            Siguiente pendiente
          </ActionButton>
        </div>

        <div
          aria-label={`Progreso total ${summary.completionRate}%`}
          className="roadmap-progress"
          role="progressbar"
          aria-valuemax={100}
          aria-valuemin={0}
          aria-valuenow={summary.completionRate}
        >
          <span
            className="roadmap-progress__fill"
            style={{ width: `${summary.completionRate}%` }}
          />
        </div>

        <div
          aria-label="Filtro por captura"
          className="roadmap-capture-filters"
          role="group"
        >
          <button
            className={`roadmap-capture-filters__button ${
              captureFilter === 'all' ? 'roadmap-capture-filters__button--active' : ''
            }`}
            aria-pressed={captureFilter === 'all'}
            onClick={() => setCaptureFilter('all')}
            type="button"
          >
            Todo
          </button>
          <button
            className={`roadmap-capture-filters__button ${
              captureFilter === 'captured' ? 'roadmap-capture-filters__button--active' : ''
            }`}
            aria-pressed={captureFilter === 'captured'}
            onClick={() => setCaptureFilter('captured')}
            type="button"
          >
            Con captura
          </button>
          <button
            className={`roadmap-capture-filters__button ${
              captureFilter === 'uncaptured'
                ? 'roadmap-capture-filters__button--active'
                : ''
            }`}
            aria-pressed={captureFilter === 'uncaptured'}
            onClick={() => setCaptureFilter('uncaptured')}
            type="button"
          >
            Sin captura
          </button>
        </div>

        <p aria-live="polite" className="roadmap-live-feedback" role="status">
          {feedbackMessage ?? 'Marca avances y usa “Siguiente pendiente” para mantener el ritmo.'}
        </p>
      </div>

      <div className="roadmap-summary">
        <article className="summary-item">
          <p className="summary-item__label">Checkpoints</p>
          <p className="summary-item__value">{summary.totalEntries}</p>
        </article>
        <article className="summary-item">
          <p className="summary-item__label">Capturas</p>
          <p className="summary-item__value">
            {summary.captured}/{summary.totalCaptureZones}
          </p>
        </article>
        <article className="summary-item">
          <p className="summary-item__label">Sin captura</p>
          <p className="summary-item__value">{summary.uncaptured}</p>
        </article>
        <article className="summary-item">
          <p className="summary-item__label">Líderes</p>
          <p className="summary-item__value">
            {summary.leadersDefeated}/{summary.totalLeaders}
          </p>
        </article>
      </div>

      {!filteredZones.length ? (
        <p className="empty-state">No hay zonas para el filtro seleccionado.</p>
      ) : (
        <ul className="roadmap-list">
          {filteredZones.map((zone) => {
            const progress = zoneProgress[zone.id] ?? EMPTY_PROGRESS

            return (
              <RoadmapRow
                key={zone.id}
                isFocused={focusedZoneId === zone.id}
                isHighlighted={highlightedZoneId === zone.id}
                onToggle={handleToggle}
                progress={progress}
                zone={zone}
              />
            )
          })}
        </ul>
      )}
    </Panel>
  )
}
