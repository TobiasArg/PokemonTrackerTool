import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import {
  ROADMAP_ZONES,
  canZoneCapture,
  isGymLeaderZone,
  useNuzlockeStore,
} from './useNuzlockeStore'

export const useRoadmap = () => {
  const { zoneProgress, toggleZoneProgress } = useNuzlockeStore(
    useShallow((state) => ({
      zoneProgress: state.zoneProgress,
      toggleZoneProgress: state.toggleZoneProgress,
    })),
  )

  const summary = useMemo(() => {
    const totalEntries = ROADMAP_ZONES.length
    const totalLeaders = ROADMAP_ZONES.filter((zone) => isGymLeaderZone(zone.id)).length
    const totalCaptureZones = ROADMAP_ZONES.filter((zone) => canZoneCapture(zone.id)).length

    const captured = ROADMAP_ZONES.reduce((count, zone) => {
      if (!canZoneCapture(zone.id)) {
        return count
      }

      return zoneProgress[zone.id]?.captured ? count + 1 : count
    }, 0)

    const completedZones = ROADMAP_ZONES.reduce((count, zone) => {
      if (isGymLeaderZone(zone.id)) {
        return count
      }

      return zoneProgress[zone.id]?.completed ? count + 1 : count
    }, 0)

    const leadersDefeated = ROADMAP_ZONES.reduce((count, zone) => {
      if (!isGymLeaderZone(zone.id)) {
        return count
      }

      return zoneProgress[zone.id]?.completed ? count + 1 : count
    }, 0)

    const totalChecks = totalCaptureZones * 2 + totalLeaders
    const doneChecks = captured + completedZones + leadersDefeated
    const completionRate = totalChecks
      ? Math.round((doneChecks / totalChecks) * 100)
      : 0

    return {
      totalEntries,
      totalCaptureZones,
      totalLeaders,
      captured,
      uncaptured: totalCaptureZones - captured,
      completedZones,
      leadersDefeated,
      totalChecks,
      doneChecks,
      completionRate,
    }
  }, [zoneProgress])

  return {
    zones: ROADMAP_ZONES,
    zoneProgress,
    toggleZoneProgress,
    summary,
  }
}
