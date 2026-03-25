import { ActionButton } from '../atomic/ActionButton'
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
    <article className="fallen-card">
      <div className="fallen-card__status">CAÍDO</div>
      <h3 className="fallen-card__name">{pokemon.name}</h3>
      <p className="fallen-card__meta">Nivel: {pokemon.level}</p>
      <p className="fallen-card__meta">Ruta de captura: {pokemon.captureZone}</p>
      <p className="fallen-card__meta">Causa: {pokemon.cause}</p>
      <ActionButton
        aria-label={`Eliminar registro de ${pokemon.name}`}
        onClick={() => onRemove(pokemon.id)}
        variant="danger"
      >
        Eliminar registro
      </ActionButton>
    </article>
  )
}
