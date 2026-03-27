import { ActionButton } from '../atomic/ActionButton'
import { PokemonDataCard } from '../atomic/PokemonDataCard'
import type { ChosenPokemon } from '../../hooks/useNuzlockeStore'

type ChosenPokemonCardProps = {
  pokemon: ChosenPokemon
  onRemove: (id: string) => void
}

export const ChosenPokemonCard = ({
  pokemon,
  onRemove,
}: ChosenPokemonCardProps) => {
  return (
    <PokemonDataCard
      className="chosen-card"
      footer={
        <>
          <span className="pokemon-card__footer-note">Activo en el equipo</span>
          <ActionButton
            aria-label={`Quitar ${pokemon.pokemonName} de elegidos`}
            onClick={() => onRemove(pokemon.id)}
            variant="ghost"
          >
            Quitar
          </ActionButton>
        </>
      }
      pokemonName={pokemon.pokemonName}
      stateLabel="USABLE"
    />
  )
}
