import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'

import { useNuzlockeStore } from './useNuzlockeStore'

export const useRevives = () => {
  const {
    reviveStock,
    reviveUsage,
    setReviveStock,
    addReviveUsage,
    updateReviveUsageName,
    toggleReviveUsage,
    removeReviveUsage,
  } = useNuzlockeStore(
    useShallow((state) => ({
      reviveStock: state.reviveStock,
      reviveUsage: state.reviveUsage,
      setReviveStock: state.setReviveStock,
      addReviveUsage: state.addReviveUsage,
      updateReviveUsageName: state.updateReviveUsageName,
      toggleReviveUsage: state.toggleReviveUsage,
      removeReviveUsage: state.removeReviveUsage,
    })),
  )

  const usedCount = useMemo(() => {
    return reviveUsage.reduce((accumulator, item) => {
      if (!item.used) {
        return accumulator
      }

      return accumulator + 1
    }, 0)
  }, [reviveUsage])

  const remainingRevives = Math.max(reviveStock - usedCount, 0)

  return {
    reviveStock,
    reviveUsage,
    usedCount,
    remainingRevives,
    setReviveStock,
    addReviveUsage,
    updateReviveUsageName,
    toggleReviveUsage,
    removeReviveUsage,
  }
}
