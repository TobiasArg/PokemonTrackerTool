import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'

import { useAuth } from '../../hooks/useAuth'
import { useRuns } from '../../hooks/useRuns'
import { ActionButton } from '../atomic/ActionButton'

const SYNC_LABELS: Record<string, string> = {
  idle: 'Sincronizado',
  loading: 'Cargando run...',
  saving: 'Guardando cambios...',
  error: 'Error de sync',
}

export const PageHeader = () => {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { runs, activeRunId, syncStatus, syncError } = useRuns()

  const activeRun = useMemo(() => {
    return runs.find((run) => run.id === activeRunId) ?? null
  }, [activeRunId, runs])

  const handleSignOut = async () => {
    await signOut()
    navigate('/auth')
  }

  return (
    <header className="page-header">
      <p className="page-header__eyebrow">Pokémon Blanco y Negro 2</p>
      <h1 className="page-header__title">Nuzlocke Progress Tracker</h1>
      <p className="page-header__description">
        {activeRun
          ? `Run activa: ${activeRun.name} · ${SYNC_LABELS[syncStatus] ?? syncStatus}`
          : 'Selecciona una run para empezar.'}
      </p>
      {syncError ? <p className="page-header__sync-error">{syncError}</p> : null}

      <div className="page-header__actions">
        <ActionButton onClick={() => navigate('/runs')} variant="ghost">
          Mis runs
        </ActionButton>
        <ActionButton onClick={handleSignOut} variant="secondary">
          Cerrar sesión
        </ActionButton>
      </div>
    </header>
  )
}
