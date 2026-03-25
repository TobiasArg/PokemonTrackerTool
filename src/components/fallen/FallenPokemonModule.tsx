import { type FormEvent, useState } from 'react'

import { useFallenPokemon } from '../../hooks/useFallenPokemon'
import { ActionButton } from '../atomic/ActionButton'
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
  const [formState, setFormState] = useState<FallenFormState>(INITIAL_FORM_STATE)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    addFallenPokemon({
      name: formState.name,
      level: Number.parseInt(formState.level, 10),
      captureZone: formState.captureZone,
      cause: formState.cause,
    })

    setFormState(INITIAL_FORM_STATE)
  }

  return (
    <Panel
      description="Registra los Pokémon muertos con información clave de la run."
      title="Módulo de Pokémon Caídos"
    >
      <form className="fallen-form" onSubmit={handleSubmit}>
        <TextField
          id="fallen-name"
          label="Nombre"
          onChange={(event) =>
            setFormState((state) => ({ ...state, name: event.target.value }))
          }
          placeholder="Ej: Arcanine"
          required
          value={formState.name}
        />
        <TextField
          id="fallen-level"
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
          id="fallen-capture-zone"
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
          id="fallen-cause"
          label="Causa"
          onChange={(event) =>
            setFormState((state) => ({ ...state, cause: event.target.value }))
          }
          placeholder="Ej: Crítico inesperado"
          required
          value={formState.cause}
        />
        <ActionButton type="submit" variant="secondary">
          Registrar caído
        </ActionButton>
      </form>

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
  )
}
