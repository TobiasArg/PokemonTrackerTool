import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { ActionButton } from '../components/atomic/ActionButton'
import { Panel } from '../components/atomic/Panel'
import { TextField } from '../components/atomic/TextField'
import { useRuns } from '../hooks/useRuns'

export const RunsPage = () => {
  const navigate = useNavigate()
  const {
    runs,
    activeRunId,
    createRun,
    renameRun,
    archiveRun,
    deleteRun,
    setActiveRun,
    loadRuns,
  } = useRuns()

  const [newRunName, setNewRunName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    void (async () => {
      try {
        await loadRuns()
      } catch (loadError) {
        setError(
          loadError instanceof Error ? loadError.message : 'No se pudieron cargar las runs.',
        )
      }
    })()
  }, [loadRuns])

  const sortedRuns = useMemo(() => {
    return [...runs].sort((first, second) => {
      return first.createdAt.localeCompare(second.createdAt)
    })
  }, [runs])

  const handleCreateRun = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsCreating(true)

    try {
      const run = await createRun(newRunName || 'Nueva run')
      if (!run) {
        setError('No se pudo crear la run.')
        setIsCreating(false)
        return
      }

      setNewRunName('')
      await setActiveRun(run.id)
      navigate('/pokemons')
    } catch (createError) {
      setError(
        createError instanceof Error ? createError.message : 'No se pudo crear la run.',
      )
    } finally {
      setIsCreating(false)
    }
  }

  const handleSelectRun = async (runId: string) => {
    try {
      await setActiveRun(runId)
      navigate('/pokemons')
    } catch (selectError) {
      setError(
        selectError instanceof Error
          ? selectError.message
          : 'No se pudo abrir la run seleccionada.',
      )
    }
  }

  const handleRenameRun = async (runId: string, currentName: string) => {
    const nextName = window.prompt('Nuevo nombre para la run:', currentName)
    if (!nextName || nextName.trim() === currentName) {
      return
    }

    try {
      await renameRun(runId, nextName)
    } catch (renameError) {
      setError(
        renameError instanceof Error
          ? renameError.message
          : 'No se pudo renombrar la run.',
      )
    }
  }

  const handleArchiveRun = async (runId: string, isArchived: boolean) => {
    try {
      await archiveRun(runId, !isArchived)
    } catch (archiveError) {
      setError(
        archiveError instanceof Error
          ? archiveError.message
          : 'No se pudo actualizar el estado de archivo.',
      )
    }
  }

  const handleDeleteRun = async (runId: string, runName: string) => {
    const confirmed = window.confirm(`¿Eliminar definitivamente la run "${runName}"?`)
    if (!confirmed) {
      return
    }

    try {
      await deleteRun(runId)
    } catch (deleteError) {
      setError(
        deleteError instanceof Error ? deleteError.message : 'No se pudo eliminar la run.',
      )
    }
  }

  return (
    <section className="route-page runs-page">
      <Panel
        title="Mis Runs"
        description="Crea y administra tus runs en la nube."
      >
        <form className="runs-create-form" onSubmit={handleCreateRun}>
          <TextField
            id="run-name"
            label="Nombre de la nueva run"
            onChange={(event) => setNewRunName(event.target.value)}
            placeholder="Ej: B2W2 Hardcore"
            value={newRunName}
          />
          <ActionButton disabled={isCreating} type="submit" variant="secondary">
            {isCreating ? 'Creando...' : 'Crear run'}
          </ActionButton>
        </form>

        {error ? <p className="modal-form__error">{error}</p> : null}

        {!sortedRuns.length ? (
          <p className="empty-state">No tienes runs todavía.</p>
        ) : (
          <div className="runs-list">
            {sortedRuns.map((run) => {
              const isActive = run.id === activeRunId

              return (
                <article className="runs-item" key={run.id}>
                  <div className="runs-item__meta">
                    <p className="runs-item__title">
                      {run.name} {isActive ? '· ACTIVA' : ''}
                    </p>
                    <p className="runs-item__subtitle">
                      {run.isArchived ? 'Archivada' : 'Activa'} · {run.gameKey.toUpperCase()}
                    </p>
                  </div>

                  <div className="runs-item__actions">
                    <ActionButton
                      onClick={() => handleSelectRun(run.id)}
                      variant="secondary"
                    >
                      Abrir
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleRenameRun(run.id, run.name)}
                      variant="ghost"
                    >
                      Renombrar
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleArchiveRun(run.id, run.isArchived)}
                      variant="ghost"
                    >
                      {run.isArchived ? 'Desarchivar' : 'Archivar'}
                    </ActionButton>
                    <ActionButton
                      onClick={() => handleDeleteRun(run.id, run.name)}
                      variant="danger"
                    >
                      Eliminar
                    </ActionButton>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </Panel>
    </section>
  )
}
