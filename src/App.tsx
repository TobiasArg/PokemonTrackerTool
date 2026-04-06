import { useEffect, useRef, type ReactNode } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { MobileTabNav } from './components/layout/MobileTabNav'
import { PageHeader } from './components/layout/PageHeader'
import { useAuth } from './hooks/useAuth'
import { useNuzlockeStore } from './hooks/useNuzlockeStore'
import { useRuns } from './hooks/useRuns'
import { isSupabaseConfigured, supabase } from './lib/supabase'
import { AuthPage } from './pages/AuthPage'
import { BadgesPage } from './pages/BadgesPage'
import { PokemonPage } from './pages/PokemonPage'
import { RoadmapPage } from './pages/RoadmapPage'
import { RunsPage } from './pages/RunsPage'

const RequireActiveRun = ({ activeRunId, children }: { activeRunId: string | null; children: ReactNode }) => {
  if (!activeRunId) {
    return <Navigate replace to="/runs" />
  }

  return <>{children}</>
}

function App() {
  const location = useLocation()
  const { authStatus, isBootstrapped, bootstrap } = useAuth()
  const {
    activeRunId,
    persistActiveRunSnapshot,
    dataRevision,
    lastPersistedRevision,
    isHydratingRunData,
    syncStatus,
  } = useRuns()

  const hasBootstrappedRef = useRef(false)

  useEffect(() => {
    if (hasBootstrappedRef.current) {
      return
    }

    hasBootstrappedRef.current = true
    void bootstrap()
  }, [bootstrap])

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      return
    }

    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        useNuzlockeStore.getState().applySignedOutState()
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        void useNuzlockeStore.getState().bootstrap()
      }
    })

    return () => {
      data.subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (authStatus !== 'authenticated') {
      return
    }

    if (!activeRunId || isHydratingRunData) {
      return
    }

    if (dataRevision <= lastPersistedRevision) {
      return
    }

    if (syncStatus === 'saving') {
      return
    }

    // Coalesce writes for normal edits and back off after errors.
    const persistDelay = syncStatus === 'error' ? 2500 : 500

    const timeoutId = window.setTimeout(() => {
      void persistActiveRunSnapshot()
    }, persistDelay)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    activeRunId,
    authStatus,
    dataRevision,
    isHydratingRunData,
    lastPersistedRevision,
    persistActiveRunSnapshot,
    syncStatus,
  ])

  if (!isBootstrapped || authStatus === 'loading') {
    return (
      <div className="app-loading">
        <p className="app-loading__label">Sincronizando sistema...</p>
      </div>
    )
  }

  const showHeader = authStatus === 'authenticated'
  const isTrackerPath = ['/pokemons', '/roadmap', '/medallas'].some((path) =>
    location.pathname.startsWith(path),
  )
  const showNav =
    authStatus === 'authenticated' &&
    Boolean(activeRunId) &&
    isTrackerPath

  return (
    <div className="app-layout">
      {showHeader ? (
        <div className="page-shell page-shell--header">
          <PageHeader />
        </div>
      ) : null}

      <main className="page-shell page-shell--content">
        <Routes>
          {authStatus !== 'authenticated' ? (
            <>
              <Route element={<Navigate replace to="/auth" />} path="/" />
              <Route element={<AuthPage />} path="/auth" />
              <Route element={<Navigate replace to="/auth" />} path="*" />
            </>
          ) : (
            <>
              <Route
                element={
                  activeRunId ? <Navigate replace to="/pokemons" /> : <Navigate replace to="/runs" />
                }
                path="/"
              />
              <Route element={<RunsPage />} path="/runs" />
              <Route
                element={
                  <RequireActiveRun activeRunId={activeRunId}>
                    <PokemonPage />
                  </RequireActiveRun>
                }
                path="/pokemons"
              />
              <Route
                element={
                  <RequireActiveRun activeRunId={activeRunId}>
                    <RoadmapPage />
                  </RequireActiveRun>
                }
                path="/roadmap"
              />
              <Route
                element={
                  <RequireActiveRun activeRunId={activeRunId}>
                    <BadgesPage />
                  </RequireActiveRun>
                }
                path="/medallas"
              />
              <Route element={<Navigate replace to="/" />} path="/auth" />
              <Route element={<Navigate replace to="/" />} path="*" />
            </>
          )}
        </Routes>
      </main>

      {showNav ? <MobileTabNav /> : null}
    </div>
  )
}

export default App
