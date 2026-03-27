import { useEffect, useMemo, useState } from 'react'

import { normalizePokemonName as normalizePokemonNameShared } from '../utils/pokemonNormalization'

export type PokemonTypeInfo = {
  id: string
  label: string
  color: string
}

export type PokemonCardData = {
  id: number
  apiName: string
  displayName: string
  spriteUrl: string | null
  types: PokemonTypeInfo[]
}

type PokemonApiResponse = {
  id: number
  name: string
  sprites: {
    front_default: string | null
    other?: {
      ['official-artwork']?: {
        front_default: string | null
      }
      dream_world?: {
        front_default: string | null
      }
    }
  }
  types: Array<{
    slot: number
    type: {
      name: string
    }
  }>
}

type PokemonCardState = {
  status: 'idle' | 'loading' | 'success' | 'error'
  data: PokemonCardData | null
  errorMessage: string | null
}

const POKEAPI_BASE_URL = 'https://pokeapi.co/api/v2/pokemon'

const TYPE_META: Record<string, { label: string; color: string }> = {
  normal: { label: 'Normal', color: '#8f98a2' },
  fire: { label: 'Fuego', color: '#f0734a' },
  water: { label: 'Agua', color: '#4d92f3' },
  electric: { label: 'Eléctrico', color: '#f7c83f' },
  grass: { label: 'Planta', color: '#62be5b' },
  ice: { label: 'Hielo', color: '#78d6d9' },
  fighting: { label: 'Lucha', color: '#cf6267' },
  poison: { label: 'Veneno', color: '#aa70c7' },
  ground: { label: 'Tierra', color: '#d4bc6f' },
  flying: { label: 'Volador', color: '#86a8f4' },
  psychic: { label: 'Psíquico', color: '#f47fb2' },
  bug: { label: 'Bicho', color: '#9fbe41' },
  rock: { label: 'Roca', color: '#c3ad78' },
  ghost: { label: 'Fantasma', color: '#7670d4' },
  dragon: { label: 'Dragón', color: '#5c74f2' },
  dark: { label: 'Siniestro', color: '#7a6557' },
  steel: { label: 'Acero', color: '#7ba9bf' },
  fairy: { label: 'Hada', color: '#e9a2df' },
}

const pokemonCache = new Map<string, PokemonCardData>()
const inFlightRequests = new Map<string, Promise<PokemonCardData>>()

const toTitleCase = (value: string): string => {
  return value
    .split('-')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')
}

const mapPokemonType = (typeId: string): PokemonTypeInfo => {
  const meta = TYPE_META[typeId]

  if (meta) {
    return {
      id: typeId,
      label: meta.label,
      color: meta.color,
    }
  }

  return {
    id: typeId,
    label: toTitleCase(typeId),
    color: '#7a91b8',
  }
}

export const normalizePokemonName = normalizePokemonNameShared

const buildSpriteUrl = (payload: PokemonApiResponse): string | null => {
  return (
    payload.sprites.other?.['official-artwork']?.front_default ??
    payload.sprites.other?.dream_world?.front_default ??
    payload.sprites.front_default ??
    null
  )
}

const parsePokemonPayload = (payload: PokemonApiResponse): PokemonCardData => {
  return {
    id: payload.id,
    apiName: payload.name,
    displayName: toTitleCase(payload.name),
    spriteUrl: buildSpriteUrl(payload),
    types: [...payload.types]
      .sort((first, second) => first.slot - second.slot)
      .map(({ type }) => mapPokemonType(type.name)),
  }
}

const fetchPokemonCardData = async (query: string): Promise<PokemonCardData> => {
  const response = await fetch(`${POKEAPI_BASE_URL}/${query}/`, {
    headers: {
      Accept: 'application/json',
    },
  })

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('POKEMON_NOT_FOUND')
    }

    throw new Error('POKEAPI_REQUEST_FAILED')
  }

  const payload = (await response.json()) as PokemonApiResponse
  return parsePokemonPayload(payload)
}

const requestPokemonCardData = (query: string): Promise<PokemonCardData> => {
  const cached = pokemonCache.get(query)
  if (cached) {
    return Promise.resolve(cached)
  }

  const inFlight = inFlightRequests.get(query)
  if (inFlight) {
    return inFlight
  }

  const request = fetchPokemonCardData(query)
    .then((pokemon) => {
      pokemonCache.set(query, pokemon)
      return pokemon
    })
    .finally(() => {
      inFlightRequests.delete(query)
    })

  inFlightRequests.set(query, request)
  return request
}

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && error.message === 'POKEMON_NOT_FOUND') {
    return 'No encontrado en PokeAPI.'
  }

  return 'No se pudo cargar el Pokémon.'
}

export const usePokemonCardData = (pokemonName: string): PokemonCardState => {
  const query = useMemo(() => normalizePokemonName(pokemonName), [pokemonName])
  const cachedPokemon = query ? pokemonCache.get(query) : undefined

  const [requestState, setRequestState] = useState<PokemonCardState & { query: string }>({
    query: '',
    status: 'idle',
    data: null,
    errorMessage: null,
  })

  useEffect(() => {
    if (!query || cachedPokemon) {
      return
    }

    let cancelled = false

    requestPokemonCardData(query)
      .then((pokemon) => {
        if (cancelled) {
          return
        }

        setRequestState({
          query,
          status: 'success',
          data: pokemon,
          errorMessage: null,
        })
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return
        }

        setRequestState({
          query,
          status: 'error',
          data: null,
          errorMessage: getErrorMessage(error),
        })
      })

    return () => {
      cancelled = true
    }
  }, [cachedPokemon, query])

  if (!query) {
    return {
      status: 'idle',
      data: null,
      errorMessage: null,
    }
  }

  if (cachedPokemon) {
    return {
      status: 'success',
      data: cachedPokemon,
      errorMessage: null,
    }
  }

  if (requestState.query === query) {
    return {
      status: requestState.status,
      data: requestState.data,
      errorMessage: requestState.errorMessage,
    }
  }

  return {
    status: 'loading',
    data: null,
    errorMessage: null,
  }
}
