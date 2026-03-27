import { ActionButton } from '../atomic/ActionButton'
import { PokemonDataCard } from '../atomic/PokemonDataCard'
import type { FallenPokemon } from '../../hooks/useNuzlockeStore'

type FallenPokemonCardProps = {
  pokemon: FallenPokemon
  onRemove: (id: string) => void
}

export const FallenPokemonCard = ({
  pokemon,
  onRemove,
}: FallenPokemonCardProps) => {
  return (
    <PokemonDataCard
      className="fallen-card"
      footer={
        <>
          <span className="pokemon-card__footer-note">Registro de caída</span>
          <ActionButton
            aria-label={`Eliminar registro de ${pokemon.name}`}
            onClick={() => onRemove(pokemon.id)}
            variant="danger"
          >
            Eliminar registro
          </ActionButton>
        </>
      }
      metadata={
        <>
          <p className="fallen-card__meta">Nivel: {pokemon.level}</p>
          <p className="fallen-card__meta">Ruta de captura: {pokemon.captureZone}</p>
          <p className="fallen-card__meta">Causa: {pokemon.cause}</p>
        </>
      }
      pokemonName={pokemon.name}
      stateLabel="CAÍDO"
    />
  )
}
