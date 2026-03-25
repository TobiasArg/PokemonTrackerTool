import { useShallow } from 'zustand/react/shallow'

import { useNuzlockeStore } from './useNuzlockeStore'

export const useFallenPokemon = () => {
  return useNuzlockeStore(
    useShallow((state) => ({
      fallenPokemons: state.fallenPokemons,
      addFallenPokemon: state.addFallenPokemon,
      removeFallenPokemon: state.removeFallenPokemon,
    })),
  )
}
