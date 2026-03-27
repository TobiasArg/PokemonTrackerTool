export type SyncStatus = 'idle' | 'loading' | 'saving' | 'error'

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

export type UserSession = {
  userId: string
  email: string | null
}

export type RunSummary = {
  id: string
  name: string
  gameKey: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
}

export type ZoneProgressValue = {
  captured: boolean
  completed: boolean
}

export type ZoneProgressMap = Record<string, ZoneProgressValue>

export type BadgeSnapshotItem = {
  id: string
  earned: boolean
}

export type ChosenPokemonSnapshotItem = {
  id: string
  pokemonName: string
  createdAt: string
}

export type FallenPokemonSnapshotItem = {
  id: string
  name: string
  level: number
  captureZone: string
  cause: string
  createdAt: string
}

export type RunSnapshot = {
  run: RunSummary
  zoneProgress: ZoneProgressMap
  badges: BadgeSnapshotItem[]
  chosenPokemons: ChosenPokemonSnapshotItem[]
  fallenPokemons: FallenPokemonSnapshotItem[]
}
