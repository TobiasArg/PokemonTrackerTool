import { useShallow } from 'zustand/react/shallow'

import { useNuzlockeStore } from './useNuzlockeStore'

export const useBadges = () => {
  const { badges, toggleBadge } = useNuzlockeStore(
    useShallow((state) => ({
      badges: state.badges,
      toggleBadge: state.toggleBadge,
    })),
  )

  const earnedCount = badges.reduce((count, badge) => {
    return badge.earned ? count + 1 : count
  }, 0)

  return {
    badges,
    earnedCount,
    totalBadges: badges.length,
    toggleBadge,
  }
}
