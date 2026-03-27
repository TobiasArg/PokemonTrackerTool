import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { ROADMAP_ZONES, canZoneCapture, isGymLeaderZone, useNuzlockeStore } from './useNuzlockeStore'

export const useTrackerTelemetry = () => {
  const { chosenPokemons, fallenPokemons, zoneProgress, badges } = useNuzlockeStore(
    useShallow((state) => ({
      chosenPokemons: state.chosenPokemons,
      fallenPokemons: state.fallenPokemons,
      zoneProgress: state.zoneProgress,
      badges: state.badges,
    })),
  )

  return useMemo(() => {
    const totalCaptureZones = ROADMAP_ZONES.filter((zone) => canZoneCapture(zone.id)).length
    const totalLeaders = ROADMAP_ZONES.filter((zone) => isGymLeaderZone(zone.id)).length

    const capturedZones = ROADMAP_ZONES.reduce((count, zone) => {
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
    const doneChecks = capturedZones + completedZones + leadersDefeated
    const completionRate = totalChecks ? Math.round((doneChecks / totalChecks) * 100) : 0

    const badgesEarned = badges.reduce((count, badge) => {
      return badge.earned ? count + 1 : count
    }, 0)

    return {
      chosenCount: chosenPokemons.length,
      fallenCount: fallenPokemons.length,
      capturedZones,
      totalCaptureZones,
      leadersDefeated,
      totalLeaders,
      badgesEarned,
      totalBadges: badges.length,
      doneChecks,
      totalChecks,
      completionRate,
    }
  }, [badges, chosenPokemons.length, fallenPokemons.length, zoneProgress])
}
