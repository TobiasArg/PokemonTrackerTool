import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { ROADMAP_ZONES, useNuzlockeStore } from './useNuzlockeStore'

export const useRoadmap = () => {
  const { zoneProgress, toggleZoneProgress } = useNuzlockeStore(
    useShallow((state) => ({
      zoneProgress: state.zoneProgress,
      toggleZoneProgress: state.toggleZoneProgress,
    })),
  )

  const summary = useMemo(() => {
    const totalZones = ROADMAP_ZONES.length

    const visited = ROADMAP_ZONES.reduce((count, zone) => {
      return zoneProgress[zone.id]?.visited ? count + 1 : count
    }, 0)

    const captured = ROADMAP_ZONES.reduce((count, zone) => {
      return zoneProgress[zone.id]?.captured ? count + 1 : count
    }, 0)

    const completed = ROADMAP_ZONES.reduce((count, zone) => {
      return zoneProgress[zone.id]?.completed ? count + 1 : count
    }, 0)

    return {
      totalZones,
      visited,
      captured,
      completed,
    }
  }, [zoneProgress])

  return {
    zones: ROADMAP_ZONES,
    zoneProgress,
    toggleZoneProgress,
    summary,
  }
}
