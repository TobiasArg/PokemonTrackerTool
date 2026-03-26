import { type FormEvent, useState } from 'react'

import { useFallenPokemon } from '../../hooks/useFallenPokemon'
import { ActionButton } from '../atomic/ActionButton'
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

export const FallenPokemonModule = () => {
  const { fallenPokemons, addFallenPokemon, removeFallenPokemon } = useFallenPokemon()
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [formState, setFormState] = useState<FallenFormState>(INITIAL_FORM_STATE)

  const openRegisterModal = () => {
    setFormState(INITIAL_FORM_STATE)
    setIsRegisterOpen(true)
  }

  const closeRegisterModal = () => {
    setIsRegisterOpen(false)
    setFormState(INITIAL_FORM_STATE)
  }

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    addFallenPokemon({
      name: formState.name,
      level: Number.parseInt(formState.level, 10),
      captureZone: formState.captureZone,
      cause: formState.cause,
    })

    closeRegisterModal()
  }

  return (
    <>
      <Panel
        description="Registra los Pokémon muertos con información clave de la run."
        title="Módulo de Pokémon Caídos"
      >
        <div className="module-toolbar">
          <ActionButton onClick={openRegisterModal} variant="secondary">
            Registrar
          </ActionButton>
        </div>

        {!fallenPokemons.length ? (
          <p className="empty-state">No hay Pokémon caídos registrados.</p>
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
            onChange={(event) =>
              setFormState((state) => ({ ...state, name: event.target.value }))
            }
            placeholder="Ej: Arcanine"
            required
            value={formState.name}
          />
          <TextField
            id="fallen-modal-level"
            label="Nivel"
            max={100}
            min={1}
            onChange={(event) =>
              setFormState((state) => ({ ...state, level: event.target.value }))
            }
            placeholder="Ej: 32"
            required
            type="number"
            value={formState.level}
          />
          <TextField
            id="fallen-modal-capture-zone"
            label="Ruta de captura"
            onChange={(event) =>
              setFormState((state) => ({
                ...state,
                captureZone: event.target.value,
              }))
            }
            placeholder="Ej: Ruta 16"
            required
            value={formState.captureZone}
          />
          <TextField
            id="fallen-modal-cause"
            label="Causa"
            onChange={(event) =>
              setFormState((state) => ({ ...state, cause: event.target.value }))
            }
            placeholder="Ej: Crítico inesperado"
            required
            value={formState.cause}
          />

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
