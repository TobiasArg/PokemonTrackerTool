import { useShallow } from 'zustand/react/shallow'

import { useNuzlockeStore } from './useNuzlockeStore'

export const useRuns = () => {
  return useNuzlockeStore(
    useShallow((state) => ({
      runs: state.runs,
      activeRunId: state.activeRunId,
      syncStatus: state.syncStatus,
      syncError: state.syncError,
      lastSyncedAt: state.lastSyncedAt,
      loadRuns: state.loadRuns,
      createRun: state.createRun,
      renameRun: state.renameRun,
      archiveRun: state.archiveRun,
      deleteRun: state.deleteRun,
      setActiveRun: state.setActiveRun,
      clearSyncError: state.clearSyncError,
      retrySync: state.retrySync,
      persistActiveRunSnapshot: state.persistActiveRunSnapshot,
      dataRevision: state.dataRevision,
      lastPersistedRevision: state.lastPersistedRevision,
      isHydratingRunData: state.isHydratingRunData,
      session: state.session,
    })),
  )
}
