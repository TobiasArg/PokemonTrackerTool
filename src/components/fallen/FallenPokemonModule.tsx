import { type FormEvent, useState } from 'react'

import { useFallenPokemon } from '../../hooks/useFallenPokemon'
import { ActionButton } from '../atomic/ActionButton'
import { EmptyState } from '../atomic/EmptyState'
import { Modal } from '../atomic/Modal'
import { Panel } from '../atomic/Panel'
import { TextField } from '../atomic/TextField'
import { FallenPokemonCard } from './FallenPokemonCard'

type FallenFormState = {
  name: string
  level: string
  captureZone: string
  cause: string
}

const INITIAL_FORM_STATE: FallenFormState = {
  name: '',
  level: '',
  captureZone: '',
  cause: '',
}

const INVALID_FALLEN_ERROR =
  'Completa nombre, nivel, ruta de captura y causa con datos válidos.'

type FallenPokemonModuleProps = {
  compact?: boolean
}

export const FallenPokemonModule = ({ compact = false }: FallenPokemonModuleProps) => {
  const { fallenPokemons, addFallenPokemon, removeFallenPokemon } = useFallenPokemon()
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [formState, setFormState] = useState<FallenFormState>(INITIAL_FORM_STATE)
  const [registerError, setRegisterError] = useState<string | null>(null)

  const updateFormField = (field: keyof FallenFormState, value: string) => {
    setFormState((state) => ({ ...state, [field]: value }))
    if (registerError) {
      setRegisterError(null)
    }
  }

  const openRegisterModal = () => {
    setFormState(INITIAL_FORM_STATE)
    setRegisterError(null)
    setIsRegisterOpen(true)
  }

  const closeRegisterModal = () => {
    setIsRegisterOpen(false)
    setFormState(INITIAL_FORM_STATE)
    setRegisterError(null)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const result = addFallenPokemon({
      name: formState.name,
      level: Number.parseInt(formState.level, 10),
      captureZone: formState.captureZone,
      cause: formState.cause,
    })

    if (result === 'added') {
      closeRegisterModal()
      return
    }

    setRegisterError(INVALID_FALLEN_ERROR)
  }

  return (
    <>
      <Panel
        hideHeader={compact}
        description={compact ? undefined : 'Registra los Pokémon muertos con datos de la run.'}
        title={compact ? 'Pokémon caídos' : 'Módulo de Pokémon Caídos'}
      >
        <div className="module-toolbar">
          <div className="module-toolbar__meta">
            <p className="module-toolbar__kicker">Bitácora de Bajas</p>
            <p className="module-toolbar__info">{fallenPokemons.length} registros de caída</p>
          </div>
          <ActionButton onClick={openRegisterModal} variant="secondary">
            Registrar caída
          </ActionButton>
        </div>

        {!fallenPokemons.length ? (
          <EmptyState
            hint="Cuando ocurra una baja, regístrala para mantener la run consistente."
            title="SIN BAJAS REGISTRADAS"
          />
        ) : (
          <div className="fallen-grid">
            {fallenPokemons.map((pokemon) => {
              return (
                <FallenPokemonCard
                  key={pokemon.id}
                  onRemove={removeFallenPokemon}
                  pokemon={pokemon}
                />
              )
            })}
          </div>
        )}
      </Panel>

      <Modal
        description="Añade un Pokémon caído y guarda el detalle de su pérdida."
        isOpen={isRegisterOpen}
        onClose={closeRegisterModal}
        title="Registrar Pokémon caído"
      >
        <form className="modal-form" onSubmit={handleSubmit}>
          <TextField
            id="fallen-modal-name"
            label="Nombre"
            onChange={(event) => updateFormField('name', event.target.value)}
            placeholder="Ej: Arcanine"
            required
            value={formState.name}
          />
          <TextField
            id="fallen-modal-level"
            label="Nivel"
            max={100}
            min={1}
            onChange={(event) => updateFormField('level', event.target.value)}
            placeholder="Ej: 32"
            required
            type="number"
            value={formState.level}
          />
          <TextField
            id="fallen-modal-capture-zone"
            label="Ruta de captura"
            onChange={(event) => updateFormField('captureZone', event.target.value)}
            placeholder="Ej: Ruta 16"
            required
            value={formState.captureZone}
          />
          <TextField
            id="fallen-modal-cause"
            label="Causa"
            onChange={(event) => updateFormField('cause', event.target.value)}
            placeholder="Ej: Crítico inesperado"
            required
            value={formState.cause}
          />

          {registerError ? <p className="modal-form__error">{registerError}</p> : null}

          <div className="modal-form__actions">
            <ActionButton onClick={closeRegisterModal} type="button" variant="ghost">
              Cancelar
            </ActionButton>
            <ActionButton type="submit" variant="secondary">
              Guardar registro
            </ActionButton>
          </div>
        </form>
      </Modal>
    </>
  )
}
