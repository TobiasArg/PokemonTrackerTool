import { useShallow } from 'zustand/react/shallow'

import { useNuzlockeStore } from './useNuzlockeStore'

export const useChosenPokemon = () => {
  return useNuzlockeStore(
    useShallow((state) => ({
      chosenPokemons: state.chosenPokemons,
      addChosenPokemon: state.addChosenPokemon,
      removeChosenPokemon: state.removeChosenPokemon,
      trimChosenPokemons: state.trimChosenPokemons,
    })),
  )
}
