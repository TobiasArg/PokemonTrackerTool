import { type FormEvent, useEffect, useState } from 'react'

import { useChosenPokemon } from '../../hooks/useChosenPokemon'
import { useRoadmap } from '../../hooks/useRoadmap'
import type { AddChosenPokemonResult } from '../../hooks/useNuzlockeStore'
import { ActionButton } from '../atomic/ActionButton'
import { EmptyState } from '../atomic/EmptyState'
import { Modal } from '../atomic/Modal'
import { Panel } from '../atomic/Panel'
import { TextField } from '../atomic/TextField'
import { ChosenPokemonCard } from './ChosenPokemonCard'

type ChosenPokemonModuleProps = {
  compact?: boolean
}

const CHOSEN_REGISTER_ERRORS: Record<Exclude<AddChosenPokemonResult, 'added'>, string> = {
  empty: 'Ingresa un nombre válido.',
  duplicate: 'Ese Pokémon ya está registrado en el equipo.',
  fallen: 'Ese Pokémon ya figura como caído y no puede volver al equipo.',
  'limit-reached': 'No hay cupos disponibles según tus capturas.',
}

export const ChosenPokemonModule = ({ compact = false }: ChosenPokemonModuleProps) => {
  const { summary } = useRoadmap()
  const {
    chosenPokemons,
    addChosenPokemon,
    removeChosenPokemon,
    trimChosenPokemons,
  } = useChosenPokemon()

  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [draftPokemonName, setDraftPokemonName] = useState('')
  const [registerError, setRegisterError] = useState<string | null>(null)

  const captureLimit = summary.captured
  const selectedCount = chosenPokemons.length
  const remainingSlots = Math.max(captureLimit - selectedCount, 0)
  const canRegister = captureLimit > 0 && selectedCount < captureLimit

  useEffect(() => {
    trimChosenPokemons(captureLimit)
  }, [captureLimit, trimChosenPokemons])

  const openRegisterModal = () => {
    setDraftPokemonName('')
    setRegisterError(null)
    setIsRegisterOpen(true)
  }

  const closeRegisterModal = () => {
    setDraftPokemonName('')
    setRegisterError(null)
    setIsRegisterOpen(false)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!canRegister) {
      setRegisterError(CHOSEN_REGISTER_ERRORS['limit-reached'])
      return
    }

    const result = addChosenPokemon(draftPokemonName)
    if (result === 'added') {
      closeRegisterModal()
      return
    }

    setRegisterError(CHOSEN_REGISTER_ERRORS[result])
  }

  return (
    <>
      <Panel
        hideHeader={compact}
        className="chosen-panel"
        description={
          compact ? undefined : 'Registra aquí los Pokémon capturados que elegiste como usables.'
        }
        title={compact ? 'Equipo usable' : 'Módulo de Pokémon Elegidos'}
      >
        <div className="chosen-summary">
          <article className="metric-card chosen-summary__card">
            <p className="metric-card__label">Capturas marcadas</p>
            <p className="metric-card__value">{captureLimit}</p>
          </article>
          <article className="metric-card chosen-summary__card">
            <p className="metric-card__label">Elegidos</p>
            <p className="metric-card__value">{selectedCount}</p>
          </article>
          <article className="metric-card chosen-summary__card">
            <p className="metric-card__label">Cupos restantes</p>
            <p className="metric-card__value">{remainingSlots}</p>
          </article>
        </div>

        <div className="module-toolbar">
          <div className="module-toolbar__meta">
            <p className="module-toolbar__kicker">Control de Equipo</p>
            <p className="module-toolbar__info">{selectedCount}/{captureLimit} slots en uso</p>
          </div>
          <ActionButton
            disabled={!canRegister}
            onClick={openRegisterModal}
            variant="secondary"
          >
            Registrar elegido
          </ActionButton>
        </div>

        {!captureLimit ? (
          <EmptyState
            hint="Marca al menos una captura en Roadmap para habilitar cupos de equipo."
            title="SIN CUPOS DISPONIBLES"
          />
        ) : !chosenPokemons.length ? (
          <EmptyState
            hint="Usa “Registrar elegido” para cargar tu primer miembro del team."
            title="EQUIPO VACÍO"
          />
        ) : (
          <div className="chosen-grid">
            {chosenPokemons.map((pokemon) => {
              return (
                <ChosenPokemonCard
                  key={pokemon.id}
                  onRemove={removeChosenPokemon}
                  pokemon={pokemon}
                />
              )
            })}
          </div>
        )}
      </Panel>

      <Modal
        description={`Puedes registrar hasta ${captureLimit} Pokémon según tus capturas.`}
        isOpen={isRegisterOpen}
        onClose={closeRegisterModal}
        title="Registrar Pokémon elegido"
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <TextField
            id="chosen-modal-name"
            label="Nombre del Pokémon"
            onChange={(event) => {
              setDraftPokemonName(event.target.value)
              if (registerError) {
                setRegisterError(null)
              }
            }}
            placeholder="Ej: Lucario"
            required
            value={draftPokemonName}
          />

          {registerError ? <p className="modal-form__error">{registerError}</p> : null}

          <div className="modal-form__actions">
            <ActionButton onClick={closeRegisterModal} type="button" variant="ghost">
              Cancelar
            </ActionButton>
            <ActionButton
              disabled={!canRegister || !draftPokemonName.trim()}
              type="submit"
              variant="secondary"
            >
              Guardar
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
